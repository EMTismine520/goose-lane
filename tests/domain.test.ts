import { describe, expect, it } from 'vitest';
import { APPLIANCES, baseUnits, LEGACY_CHAINS as CHAINS, CUSTOMERS, DECORATIONS, LEGACY_ITEMS as ITEMS, LEGACY_ORDERS as ORDERS, LEGACY_RECIPES as RECIPES, SHOPS } from '../src/content/catalog';
import { availableOrders, canAffordRequirements, createLegacyInitialState as createInitialState, effectiveNow, execute, GENERATOR_CAPACITY, GENERATOR_COOLDOWN, getBonuses, getDayProgress, getGeneratorStatus, getOrderReward, getRecipeDuration, inventoryCount, MAX_OFFLINE_MS, mergeTarget, stateInvariantErrors, unlockedCells } from '../src/domain/engine';
import type { Command, GameState, ItemInstance } from '../src/domain/types';
import { simulateCampaign } from '../src/diagnostics/campaign';

function withItems(items: string[], day = 1): GameState {
  const state = createInitialState(1000);
  state.board.fill(null);
  state.day = day;
  items.forEach((item, index) => { state.board[index] = { uid: `g${state.nextId++}`, item }; });
  return state;
}
function run(state: GameState, command: Command, now = state.lastSeen) {
  const result = execute(state, command, now);
  expect(result.ok, result.events[0]?.message).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  return result.state;
}
function materialUnits(state: GameState): number {
  const inventory = [...state.board.filter((item): item is ItemInstance => !!item), ...state.storage].reduce((n, item) => n + baseUnits(item.item), 0);
  return inventory + state.jobs.reduce((n, job) => n + (job ? RECIPES.find(recipe => recipe.id === job.recipe)!.inputs.reduce((sum, need) => sum + baseUnits(need.item) * need.count, 0) : 0), 0);
}

describe('content and unlock graph', () => {
  it('ships all six chapters with valid, reachable definitions', () => {
    expect([CHAINS.length, RECIPES.length, ORDERS.length, SHOPS.length, CUSTOMERS.length, DECORATIONS.length, APPLIANCES.length]).toEqual([8, 24, 84, 6, 12, 24, 4]);
    expect(Object.values(ITEMS).filter(item => item.kind === 'ingredient')).toHaveLength(56);
    expect(new Set(ORDERS.map(order => order.id)).size).toBe(84);
    for (const chain of CHAINS) {
      expect(chain.items).toHaveLength(7);
      for (let i = 0; i < 7; i++) expect(mergeTarget(chain.items[i])).toBe(chain.items[i + 1] ?? null);
    }
    for (const recipe of RECIPES) {
      expect(APPLIANCES[recipe.appliance].unlockDay).toBeLessThanOrEqual(recipe.unlockDay);
      expect(ITEMS[recipe.output].sell).toBeLessThanOrEqual(recipe.inputs.reduce((n, need) => n + ITEMS[need.item].sell * need.count, 0));
      for (const need of recipe.inputs) expect(CHAINS.find(chain => chain.id === ITEMS[need.item].chain)!.unlockDay).toBeLessThanOrEqual(recipe.unlockDay);
    }
    for (const order of ORDERS) {
      expect(order.needs.length).toBeGreaterThan(0);
      expect(order.needs.length).toBeLessThanOrEqual(3);
      for (const need of order.needs) {
        expect(ITEMS[need.item]).toBeDefined();
        const unlock = ITEMS[need.item].kind === 'dish' ? RECIPES.find(recipe => recipe.output === need.item)!.unlockDay : CHAINS.find(chain => chain.id === ITEMS[need.item].chain)!.unlockDay;
        expect(unlock).toBeLessThanOrEqual(order.day);
      }
    }
    expect(Object.values(ITEMS).every(item => item.icon >= 0 && item.icon < 64)).toBe(true);
  });
});

