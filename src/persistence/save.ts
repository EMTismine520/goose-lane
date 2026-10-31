import { CHAPTERS, MAX_DEVICES, chapterDefinition, regularTemplates } from '../content/chapters';
import { activeWorkspace, allWorkspaces, bindWorkspaceViews, cloneGameState, deviceCount, initializeChapters, reservedDevices, WORKSPACE_FIELDS } from '../domain/workspaces';
import type { Workspace, OrderDef } from '../domain/types';
const SCHEMA_VERSION=3, CONTENT_VERSION='4.0.0';
import { APPLIANCES, CHAINS, CONTENT_VERSION as CURRENT_CONTENT_VERSION, DECORATIONS, HOME_CHAINS, ITEMS, ORDERS, RECIPES, SCHEMA_VERSION as CURRENT_SCHEMA_VERSION, SHOPS } from '../content/catalog';
import { perfSpan } from '../platform/performance';
import { ENERGY_CONFIG, SPEED_UP_CONFIG } from '../content/production';
import type { GameState, ItemInstance } from '../domain/types';
import { availableApplianceRecipes, createInitialState, unlockedCells } from '../domain/engine';
import { activeDevices, BOARD_LAYOUT, BUILD_NODES } from '../content/board-layouts';
import { reconcileHomeDevices } from '../domain/home-progression';
import { TUTORIAL_STEPS } from '../content/tutorial';
import { DEVICE_FAMILIES } from '../content/expansion';
import { productionFor, recipeMatchesDevice, reconcileDeviceGrants, themeStage } from '../domain/devices';
import type { DeviceInstance } from '../domain/types';

const MAX_SAVE_BYTES = 1_000_000;
const MAX_COUNTER = 1_000_000_000_000;
const STORE = 'snapshots';
type RecordValue = Record<string, unknown>;
interface Snapshot { format: 1; token: string; data: string; savedAt: number; }

export class SaveError extends Error {
  constructor(message: string, public readonly code: 'invalid' | 'future' | 'conflict' | 'storage' | 'corrupt', options?: ErrorOptions) {
    super(message, options);
    this.name = 'SaveError';
  }
}

const invalid = (path: string): never => { throw new SaveError(`存档中的「${path}」无效，未修改现有进度。`, 'invalid'); };
function object(value: unknown, path: string, keys?: string[]): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid(path);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return invalid(path);
  const record = value as RecordValue;
  if (Object.keys(record).some((key) => key === '__proto__' || key === 'constructor' || key === 'prototype' || (keys && !keys.includes(key)))) return invalid(path);
  return record;
}
function integer(value: unknown, path: string, min = 0, max = MAX_COUNTER): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) return invalid(path);
  return value;
}
function boolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') return invalid(path);
  return value;
}
function text(value: unknown, path: string, max = 80): string {
  if (typeof value !== 'string' || !value.length || value.length > max || /[\u0000-\u001f]/.test(value)) return invalid(path);
  return value;
}
function array(value: unknown, path: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) return invalid(path);
  for (let index = 0; index < value.length; index++) if (!(index in value)) return invalid(path);
  return value;
}
function known(value: unknown, choices: readonly string[], path: string): string {
  const id = text(value, path);
  if (!choices.includes(id)) return invalid(path);
  return id;
}
function uniqueIds(value: unknown, choices: readonly string[], path: string): string[] {
  const ids = array(value, path, choices.length).map((entry) => known(entry, choices, path));
  if (new Set(ids).size !== ids.length) return invalid(path);
  return ids;
}

const LEGACY_FIELDS = ['schemaVersion', 'contentVersion', 'revision', 'seed', 'nextId', 'board', 'storage', 'storageCapacity', 'generators', 'jobs', 'completedOrders', 'day', 'coins', 'reputation', 'shops', 'decorations', 'discovered', 'stats', 'tutorial', 'settings', 'lastSeen', 'undo'];
const CURRENT_FIELDS = [...LEGACY_FIELDS, 'energy', 'appliances', 'construction', 'tutorialState', 'session', 'migrationInbox', 'processedCommandIds', 'cellVersions', 'campaign','devices','deviceGrants','deviceDiscovered'];

