import { APPLIANCES, CHAINS, CONTENT_VERSION, DECORATIONS, ITEMS, ORDERS, RECIPES, SCHEMA_VERSION, SHOPS } from '../content/catalog';
import type { Command, CommandResult, GameEvent, GameState, ItemInstance, OrderDef, RecipeDef, Requirement } from './types';

export const BOARD_SIZE = 56;
export const GENERATOR_CAPACITY = 12;
export const GENERATOR_COOLDOWN = 8_000;
export const MAX_OFFLINE_MS = 86_400_000;
export const STORAGE_CAPACITY = 8;

const boundedTimestamp = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER - MAX_OFFLINE_MS * 2, Math.floor(value))) : 0;
export function effectiveNow(state: GameState, now = Date.now()): number {
  return Math.max(state.lastSeen, Math.min(boundedTimestamp(now), state.lastSeen + MAX_OFFLINE_MS));
}
export function unlockedCells(state: GameState): number { return state.day >= 5 ? 56 : state.day >= 3 ? 49 : 42; }
export function mergeTarget(item: string): string | null {
  const definition = ITEMS[item];
  return definition?.kind === 'ingredient' && definition.level < 7 ? `${definition.chain}-${definition.level + 1}` : null;
}

export function createInitialState(now = Date.now()): GameState {
  const board: (ItemInstance | null)[] = Array(BOARD_SIZE).fill(null);
  board[16] = { uid: 'g1', item: 'grain-1' };
  board[17] = { uid: 'g2', item: 'grain-1' };
  board[23] = { uid: 'g3', item: 'coffee-1' };
  board[24] = { uid: 'g4', item: 'coffee-1' };
  return {
    schemaVersion: SCHEMA_VERSION, contentVersion: CONTENT_VERSION, revision: 0, seed: 0x6f657321, nextId: 5,
    board, storage: [], storageCapacity: STORAGE_CAPACITY,
    generators: Object.fromEntries(CHAINS.map(chain => [chain.id, { remaining: GENERATOR_CAPACITY, readyAt: 0 }])),
    jobs: [null, null, null, null], completedOrders: [], day: 1, coins: 80, reputation: 0,
    shops: Object.fromEntries(SHOPS.map(shop => [shop.id, 0])), decorations: [], discovered: ['grain-1', 'coffee-1'],
    stats: { merges: 0, generated: 0, cooked: 0, earned: 0 }, tutorial: 0,
    settings: { music: false, sound: true, reducedMotion: false, volume: 0.55 }, lastSeen: boundedTimestamp(now), undo: null,
  };
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
  return ORDERS.filter(order => order.day === state.day && !completed.has(order.id)).slice(0, 3);
}
export function getDayProgress(state: GameState) {
  const orders = ORDERS.filter(order => order.day === state.day);
  const completed = orders.filter(order => state.completedOrders.includes(order.id)).length;
  const shop = SHOPS.find(shop => shop.day === state.day)!;
  const shopReady = (state.shops[shop.id] ?? 0) >= 2;
  return { completed, total: orders.length, ratio: completed / orders.length, shopReady, canAdvance: completed === orders.length && shopReady && state.day < 6 };
}
export function getGeneratorStatus(state: GameState, chain: string, now = Date.now()) {
  const generator = state.generators[chain];
  const definition = CHAINS.find(item => item.id === chain);
  const time = effectiveNow(state, now);
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
export function getRecipeDuration(state: GameState, recipe: RecipeDef): number {
  return Math.max(1000, Math.round(recipe.duration * (1 - getBonuses(state).speed)));
}
export function canCook(state: GameState, recipeId: string, slot?: number): boolean {
  const recipe = RECIPES.find(recipe => recipe.id === recipeId);
  if (!recipe) return false;
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
const emptyCell = (state: GameState) => state.board.findIndex((item, index) => item === null && index < unlockedCells(state));
const validCell = (state: GameState, index: number) => Number.isInteger(index) && index >= 0 && index < unlockedCells(state);

/** All mutations happen on a private copy; any rejected command returns the original state. */
export function execute(original: GameState, command: Command, now = Date.now()): CommandResult {
  const reject = (message: string): CommandResult => ({ state: original, ok: false, events: [{ type: 'error', message }] });
  if (!command || typeof command !== 'object') return reject('操作未识别，请重试。');
  if (!Number.isSafeInteger(original.revision + 1) || !Number.isSafeInteger(original.nextId + 1)) return reject('存档编号已到上限，请导出备份。');
  const state = structuredClone(original);
  const time = effectiveNow(state, now);
  if (!Number.isSafeInteger(time) || !Number.isSafeInteger(time + MAX_OFFLINE_MS)) return reject('存档时间超出安全范围，请恢复有效备份。');
  const events: GameEvent[] = [];
  state.undo = null;
  switch (command.type) {
    case 'generate': {
      const chain = CHAINS.find(chain => chain.id === command.chain);
      if (!chain || chain.unlockDay > state.day) return reject('这条食材链将在后续章节开放。');
      const index = emptyCell(state);
      if (index < 0) return reject('棋盘满啦，试试合成、交单或移入仓库。');
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
      state.undo = { item, index: command.index, coins, revision: state.revision + 1 };
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
      const item = instance(state, recipe.output);
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
      state.completedOrders.push(order.id);
      state.stats.earned += coins;
      events.push({ type: 'deliver', message: order.thanks, amount: coins });
      break;
    }
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
  if (!Number.isSafeInteger(state.coins) || state.coins < 0 || !Number.isSafeInteger(state.reputation)) return reject('这次操作超出了可保存范围。');
  state.revision++;
  state.lastSeen = time;
  return { state, ok: true, events };
}

export function stateInvariantErrors(state: GameState): string[] {
  const errors: string[] = [];
  if (state.board.length !== BOARD_SIZE || state.jobs.length !== 4) errors.push('board/job length');
  if (state.storage.length > state.storageCapacity) errors.push('storage overflow');
  if (!Number.isSafeInteger(state.coins) || state.coins < 0) errors.push('coins');
  if (state.board.slice(unlockedCells(state)).some(Boolean)) errors.push('locked cell occupied');
  const allItems = [...state.board.filter((item): item is ItemInstance => item !== null), ...state.storage];
  const uids = [...allItems.map(item => item.uid), ...state.jobs.filter(Boolean).map(job => job!.id)];
  if (new Set(uids).size !== uids.length) errors.push('duplicate instance id');
  if (allItems.some(item => !ITEMS[item.item])) errors.push('unknown item');
  if (new Set(state.completedOrders).size !== state.completedOrders.length) errors.push('duplicate order');
  if (state.completedOrders.some(id => !ORDERS.some(order => order.id === id && order.day <= state.day))) errors.push('unknown/future completed order');
  if (Object.values(state.generators).some(generator => generator.remaining < 0 || generator.remaining > GENERATOR_CAPACITY || !Number.isInteger(generator.remaining))) errors.push('generator quota');
  if (state.jobs.some((job, index) => job && (!RECIPES.some(recipe => recipe.id === job.recipe && recipe.appliance === index) || job.endsAt < job.startedAt))) errors.push('cooking job');
  if (Object.entries(state.shops).some(([id, stage]) => !SHOPS.some(shop => shop.id === id) || !Number.isInteger(stage) || stage < 0 || stage > 3)) errors.push('shop stage');
  return errors;
}
