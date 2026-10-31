import { MAX_DEVICES, chapterDefinition, chapterOrders, regularTemplates, resolveDependencies as resolveRecipeDevices } from '../content/chapters';
import { activeWorkspace, allWorkspaces, bindWorkspaceViews, chapterPrice, cloneGameState, createWorkspace, currentChapter, deviceCount, deviceGrowthAvailable, familyAllowed, fillRegularOrders, hasChapters, initializeChapters, recipeAllowed, reservedDevices, WORKSPACE_FIELDS } from './workspaces';
import { APPLIANCES, baseUnits, CHAINS, CONTENT_VERSION, DECORATIONS, FRESH_ORDERS, FRESH_RECIPES, HOME_CHAINS, HOME_ORDERS, ITEMS, LEGACY_ORDERS, LEGACY_RECIPES, MODERN_RECIPES, ORDERS, RECIPES, SCHEMA_VERSION, SHOPS } from '../content/catalog';
import { activeDevices, BOARD_LAYOUT, BUILD_NODES, HOME_UNLOCK_HINT, homeCookingUnlocked } from '../content/board-layouts';
import { reconcileHomeDevices } from './home-progression';
import { ENERGY_CONFIG, nextRandom, PRODUCTION } from '../content/production';
import { GIFT_CODES, GIFT_CODE_MAX_LENGTH } from '../content/gift-codes';
import { TUTORIAL_STEPS } from '../content/tutorial';
import type { ApplianceState, Command, CommandResult, GameEvent, GameState, ItemInstance, OrderDef, RecipeDef, Requirement } from './types';
import { DEVICE_FAMILIES } from '../content/expansion';
import { deviceArtId, deviceIdle, makeDevice, productionFor, recipeMatchesDevice, reconcileDeviceGrants, themeStage } from './devices';

export const BOARD_SIZE = 63;
export const GENERATOR_CAPACITY = 12;
export const GENERATOR_COOLDOWN = 8_000;
export const MAX_OFFLINE_MS = 86_400_000;
export const STORAGE_CAPACITY = 8;

const boundedTimestamp = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER - MAX_OFFLINE_MS * 2, Math.floor(value))) : 0;
export function effectiveNow(state: GameState, now = Date.now()): number {
  return Math.max(state.lastSeen, Math.min(boundedTimestamp(now), state.lastSeen + MAX_OFFLINE_MS));
}
export function unlockedCells(state: GameState): number {
  if (state.schemaVersion < 2) return state.day >= 5 ? 56 : state.day >= 3 ? 49 : 42;
  if (activeWorkspace(state)?.mode === 'chapter' && currentChapter(state) !== 1) return 63;
  if (state.campaign === 'fresh') return 42 + Math.min(3, state.construction.completed.length) * 7;
  return state.day >= 5 ? 63 : state.day >= 4 ? 56 : state.day >= 3 ? 49 : 42;
}
export function mergeTarget(item: string): string | null {
  const definition = ITEMS[item];
  const chain=definition?CHAINS.find(chain=>chain.id===definition.chain):undefined;
  return chain?.items.includes(item)?chain.items[definition.level]??null:null;
}

export function createInitialState(now = Date.now()): GameState {
  const board: (ItemInstance | null)[] = Array(BOARD_SIZE).fill(null);
  board[16] = { uid: 'g1', item: 'fresh-veg-1' };
  board[17] = { uid: 'g2', item: 'fresh-veg-1' };
  board[23] = { uid: 'g3', item: 'fresh-fruit-1' };
  board[24] = { uid: 'g4', item: 'fresh-fruit-1' };
  const state: GameState = {
    schemaVersion: SCHEMA_VERSION, contentVersion: CONTENT_VERSION, revision: 0, seed: 0x6f657321, nextId: 5,
    board, storage: [], storageCapacity: STORAGE_CAPACITY,
    generators: Object.fromEntries(CHAINS.map(chain => [chain.id, { remaining: GENERATOR_CAPACITY, readyAt: 0 }])),
    jobs: [null, null, null, null], completedOrders: [], day: 1, coins: 0, reputation: 0,
    shops: Object.fromEntries(SHOPS.map(shop => [shop.id, 0])), decorations: [], discovered: ['fresh-veg-1', 'fresh-fruit-1'],
    stats: { merges: 0, generated: 0, cooked: 0, earned: 0 }, tutorial: 0,
    settings: { music: false, sound: true, reducedMotion: false, volume: 0.55 }, lastSeen: boundedTimestamp(now), undo: null,
    campaign: 'fresh', energy: { value: ENERGY_CONFIG.initial, lastRecoveryAt: boundedTimestamp(now) },
    appliances: [], devices: [], deviceGrants: [], deviceDiscovered: [],
    construction: { completed: [], hats: 0, rewardClaimed: false },
    tutorialState: { node: 'produce', completed: [], targetUid: 'vegetable-cart' },
    session: { page: 'merge', selectedUid: null, orderScroll: 0 }, migrationInbox: [], processedCommandIds: [], cellVersions: Array(BOARD_SIZE).fill(0),
  };
  reconcileDeviceGrants(state);
  return initializeChapters(state);
}

/** Schema-one fixture for historical simulation and regression, never written as a new save. */
export function createLegacyInitialState(now = Date.now()): GameState {
  const base = createInitialState(now);
  const state = { ...base, ...Object.fromEntries(WORKSPACE_FIELDS.map(k => [k, base[k]])) } as GameState;
  delete state.workspaces; delete state.activeWorkspaceId; delete state.chapterAccess;
  state.schemaVersion = 1; state.contentVersion = '1.0.0'; state.campaign = 'legacy';
  state.board = state.board.slice(0, 56); state.cellVersions = state.cellVersions.slice(0, 56); state.appliances = [];
  state.board[16]!.item = state.board[17]!.item = 'grain-1'; state.board[23]!.item = state.board[24]!.item = 'coffee-1';
  state.discovered = ['grain-1', 'coffee-1']; state.coins = 80; state.tutorialState.node = 'complete';
  return state;
}