/** Explicit, lossless inventory migration. Unknown content never silently changes identity. */
function migrate(value: unknown): RecordValue {
  const source = object(value, '根对象');
  const version = integer(source.schemaVersion, '版本', 0, Number.MAX_SAFE_INTEGER);
  if (version > SCHEMA_VERSION) throw new SaveError('这是较新版本的存档，请使用新版游戏打开。原档已保留。', 'future');
  if (version === SCHEMA_VERSION) return source;
  if (version === 2) {
    if(!['2.0.0','2.1.0'].includes(String(source.contentVersion)))throw new SaveError('存档内容版本不兼容，原档已保留。','future');
    return object(source,'旧版根对象',CURRENT_FIELDS.filter(k=>!['devices','deviceGrants','deviceDiscovered'].includes(k)));
  }
  if (version !== 0 && version !== 1) return invalid('版本');
  object(source, '旧版根对象', LEGACY_FIELDS);
  let legacy = { ...source };
  if (version === 0) {
    const settings = object(source.settings, '旧版设置', ['muted', 'volume']);
    boolean(settings.muted, '旧版静音');
    if ('contentVersion' in source || 'storageCapacity' in source || 'undo' in source) return invalid('旧版结构');
    legacy = { ...legacy, storageCapacity: 8, undo: null, settings: { music: !settings.muted, sound: !settings.muted, volume: settings.volume, reducedMotion: false } };
  } else if (source.contentVersion !== '1.0.0') throw new SaveError('存档内容版本不兼容，请使用对应版本游戏；原档未被覆盖。', 'future');
  const day = integer(legacy.day, '经营日', 1, 6);
  const oldBoard = array(legacy.board, '旧版棋盘', 56);
  const oldLimit = day < 3 ? 42 : day < 5 ? 49 : 56;
  if (oldBoard.length !== 56 || oldBoard.some((entry, index) => entry !== null && index >= oldLimit)) return invalid('旧版棋盘格数');
  const base=createInitialState(integer(legacy.lastSeen, '最后游玩时间', 0, Number.MAX_SAFE_INTEGER));
  const initial={...base,...Object.fromEntries(WORKSPACE_FIELDS.map(k=>[k,base[k]]))};
  delete initial.workspaces;delete initial.activeWorkspaceId;delete initial.chapterAccess;
  delete (initial as Partial<GameState>).speedUpTickets;
  const limit = day >= 5 ? 63 : day >= 4 ? 56 : day >= 3 ? 49 : 42;
  const occupied = new Set(BOARD_LAYOUT.entities.map((entry) => entry.index));
  const board: unknown[] = Array(63).fill(null);
  const migrationInbox: unknown[] = [];
  let undo = legacy.undo;
  let undoIndex = -1;
  if (undo !== null) {
    const record = object(undo, '旧版撤销', ['item', 'index', 'coins', 'revision']);
    const index = integer(record.index, '旧版撤销位置', 0, oldLimit - 1);
    if (oldBoard[index] !== null || record.revision !== legacy.revision) return invalid('撤销状态');
    undoIndex = index < limit && !occupied.has(index) ? index : board.findIndex((_, index) => index < limit && !occupied.has(index));
    undo = { ...record, index: undoIndex };
  }
  const displaced: unknown[] = [];
  oldBoard.forEach((entry, index) => {
    if (entry === null) return;
    if (index < limit && !occupied.has(index) && index !== undoIndex) board[index] = entry;
    else displaced.push(entry);
  });
  displaced.forEach((entry) => {
    const free = board.findIndex((value, index) => value === null && index < limit && !occupied.has(index) && index !== undoIndex);
    if (free < 0) migrationInbox.push(entry); else board[free] = entry;
  });
  const generators = object(legacy.generators, '旧版生产器', ['grain', 'coffee', 'vegetable', 'dairy', 'fruit', 'seafood', 'meat', 'dessert']);
  for (const id of ['grain', 'coffee', 'vegetable', 'dairy', 'fruit', 'seafood', 'meat', 'dessert']) if (!(id in generators)) return invalid('旧版生产器');
  const jobs = array(legacy.jobs, '旧版加工槽', APPLIANCES.length).map((raw) => {
    if (raw === null) return null;
    const job = object(raw, '旧版加工任务', ['id', 'recipe', 'startedAt', 'endsAt']);
    const recipe = RECIPES.find((entry) => entry.id === job.recipe);
    return { ...job, ...(recipe ? { output: recipe.output } : {}) };
  });
  const tutorial = integer(legacy.tutorial, '旧版教学', 0, 5);
  const tutorialIndex = tutorial >= 4 || day > 1 ? TUTORIAL_STEPS.length : [0, 1, 2, 3][tutorial];
  return { ...initial, ...legacy, schemaVersion: SCHEMA_VERSION, contentVersion: CONTENT_VERSION, board, jobs, undo,
    generators: { ...initial.generators, ...generators }, migrationInbox, campaign: 'legacy',
    tutorialState: { node: TUTORIAL_STEPS[tutorialIndex]?.id ?? 'complete', completed: TUTORIAL_STEPS.slice(0, tutorialIndex).map((step) => step.id), targetUid: null },
  };
}

