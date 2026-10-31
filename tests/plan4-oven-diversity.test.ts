import { validateSave as normalizeKitchen } from '../src/persistence/save';
import { describe, expect, it } from 'vitest';
import { FRESH_ORDERS, HOME_ORDERS, ITEMS, MODERN_ORDERS, MODERN_RECIPES } from '../src/content/catalog';
import { EXPANSION } from '../src/content/expansion';
import { activeDevices, BUILD_NODES } from '../src/content/board-layouts';
import { execute, getApplianceStatus, getBoardEntity, getRecipeDurationAtLevel, inventoryCount, stateInvariantErrors } from '../src/domain/engine';
import { historicalState as createInitialState } from './chapter-fixtures';
import { reconcileDeviceGrants } from '../src/domain/devices';
import { parseSave, serializeSave } from '../src/persistence/save';
import type { Command, GameState } from '../src/domain/types';

const dishes = [
  { id: 'fresh-ico-0052', name: '黄油烤薯角', inputs: ['fresh-seasonal-4', 'fresh-milk-2'], duration: 52000, rank: 4, order: 'v3-order-027', index: 48, coins: 62, sell: 12 },
  { id: 'fresh-ico-0129', name: '芝士焗西兰花', inputs: ['fresh-veg-5', 'fresh-milk-3'], duration: 56000, rank: 5, order: 'v3-order-032', index: 54, coins: 80, sell: 18 },
  { id: 'fresh-ico-0134', name: '黄油洋葱烤茄子', inputs: ['fresh-seasonal-7', 'fresh-spice-3', 'fresh-milk-2'], duration: 58000, rank: 7, order: 'v3-order-037', index: 56, coins: 89, sell: 21 },
  { id: 'fresh-ico-0158', name: '培根四季豆卷', inputs: ['fresh-beast-2', 'fresh-seasonal-6'], duration: 58000, rank: 6, order: 'v3-order-038', index: 59, coins: 89, sell: 21 },
  { id: 'fresh-ico-0162', name: '番茄芝士披萨', inputs: ['fresh-grain-4', 'fresh-veg-1', 'fresh-milk-3'], duration: 58000, rank: 4, order: 'v3-order-033', index: 61, coins: 77, sell: 17 },
];
const retiredInputs = [
  { id: 'fresh-ico-0129', inputs: ['fresh-grain-6', 'fresh-beast-1'] },
  { id: 'fresh-ico-0134', inputs: ['fresh-grain-6', 'fresh-spice-3', 'fresh-milk-2'] },
  { id: 'fresh-ico-0158', inputs: ['fresh-grain-6', 'fresh-beast-2', 'fresh-seasonal-5'] },
  { id: 'fresh-ico-0162', inputs: ['fresh-grain-6', 'fresh-beast-1', 'fresh-veg-1'] },
];

function act(state: GameState, command: Command, time = state.lastSeen) {
  const result = execute(state, command, time);
  expect(result.ok, result.events.map(event => event.message).join('/')).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  expect(parseSave(serializeSave(result.state))).toEqual(result.state);
  return result.state;
}

function ovenReady() {
  let state = createInitialState(1_000_000);
  state.completedOrders = [...FRESH_ORDERS, ...HOME_ORDERS].map(order => order.id);
  state.construction.completed = BUILD_NODES.map(node => node.id);
  for (let stage = 3; stage < 8; stage++) state.completedOrders.push(...MODERN_ORDERS.filter(order => order.stage === stage).slice(0, 3).map(order => order.id));
  state.coins = 10000;
  reconcileDeviceGrants(state); state=normalizeKitchen(state);
  if (!activeDevices(state).some(device => device.id === 'oven')) state = act(state, { type: 'retrieveDevice', device: 'oven' });
  const spare = `d${state.nextId}`;
  state = act(state, { type: 'buyDevice', family: 'oven' });
  return act(state, { type: 'mergeDevices', device: spare, target: 'oven' });
}