export function inventoryCount(state: GameState, item: string): number {
  return state.board.reduce((n, value) => n + (value?.item === item ? 1 : 0), 0) + state.storage.reduce((n, value) => n + (value.item === item ? 1 : 0), 0);
}
function requirementTotals(needs: Requirement[]): Map<string, number> | null {
  if (!Array.isArray(needs) || needs.length === 0) return null;
  const totals = new Map<string, number>();
  for (const need of needs) {
    if (!need || !ITEMS[need.item] || !Number.isSafeInteger(need.count) || need.count <= 0) return null;
    const total = (totals.get(need.item) ?? 0) + need.count;
    if (!Number.isSafeInteger(total)) return null;
    totals.set(need.item, total);
  }
  return totals;
}
export function canAffordRequirements(state: GameState, needs: Requirement[]): boolean {
  const totals = requirementTotals(needs);
  return totals !== null && Array.from(totals).every(([item, count]) => inventoryCount(state, item) >= count);
}
export function availableOrders(state: GameState) {
  const completed = new Set(state.completedOrders);
  if(state.schemaVersion>=3&&state.campaign==='fresh') {
    const w=activeWorkspace(state);
    if(w?.orderTab==='regular')return w.regularOrders;
    if(w?.mode==='chapter')return chapterOrders(w.chapter).filter(o=>!completed.has(o.id)).slice(0,3);
    const stage=themeStage(state);
    return ORDERS.filter(o=>!completed.has(o.id)&&(stage===1?FRESH_ORDERS.includes(o):stage===2?HOME_ORDERS.includes(o):o.id.startsWith('v3-order-')&&(o.stage??8)<=stage)).slice(0,3);
  }
  const campaignOrders = state.campaign === 'fresh' && state.day === 1 ? homeCookingUnlocked(state) ? HOME_ORDERS : FRESH_ORDERS : LEGACY_ORDERS;
  return campaignOrders.filter(order => order.day === state.day && !completed.has(order.id)).slice(0, 3);
}
export function getDayProgress(state: GameState) {
  const home = homeCookingUnlocked(state);
  const orders = (state.campaign === 'fresh' && state.day === 1 ? home ? HOME_ORDERS : FRESH_ORDERS : LEGACY_ORDERS).filter(order => order.day === state.day);
  const completed = orders.filter(order => state.completedOrders.includes(order.id)).length;
  const shop = SHOPS.find(shop => shop.day === state.day)!;
  const shopReady = state.campaign === 'fresh' && state.day === 1 ? state.construction.completed.length === BUILD_NODES.length : (state.shops[shop.id] ?? 0) >= 2;
  return { completed, total: orders.length, ratio: completed / orders.length, shopReady, phase: home ? 'home' : 'opening', canAdvance: state.campaign === 'legacy' && completed === orders.length && shopReady && state.day < 6 };
}
export function getGeneratorStatus(state: GameState, chain: string, now = Date.now()) {
  const generator = state.generators[chain];
  const definition = CHAINS.find(item => item.id === chain);
  const time = effectiveNow(state, now);
  if (state.schemaVersion >= 2) return { remaining: getEnergyStatus(state, time).value, readyAt: 0, waiting: 0, unlocked: !!definition && state.day >= definition.unlockDay && (state.campaign==='fresh'?(hasChapters(state)?familyAllowed(state,definition.producer??''):(definition.stage??1)<=themeStage(state)):!HOME_CHAINS.some(value => value.id === chain)) };
  if (!generator || !definition) return { remaining: 0, readyAt: 0, waiting: 0, unlocked: false };
  const waiting = generator.remaining === 0 ? Math.max(0, generator.readyAt - time) : 0;
  return { remaining: generator.remaining === 0 && waiting === 0 ? GENERATOR_CAPACITY : generator.remaining, readyAt: waiting === 0 ? 0 : generator.readyAt, waiting, unlocked: state.day >= definition.unlockDay };
}
export function getBonuses(state: GameState) {
  const owned = DECORATIONS.filter(decoration => state.decorations.includes(decoration.id));
  return { tips: Math.min(0.2, owned.filter(d => d.bonus === 'tips').length * 0.02), speed: Math.min(0.3, owned.filter(d => d.bonus === 'speed').length * 0.03) };
}
export function getOrderReward(state: GameState, order: OrderDef): number {
  return Math.floor(order.coins * (1 + getBonuses(state).tips));
}
export function getRecipeDuration(state: GameState, recipe: RecipeDef, deviceId?: string): number {
  const level=state.devices?.find(d=>d.id===deviceId)?.level??1;
  return getRecipeDurationAtLevel(state,recipe,level);
}
export function getRecipeDurationAtLevel(state: GameState, recipe: RecipeDef, level:number): number {
  return Math.max(1000, Math.round(recipe.duration * (1 - getBonuses(state).speed)*[1,0.85,0.70][level-1]));
}
export function canCook(state: GameState, recipeId: string, slot?: number): boolean {
  const recipe = RECIPES.find(recipe => recipe.id === recipeId);
  if (!recipe || state.schemaVersion >= 2 && MODERN_RECIPES.includes(recipe)) return false;
  const selectedSlot = slot ?? recipe.appliance;
  return recipe.unlockDay <= state.day && selectedSlot === recipe.appliance && APPLIANCES[selectedSlot]?.unlockDay <= state.day && state.jobs[selectedSlot] === null && canAffordRequirements(state, recipe.inputs);
}

function consume(state: GameState, needs: Requirement[]) {
  for (const [item, count] of requirementTotals(needs)!) {
    let remaining = count;
    for (let index = 0; index < state.board.length && remaining > 0; index++) {
      if (state.board[index]?.item === item) { state.board[index] = null; remaining--; }
    }
    for (let index = state.storage.length - 1; index >= 0 && remaining > 0; index--) {
      if (state.storage[index].item === item) { state.storage.splice(index, 1); remaining--; }
    }
  }
}
function instance(state: GameState, item: string): ItemInstance {
  if (!state.discovered.includes(item)) state.discovered.push(item);
  return { uid: `g${state.nextId++}`, item };
}
const deviceAt = (state: GameState, index: number) => activeDevices(state).find(entity => entity.index === index);
const validCell = (state: GameState, index: number) => Number.isInteger(index) && index >= 0 && index < unlockedCells(state) && !deviceAt(state, index);
const emptyCell = (state: GameState, origin = 0) => state.board.map((item, index) => ({ item, index })).filter(({ item, index }) => item === null && validCell(state, index)).sort((a, b) => {
  const distance = (index: number) => Math.abs(Math.floor(index / 7) - Math.floor(origin / 7)) + Math.abs(index % 7 - origin % 7);
  return distance(a.index) - distance(b.index) || a.index - b.index;
})[0]?.index ?? -1;

export function getEnergyStatus(state: GameState, now = Date.now()) {
  const time = effectiveNow(state, now);
  const energy = state.energy;
  const elapsed = Math.max(0, time - energy.lastRecoveryAt);
  const ticks = Math.floor(elapsed / ENERGY_CONFIG.recoveryInterval);
  const value = energy.value >= ENERGY_CONFIG.naturalCap ? energy.value : Math.min(ENERGY_CONFIG.naturalCap, energy.value + ticks);
  const lastRecoveryAt = value >= ENERGY_CONFIG.naturalCap ? time : energy.lastRecoveryAt + ticks * ENERGY_CONFIG.recoveryInterval;
  return { value, lastRecoveryAt, naturalCap: ENERGY_CONFIG.naturalCap, nextRecoveryIn: value >= ENERGY_CONFIG.naturalCap ? 0 : ENERGY_CONFIG.recoveryInterval - (time - lastRecoveryAt) };
}

export interface BoardEntityView {
  kind: 'item' | 'generator' | 'appliance' | 'blocker' | 'empty'; index: number; id: string; name: string; version: number;
  item?: ItemInstance; chain?: string; slot?: number; appliance?: ApplianceState; unlockDay?: number;
  canMove: boolean; canMerge: boolean; canAccept: boolean; canSell: boolean;
}
export function getBoardEntity(state: GameState, index: number): BoardEntityView {
  const base = { index, version: state.cellVersions[index] ?? 0, canMove: false, canMerge: false, canAccept: false, canSell: false };
  const blocker = BOARD_LAYOUT.blockers.find(block => block.footprint.includes(index));
  if (index < 0 || index >= state.board.length || index >= unlockedCells(state)) return { ...base, kind: 'blocker', id: blocker?.id ?? 'locked', name: blocker ? state.campaign === 'fresh' ? blocker.buildLabel : blocker.name : '尚未开放', unlockDay: state.campaign === 'legacy' ? blocker?.unlockDay : undefined };
  const device = deviceAt(state, index);
  if (device) {
    let chain: string | undefined = 'chain' in device ? device.chain : undefined;
    if (state.campaign === 'legacy' && chain) chain = device.index === 35 ? 'grain' : 'coffee';
    const appliance = state.appliances.find(value => value.id === device.id);
    const name = state.campaign === 'legacy' && chain ? CHAINS.find(value => value.id === chain)?.name ?? device.name : device.name;
    return { ...base, ...device, name, chain, appliance, kind: device.kind, canMove:state.schemaVersion>=3&&state.campaign==='fresh',canMerge:(device.level??3)<3&&deviceIdle(state,device.id),canAccept: device.kind === 'appliance' && !!appliance && !appliance.job && !appliance.outputSlot };
  }
  const item = state.board[index];
  return item ? { ...base, kind: 'item', id: item.uid, name: ITEMS[item.item]?.name ?? '食材', item, canMove: true, canMerge: !!mergeTarget(item.item), canSell: true } : { ...base, kind: 'empty', id: `cell-${index}`, name: '空格', canAccept: true };
}