/** Validate every persisted field and build a detached, bounded, known-shape state. */
function validateFlatSave(input: unknown, scope?: Workspace): GameState {
  const value = object(migrate(input), '根对象', CURRENT_FIELDS);
  const oldSchema=value.schemaVersion===2;
  const oldContent = value.contentVersion === '2.0.0';
  if (!oldSchema && value.contentVersion !== CONTENT_VERSION) throw new SaveError('存档内容版本不兼容，请使用对应版本游戏；原档未被覆盖。', 'future');
  const day = integer(value.day, '经营日', 1, 6);
  const revision = integer(value.revision, '修订号');
  const nextId = integer(value.nextId, '下一个编号', 1);
  const itemIds = Object.keys(ITEMS);
  const used = new Set<string>();
  const takeUid = (value: unknown, path: string): string => {
    const uid = text(value, path);
    const match = /^g([1-9]\d*)$/.exec(uid);
    if (!match || !Number.isSafeInteger(Number(match[1])) || Number(match[1]) >= nextId || used.has(uid)) return invalid(path);
    used.add(uid);
    return uid;
  };
  const item = (raw: unknown, path: string): ItemInstance => {
    const entry = object(raw, path, ['uid', 'item']);
    return { uid: takeUid(entry.uid, `${path}编号`), item: known(entry.item, itemIds, `${path}物品`) };
  };
  const campaign = known(value.campaign, ['fresh', 'legacy'], '内容章节') as 'fresh' | 'legacy';
  const constructionRaw = object(value.construction, '建设', ['completed', 'hats', 'rewardClaimed']);
  const completed = uniqueIds(constructionRaw.completed, BUILD_NODES.map((node) => node.id), '建设步骤');
  if (completed.some((id, index) => id !== BUILD_NODES[index].id)) return invalid('建设顺序');
  const rewardClaimed = boolean(constructionRaw.rewardClaimed, '建设阶段奖励');
  if (rewardClaimed && completed.length !== BUILD_NODES.length) return invalid('建设阶段奖励');
  const construction = { completed, hats: integer(constructionRaw.hats, '厨师帽'), rewardClaimed };
  const completedOrders = uniqueIds(value.completedOrders, ORDERS.map((order) => order.id), '已完成订单');
  const progressState = { schemaVersion: oldSchema?2:SCHEMA_VERSION, day, campaign, construction, completedOrders } as GameState;
  const limit = scope?.mode==='chapter'&&scope.chapter!==1?63:unlockedCells(progressState);
  const oldDefinitions = oldContent ? BOARD_LAYOUT.entities : activeDevices(progressState);
  const devices: DeviceInstance[]=oldSchema ? oldDefinitions.map(d=>({id:d.id,familyId:d.id,level:1,index:d.index,selectedChain:d.chain??null,band:0,version:0})) : array(value.devices,'设备',MAX_DEVICES).map(raw=>{
    const d=object(raw,'设备',['id','familyId','level','index','selectedChain','band','version']);
    const familyId=known(d.familyId,DEVICE_FAMILIES.map(f=>f.id),'设备类别'), family=DEVICE_FAMILIES.find(f=>f.id===familyId)!;
    const id=text(d.id,'设备编号');
    const match=/^d([1-9]\d*)$/.exec(id);
    if(id!==familyId&&(!match||Number(match[1])>=nextId)||used.has(id)||(scope ? scope.mode==='original'?family.stage>scope.originalStage!:!chapterDefinition(scope.chapter)!.dependencies.families.includes(familyId):family.stage>themeStage(progressState))&&campaign==='fresh')return invalid('设备编号或开放状态');
    used.add(id);
    const level=integer(d.level,'设备等级',1,3), band=integer(d.band,'产出段',0,4);
    const selectedChain=d.selectedChain===null?null:known(d.selectedChain,family.chains,'选择的系列');
    if(family.kind==='generator'&&(!selectedChain||!productionFor(selectedChain,band)||productionFor(selectedChain,band)!.minLevel>level))return invalid('生产器设置');
    if(family.kind==='appliance'&&(selectedChain!==null||band!==0))return invalid('厨具设置');
    return {id,familyId,level,index:d.index===null?null:integer(d.index,'设备位置',0,limit-1),selectedChain,band,version:integer(d.version,'设备版本')};
  });
  const deviceGrants=oldSchema?devices.map(d=>d.familyId):uniqueIds(value.deviceGrants,DEVICE_FAMILIES.map(f=>f.id),'设备赠送记录');
  const formIds=DEVICE_FAMILIES.flatMap(f=>[1,2,3].map(l=>`${f.id}-l${l}`));
  const deviceDiscovered=oldSchema?devices.map(d=>`${d.familyId}-l1`):uniqueIds(value.deviceDiscovered,formIds,'设备图鉴');
  if(new Set(devices.map(d=>d.id)).size!==devices.length||devices.some(d=>!deviceGrants.includes(d.familyId)))return invalid('设备记录');
  const occupied = new Set(devices.filter(d=>d.index!==null).map(d=>d.index!));
  if(occupied.size!==devices.filter(d=>d.index!==null).length)return invalid('设备重叠');
  progressState.devices=devices;progressState.schemaVersion=SCHEMA_VERSION;
  const board = array(value.board, '棋盘', 63).map((raw, index) => raw === null ? null : item(raw, `棋盘${index + 1}`));
  if (board.length !== 63 || board.some((entry, index) => entry && (index >= limit || occupied.has(index)))) return invalid('棋盘格数');
  const storageCapacity = integer(value.storageCapacity, '仓库容量', 8, 8);
  const storage = array(value.storage, '仓库', storageCapacity).map((raw, index) => item(raw, `仓库${index + 1}`));
  const generatorKeys = CHAINS.filter(chain => !oldSchema || !chain.stage || chain.stage<=2 && (!oldContent || !HOME_CHAINS.includes(chain))).map((chain) => chain.id);
  const generatorRaw = object(value.generators, '生产器', generatorKeys);
  const generators = Object.fromEntries(generatorKeys.map((id) => {
    const entry = object(generatorRaw[id], `生产器${id}`, ['remaining', 'readyAt']);
    return [id, { remaining: integer(entry.remaining, '生产器配额', 0, 12), readyAt: integer(entry.readyAt, '生产器时间', 0, Number.MAX_SAFE_INTEGER) }];
  }));
  const jobs = array(value.jobs, '加工槽', APPLIANCES.length).map((raw, slot) => {
    if (raw === null) return null;
    const entry = object(raw, '加工任务', ['id', 'recipe', 'startedAt', 'endsAt', 'output']);
    const recipe = known(entry.recipe, RECIPES.map((recipe) => recipe.id), '加工配方');
    const definition = RECIPES.find((entry) => entry.id === recipe)!;
    const startedAt = integer(entry.startedAt, '开始时间', 0, Number.MAX_SAFE_INTEGER);
    const endsAt = integer(entry.endsAt, '结束时间', startedAt, Number.MAX_SAFE_INTEGER);
    if (definition.appliance !== slot || definition.unlockDay > day) return invalid('加工槽配方');
    const output = entry.output === undefined ? undefined : known(entry.output, itemIds, '加工产物');
    if (output !== undefined && output !== definition.output) return invalid('加工产物');
    return { id: takeUid(entry.id, '加工编号'), recipe, startedAt, endsAt, ...(output ? { output } : {}) };
  });
  if (jobs.length !== APPLIANCES.length) return invalid('加工槽数量');
  if (completedOrders.some((id) => ORDERS.find((order) => order.id === id)!.day > day)) return invalid('订单经营日');
  const coins = integer(value.coins, '金币');
  const shopKeys = SHOPS.map((shop) => shop.id);
  const shopRaw = object(value.shops, '店铺', shopKeys);
  const shops = Object.fromEntries(SHOPS.map((shop) => [shop.id, integer(shopRaw[shop.id], `店铺${shop.id}`, 0, shop.costs.length)]));
  const decorations = uniqueIds(value.decorations, DECORATIONS.map((entry) => entry.id), '装饰');
  const discovered = uniqueIds(value.discovered, itemIds, '图鉴');
  const statsRaw = object(value.stats, '统计', ['merges', 'generated', 'cooked', 'earned']);
  const settingsRaw = object(value.settings, '设置', ['music', 'sound', 'reducedMotion', 'volume']);
  if (typeof settingsRaw.volume !== 'number' || !Number.isFinite(settingsRaw.volume) || settingsRaw.volume < 0 || settingsRaw.volume > 1) return invalid('音量');
  let undo: GameState['undo'] = null;
  if (value.undo !== null) {
    const entry = object(value.undo, '撤销', ['item', 'index', 'coins', 'revision']);
    const index = integer(entry.index, '撤销位置', 0, limit - 1);
    const undoItem = item(entry.item, '撤销物品');
    const undoCoins = integer(entry.coins, '撤销金币', 0, coins);
    if (board[index] !== null || occupied.has(index) || entry.revision !== revision || ITEMS[undoItem.item].sell !== undoCoins) return invalid('撤销状态');
    undo = { item: undoItem, index, coins: undoCoins, revision };
  }
  const lastSeen = integer(value.lastSeen, '最后游玩时间', 0, Number.MAX_SAFE_INTEGER);
  const energyRaw = object(value.energy, '体力', ['value', 'lastRecoveryAt']);
  const energy = { value: integer(energyRaw.value, '体力数值', 0, ENERGY_CONFIG.maxValue), lastRecoveryAt: integer(energyRaw.lastRecoveryAt, '体力回复时间', 0, lastSeen) };
  const applianceDefinitions = devices.filter(d=>DEVICE_FAMILIES.find(f=>f.id===d.familyId)!.kind==='appliance').map(d=>({...d,index:d.index??-1,slot:DEVICE_FAMILIES.find(f=>f.id===d.familyId)!.slot}));
  const allowedRecipes = scope ? scope.mode==='chapter'?chapterDefinition(scope.chapter)!.dependencies.recipes:RECIPES.filter(r=>(r.stage??1)<=scope.originalStage!) : availableApplianceRecipes(progressState);
  const applianceIds = new Set<string>();
  const appliances = array(value.appliances, '厨具', applianceDefinitions.length).map((raw) => {
    const entry = object(raw, '厨具', ['id', 'slot', 'index', 'inputSlots', 'job', 'outputSlot', 'version']);
    const definition = applianceDefinitions.find((device) => device.id === entry.id);
    if (!definition || applianceIds.has(definition.id) || entry.slot !== definition.slot || entry.index !== definition.index) return invalid('厨具位置');
    applianceIds.add(definition.id);
    const inputSlots = array(entry.inputSlots, '投料槽', 12).map((raw, index) => item(raw, `投料${index + 1}`));
    let job: GameState['appliances'][number]['job'] = null;
    if (entry.job !== null) {
      const rawJob = object(entry.job, '厨具任务', ['id', 'recipe', 'startedAt', 'endsAt', 'output']);
      const recipe = RECIPES.find((recipe) => recipe.id === rawJob.recipe);
      if (!recipe || !allowedRecipes.includes(recipe) || !recipeMatchesDevice(progressState,{id:definition.id,slot:definition.slot!,index:definition.index,inputSlots:[],job:null,outputSlot:null,version:0},recipe) || inputSlots.length) return invalid('厨具任务配方');
      const startedAt = integer(rawJob.startedAt, '厨具开始时间', 0, Number.MAX_SAFE_INTEGER);
      const endsAt = integer(rawJob.endsAt, '厨具结束时间', startedAt, Number.MAX_SAFE_INTEGER);
      const output = known(rawJob.output ?? recipe.output, itemIds, '厨具产物');
      if (output !== recipe.output) return invalid('厨具产物');
      job = { id: takeUid(rawJob.id, '厨具任务编号'), recipe: recipe.id, startedAt, endsAt, output };
    }
    const outputSlot = entry.outputSlot === null ? null : item(entry.outputSlot, '待取料理');
    if (outputSlot && (!job || job.output !== outputSlot.item || job.endsAt > lastSeen)) return invalid('待取料理状态');
    if (inputSlots.length && !allowedRecipes.some((recipe) => recipeMatchesDevice(progressState,{id:definition.id,slot:definition.slot!,index:definition.index,inputSlots:[],job:null,outputSlot:null,version:0},recipe) && inputSlots.every((ingredient) => recipe.inputs.some((need) => need.item === ingredient.item)) && recipe.inputs.every((need) => inputSlots.filter((ingredient) => ingredient.item === need.item).length <= need.count))) return invalid('厨具投料');
    if(definition.index===-1&&(inputSlots.length||job||outputSlot))return invalid('收纳中的忙碌厨具');
    return { id: definition.id, slot: definition.slot!, index: definition.index, inputSlots, job, outputSlot, version: integer(entry.version, '厨具版本') };
  });
  if (appliances.length !== applianceDefinitions.length) return invalid('厨具数量');
  const migrationInbox = array(value.migrationInbox, '迁移待领取', oldContent ? 256 : 261).map((raw, index) => item(raw, `待领取${index + 1}`));

  const tutorialRaw = object(value.tutorialState, '教学', ['node', 'completed', 'targetUid']);
  const tutorialIds = TUTORIAL_STEPS.map((step) => step.id);
  const reference = (raw: unknown, path: string) => raw === null ? null : text(raw, path);
  const tutorialState = { node: known(tutorialRaw.node, [...tutorialIds, 'complete'], '教学节点'), completed: uniqueIds(tutorialRaw.completed, tutorialIds, '已完成教学'), targetUid: reference(tutorialRaw.targetUid, '教学目标') };
  const sessionRaw = object(value.session, '页面现场', ['page', 'selectedUid', 'orderScroll']);
  const session = { page: known(sessionRaw.page, ['merge', 'street'], '页面') as 'merge' | 'street', selectedUid: reference(sessionRaw.selectedUid, '选中物'), orderScroll: integer(sessionRaw.orderScroll, '订单滚动位置', 0, 100000) };
  const processedCommandIds = array(value.processedCommandIds, '命令记录', 256).map((id) => text(id, '命令编号', 160));
  if (new Set(processedCommandIds).size !== processedCommandIds.length) return invalid('重复命令编号');
  const cellVersions = array(value.cellVersions, '格子版本', 63).map((version) => integer(version, '格子版本'));
  if (cellVersions.length !== 63) return invalid('格子版本数量');
  // Historical flat projections have no ticket wallet; validateSave adds it once at the root.
  const result = {
    schemaVersion: SCHEMA_VERSION, contentVersion: CONTENT_VERSION, revision,
    seed: integer(value.seed, '随机种子', 0, 0xffffffff), nextId, board, storage, storageCapacity,
    generators, jobs, completedOrders, day, coins, reputation: integer(value.reputation, '声望'), shops, decorations, discovered,
    stats: { merges: integer(statsRaw.merges, '合成统计'), generated: integer(statsRaw.generated, '生产统计'), cooked: integer(statsRaw.cooked, '料理统计'), earned: integer(statsRaw.earned, '收入统计') },
    tutorial: integer(value.tutorial, '教学进度', 0, 5),
    settings: { music: boolean(settingsRaw.music, '音乐开关'), sound: boolean(settingsRaw.sound, '音效开关'), reducedMotion: boolean(settingsRaw.reducedMotion, '减少动态'), volume: settingsRaw.volume },
    lastSeen, undo, energy, appliances, construction, tutorialState, session, migrationInbox, processedCommandIds, cellVersions, campaign,devices,deviceGrants,deviceDiscovered,
  } as GameState;
  if (oldSchema) {
    // Validate the complete old shape before changing layout. Never repair corrupt input.
    for (const chain of CHAINS) result.generators[chain.id] ??= { remaining: 12, readyAt: 0 };
    reconcileHomeDevices(result);
    return validateFlatSave(result);
  }
  if(!scope&&campaign==='fresh'&&DEVICE_FAMILIES.filter(f=>f.stage<=themeStage(result)).some(f=>!deviceGrants.includes(f.id)))return invalid('主题设备赠送记录');
  if(campaign==='fresh'&&devices.some(d=>!deviceDiscovered.includes(`${d.familyId}-l${d.level}`)))return invalid('设备发现记录');
  return result;
}