describe('atomic board and inventory commands', () => {
  it('starts with an immediately solvable first order', () => {
    const initial = createInitialState(1000);
    const merged = run(initial, { type: 'move', from: 16, to: 17 });
    expect(initial.board[16]?.item).toBe('grain-1');
    const served = run(merged, { type: 'deliver', order: availableOrders(merged)[0].id });
    expect(served.coins).toBeGreaterThan(initial.coins);
    expect(served.completedOrders).toHaveLength(1);
    expect(served.revision).toBe(2);
  });
  it('merges, exchanges different items and exchanges max-level items without loss', () => {
    let state = withItems(['grain-1', 'grain-1', 'coffee-1', 'grain-7', 'grain-7']);
    state = run(state, { type: 'move', from: 0, to: 1 });
    expect(state.board[1]?.item).toBe('grain-2');
    const units = materialUnits(state);
    state = run(state, { type: 'move', from: 1, to: 2 });
    expect(state.board[1]?.item).toBe('coffee-1');
    const uid = state.board[3]!.uid;
    state = run(state, { type: 'move', from: 3, to: 4 });
    expect(state.board[4]?.uid).toBe(uid);
    expect(materialUnits(state)).toBe(units);
  });
  it('rejects invalid positions and locked chains without mutating any state', () => {
    const state = createInitialState(1000);
    for (const command of [{ type: 'move', from: -1, to: 0 }, { type: 'move', from: 16, to: 42 }, { type: 'move', from: 16, to: 16 }, { type: 'store', index: 0.5 }, { type: 'generate', chain: 'dessert' }] as Command[]) {
      const result = execute(state, command, 8000);
      expect(result.ok).toBe(false);
      expect(result.state).toBe(state);
    }
    expect([unlockedCells(state), unlockedCells({ ...state, day: 3 }), unlockedCells({ ...state, day: 5 })]).toEqual([42, 49, 56]);
  });
  it('full board generation never spends quota and storage transfers preserve instance ids', () => {
    let state = withItems(Array(42).fill('grain-1'));
    const result = execute(state, { type: 'generate', chain: 'grain' });
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
    expect(state.generators.grain.remaining).toBe(GENERATOR_CAPACITY);
    const uid = state.board[0]!.uid;
    state = run(state, { type: 'store', index: 0 });
    state = run(state, { type: 'retrieve', uid });
    expect(state.board[0]?.uid).toBe(uid);
    expect(state.storage).toHaveLength(0);
  });
  it('sale undo is single use and is invalidated by further transactions', () => {
    const initial = withItems(['grain-4', 'coffee-1']);
    const sold = run(initial, { type: 'sell', index: 0 });
    const undone = run(sold, { type: 'undo' });
    expect(undone.board[0]).toEqual(initial.board[0]);
    expect(undone.coins).toBe(initial.coins);
    expect(execute(undone, { type: 'undo' }).ok).toBe(false);
    const moved = run(sold, { type: 'move', from: 1, to: 0 });
    expect(moved.undo).toBeNull();
    expect(execute(moved, { type: 'undo' }).ok).toBe(false);
  });
  it('aggregates duplicate requirement rows before deciding affordability', () => {
    const state = withItems(['grain-1']);
    expect(canAffordRequirements(state, [{ item: 'grain-1', count: 1 }, { item: 'grain-1', count: 1 }])).toBe(false);
    expect(canAffordRequirements(state, [{ item: 'grain-1', count: -1 }])).toBe(false);
  });
});