export function availableApplianceRecipes(state: GameState): RecipeDef[] {
  if(state.schemaVersion>=3&&state.campaign==='fresh')return MODERN_RECIPES.filter(r=>activeWorkspace(state)?.mode==='chapter'?recipeAllowed(state,r.id):(r.stage??1)<=themeStage(state));
  return (state.campaign === 'legacy' ? [...LEGACY_RECIPES, ...FRESH_RECIPES] : homeCookingUnlocked(state) ? MODERN_RECIPES : FRESH_RECIPES).filter(recipe => recipe.unlockDay <= state.day);
}
function compatibleRecipes(state: GameState, appliance: ApplianceState, inputs = appliance.inputSlots) {
  const missingCost = (recipe: RecipeDef) => recipe.inputs.reduce((sum, need) => sum + Math.max(0, need.count - inputs.filter(input => input.item === need.item).length) * baseUnits(need.item), 0);
  return availableApplianceRecipes(state).filter(recipe => recipeMatchesDevice(state,appliance,recipe) && inputs.every(input => recipe.inputs.some(need => need.item === input.item)) && recipe.inputs.every(need => inputs.filter(input => input.item === need.item).length <= need.count)).sort((a, b) => missingCost(a) - missingCost(b));
}
function fullyLoaded(appliance: ApplianceState, recipe: RecipeDef) {
  return recipe.inputs.every(need => appliance.inputSlots.filter(input => input.item === need.item).length === need.count) && appliance.inputSlots.length === recipe.inputs.reduce((count, need) => count + need.count, 0);
}
export function getApplianceStatus(state: GameState, id: string, now = Date.now()) {
  const appliance = state.appliances.find(value => value.id === id);
  if (!appliance || !activeDevices(state).some(device => device.id === id)) return null;
  const remaining = appliance.job ? Math.max(0, appliance.job.endsAt - effectiveNow(state, now)) : 0;
  const recipes = compatibleRecipes(state, appliance);
  const recipe = appliance.job ? RECIPES.find(value => value.id === appliance.job!.recipe) ?? null : recipes.find(value => fullyLoaded(appliance, value)) ?? recipes[0] ?? null;
  const phase = appliance.job ? remaining > 0 ? 'cooking' : 'ready' : appliance.outputSlot ? 'ready' : appliance.inputSlots.length ? 'loaded' : 'idle';
  const candidates = recipes.map(value => ({ recipe: value, missing: value.inputs.map(need => ({ item: need.item, count: Math.max(0, need.count - appliance.inputSlots.filter(input => input.item === need.item).length) })).filter(need => need.count > 0) }));
  return { phase: phase as 'idle' | 'loaded' | 'cooking' | 'ready', appliance, recipes, candidates, recipe, remaining, canStart: !!recipe && !appliance.job && !appliance.outputSlot && fullyLoaded(appliance, recipe) };
}
export function getConstructionProgress(state: GameState) {
  const completed = state.construction.completed.length;
  return { completed, total: BUILD_NODES.length, ratio: completed / BUILD_NODES.length, percent: completed === 0 ? 0 : BUILD_NODES[completed - 1].progress, next: BUILD_NODES[completed] ?? null, canClaimReward: completed === BUILD_NODES.length && !state.construction.rewardClaimed };
}
export function getTutorialStep(state: GameState) {
  if(activeWorkspace(state)?.mode==='chapter'&&currentChapter(state)!==1 || homeCookingUnlocked(state))return null;
  const step = TUTORIAL_STEPS.find(value => value.id === state.tutorialState.node);
  if (!step) return null;
  let target: string = step.target;
  let text: string = step.text;
  if (step.id === 'merge') {
    const pair = state.board.find(item => item && mergeTarget(item.item) && state.board.filter(other => other?.item === item.item).length >= 2);
    target = pair?.uid ?? 'vegetable-cart';
    if (!pair) text = '轻点推车凑成一对，再把相同食材二合';
  }
  if (step.id === 'start') {
    const appliance = state.appliances.find(value => value.inputSlots.length && !value.job);
    target = appliance?.id ?? 'chopping-board';
    if (appliance && !getApplianceStatus(state, appliance.id, state.lastSeen)?.canStart) text = '按配方补齐缺少的食材，再点烹饪开工';
  }
  if (step.id === 'collect') {
    const appliance = state.appliances.find(value => value.job || value.outputSlot);
    target = appliance?.id ?? 'chopping-board';
    if (appliance?.job && appliance.job.endsAt > state.lastSeen) text = '料理正在制作，等完成后轻点厨具领取';
  }
  return { ...step, target, text };
}
function advanceTutorial(state: GameState, events: GameEvent[]) {
  if (state.tutorialState.node === 'complete' || state.campaign !== 'fresh') return;
  const seen = new Set(state.tutorialState.completed);
  for (const event of events) {
    for (const step of TUTORIAL_STEPS) if (step.event === event.type) {
      // The second production teaches waiting; the first one must not silently skip it.
      if (step.id !== 'wait' || state.appliances.some(appliance => appliance.job)) seen.add(step.id);
    }
  }
  if (state.stats.merges > 0) seen.add('merge');
  if (state.stats.cooked > 0) seen.add('wait');
  if (state.completedOrders.length) seen.add('first-order');
  if (state.construction.completed.length) seen.add('build');
  state.tutorialState.completed = [...seen];
  const next = TUTORIAL_STEPS.find(step => !seen.has(step.id));
  state.tutorialState.node = next?.id ?? 'complete';
  state.tutorialState.targetUid = getTutorialStep(state)?.target ?? null;
  state.tutorial = next ? Math.min(4, Math.floor(TUTORIAL_STEPS.indexOf(next) / 2)) : 5;
}
function reconcileTime(state: GameState, time: number, events: GameEvent[]) {
  if (state.schemaVersion < 2) return;
  const energy = getEnergyStatus(state, time);
  state.energy = { value: energy.value, lastRecoveryAt: energy.lastRecoveryAt };
  for (const w of allWorkspaces(state)) for (const appliance of w.appliances) if (appliance.job && appliance.job.endsAt <= time && !appliance.outputSlot) {
    const output = appliance.job.output ?? RECIPES.find(recipe => recipe.id === appliance.job!.recipe)?.output;
    if (output) {
      appliance.outputSlot = instance(state, output); appliance.version++;
      events.push({ type: 'ready', workspaceId:w.id, message: `${ITEMS[output].name}做好啦，轻点厨具领取。`, appliance: appliance.id, item: output, index: appliance.index });
    }
  }
}