/** Validate all kitchens, then bind non-persisted lenses for existing presentation consumers. */
export function validateSave(input: unknown): GameState {
  const raw=object(input,'根对象');
  const version=integer(raw.schemaVersion,'版本',0,Number.MAX_SAFE_INTEGER);
  if(version>CURRENT_SCHEMA_VERSION)throw new SaveError('这是较新版本的存档，请使用新版游戏打开。原档已保留。','future');
  if(version<4){
    const flat=validateFlatSave(raw);
    const originalStage=themeStage(flat);
    flat.speedUpTickets=SPEED_UP_CONFIG.initial;
    flat.schemaVersion=CURRENT_SCHEMA_VERSION;flat.contentVersion=CURRENT_CONTENT_VERSION;
    return flat.campaign==='fresh'?initializeChapters(flat,originalStage):flat;
  }
  if(raw.contentVersion!==(version===4?'5.0.0':CURRENT_CONTENT_VERSION))throw new SaveError('存档内容版本不兼容，原档已保留。','future');
  const ticketFields=version===4?[]:['speedUpTickets'];
  const tickets=version===4?SPEED_UP_CONFIG.initial:integer(raw.speedUpTickets,'加速券',0,SPEED_UP_CONFIG.maxValue);
  if(raw.campaign!=='fresh'){
    object(raw,'根对象',[...CURRENT_FIELDS,...ticketFields]);
    const flat=validateFlatSave({...Object.fromEntries(CURRENT_FIELDS.map(k=>[k,raw[k]])),schemaVersion:3,contentVersion:'4.0.0'});
    flat.speedUpTickets=tickets;
    flat.schemaVersion=CURRENT_SCHEMA_VERSION;flat.contentVersion=CURRENT_CONTENT_VERSION;return flat;
  }
  const globals=CURRENT_FIELDS.filter(k=>!(WORKSPACE_FIELDS as readonly string[]).includes(k));
  object(raw,'根对象',[...globals,...ticketFields,'activeWorkspaceId','chapterAccess','workspaces']);
  const access=object(raw.chapterAccess,'章节权益',['unlocked','paidUnlocks']);
  const unlocked=array(access.unlocked,'已开放章节',8).map(n=>integer(n,'章节编号',1,8));
  if(!unlocked.includes(1)||new Set(unlocked).size!==unlocked.length)return invalid('章节权益');
  const paidUnlocks=integer(access.paidUnlocks,'已购买章节',0,7);
  if(paidUnlocks>unlocked.length-1)return invalid('购买记录');
  const rawWorkspaces=object(raw.workspaces,'厨房', ['original',...CHAPTERS.map(c=>'chapter-'+c.id)]);
  const activeId=known(raw.activeWorkspaceId,Object.keys(rawWorkspaces),'当前厨房');
  const workspaces:Record<string,Workspace>={};let root:GameState|undefined;
  for(const [id,source] of Object.entries(rawWorkspaces)){
    const w=object(source,'厨房'+id,[...WORKSPACE_FIELDS,'id','chapter','mode','originalStage','regularOrders','regularCompleted','orderTab','starterGranted']);
    const chapter=integer(w.chapter,'厨房章节',1,8),mode=known(w.mode,['chapter','original'],'厨房类型') as Workspace['mode'];
    if(w.id!==id||!unlocked.includes(chapter)||id!==(mode==='original'?'original':'chapter-'+chapter))return invalid('厨房标识');
    const scope={chapter,mode,...(mode==='original'?{originalStage:integer(w.originalStage,'原厨房权限',1,8)}:{})} as Workspace;
    if(mode==='original'&&scope.originalStage!==chapter)return invalid('原厨房权限');
    const rawUndo=raw.undo===null?null:object(raw.undo,'撤销',['item','index','coins','revision','workspaceId']);
    if(rawUndo&&rawUndo.workspaceId!==activeId)return invalid('撤销所属厨房');
    const flatInput={...Object.fromEntries(globals.map(k=>[k,raw[k]])),...Object.fromEntries(WORKSPACE_FIELDS.map(k=>[k,w[k]])),schemaVersion:3,contentVersion:'4.0.0',undo:id===activeId&&rawUndo?Object.fromEntries(Object.entries(rawUndo).filter(([k])=>k!=='workspaceId')):null};
    const flat=validateFlatSave(flatInput,scope);
    const regularRaw=array(w.regularOrders,'常客订单',3),templates=regularTemplates(chapter);
    if(regularRaw.length!==3)return invalid('常客订位');
    const regularOrders=regularRaw.map((value,i)=>{
      const o=object(value,'常客单',['id','day','stage','customer','title','message','thanks','needs','coins','reputation']);
      const id=text(o.id,'常客编号');const match=/^regular:g([1-9]\d*)$/.exec(id);
      if(!match||Number(match[1])>=flat.nextId)return invalid('常客编号');
      const needs=array(o.needs,'常客需求',12).map(raw=>{const n=object(raw,'需求',['item','count']);return {item:known(n.item,Object.keys(ITEMS),'常客物品'),count:integer(n.count,'常客数量',1,12)};});
      if(JSON.stringify(needs)!==JSON.stringify(templates[i].needs)||o.day!==1||o.stage!==chapter||o.reputation!==0)return invalid('常客需求');
      return {id,day:1,stage:chapter,customer:known(o.customer,['momo','uncle','taro','lin'],'常客'),title:text(o.title,'常客标题'),message:text(o.message,'常客留言',200),thanks:text(o.thanks,'常客答谢',200),needs,coins:integer(o.coins,'常客奖励',1,1000),reputation:0} as OrderDef;
    });
    workspaces[id]={...Object.fromEntries(WORKSPACE_FIELDS.map(k=>[k,flat[k]])),id,chapter,mode,...(scope.originalStage?{originalStage:scope.originalStage}:{}),regularOrders,regularCompleted:integer(w.regularCompleted,'常客完成次数'),orderTab:known(w.orderTab,['story','regular'],'订单类型') as Workspace['orderTab'],starterGranted:boolean(w.starterGranted,'启动赠送')} as Workspace;
    if(!workspaces[id].starterGranted)return invalid('启动赠送');
    if(mode==='chapter'){
      const allowed=chapterDefinition(chapter)!.dependencies;
      if(allowed.families.some(f=>!flat.deviceGrants.includes(f)))return invalid('章节设备配套');
      const items=[...flat.board.filter(Boolean),...flat.storage,...flat.migrationInbox,...flat.appliances.flatMap(a=>[...a.inputSlots,...(a.outputSlot?[a.outputSlot]:[])])];
      if(items.some(i=>!allowed.items.includes(i!.item)))return invalid('章节物品权限');
    }
    if(id===activeId){root=flat;if(root.undo)root.undo.workspaceId=id;}
  }
  if(!root||!Object.keys(workspaces).length)return invalid('厨房缺失');
  root.schemaVersion=CURRENT_SCHEMA_VERSION;root.contentVersion=CURRENT_CONTENT_VERSION;root.activeWorkspaceId=activeId;root.chapterAccess={unlocked,paidUnlocks};root.workspaces=workspaces;
  root.speedUpTickets=tickets;
  bindWorkspaceViews(root);
  const used=new Set<string>();
  for(const w of Object.values(workspaces)){
    const items=[...w.board.filter(Boolean),...w.storage,...w.migrationInbox,...w.appliances.flatMap(a=>[...a.inputSlots,...(a.outputSlot?[a.outputSlot]:[])])];
    const ids=[...items.map(i=>i!.uid),...w.devices.map(d=>d.id),...w.jobs.filter(Boolean).map(j=>j!.id),...w.appliances.flatMap(a=>a.job?[a.job.id]:[]),...w.regularOrders.map(o=>o.id)];
    for(const id of ids){if(used.has(id))return invalid('跨厨房重复编号');used.add(id);}
  }
  if(root.undo&&used.has(root.undo.item.uid))return invalid('撤销重复物品');
  if(deviceCount(root)+reservedDevices(root)>MAX_DEVICES)return invalid('设备总量或开章预留');
  return root;
}

