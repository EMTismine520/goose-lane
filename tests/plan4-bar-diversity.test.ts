import { describe, expect, it } from 'vitest';
import { FRESH_ORDERS, HOME_ORDERS, ITEMS, MODERN_ORDERS, MODERN_RECIPES } from '../src/content/catalog';
import { EXPANSION } from '../src/content/expansion';
import { activeDevices, BUILD_NODES } from '../src/content/board-layouts';
import { createInitialState, execute, getApplianceStatus, getBoardEntity, getRecipeDurationAtLevel, inventoryCount, stateInvariantErrors } from '../src/domain/engine';
import { reconcileDeviceGrants } from '../src/domain/devices';
import { parseSave, serializeSave } from '../src/persistence/save';
import type { Command, GameState } from '../src/domain/types';

function act(state: GameState, command: Command, time = state.lastSeen) {
  const result = execute(state, command, time);
  expect(result.ok, result.events.map(event => event.message).join('/')).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  expect(parseSave(serializeSave(result.state))).toEqual(result.state);
  return result.state;
}

function barReady(level: number) {
  let state = createInitialState(1_000_000);
  state.completedOrders = [...FRESH_ORDERS, ...HOME_ORDERS].map(order => order.id);
  state.construction.completed = BUILD_NODES.map(node => node.id);
  for (let stage = 3; stage < 8; stage++) state.completedOrders.push(...MODERN_ORDERS.filter(order => order.stage === stage).slice(0, 3).map(order => order.id));
  state.coins = 100000;
  reconcileDeviceGrants(state);
  if (!activeDevices(state).some(device => device.id === 'bar')) state = act(state, { type: 'retrieveDevice', device: 'bar' });
  for (let nextLevel = 2; nextLevel <= level; nextLevel++) {
    const spare = `d${state.nextId}`;
    state = act(state, { type: 'buyDevice', family: 'bar' });
    if (nextLevel === 3) {
      const second = `d${state.nextId}`;
      state = act(state, { type: 'buyDevice', family: 'bar' });
      state = act(state, { type: 'mergeDevices', device: second, target: spare });
    }
    state = act(state, { type: 'mergeDevices', device: spare, target: 'bar' });
  }
  return state;
}
function add(state: GameState, item: string) {
  const from = state.board.findIndex((value, index) => !value && getBoardEntity(state, index).kind === 'empty');
  expect(from).toBeGreaterThanOrEqual(0);
  state.board[from] = { uid: `g${state.nextId++}`, item };
  return from;
}


const recipeId = 'fresh-ico-0118', output = 'dish-fresh-ico-0118';
const ingredients = ['fresh-mixer-11', 'fresh-exotic-8', 'fresh-exotic-3'];
describe('Plan4 distinct mulberry bar drink', () => {
  it('cooks and collects the replacement from tequila, mulberry and lemon with the existing output and timer', () => {
    const recipe = MODERN_RECIPES.find(row => row.id === recipeId)!;
    expect(recipe).toMatchObject({ name: '桑葚龙舌兰特调', output, deviceFamilyId: 'bar', minDeviceLevel: 3, stage: 8, duration: 34000 });
    let state = barReady(3);
    const before = inventoryCount(state, output);
    for (const item of ingredients) state = act(state, { type: 'stageInput', from: add(state, item), appliance: 'bar' });
    expect(getApplianceStatus(state, 'bar', state.lastSeen)).toMatchObject({ canStart: true, recipe: { id: recipeId } });
    state = act(state, { type: 'startCooking', appliance: 'bar', recipe: recipeId });
    const job = state.appliances.find(appliance => appliance.id === 'bar')!.job!;
    expect(job.output).toBe(output);
    expect(job.endsAt - job.startedAt).toBe(getRecipeDurationAtLevel(state, recipe, 3));
    state = act(state, { type: 'recover' }, job.endsAt);
    state = act(state, { type: 'collectAppliance', appliance: 'bar' });
    expect(inventoryCount(state, output)).toBe(before + 1);
  });
  it('rejects the former sweet-orange combination without consuming it and requires the new lemon input', () => {
    let state = barReady(3);
    state = act(state, { type: 'stageInput', from: add(state, 'fresh-mixer-11'), appliance: 'bar' });
    const from = add(state, 'fresh-fruit-2'), orange = state.board[from];
    const rejected = execute(state, { type: 'stageInput', from, appliance: 'bar' }, state.lastSeen);
    expect(rejected.ok).toBe(false);
    expect(rejected.state).toBe(state);
    expect(rejected.state.board[from]).toEqual(orange);
    state = act(state, { type: 'stageInput', from: add(state, 'fresh-exotic-8'), appliance: 'bar' });
    expect(getApplianceStatus(state, 'bar', state.lastSeen)).toMatchObject({ canStart: false });
    const incomplete = execute(state, { type: 'startCooking', appliance: 'bar', recipe: recipeId }, state.lastSeen);
    expect(incomplete.ok).toBe(false);
    expect(incomplete.state).toBe(state);
    state = act(state, { type: 'stageInput', from: add(state, 'fresh-exotic-3'), appliance: 'bar' });
    expect(getApplianceStatus(state, 'bar', state.lastSeen)).toMatchObject({ canStart: true, recipe: { id: recipeId } });
  });
  it('keeps catalog, order and pricing aligned with the new identity while preserving the orange soda', () => {
    const recipe = EXPANSION.recipes.find(row => row.id === recipeId)!;
    expect(recipe.inputs).toEqual(ingredients.map(item => ({ item, count: 1 })));
    expect(recipe.inputNames).toEqual(['龙舌兰', '桑葚', '柠檬']);
    expect(recipe.ancestorRank).toBe(11);
    expect(EXPANSION.orders.find(order => order.output === output)).toMatchObject({ id: 'v3-order-115', index: 100, minDeviceLevel: 3, stage: 8, coins: 155, effort: recipe.effort });
    expect(ITEMS[output]).toMatchObject({ name: recipe.name, sell: 43, stage: 8 });
    const order = MODERN_ORDERS.find(row => row.id === 'v3-order-115')!;
    expect(order).toMatchObject({ needs: [{ item: output, count: 1 }], coins: 155 });
    expect(order.title).toContain(recipe.name);
    expect(MODERN_RECIPES.find(row => row.id === recipeId)!.description).toContain('龙舌兰、桑葚、柠檬');
    expect(MODERN_RECIPES.filter(row => row.deviceFamilyId === 'bar')).toHaveLength(12);
    expect(MODERN_RECIPES.find(row => row.name === '龙舌兰螺丝刀')).toBeUndefined();
    expect(MODERN_RECIPES.find(row => row.name === '橙冰苏打')!.inputs).toEqual([{ item: 'fresh-mixer-9', count: 1 }, { item: 'fresh-mixer-3', count: 1 }]);
  });
});