/** All mutations happen on a private copy; any rejected command returns the original state. */
export function execute(original: GameState, command: Command, now = Date.now()): CommandResult {
  const reject = (message: string): CommandResult => ({ state: original, ok: false, events: [{ type: 'error', message }] });
  if (!command || typeof command !== 'object') return reject('操作未识别，请重试。');
  bindWorkspaceViews(original);
  if (command.expectedWorkspaceId !== undefined && command.expectedWorkspaceId !== original.activeWorkspaceId) return reject('厨房已切换，原操作已取消。');
  if(['configureDevice','storeDevice','retrieveDevice','moveDevice','mergeDevices'].includes(command.type)&&(original.campaign!=='fresh'||original.schemaVersion<3))return reject('设备成长与设备架在当前图鉴主线中使用。');
  if (command.commandId && original.processedCommandIds.includes(command.commandId)) return reject('这次操作已经完成，无需重复。');
  const sourceIndex = 'from' in command ? command.from : 'index' in command ? command.index : undefined;
  if (command.expectedUid !== undefined && (sourceIndex === undefined || original.board[sourceIndex]?.uid !== command.expectedUid)) return reject('这份食材的位置已改变，请重新选择。');
  if (command.type === 'move') {
    if (command.expectedTargetUid !== undefined && (original.board[command.to]?.uid ?? null) !== command.expectedTargetUid) return reject('落点的食材已改变，请重新拖动。');
    if (command.expectedTargetVersion !== undefined && original.cellVersions[command.to] !== command.expectedTargetVersion) return reject('落点已更新，请重新拖动。');
    const target = deviceAt(original, command.to);
    if (target?.kind === 'appliance') return execute(original, { ...command, type: 'stageInput', appliance: target.id }, now);
  }
  if ('appliance' in command && command.expectedVersion !== undefined && original.appliances.find(appliance => appliance.id === command.appliance)?.version !== command.expectedVersion) return reject('厨具状态已改变，请重试。');
  if (!Number.isSafeInteger(original.revision + 1) || !Number.isSafeInteger(original.nextId + 1)) return reject('存档编号已到上限，请导出备份。');
  const state = cloneGameState(original);
  const time = effectiveNow(state, now);
  if (!Number.isSafeInteger(time) || !Number.isSafeInteger(time + MAX_OFFLINE_MS)) return reject('存档时间超出安全范围，请恢复有效备份。');
  const events: GameEvent[] = [];
  reconcileTime(state, time, events);
  const sameKitchen=(command.type==='enterChapter'||command.type==='unlockAndEnterChapter')&&state.activeWorkspaceId===(command.chapter==='original'?'original':`chapter-${command.chapter}`);
  const preserveUndo = ['session', 'recover', 'settings', 'redeemGift'].includes(command.type)||sameKitchen;
  state.undo = preserveUndo ? state.undo : null;
  switch (command.type) {
    case 'unlockAndEnterChapter':
    case 'enterChapter': {
      if(!hasChapters(state))return reject('请在章节模式中选择厨房。');
      const originalKitchen=command.chapter==='original';
      if(originalKitchen&&command.type==='unlockAndEnterChapter')return reject('原厨房无需购买。');
      const chapter=originalKitchen?0:command.chapter as number;
      if(!originalKitchen&&!chapterDefinition(chapter))return reject('章节不存在。');
      const unlocked=originalKitchen?!!state.workspaces!.original:state.chapterAccess!.unlocked.includes(chapter);
      if(!unlocked&&command.type==='enterChapter')return reject('请先解锁这个章节。');
      if(!unlocked){const price=chapterPrice(state);if(state.coins<price)return reject(`还差 ${price-state.coins} 金币，常客订单可以继续赚金币。`);state.coins-=price;state.chapterAccess!.unlocked.push(chapter);state.chapterAccess!.paidUnlocks++;}
      const w=originalKitchen?state.workspaces!.original:state.workspaces![`chapter-${chapter}`]??createWorkspace(state,chapter);
      state.activeWorkspaceId=w.id;state.session.page='merge';fillRegularOrders(state);
      events.push({type:'chapter-entered',message:`已进入${originalKitchen?'原厨房':chapterDefinition(chapter)!.name}，其他厨房已保存。`,workspaceId:w.id});break;
    }
    case 'orderTab': {const w=activeWorkspace(state);if(!w||!['story','regular'].includes(command.tab))return reject('订单类型不存在。');w.orderTab=command.tab;w.session.orderScroll=0;break;}
    case 'skipTutorial': {state.tutorialState.node='complete';break;}
    case 'arrangeRecipe': {
      if(!hasChapters(state))return reject('请在独立章节中布置设备。');
      const recipe=availableApplianceRecipes(state).find(r=>r.id===command.recipe);if(!recipe)return reject('这份配方不在当前厨房。');
      const preview=getRecipeLayoutPreview(state,recipe.id)!;
      if(preview.families.some(f=>!f.device))return reject('本章缺少所需设备，请先到设备架准备。');
      for(const selection of preview.families){const d=state.devices.find(d=>d.id===selection.device)!;if(d.index!==null)continue;
        let index=emptyCell(state);if(index<0){const spare=state.devices.find(d=>d.index!==null&&!preview.families.some(f=>f.device===d.id)&&deviceIdle(state,d.id));if(!spare)return reject('请先腾出空格，布局尚未改变。');index=spare.index!;spare.index=null;spare.version++;const a=state.appliances.find(a=>a.id===spare.id);if(a){a.index=-1;a.version++;}}
        d.index=index;d.version++;const a=state.appliances.find(a=>a.id===d.id);if(a){a.index=index;a.version++;}
      }events.push({type:'device',message:'所需设备已布置，原有食材和忙碌厨具保留。'});break;
    }
    case 'redeemGift': {
      if (typeof command.key !== 'string') return reject('兑换码格式不正确，请重新输入。');
      if (command.key.length > GIFT_CODE_MAX_LENGTH) return reject(`兑换码不能超过 ${GIFT_CODE_MAX_LENGTH} 个字符。`);
      const key = command.key.trim().toUpperCase();
      if (!key) return reject('请输入兑换码。');
      const gift = GIFT_CODES.find(entry => entry.key === key);
      if (!gift) return reject('兑换码无效，请检查后重试。');
      if (state.energy.value > ENERGY_CONFIG.maxValue - gift.energy) return reject('体力已接近可保存上限，请消耗一些后再兑换。');
      state.energy.value += gift.energy;
      events.push({ type: 'redeem', message: `兑换成功，体力 +${gift.energy}`, amount: gift.energy });
      break;
    }
    case 'configureDevice': {
      const device=state.devices.find(d=>d.id===command.device), chain=CHAINS.find(c=>c.id===command.chain), production=productionFor(command.chain,command.band);
      if(!device||!chain||DEVICE_FAMILIES.find(f=>f.id===device.familyId)?.chains[0]!==command.chain||device.selectedChain!==command.chain||!production||production.minLevel>device.level||(hasChapters(state)?!familyAllowed(state,device.familyId):(chain.stage??1)>themeStage(state))||command.band>0&&!(hasChapters(state)?deviceGrowthAvailable(state):themeStage(state)>=3))return reject('系列或产出段尚未开放。');
      device.selectedChain=chain.id;device.band=command.band;device.version++;break;
    }
    case 'buyDevice': {
      const family=DEVICE_FAMILIES.find(f=>f.id===command.family);
      if(state.campaign!=='fresh'||!family||(hasChapters(state)?!deviceGrowthAvailable(state)||!familyAllowed(state,family.id):themeStage(state)<3||family.stage>themeStage(state)))return reject(hasChapters(state)?'这台设备不在当前厨房的开放范围，可在独立章节中管理相应设备。':'完成家常烟火后，可购买已开放设备的副本。');
      if(hasChapters(state)?deviceCount(state)+1+reservedDevices(state)>MAX_DEVICES:state.devices.length>=256)return reject('设备架已满，先合成闲置副本。');
      if(state.coins<family.price)return reject(`还差 ${family.price-state.coins} 金币，完成订单或出售多余食材可获得。`);
      state.coins-=family.price;makeDevice(state,family.id,`d${state.nextId++}`);
      events.push({type:'device',message:`${family.name}已放入设备架，可与同类同级设备合成。`});break;
    }
    case 'storeDevice': {
      const device=state.devices.find(d=>d.id===command.device);
      if(!device||device.index===null||!deviceIdle(state,device.id))return reject('只有完全空闲的设备可以收纳。');
      device.index=null;device.version++;const appliance=state.appliances.find(a=>a.id===device.id);if(appliance){appliance.index=-1;appliance.version++;}
      events.push({type:'device',message:'设备已收好，随时可以从设备架取出。'});break;
    }
    case 'retrieveDevice':
    case 'moveDevice': {
      const device=state.devices.find(d=>d.id===command.device);
      if(!device||command.type==='retrieveDevice'&&device.index!==null||command.type==='moveDevice'&&device.index===null)return reject('设备位置已经改变，请重新选择。');
      const index=command.type==='moveDevice'?command.to:command.index??emptyCell(state);
      if(!validCell(state,index)||state.board[index])return reject('请先腾出一个已开放的棋盘格，设备会保留在原处。');
      device.index=index;device.version++;const appliance=state.appliances.find(a=>a.id===device.id);if(appliance){appliance.index=index;appliance.version++;}
      events.push({type:'device',message:command.type==='moveDevice'?'设备已移动，料理进度继续保留。':'设备已摆上棋盘。',index});break;
    }
    case 'mergeDevices': {
      const source=state.devices.find(d=>d.id===command.device), target=state.devices.find(d=>d.id===command.target);
      if(!(hasChapters(state)?deviceGrowthAvailable(state):themeStage(state)>=3))return reject('设备成长将在晨间茶饮主题开放。');
      if(!source||!target||source.id===target.id||source.familyId!==target.familyId||source.level!==target.level||target.level>=3)return reject('需要两台同类同级设备，最高可升至三级。');
      if(!deviceIdle(state,source.id)||!deviceIdle(state,target.id))return reject('请先撤回投料或领取料理，再合成空闲设备。');
      target.level++;target.band=0;target.version++;
      state.devices=state.devices.filter(d=>d.id!==source.id);state.appliances=state.appliances.filter(a=>a.id!==source.id);
      const art=deviceArtId(target);if(!state.deviceDiscovered.includes(art))state.deviceDiscovered.push(art);
      events.push({type:'device-upgrade',message:`${DEVICE_FAMILIES.find(f=>f.id===target.familyId)!.name}升至${target.level}级！`,index:target.index??undefined});break;
    }
    case 'generate': {
      const chain = CHAINS.find(chain => chain.id === command.chain);
      if (!chain || chain.unlockDay > state.day || state.campaign==='fresh'&&(hasChapters(state)?!familyAllowed(state,chain.producer??''):(chain.stage??1)>themeStage(state))) return reject('这条食材链将在后续主题开放。');
      if (!hasChapters(state) && HOME_CHAINS.some(value => value.id === chain.id) && !homeCookingUnlocked(state)) return reject(HOME_UNLOCK_HINT);
      const family=DEVICE_FAMILIES.find(f=>f.chains.includes(chain.id));
      const device = activeDevices(state).find(entity => entity.kind === 'generator' && (state.schemaVersion>=3&&state.campaign==='fresh'?entity.familyId===family?.id&&(!command.device||entity.id===command.device):entity.chain===chain.id));
      if(state.schemaVersion>=3&&state.campaign==='fresh'&&(!device||state.devices.find(d=>d.id===device.id)?.selectedChain!==chain.id))return reject('先从设备架取出本系列的专用生产器。');
      const index = emptyCell(state, state.schemaVersion >= 2 ? device?.index ?? 35 : 0);
      if (index < 0) return reject('棋盘满啦，试试合成、交单或移入仓库。');
      if (state.schemaVersion >= 2) {
        const producer=state.devices?.find(d=>d.id===device?.id);
        const band=command.band??(command.device?producer?.band??0:0);
        const production = state.campaign==='fresh'&&state.schemaVersion>=3 ? productionFor(chain.id,band) : PRODUCTION[chain.id] ?? { energyCost: 1, drops: [{ item: chain.items[0], weight: 1 }] };
        if(!production||'minLevel' in production&&((producer?.level??1)<Number(production.minLevel)||band>0&&!(hasChapters(state)?deviceGrowthAvailable(state):themeStage(state)>=3)))return reject('此产出段需要升级生产器。');
        if (state.energy.value < production.energyCost) return reject(`体力不足，${Math.ceil(getEnergyStatus(state, time).nextRecoveryIn / 1000)} 秒后恢复，也可建设领取体力。`);
        const random = nextRandom(state.seed);
        const total = production.drops.reduce((sum, drop) => sum + drop.weight, 0);
        let cursor = random.value * total;
        const item = production.drops.find(drop => (cursor -= drop.weight) < 0)?.item ?? production.drops[0].item;
        state.seed = random.seed;
        state.energy.value -= production.energyCost;
        state.board[index] = instance(state, item);
        state.stats.generated++;
        events.push({ type: 'generate', message: `获得${ITEMS[item].name}`, index, from: device?.index, item, uid: state.board[index]!.uid, amount: -production.energyCost });
        break;
      }
      const status = getGeneratorStatus(state, chain.id, time);
      if (status.waiting > 0) return reject(`正在补货，${Math.ceil(status.waiting / 1000)} 秒后回来，也可以先做另一条链。`);
      const remaining = status.remaining - 1;
      state.generators[chain.id] = { remaining, readyAt: remaining === 0 ? time + GENERATOR_COOLDOWN : 0 };
      const item = chain.items[0];
      state.board[index] = instance(state, item);
      state.stats.generated++;
      events.push({ type: 'generate', message: `获得${ITEMS[item].name}`, index, item });
      break;
    }
    case 'move': {
      if (!validCell(state, command.from) || !validCell(state, command.to) || command.from === command.to) return reject('请选一个已经开放的不同格子。');
      const source = state.board[command.from];
      const target = state.board[command.to];
      if (!source) return reject('来源格子里没有食材。');
      const result = source.item === target?.item ? mergeTarget(source.item) : null;
      if (result) {
        state.board[command.from] = null;
        state.board[command.to] = instance(state, result);
        state.stats.merges++;
        events.push({ type: 'merge', message: `合成了${ITEMS[result].name}`, index: command.to, item: result });
      } else {
        state.board[command.from] = target;
        state.board[command.to] = source;
        events.push({ type: 'move', message: target ? '已交换位置' : '已移动食材', index: command.to });
      }
      break;
    }
    case 'stageInput': {
      const appliance = state.appliances.find(value => value.id === command.appliance);
      if (!appliance || !validCell(state, command.from)) return reject('请选择食材和已开放的厨具。');
      if (appliance.job || appliance.outputSlot) return reject('厨具正在忙，先等料理完成并领取。');
      const input = state.board[command.from];
      if (!input) return reject('这份食材已不在原来的位置。');
      if (!compatibleRecipes(state, appliance, [...appliance.inputSlots, input]).length) return reject(`这份食材不适合${activeDevices(state).find(entity => entity.id === appliance.id)?.name ?? '这台厨具'}，请查看可用食谱。`);
      appliance.inputSlots.push(input); state.board[command.from] = null; appliance.version++;
      events.push({ type: 'stageInput', message: `${ITEMS[input.item].name}已放好，点烹饪才会开工。`, from: command.from, index: appliance.index, appliance: appliance.id, item: input.item, uid: input.uid });
      break;
    }
    case 'withdrawInput': {
      const appliance = state.appliances.find(value => value.id === command.appliance);
      if (!appliance || appliance.job || appliance.outputSlot) return reject('已经开工的料理不能撤回材料。');
      const inputIndex = appliance.inputSlots.findIndex(input => input.uid === command.uid);
      if (inputIndex < 0) return reject('这份食材已经不在厨具里。');
      const index = emptyCell(state, appliance.index);
      if (index < 0) return reject('棋盘满啦，材料会继续留在厨具中。');
      state.board[index] = appliance.inputSlots.splice(inputIndex, 1)[0]; appliance.version++;
      events.push({ type: 'withdrawInput', message: '材料已退回棋盘。', index, uid: command.uid, appliance: appliance.id });
      break;
    }
    case 'startCooking': {
      const appliance = state.appliances.find(value => value.id === command.appliance);
      if (!appliance || appliance.job || appliance.outputSlot) return reject('这台厨具正在忙，完成后记得领取。');
      const recipes = compatibleRecipes(state, appliance);
      const recipe = recipes.find(value => (!command.recipe || command.recipe === value.id) && fullyLoaded(appliance, value));
      if (!recipe) return reject('材料还没备齐，投齐配方所需食材再开工。');
      appliance.inputSlots = [];
      appliance.job = { id: `g${state.nextId++}`, recipe: recipe.id, output: recipe.output, startedAt: time, endsAt: time + getRecipeDuration(state, recipe,appliance.id) };
      appliance.version++;
      events.push({ type: 'cook', message: `${recipe.name}开始制作，可以继续合成。`, appliance: appliance.id, index: appliance.index, item: recipe.output });
      break;
    }
    case 'collectAppliance': {
      const appliance = state.appliances.find(value => value.id === command.appliance);
      if (!appliance?.job || (command.expectedJobId && command.expectedJobId !== appliance.job.id)) return reject('这份料理已领取或任务已经改变。');
      if (!appliance.outputSlot || appliance.job.endsAt > time) return reject('料理还差一点火候，再等等吧。');
      const index = emptyCell(state, appliance.index);
      if (index < 0) return reject('棋盘满啦，成品会留在厨具中，腾出一格再领取。');
      const output = appliance.outputSlot;
      state.board[index] = output; appliance.outputSlot = null; appliance.job = null; appliance.version++; state.stats.cooked++;
      events.push({ type: 'collect', message: `${ITEMS[output.item].name}做好啦！`, index, appliance: appliance.id, item: output.item, uid: output.uid });
      break;
    }
    case 'store': {
      if (!validCell(state, command.index) || !state.board[command.index]) return reject('先选择要收好的食材。');
      if (state.storage.length >= state.storageCapacity) return reject('仓库满啦，先取出一些食材吧。');
      state.storage.push(state.board[command.index]!);
      state.board[command.index] = null;
      events.push({ type: 'store', message: '食材已收进仓库，交单和做菜会自动取用。' });
      break;
    }
    case 'retrieve': {
      const index = emptyCell(state);
      const stored = state.storage.findIndex(item => item.uid === command.uid);
      if (stored < 0) return reject('这份食材已经不在仓库里。');
      if (index < 0) return reject('棋盘满啦，先腾出一个位置。');
      state.board[index] = state.storage.splice(stored, 1)[0];
      events.push({ type: 'retrieve', message: '已取回棋盘', index });
      break;
    }
    case 'sell': {
      if (!validCell(state, command.index)) return reject('请选择已经开放的格子。');
      const item = state.board[command.index];
      if (!item || !ITEMS[item.item]) return reject('先选择要出售的食材。');
      const coins = ITEMS[item.item].sell;
      state.coins += coins;
      state.board[command.index] = null;
      state.undo = { item, index: command.index, coins, revision: state.revision + 1, ...(state.activeWorkspaceId?{workspaceId:state.activeWorkspaceId}:{}) };
      events.push({ type: 'sell', message: `出售${ITEMS[item.item].name}，获得 ${coins} 金币；继续操作前可撤销。`, amount: coins });
      break;
    }
    case 'undo': {
      const undo = original.undo;
      if (!undo || undo.revision !== original.revision || !validCell(state, undo.index) || state.board[undo.index] !== null || state.coins < undo.coins || state.board.some(item => item?.uid === undo.item.uid) || state.storage.some(item => item.uid === undo.item.uid)) return reject('这次出售已无法撤销。');
      state.board[undo.index] = { ...undo.item };
      state.coins -= undo.coins;
      events.push({ type: 'undo', message: '食材已经回来啦。', index: undo.index });
      break;
    }
    case 'cook': {
      if (state.schemaVersion >= 2 && MODERN_RECIPES.some(recipe => recipe.id === command.recipe)) return reject('请先把食材拖进厨具，再点击烹饪。');
      const recipe = RECIPES.find(recipe => recipe.id === command.recipe);
      if (!recipe || recipe.unlockDay > state.day) return reject('这份菜谱尚未解锁。');
      if (!Number.isInteger(command.slot) || command.slot !== recipe.appliance || APPLIANCES[command.slot]?.unlockDay > state.day) return reject('请使用菜谱指定且已解锁的厨具。');
      if (state.jobs[command.slot]) return reject('这台厨具正在工作，完成后记得领取。');
      if (!canAffordRequirements(state, recipe.inputs)) return reject('材料还没备齐，棋盘与仓库中的材料都会计入。');
      consume(state, recipe.inputs);
      const duration = getRecipeDuration(state, recipe);
      state.jobs[command.slot] = { id: `g${state.nextId++}`, recipe: recipe.id, startedAt: time, endsAt: time + duration };
      events.push({ type: 'cook', message: `${recipe.name}开始制作，等候时可以继续合成。` });
      break;
    }
    case 'collect': {
      if (!Number.isInteger(command.slot) || command.slot < 0 || command.slot >= 4) return reject('厨具不存在。');
      const job = state.jobs[command.slot];
      if (!job) return reject('这台厨具没有待领取的料理。');
      if (job.endsAt > time) return reject('料理还差一点火候，再等等吧。');
      const index = emptyCell(state);
      if (index < 0 && state.storage.length >= state.storageCapacity) return reject('棋盘和仓库都满啦，料理会在厨具里保温。');
      const recipe = RECIPES.find(recipe => recipe.id === job.recipe)!;
      const item = instance(state, job.output ?? recipe.output);
      if (index >= 0) state.board[index] = item; else state.storage.push(item);
      state.jobs[command.slot] = null;
      state.stats.cooked++;
      events.push({ type: 'collect', message: `${recipe.name}出炉啦${index < 0 ? '，已放进仓库' : ''}！`, index: index >= 0 ? index : undefined, item: recipe.output });
      break;
    }
    case 'deliver': {
      const order = availableOrders(state).find(order => order.id === command.order);
      if (!order) return reject('这份订单已完成，或还没有排到。');
      if (!canAffordRequirements(state, order.needs)) return reject('订单还差一些食材，备齐再交付吧。');
      consume(state, order.needs);
      const coins = getOrderReward(state, order);
      state.coins += coins;
      state.reputation += order.reputation;
      const workspace=activeWorkspace(state);
      if(order.id.startsWith('regular:')&&workspace){const i=workspace.regularOrders.findIndex(o=>o.id===order.id);const template=regularTemplates(workspace.chapter)[i]!;workspace.regularOrders[i]={...structuredClone(template),id:`regular:g${state.nextId++}`};workspace.regularCompleted++;}
      else state.completedOrders.push(order.id);
      state.stats.earned += coins;
      events.push({ type: 'deliver', message: order.thanks, amount: coins, order: order.id });
      if (order.needs.some(need => ITEMS[need.item].kind !== 'ingredient')) events.push({ type: 'deliver-dish', message: '', order: order.id });
      break;
    }
    case 'build': {
      const node = BUILD_NODES[state.construction.completed.length];
      if (!node || node.id !== command.node) return reject('建设步骤已经改变，请打开当前建设点。');
      if (state.coins < node.cost) return reject(`还差 ${node.cost - state.coins} 金币，完成订单就能继续。`);
      state.coins -= node.cost;
      state.construction.completed.push(node.id); state.construction.hats += node.hats;
      state.energy.value += node.energy;
      events.push({ type: 'build', message: `${node.name}完成！获得 ${node.energy} 体力和 ${node.hats} 顶厨师帽。`, node: node.id, amount: node.cost });
      break;
    }
    case 'claimConstructionReward': {
      if (!getConstructionProgress(state).canClaimReward) return reject('完成全部建设后可领取，奖励仅能领取一次。');
      state.construction.rewardClaimed = true; state.energy.value += ENERGY_CONFIG.buildCompletionReward;
      events.push({ type: 'reward', message: `果蔬店开张啦！获得 ${ENERGY_CONFIG.buildCompletionReward} 体力。`, amount: ENERGY_CONFIG.buildCompletionReward });
      break;
    }
    case 'claimMigration': {
      const itemIndex = state.migrationInbox.findIndex(item => item.uid === command.uid);
      const index = emptyCell(state);
      if (itemIndex < 0) return reject('这份迁移物品已领取。');
      if (index < 0) return reject('棋盘满啦，物品会保留在迁移收纳箱里。');
      state.board[index] = state.migrationInbox.splice(itemIndex, 1)[0];
      events.push({ type: 'retrieve', message: '已取回原存档中的食材。', index, uid: command.uid });
      break;
    }
    case 'session': {
      const value = command.session;
      if (!value || typeof value !== 'object' || Array.isArray(value) || Object.entries(value).some(([key, item]) => key === 'page' ? !['merge', 'street'].includes(item as string) : key === 'selectedUid' ? item !== null && typeof item !== 'string' : key === 'orderScroll' ? !Number.isFinite(item) || (item as number) < 0 : true)) return reject('界面状态不正确。');
      state.session = { ...state.session, ...value, orderScroll: Math.min(100_000, Math.round(value.orderScroll ?? state.session.orderScroll)) };
      if (value.page === 'street') events.push({ type: 'visit-street', message: '' });
      break;
    }
    case 'recover': break;
    case 'upgrade': {
      const shop = SHOPS.find(shop => shop.id === command.shop);
      if (!shop || shop.day > state.day) return reject('这家店将在后续章节开放。');
      const stage = state.shops[shop.id] ?? 0;
      if (stage >= 3) return reject('这家店已经焕然一新啦。');
      const cost = shop.costs[stage];
      if (state.coins < cost) return reject(`还差 ${cost - state.coins} 金币，完成订单就能继续。`);
      state.coins -= cost;
      state.shops[shop.id] = stage + 1;
      events.push({ type: 'upgrade', message: `${shop.name}${['已整理完毕', '开张啦', '焕然一新啦'][stage]}！`, amount: cost });
      break;
    }
    case 'decorate': {
      const decoration = DECORATIONS.find(item => item.id === command.decoration);
      if (!decoration || (state.shops[decoration.shop] ?? 0) < 2) return reject('店铺开张后，就能添置装饰啦。');
      if (state.decorations.includes(decoration.id)) return reject('这件装饰已经摆好了。');
      if (state.coins < decoration.cost) return reject(`还差 ${decoration.cost - state.coins} 金币。`);
      state.coins -= decoration.cost;
      state.decorations.push(decoration.id);
      events.push({ type: 'decorate', message: `${decoration.name}已经摆好，老街又暖了一点。`, amount: decoration.cost });
      break;
    }
    case 'nextDay': {
      if (state.campaign === 'fresh') return reject('首店已经迎来新鲜的一天，继续合成、收集和整理你的果蔬小店吧。');
      const progress = getDayProgress(state);
      if (state.day >= 6) return reject('六章已经全部开放，继续装点你的鹅巷吧。');
      if (progress.completed !== progress.total) return reject('还有客人的订单没完成，先招呼好大家吧。');
      if (!progress.shopReady) return reject('把本章店铺修到「开张」，再迎接新一天。');
      state.day++;
      events.push({ type: 'nextDay', message: `第 ${state.day} 章开始啦，新的店铺和味道在等你。` });
      break;
    }
    case 'settings': {
      if (!command.settings || typeof command.settings !== 'object' || Array.isArray(command.settings)) return reject('设置格式不正确。');
      for (const [key, value] of Object.entries(command.settings)) {
        if (key === 'volume' ? typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1 : !['music', 'sound', 'reducedMotion'].includes(key) || typeof value !== 'boolean') return reject('设置值不正确。');
      }
      state.settings = { ...state.settings, ...command.settings };
      events.push({ type: 'settings', message: '偏好已保存。' });
      break;
    }
    case 'tutorial': {
      if (!Number.isInteger(command.step) || command.step < state.tutorial || command.step > 5) return reject('引导进度不正确。');
      state.tutorial = command.step;
      events.push({ type: 'tutorial', message: command.step === 5 ? '老街交给你啦，随时可以打开图鉴查看帮助。' : '继续试试看吧。' });
      break;
    }
    default: return reject('操作未识别，请重试。');
  }
  if (!hasChapters(state) && reconcileHomeDevices(state)) events.push(themeStage(state)===2?{ type: 'home-unlocked', message: '家常菜厨房开放啦！两类肉车、香料盒和料理锅已经就位。', index: 47 }:{type:'theme-unlocked',message:'新主题开放啦！赠送设备已收入设备架，继续探索下一街区。'});
  if (!Number.isSafeInteger(state.coins) || state.coins < 0 || !Number.isSafeInteger(state.reputation)) return reject('这次操作超出了可保存范围。');
  if (!Number.isSafeInteger(state.energy.value) || state.energy.value < 0) return reject('体力超出了可保存范围。');
  for (let index = 0; state.activeWorkspaceId === original.activeWorkspaceId && index < state.board.length; index++) {
    const device = deviceAt(state, index);
    const changedDevice = device?.kind === 'appliance' && state.appliances.find(value => value.id === device.id)?.version !== original.appliances.find(value => value.id === device.id)?.version;
    if (state.board[index]?.uid !== original.board[index]?.uid || changedDevice || device?.id !== deviceAt(original, index)?.id) state.cellVersions[index] = (original.cellVersions[index] ?? 0) + 1;
  }
  if (command.commandId) state.processedCommandIds = [...state.processedCommandIds, command.commandId].slice(-256);
  advanceTutorial(state, events);
  if (state.session.selectedUid && ![...state.board.filter(Boolean), ...state.appliances].some(value => value && ('uid' in value ? value.uid : value.id) === state.session.selectedUid) && !activeDevices(state).some(value => value.id === state.session.selectedUid)) state.session.selectedUid = null;
  state.revision++;
  if (preserveUndo && state.undo) state.undo.revision = state.revision;
  state.lastSeen = time;
  return { state, ok: true, events };
}