export function serializeSave(state: GameState): string { const source=JSON.stringify(validateSave(state), null, 2); if(new TextEncoder().encode(source).length>MAX_SAVE_BYTES)throw new SaveError('存档超过1 MB限制，原进度未修改。','storage');return source; }
export function parseSave(source: string): GameState {
  if (typeof source !== 'string' || source.length > MAX_SAVE_BYTES || new TextEncoder().encode(source).length > MAX_SAVE_BYTES) throw new SaveError('存档文件超过 1 MB 限制。', 'invalid');
  let value: unknown;
  try { value = JSON.parse(source); } catch (cause) { throw new SaveError('存档不是有效的 JSON 文件，现有进度未修改。', 'invalid', { cause }); }
  return validateSave(value);
}

/** V4 imports never convert historical campaigns into the new game. */
export function parseImportSave(source: string): GameState {
  if (typeof source !== 'string' || source.length > MAX_SAVE_BYTES || new TextEncoder().encode(source).length > MAX_SAVE_BYTES) throw new SaveError('存档文件超过 1 MB 限制。','invalid');
  let value: unknown;
  try { value=JSON.parse(source); } catch (cause) { throw new SaveError('存档不是有效的 JSON 文件，现有进度未修改。','invalid',{cause}); }
  return validateSave(value);
}