function add(state: GameState, item: string) {
  const from = state.board.findIndex((value, index) => !value && getBoardEntity(state, index).kind === 'empty');
  expect(from).toBeGreaterThanOrEqual(0);
  state.board[from] = { uid: `g${state.nextId++}`, item };
  return from;
}

describe('Plan4 distinct oven dishes', () => {
  it.each(dishes)('cooks $name from its actual ingredients with the established output and timer', dish => {
    const recipe = MODERN_RECIPES.find(row => row.id === dish.id)!;
    expect(recipe).toMatchObject({ name: dish.name, output: `dish-${dish.id}`, deviceFamilyId: 'oven', minDeviceLevel: 2, stage: 4, duration: dish.duration });
    expect(recipe.inputs).toEqual(dish.inputs.map(item => ({ item, count: 1 })));
    let state = ovenReady();
    const before = inventoryCount(state, recipe.output);
    for (const item of dish.inputs) state = act(state, { type: 'stageInput', from: add(state, item), appliance: 'oven' });
    expect(getApplianceStatus(state, 'oven', state.lastSeen)).toMatchObject({ canStart: true, recipe: { id: dish.id } });
    state = act(state, { type: 'startCooking', appliance: 'oven', recipe: dish.id });
    const job = state.appliances.find(appliance => appliance.id === 'oven')!.job!;
    expect(job.output).toBe(recipe.output);
    expect(job.endsAt - job.startedAt).toBe(getRecipeDurationAtLevel(state, recipe, 2));
    state = act(state, { type: 'recover' }, job.endsAt);
    state = act(state, { type: 'collectAppliance', appliance: 'oven' });
    expect(inventoryCount(state, recipe.output)).toBe(before + 1);
    expect(ITEMS[recipe.output].name).toBe(dish.name);
  });

  it.each(retiredInputs)('rejects the superseded input set for $id without consuming the rejected item', dish => {
    let state = ovenReady();
    for (const item of dish.inputs) {
      const from = add(state, item);
      const before = state.board[from];
      const result = execute(state, { type: 'stageInput', from, appliance: 'oven' }, state.lastSeen);
      if (!result.ok) {
        expect(result.state).toBe(state);
        expect(result.state.board[from]).toEqual(before);
        break;
      }
      state = result.state;
    }
    expect(getApplianceStatus(state, 'oven', state.lastSeen)?.canStart).toBe(false);
    const result = execute(state, { type: 'startCooking', appliance: 'oven', recipe: dish.id }, state.lastSeen);
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
    expect(inventoryCount(result.state, `dish-${dish.id}`)).toBe(0);
  });

  it('keeps one hotdog, hamburger and bagel while retaining the existing order identities', () => {
    const oven = MODERN_RECIPES.filter(recipe => recipe.deviceFamilyId === 'oven');
    for (const [word, id] of [['热狗', 'fresh-ico-0102'], ['汉堡', 'fresh-ico-0143'], ['贝果', 'fresh-ico-0100']]) {
      expect(oven.filter(recipe => recipe.name.includes(word)).map(recipe => recipe.id)).toEqual([id]);
    }
    for (const dish of dishes) {
      const output = `dish-${dish.id}`;
      const recipe = EXPANSION.recipes.find(row => row.id === dish.id)!;
      expect(recipe.ancestorRank).toBe(dish.rank);
      expect(recipe.inputNames).toEqual(dish.inputs.map(item => ITEMS[item].name));
      expect(EXPANSION.orders.find(order => order.output === output)).toMatchObject({ id: dish.order, output, index: dish.index, minDeviceLevel: 2, stage: 4, coins: dish.coins, effort: recipe.effort });
      expect(ITEMS[output].sell).toBe(dish.sell);
      expect(MODERN_ORDERS.find(order => order.id === dish.order)).toMatchObject({ needs: [{ item: output, count: 1 }], coins: dish.coins });
      expect(MODERN_RECIPES.find(row => row.id === dish.id)!.description).toContain(recipe.inputNames.join('、'));
    }
  });
});