function flatInvariantErrors(state: GameState): string[] {
  const errors: string[] = [];
  if (state.board.length !== (state.schemaVersion >= 2 ? BOARD_SIZE : 56) || state.jobs.length !== 4) errors.push('board/job length');
  if (state.storage.length > state.storageCapacity) errors.push('storage overflow');
  if (!Number.isSafeInteger(state.coins) || state.coins < 0) errors.push('coins');
  if (state.board.slice(unlockedCells(state)).some(Boolean)) errors.push('locked cell occupied');
  if (activeDevices(state).some(entity => state.board[entity.index])) errors.push('device cell occupied');
  if (state.schemaVersion >= 3 && state.campaign==='fresh') {
    const onBoard=state.devices.filter(d=>d.index!==null);
    if(new Set(state.devices.map(d=>d.id)).size!==state.devices.length||new Set(onBoard.map(d=>d.index)).size!==onBoard.length)errors.push('duplicate device');
    if(onBoard.some(d=>d.index!<0||d.index!>=unlockedCells(state)))errors.push('device location');
    if(state.devices.some(d=>!DEVICE_FAMILIES.some(f=>f.id===d.familyId)||!Number.isInteger(d.level)||d.level<1||d.level>3))errors.push('device definition');
    const chefs=state.devices.filter(d=>DEVICE_FAMILIES.find(f=>f.id===d.familyId)?.kind==='appliance');
    if(chefs.length!==state.appliances.length||chefs.some(d=>!state.appliances.some(a=>a.id===d.id&&a.index===(d.index??-1))))errors.push('appliance instances');
  } else if (state.schemaVersion >= 2) {
    const definitions = activeDevices(state).filter(device => device.kind === 'appliance');
    if (state.appliances.length !== definitions.length || definitions.some(device => state.appliances.filter(appliance => appliance.id === device.id && appliance.slot === device.slot && appliance.index === device.index).length !== 1)) errors.push('appliance layout');
  }
  if (!Number.isSafeInteger(state.energy.value) || state.energy.value < 0) errors.push('energy');
  if (state.cellVersions.length !== state.board.length || state.cellVersions.some(version => !Number.isSafeInteger(version) || version < 0)) errors.push('cell versions');
  const allItems = [...state.board.filter((item): item is ItemInstance => item !== null), ...state.storage, ...state.migrationInbox, ...state.appliances.flatMap(appliance => [...appliance.inputSlots, ...(appliance.outputSlot ? [appliance.outputSlot] : [])])];
  const uids = [...allItems.map(item => item.uid), ...state.jobs.filter(Boolean).map(job => job!.id), ...state.appliances.flatMap(appliance => appliance.job ? [appliance.job.id] : [])];
  if (new Set(uids).size !== uids.length) errors.push('duplicate instance id');
  if (allItems.some(item => !ITEMS[item.item])) errors.push('unknown item');
  if (new Set(state.completedOrders).size !== state.completedOrders.length) errors.push('duplicate order');
  if (state.completedOrders.some(id => !ORDERS.some(order => order.id === id && order.day <= state.day))) errors.push('unknown/future completed order');
  if (Object.values(state.generators).some(generator => generator.remaining < 0 || generator.remaining > GENERATOR_CAPACITY || !Number.isInteger(generator.remaining))) errors.push('generator quota');
  if (state.jobs.some((job, index) => job && (!RECIPES.some(recipe => recipe.id === job.recipe && recipe.appliance === index) || job.endsAt < job.startedAt))) errors.push('cooking job');
  if (Object.entries(state.shops).some(([id, stage]) => !SHOPS.some(shop => shop.id === id) || !Number.isInteger(stage) || stage < 0 || stage > 3)) errors.push('shop stage');
  if (state.construction.completed.some((id, index) => BUILD_NODES[index]?.id !== id) || state.construction.completed.length > BUILD_NODES.length) errors.push('construction order');
  for (const appliance of state.appliances) {
    if (appliance.job && (appliance.inputSlots.length > 0 || appliance.job.endsAt < appliance.job.startedAt)) errors.push('appliance ownership');
    if (appliance.outputSlot && !appliance.job) errors.push('orphan output');
    if (appliance.job && !RECIPES.some(recipe => recipe.id === appliance.job!.recipe && recipeMatchesDevice(state,appliance,recipe))) errors.push('appliance job');
    if (appliance.inputSlots.length && !compatibleRecipes(state, appliance).length) errors.push('incompatible inputs');
  }
  return errors;
}