export type SaveSlotId = 1 | 2 | 3;
export const SAVE_SLOT_IDS: readonly SaveSlotId[] = [1, 2, 3];
interface ManualSaveRecord {
  format: 1; slotId: SaveSlotId; token: string; savedAt: number; capturedAt: number; data: string;
}
export type ManualSlot =
  | { id: SaveSlotId; status: 'empty' }
  | { id: SaveSlotId; status: 'ready'; savedAt: number; capturedAt: number; state: GameState }
  | { id: SaveSlotId; status: 'corrupt' | 'incompatible'; message: string };

function checkSlotId(id: SaveSlotId): void {
  if (!SAVE_SLOT_IDS.includes(id)) invalid('存档格编号');
}
function parseManualSlot(raw: unknown, id: SaveSlotId): Extract<ManualSlot, { status: 'ready' }> {
  if (raw && typeof raw === 'object' && 'format' in raw && typeof raw.format === 'number' && raw.format > 1) throw new SaveError('此存档需要新版游戏才能读取。', 'future');
  const record = object(raw, '手动存档', ['format', 'slotId', 'token', 'savedAt', 'capturedAt', 'data']);
  if (record.format !== 1 || record.slotId !== id || typeof record.data !== 'string') invalid('手动存档记录');
  text(record.token, '手动存档标记', 120);
  const state = parseSave(record.data as string);
  const capturedAt = integer(record.capturedAt, '存档游戏时间', 0, Number.MAX_SAFE_INTEGER);
  if (capturedAt !== state.lastSeen) invalid('存档游戏时间');
  return { id, status: 'ready', state, capturedAt, savedAt: integer(record.savedAt, '手动保存时间', 0, 8_640_000_000_000_000) };
}