describe('production, cooking and clock safety', () => {
  it('uses a persisted independent quota and recovers after eight seconds', () => {
    let state = withItems([]);
    for (let i = 0; i < 12; i++) state = run(state, { type: 'generate', chain: 'grain' }, 1000);
    expect(state.generators.grain).toEqual({ remaining: 0, readyAt: 1000 + GENERATOR_COOLDOWN });
    expect(execute(state, { type: 'generate', chain: 'grain' }, 8999).ok).toBe(false);
    expect(execute(state, { type: 'generate', chain: 'coffee' }, 1000).ok).toBe(true);
    state = run(state, { type: 'generate', chain: 'grain' }, 9000);
    expect(state.generators.grain.remaining).toBe(11);
    expect(getGeneratorStatus(state, 'grain', 0).remaining).toBe(11);
  });
  it('atomically consumes exact board and storage inputs and rejects double-start', () => {
    let state = withItems(['coffee-2', 'dairy-2'], 2);
    state = run(state, { type: 'store', index: 1 });
    state = run(state, { type: 'cook', recipe: 'latte', slot: 1 }, 2000);
    expect(inventoryCount(state, 'coffee-2')).toBe(0);
    expect(inventoryCount(state, 'dairy-2')).toBe(0);
    expect(state.jobs[1]?.endsAt).toBe(10000);
    const duplicate = execute(state, { type: 'cook', recipe: 'latte', slot: 1 }, 2000);
    expect(duplicate.state).toBe(state);
    expect(duplicate.ok).toBe(false);
    expect(execute(state, { type: 'collect', slot: 1 }, 9999).ok).toBe(false);
    state = run(state, { type: 'collect', slot: 1 }, 10000);
    expect(inventoryCount(state, 'dish-latte')).toBe(1);
    expect(execute(state, { type: 'collect', slot: 1 }, 10000).ok).toBe(false);
  });
  it('rejects missing ingredients without consuming the ones present', () => {
    const state = withItems(['coffee-2'], 2);
    const result = execute(state, { type: 'cook', recipe: 'latte', slot: 1 });
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
    expect(inventoryCount(state, 'coffee-2')).toBe(1);
    expect(execute(state, { type: 'cook', recipe: 'latte', slot: 0 }).ok).toBe(false);
  });
  it('preserves cooked food when both board and storage are full; upgrade preserves cooking', () => {
    let state = withItems(['grain-2']);
    state = run(state, { type: 'cook', recipe: 'toast', slot: 0 });
    const job = state.jobs[0];
    state = run(state, { type: 'upgrade', shop: 'breakfast' });
    expect(state.jobs[0]).toEqual(job);
    for (let i = 0; i < 42; i++) state.board[i] = { uid: `g${state.nextId++}`, item: 'grain-1' };
    for (let i = 0; i < 8; i++) state.storage.push({ uid: `g${state.nextId++}`, item: 'grain-1' });
    const result = execute(state, { type: 'collect', slot: 0 }, 5000);
    expect(result.ok).toBe(false);
    expect(result.state.jobs[0]).toEqual(job);
    state = run(state, { type: 'sell', index: 0 }, 5000);
    state = run(state, { type: 'collect', slot: 0 }, 5000);
    expect(inventoryCount(state, 'dish-toast')).toBe(1);
  });
  it('uses storage if board is full and bounds clock reversals and offline jumps', () => {
    let state = withItems(['grain-2']);
    state = run(state, { type: 'cook', recipe: 'toast', slot: 0 });
    for (let i = 0; i < 42; i++) state.board[i] = { uid: `g${state.nextId++}`, item: 'grain-1' };
    state = run(state, { type: 'collect', slot: 0 }, 5000);
    expect(state.storage[0].item).toBe('dish-toast');
    expect(effectiveNow(state, -100)).toBe(5000);
    expect(effectiveNow(state, Number.MAX_SAFE_INTEGER)).toBe(5000 + MAX_OFFLINE_MS);
    expect(effectiveNow(state, NaN)).toBe(5000);
  });
  it('runs all four appliances independently and safely rejects overflowing timestamps', () => {
    let state = withItems(['grain-3', 'grain-3', 'coffee-2', 'vegetable-3', 'seafood-4', 'vegetable-2'], 4);
    for (const id of ['pancake', 'pour-over', 'green-bun', 'grilled-fish']) {
      const recipe = RECIPES.find(recipe => recipe.id === id)!;
      state = run(state, { type: 'cook', recipe: id, slot: recipe.appliance });
    }
    expect(state.jobs.filter(Boolean)).toHaveLength(4);
    expect(new Set(state.jobs.map(job => job!.id)).size).toBe(4);
    for (let slot = 0; slot < 4; slot++) state = run(state, { type: 'collect', slot }, 50000);
    expect(state.stats.cooked).toBe(4);
    expect(state.board.filter(Boolean)).toHaveLength(4);
    const unsafe = { ...state, lastSeen: Number.MAX_SAFE_INTEGER };
    const result = execute(unsafe, { type: 'generate', chain: 'grain' }, Number.MAX_SAFE_INTEGER);
    expect(result.ok).toBe(false);
    expect(result.state).toBe(unsafe);
  });
});

