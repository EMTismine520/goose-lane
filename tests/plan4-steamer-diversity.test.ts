import { describe, expect, it } from 'vitest';
import { FRESH_ORDERS, HOME_ORDERS, ITEMS, MODERN_ORDERS, MODERN_RECIPES } from '../src/content/catalog';
import { EXPANSION } from '../src/content/expansion';
import { activeDevices, BUILD_NODES } from '../src/content/board-layouts';
import { createInitialState, execute, getApplianceStatus, getBoardEntity, getRecipeDurationAtLevel, inventoryCount, stateInvariantErrors } from '../src/domain/engine';
import { reconcileDeviceGrants } from '../src/domain/devices';
import { parseSave, serializeSave } from '../src/persistence/save';
import type { Command, GameState } from '../src/domain/types';

const dishes = [
  { id: 'fresh-ico-0072', name: '香菇酿肉', inputs: ['fresh-seasonal-1', 'fresh-beast-4', 'fresh-spice-2'], duration: 50000, rank: 4, order: 'v3-order-071', index: 64, coins: 65, sell: 13 },
  { id: 'fresh-ico-0115', name: '南瓜蒸排骨', inputs: ['fresh-veg-6', 'fresh-beast-5'], duration: 50000, rank: 6, order: 'v3-order-073', index: 69, coins: 94, sell: 23 },
];
const retiredInputs = [
  { id: 'fresh-ico-0072', inputs: ['fresh-seasonal-1', 'fresh-grain-7', 'fresh-spice-2'] },
  { id: 'fresh-ico-0115', inputs: ['fresh-beast-4', 'fresh-grain-7', 'fresh-spice-2'] },
];

function act(state: GameState, command: Command, time = state.lastSeen) {
  const result = execute(state, command, time);
  expect(result.ok, result.events.map(event => event.message).join('/')).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  expect(parseSave(serializeSave(result.state))).toEqual(result.state);
  return result.state;
}

function steamerReady() {
  let state = createInitialState(1_000_000);
  state.completedOrders = [...FRESH_ORDERS, ...HOME_ORDERS].map(order => order.id);
  state.construction.completed = BUILD_NODES.map(node => node.id);
  for (let stage = 3; stage < 8; stage++) state.completedOrders.push(...MODERN_ORDERS.filter(order => order.stage === stage).slice(0, 3).map(order => order.id));
  state.coins = 10000;
  reconcileDeviceGrants(state);
  if (!activeDevices(state).some(device => device.id === 'steamer')) state = act(state, { type: 'retrieveDevice', device: 'steamer' });
  const spare = `d${state.nextId}`;
  state = act(state, { type: 'buyDevice', family: 'steamer' });
  return act(state, { type: 'mergeDevices', device: spare, target: 'steamer' });
}

function add(state: GameState, item: string) {
  const from = state.board.findIndex((value, index) => !value && getBoardEntity(state, index).kind === 'empty');
  expect(from).toBeGreaterThanOrEqual(0);
  state.board[from] = { uid: `g${state.nextId++}`, item };
  return from;
}

describe('Plan4 distinct steamer dishes', () => {
  it.each(dishes)('cooks $name from its actual ingredients with the established output and timer', dish => {
    const recipe = MODERN_RECIPES.find(row => row.id === dish.id)!;
    expect(recipe).toMatchObject({ name: dish.name, output: `dish-${dish.id}`, deviceFamilyId: 'steamer', minDeviceLevel: 2, stage: 6, duration: dish.duration });
    expect(recipe.inputs).toEqual(dish.inputs.map(item => ({ item, count: 1 })));
    let state = steamerReady();
    const before = inventoryCount(state, recipe.output);
    for (const item of dish.inputs) state = act(state, { type: 'stageInput', from: add(state, item), appliance: 'steamer' });
    expect(getApplianceStatus(state, 'steamer', state.lastSeen)).toMatchObject({ canStart: true, recipe: { id: dish.id } });
    state = act(state, { type: 'startCooking', appliance: 'steamer', recipe: dish.id });
    const job = state.appliances.find(appliance => appliance.id === 'steamer')!.job!;
    expect(job.output).toBe(recipe.output);
    expect(job.endsAt - job.startedAt).toBe(getRecipeDurationAtLevel(state, recipe, 2));
    state = act(state, { type: 'recover' }, job.endsAt);
    state = act(state, { type: 'collectAppliance', appliance: 'steamer' });
    expect(inventoryCount(state, recipe.output)).toBe(before + 1);
    expect(ITEMS[recipe.output].name).toBe(dish.name);
  });

  it.each(retiredInputs)('rejects the superseded input set for $id without consuming the rejected item', dish => {
    let state = steamerReady();
    for (const item of dish.inputs) {
      const from = add(state, item);
      const before = state.board[from];
      const result = execute(state, { type: 'stageInput', from, appliance: 'steamer' }, state.lastSeen);
      if (!result.ok) {
        expect(result.state).toBe(state);
        expect(result.state.board[from]).toEqual(before);
        break;
      }
      state = result.state;
    }
    expect(getApplianceStatus(state, 'steamer', state.lastSeen)?.canStart).toBe(false);
    const result = execute(state, { type: 'startCooking', appliance: 'steamer', recipe: dish.id }, state.lastSeen);
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
    expect(inventoryCount(result.state, `dish-${dish.id}`)).toBe(0);
  });

  it('keeps one rice roll and preserves recipe output and order identities', () => {
    const steamer = MODERN_RECIPES.filter(recipe => recipe.deviceFamilyId === 'steamer');
    expect(steamer.filter(recipe => recipe.name.includes('肠粉')).map(recipe => recipe.id)).toEqual(['fresh-ico-0070']);
    expect(steamer).toHaveLength(12);
    for (const dish of dishes) {
      const output = `dish-${dish.id}`;
      const recipe = EXPANSION.recipes.find(row => row.id === dish.id)!;
      expect(recipe.ancestorRank).toBe(dish.rank);
      expect(recipe.inputNames).toEqual(dish.inputs.map(item => ITEMS[item].name));
      expect(EXPANSION.orders.find(order => order.output === output)).toMatchObject({ id: dish.order, output, index: dish.index, minDeviceLevel: 2, stage: 6, coins: dish.coins, effort: recipe.effort });
      expect(ITEMS[output].sell).toBe(dish.sell);
      expect(MODERN_ORDERS.find(order => order.id === dish.order)).toMatchObject({ needs: [{ item: output, count: 1 }], coins: dish.coins });
      expect(MODERN_RECIPES.find(row => row.id === dish.id)!.description).toContain(recipe.inputNames.join('、'));
      expect(MODERN_RECIPES.filter(row => row.inputs.some(need => need.item === output))).toEqual([]);
    }
  });
});