/** Resume the saved instant, rather than granting time elapsed while a slot was on the shelf. */
export function resumeManualSlot(slot: Extract<ManualSlot, { status: 'ready' }>, now: number, current?: GameState | null): GameState {
  const state = cloneGameState(slot.state);
  const time = integer(now, '读取时间', 0, Number.MAX_SAFE_INTEGER - 172_800_000);
  const delta = time - slot.capturedAt;
  const shift = (value: number) => Math.max(0, value + delta);
  const jobTime = (job: GameState['jobs'][number]) => {
    if (job) { job.startedAt = shift(job.startedAt); job.endsAt = shift(job.endsAt); }
  };
  state.lastSeen = time;
  state.energy.lastRecoveryAt = shift(state.energy.lastRecoveryAt);
  for(const w of allWorkspaces(state)){
  Object.values(w.generators).forEach(generator => { if (generator.readyAt) generator.readyAt = shift(generator.readyAt); });
  w.jobs.forEach(jobTime);
  w.appliances.forEach(appliance => jobTime(appliance.job));
  }
  state.revision = Math.max(current?.revision ?? -1, state.revision) + 1;
  if (state.undo) state.undo.revision = state.revision;
  if (current) state.settings = { ...current.settings };
  return validateSave(state);
}

function request<T>(result: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { result.onsuccess = () => resolve(result.result); result.onerror = () => reject(result.error); });
}
function completed(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('事务已中止'));
    transaction.onerror = () => { /* onabort carries the final transaction outcome. */ };
  });
}
function snapshot(raw: unknown): Snapshot | null {
  if (raw === undefined || raw === null) return null;
  const record = object(raw, '存储记录', ['format', 'token', 'data', 'savedAt']);
  if (record.format !== 1 || typeof record.data !== 'string') return invalid('存储记录');
  return { format: 1, token: text(record.token, '存储标记', 120), data: record.data, savedAt: integer(record.savedAt, '保存时间', 0, Number.MAX_SAFE_INTEGER) };
}
function tokenOf(raw: unknown): unknown { return raw && typeof raw === 'object' ? (raw as { token?: unknown }).token : null; }
function newToken(): string { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function storageError(cause: unknown): SaveError {
  if (cause instanceof SaveError) return cause;
  const name = cause && typeof cause === 'object' && 'name' in cause ? String(cause.name) : '';
  return new SaveError(name === 'QuotaExceededError' ? '设备存储空间不足，本次未保存。请保留此页面，检查可用空间后重试。' : '无法保存到设备。请保留此页面，检查浏览器存储权限后重试。', 'storage', { cause });
}

export class SaveRepository {
  private database: IDBDatabase | null = null;
  private expectedToken: unknown = null;
  private revision = -1;
  private opened = false;
  private corrupt = false;
  private queue: Promise<void> = Promise.resolve();
  private opening: Promise<{ state: GameState | null; recovered: boolean }> | null = null;

  constructor(private readonly databaseName = 'goose-lane-v4') {}

  async open(): Promise<{ state: GameState | null; recovered: boolean }> {
    if (this.opening) return this.opening;
    this.opening = this.openInternal();
    try { return await this.opening; } finally { this.opening = null; }
  }

  private async openInternal(): Promise<{ state: GameState | null; recovered: boolean }> {
    this.corrupt = false;
    try {
      if (!this.database) {
        if (typeof indexedDB === 'undefined') throw new Error('此浏览器没有 IndexedDB');
        this.database = await new Promise<IDBDatabase>((resolve, reject) => {
          const opening = indexedDB.open(this.databaseName, 1);
          opening.onupgradeneeded = () => { if (!opening.result.objectStoreNames.contains(STORE)) opening.result.createObjectStore(STORE); };
          opening.onsuccess = () => resolve(opening.result);
          opening.onerror = () => reject(opening.error);
          opening.onblocked = () => reject(new SaveError('存档升级被其他页面占用，请关闭其他游戏页面后重试。', 'storage'));
        });
        this.database.onversionchange = () => { this.database?.close(); this.database = null; this.opened = false; };
      }
      const transaction = this.database.transaction(STORE, 'readonly');
      const done = completed(transaction);
      const [rawCurrent, rawPrevious] = await Promise.all([request(transaction.objectStore(STORE).get('current')), request(transaction.objectStore(STORE).get('previous'))]);
      await done;
      this.expectedToken = tokenOf(rawCurrent);
      if (rawCurrent === undefined && rawPrevious === undefined) {
        this.opened = true; this.revision = -1;
        return { state: null, recovered: false };
      }
      let state: GameState | null = null;
      let currentFailure: unknown;
      try { const current = snapshot(rawCurrent); if (current) state = parseSave(current.data); } catch (cause) { currentFailure = cause; }
      if (currentFailure instanceof SaveError && currentFailure.code === 'future') throw currentFailure;
      const recovered = state === null;
      if (!state) {
        try { const previous = snapshot(rawPrevious); if (previous) state = parseSave(previous.data); } catch { /* Keep both original records for export. */ }
        if (!state) throw new SaveError('当前存档和上一份备份均无法读取。请导出原档或导入有效备份；原档仍被保留。', 'corrupt', { cause: currentFailure });
      }
      this.opened = true; this.revision = state.revision;
      return { state, recovered };
    } catch (cause) { this.opened = false; this.corrupt = cause instanceof SaveError && cause.code === 'corrupt'; throw storageError(cause); }
  }

  save(state: GameState): Promise<void> {
    let data: string;
    const finishSerialize = perfSpan('save-serialize');
    try { data = serializeSave(state); } catch (cause) { return Promise.reject(cause); } finally { finishSerialize(); }
    const revision = state.revision;
    const operation = this.queue.then(() => this.commit(data, revision, false));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  private async commit(data: string, revision: number, restoring: boolean, replacingCorrupt = false, manual?: ManualSaveRecord): Promise<void> {
    if (!this.database || (!this.opened && !(replacingCorrupt && this.corrupt))) throw new SaveError('存档尚未成功打开，不能覆盖设备上的原档。请先导出备份。', 'storage');
    if (!restoring && revision < this.revision) throw new SaveError('这份进度已过期，未覆盖较新的存档。请重新载入。', 'conflict');
    const database = this.database;
    const candidate: Snapshot = { format: 1, token: newToken(), data, savedAt: Date.now() };
    let failure: SaveError | null = null;
    try {
      const finishTransaction = perfSpan('indexeddb-transaction');
      const transaction = database.transaction(STORE, 'readwrite');
      const done = completed(transaction);
      const store = transaction.objectStore(STORE);
      const currentRequest = store.get('current');
      const previousRequest = replacingCorrupt ? store.get('previous') : null;
      // All reads, comparison and both writes execute inside this one IDB transaction.
      const write = () => {
        try {
          const rawCurrent: unknown = currentRequest.result;
          if (tokenOf(rawCurrent) !== this.expectedToken) {
            failure = new SaveError('另一页面已保存新进度，此页面已停止写入。请导出当前进度或重新载入。', 'conflict');
            transaction.abort();
            return;
          }
          if (replacingCorrupt) {
            store.put({ current: rawCurrent, previous: previousRequest?.result }, 'recovery');
            store.delete('previous');
          } else if (rawCurrent !== undefined) {
            let valid: Snapshot | null = null;
            const finishValidation = perfSpan('previous-save-validation');
            try { const current = snapshot(rawCurrent); if (current) { parseSave(current.data); valid = current; } } catch { /* Preserve damaged input verbatim. */ } finally { finishValidation(); }
            // Never turn a corrupt current snapshot into the last known-good backup.
            if (valid) {
              store.put(valid, 'previous');
              const originalVersion: unknown = JSON.parse(valid.data).schemaVersion;
              if (originalVersion === 0 || originalVersion === 1 || originalVersion === 2 || originalVersion === 3 || originalVersion === 4) store.put(valid, `migration-v${originalVersion}`);
            }
            else store.put(rawCurrent, 'recovery');
          }
          store.put(candidate, 'current');
          if (manual) store.put(manual, `manual-slot-${manual.slotId}`);
        } catch (cause) {
          failure = storageError(cause);
          transaction.abort();
        }
      };
      if (previousRequest) previousRequest.onsuccess = write;
      else currentRequest.onsuccess = write;
      try { await done; } finally { finishTransaction(); }
      this.expectedToken = candidate.token;
      this.revision = revision;
      this.opened = true;
      this.corrupt = false;
    } catch (cause) { throw failure || storageError(cause); }
  }

  async listManualSlots(): Promise<ManualSlot[]> {
    await this.queue;
    if (!this.database) throw new SaveError('存档存储尚未打开，请重试。', 'storage');
    try {
      const transaction = this.database.transaction(STORE, 'readonly');
      const done = completed(transaction);
      const records = await Promise.all(SAVE_SLOT_IDS.map(id => request(transaction.objectStore(STORE).get(`manual-slot-${id}`))));
      await done;
      return SAVE_SLOT_IDS.map((id, index): ManualSlot => {
        if (records[index] === undefined) return { id, status: 'empty' };
        try { return parseManualSlot(records[index], id); }
        catch (cause) { return { id, status: cause instanceof SaveError && cause.code === 'future' ? 'incompatible' : 'corrupt', message: cause instanceof Error ? cause.message : '此存档暂时无法读取。' }; }
      });
    } catch (cause) { throw storageError(cause); }
  }

  async readManualSlot(id: SaveSlotId): Promise<Extract<ManualSlot, { status: 'ready' }>> {
    checkSlotId(id);
    const slot = (await this.listManualSlots()).find(entry => entry.id === id)!;
    if (slot.status === 'ready') return slot;
    throw new SaveError(slot.status === 'empty' ? '这个位置还没有存档。' : slot.message, slot.status === 'incompatible' ? 'future' : 'invalid');
  }

  saveManualSlot(id: SaveSlotId, state: GameState, savedAt = Date.now()): Promise<void> {
    let manual: ManualSaveRecord;
    try {
      checkSlotId(id);
      manual = { format: 1, slotId: id, token: newToken(), savedAt: integer(savedAt, '手动保存时间', 0, 8_640_000_000_000_000), capturedAt: state.lastSeen, data: serializeSave(state) };
    } catch (cause) { return Promise.reject(cause); }
    const operation = this.queue.then(() => this.commit(manual.data, state.revision, false, false, manual));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  /** Explicit user import only: preserve both unreadable originals before replacing them. */
  replaceCorrupt(state: GameState): Promise<void> {
    if (!this.corrupt) return this.save(state);
    let data: string;
    try { data = serializeSave(state); } catch (cause) { return Promise.reject(cause); }
    const operation = this.queue.then(() => this.commit(data, state.revision, true, true));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  async restorePrevious(): Promise<GameState | null> {
    await this.queue;
    if (!this.database || !this.opened) throw new SaveError('请先成功打开存档，再恢复备份。', 'storage');
    const transaction = this.database.transaction(STORE, 'readonly');
    const done = completed(transaction);
    const rawPrevious = await request(transaction.objectStore(STORE).get('previous'));
    await done;
    const previous = snapshot(rawPrevious);
    if (!previous) return null;
    const restored = parseSave(previous.data);
    // Rebase the restored inventory to a new revision, so outstanding older writes stay stale.
    restored.revision = Math.max(this.revision, restored.revision) + 1;
    restored.undo = null;
    const operation = this.queue.then(() => this.commit(serializeSave(restored), restored.revision, true));
    this.queue = operation.catch(() => undefined);
    await operation;
    return restored;
  }

  /** Export untouched records even if semantic validation fails; for repair/support only. */
  async exportRaw(): Promise<string> {
    if (!this.database) throw new SaveError('设备存储当前不可访问，无法读取原始存档。', 'storage');
    const transaction = this.database.transaction(STORE, 'readonly');
    const done = completed(transaction);
    const store = transaction.objectStore(STORE);
    const [current, previous, recovery, migrationV0, migrationV1, migrationV2, migrationV3, migrationV4, ...manualSlots] = await Promise.all(['current', 'previous', 'recovery', 'migration-v0', 'migration-v1', 'migration-v2', 'migration-v3', 'migration-v4', ...SAVE_SLOT_IDS.map(id => `manual-slot-${id}`)].map((key) => request(store.get(key))));
    await done;
    return JSON.stringify({ format: 'goose-lane-recovery-v1', current, previous, recovery, migrationV0, migrationV1, migrationV2, migrationV3, migrationV4, manualSlots }, null, 2);
  }

  close(): void { this.database?.close(); this.database = null; this.opened = false; this.corrupt = false; }
}