describe('orders, upgrades and chapters', () => {
  it('cannot deliver twice, early, or partially', () => {
    let state = withItems(['grain-2']);
    expect(availableOrders(state)).toHaveLength(3);
    expect(execute(state, { type: 'deliver', order: 'day-1-order-4' }).ok).toBe(false);
    state = run(state, { type: 'deliver', order: 'day-1-order-1' });
    const duplicate = execute(state, { type: 'deliver', order: 'day-1-order-1' });
    expect(duplicate.ok).toBe(false);
    expect(duplicate.state).toBe(state);
    expect(availableOrders(state)[2].id).toBe('day-1-order-4');
    expect(execute(state, { type: 'nextDay' }).ok).toBe(false);
  });
  it('requires all orders and opening the current shop, with explicit day advance', () => {
    let state = createInitialState(1000);
    state.completedOrders = ORDERS.filter(order => order.day === 1).map(order => order.id);
    expect(execute(state, { type: 'nextDay' }).ok).toBe(false);
    state.shops.breakfast = 2;
    expect(getDayProgress(state).canAdvance).toBe(true);
    state = run(state, { type: 'nextDay' });
    expect(state.day).toBe(2);
    expect(availableOrders(state)).toHaveLength(3);
    expect(getDayProgress(state).completed).toBe(0);
  });
  it('charges decorations once and caps both additive bonuses', () => {
    let state = createInitialState(1000);
    state.day = 6;
    state.coins = 100000;
    Object.keys(state.shops).forEach(shop => { state.shops[shop] = 2; });
    for (const decoration of DECORATIONS) state = run(state, { type: 'decorate', decoration: decoration.id });
    expect(state.coins).toBe(100000 - DECORATIONS.reduce((n, item) => n + item.cost, 0));
    expect(getBonuses(state)).toEqual({ tips: 0.2, speed: 0.3 });
    expect(getOrderReward(state, ORDERS[0])).toBe(79);
    expect(getRecipeDuration(state, RECIPES[0])).toBe(2800);
    expect(execute(state, { type: 'decorate', decoration: DECORATIONS[0].id }).ok).toBe(false);
  });
  it('rejects malformed settings and unsafe balances', () => {
    const state = createInitialState(1000);
    expect(execute(state, { type: 'settings', settings: { volume: NaN } }).ok).toBe(false);
    expect(execute(state, { type: 'tutorial', step: -1 }).ok).toBe(false);
    expect(execute({ ...state, coins: Number.MAX_SAFE_INTEGER }, { type: 'sell', index: 16 }).ok).toBe(false);
  });
  it('can recover from zero money, a full board of max-level items and full storage', () => {
    let state = withItems(Array(42).fill('grain-7'));
    state.coins = 0;
    for (let i = 0; i < 8; i++) state.storage.push({ uid: `g${state.nextId++}`, item: 'coffee-7' });
    expect(execute(state, { type: 'generate', chain: 'grain' }).ok).toBe(false);
    state = run(state, { type: 'sell', index: 0 });
    expect(state.coins).toBe(64);
    state = run(state, { type: 'upgrade', shop: 'breakfast' });
    state = run(state, { type: 'generate', chain: 'grain' });
    expect(state.board[0]?.item).toBe('grain-1');
    expect(state.shops.breakfast).toBe(1);
    expect(state.coins).toBe(4);
  });
});

describe('property-style and campaign checks', () => {
  it('preserves material units and unique assets across 3000 adversarial operations', () => {
    let state = createInitialState(1000);
    let random = 123456789;
    const pick = (max: number) => { random ^= random << 13; random ^= random >>> 17; random ^= random << 5; return (random >>> 0) % max; };
    for (let step = 0; step < 3000; step++) {
      const a = pick(60) - 2;
      const b = pick(60) - 2;
      const commands: Command[] = [{ type: 'generate', chain: CHAINS[pick(8)].id }, { type: 'move', from: a, to: b }, { type: 'store', index: a }, { type: 'retrieve', uid: state.storage[pick(9)]?.uid ?? 'missing' }, { type: 'cook', recipe: RECIPES[pick(24)].id, slot: pick(6) - 1 }, { type: 'collect', slot: pick(6) - 1 }, { type: 'deliver', order: ORDERS[pick(84)].id }, { type: 'sell', index: a }, { type: 'undo' }, { type: 'nextDay' }];
      const command = commands[pick(commands.length)];
      const before = materialUnits(state);
      const snapshot = JSON.stringify(state);
      const result = execute(state, command, 1000 + step * 997);
      expect(JSON.stringify(state)).toBe(snapshot);
      if (!result.ok) expect(result.state).toBe(state);
      else {
        let expected = before;
        if (command.type === 'generate') expected++;
        if (command.type === 'sell') expected -= baseUnits(state.board[command.index]!.item);
        if (command.type === 'undo') expected += baseUnits(state.undo!.item.item);
        if (command.type === 'deliver') expected -= ORDERS.find(order => order.id === command.order)!.needs.reduce((n, need) => n + baseUnits(need.item) * need.count, 0);
        expect(materialUnits(result.state)).toBe(expected);
        expect(result.state.revision).toBe(state.revision + 1);
      }
      state = result.state;
      expect(stateInvariantErrors(state)).toEqual([]);
    }
  });
  it.each(['simple-first', 'reward-first', 'stockpile', 'storage-heavy'] as const)('completes every order, upgrade, recipe, chain and decoration with %s', strategy => {
    const { report } = simulateCampaign(strategy);
    expect(report.completedOrders).toBe(84);
    expect(report.allContentReachable).toBe(true);
    expect(report.finalCoins).toBeGreaterThanOrEqual(0);
    expect(report.chapters.every(chapter => chapter.income >= chapter.allStagesCost)).toBe(true);
  }, 20000);
});