export function stateInvariantErrors(state: GameState): string[] {
  bindWorkspaceViews(state);
  if(!hasChapters(state))return flatInvariantErrors(state);
  const errors:string[]=[];const ids=new Set<string>();
  for(const w of allWorkspaces(state)){
    const view=bindWorkspaceViews({...state,activeWorkspaceId:w.id});errors.push(...flatInvariantErrors(view).map(e=>w.id+': '+e));
    const objects=[...w.board.filter(Boolean),...w.storage,...w.migrationInbox,...w.appliances.flatMap(a=>[...a.inputSlots,...(a.outputSlot?[a.outputSlot]:[])])];
    const used=[...objects.map(o=>o!.uid),...w.devices.map(d=>d.id),...w.jobs.filter(Boolean).map(j=>j!.id),...w.appliances.flatMap(a=>a.job?[a.job.id]:[]),...w.regularOrders.map(o=>o.id)];
    for(const id of used){if(ids.has(id))errors.push('duplicate global id');ids.add(id);}
  }
  if(deviceCount(state)+reservedDevices(state)>MAX_DEVICES)errors.push('reserved device capacity');
  return errors;
}

export function getRecipeLayoutPreview(state:GameState, recipeId:string) {
  const recipe=availableApplianceRecipes(state).find(r=>r.id===recipeId);if(!recipe)return null;
  const dep=resolveRecipeDevices([recipe.output]);
  const families=dep.families.map(id=>{const device=state.devices.filter(d=>d.familyId===id).sort((a,b)=>b.level-a.level||Number(b.index!==null)-Number(a.index!==null))[0];return {id,name:DEVICE_FAMILIES.find(f=>f.id===id)!.name,level:dep.levels[id]??1,ownedLevel:device?.level??0,device:device?.id,onBoard:!!device&&device.index!==null};});
  return {families,requiredSpaces:families.filter(f=>!f.onBoard).length,freeSpaces:state.board.filter((_,i)=>getBoardEntity(state,i).kind==='empty').length,stowable:state.devices.filter(d=>d.index!==null&&!families.some(f=>f.device===d.id)&&deviceIdle(state,d.id)).length};
}
