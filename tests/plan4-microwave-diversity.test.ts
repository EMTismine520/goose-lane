import { describe, expect, it } from 'vitest';
import { FRESH_ORDERS, HOME_ORDERS, ITEMS, MODERN_ORDERS, MODERN_RECIPES } from '../src/content/catalog';
import { EXPANSION } from '../src/content/expansion';
import { activeDevices, BUILD_NODES } from '../src/content/board-layouts';
import { createInitialState, execute, getApplianceStatus, getBoardEntity, getRecipeDurationAtLevel, inventoryCount, stateInvariantErrors } from '../src/domain/engine';
import { reconcileDeviceGrants } from '../src/domain/devices';
import { parseSave, serializeSave } from '../src/persistence/save';
import type { Command, GameState } from '../src/domain/types';

const dishes = [
  { id: 'fresh-ico-0054', name: '焦糖玉米段', inputs: ['fresh-seasonal-2', 'fresh-sweet-5'], duration: 24000, level: 2, rank: 5, order: 'v3-order-026', index: 84, coins: 59, sell: 11 },
  { id: 'fresh-ico-0163', name: '棉花软糖热巧克力', inputs: ['fresh-milk-1', 'fresh-sweet-7', 'fresh-sweet-8'], duration: 32000, level: 3, rank: 8, order: 'v3-order-040', index: 87, coins: 91, sell: 22 },
];
function act(state: GameState, command: Command, time = state.lastSeen) {
  const result = execute(state, command, time);
  expect(result.ok, result.events.map(event => event.message).join('/')).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  expect(parseSave(serializeSave(result.state))).toEqual(result.state);
  return result.state;
}

function microwaveReady(level: number) {
  let state = createInitialState(1_000_000);
  state.completedOrders = [...FRESH_ORDERS, ...HOME_ORDERS].map(order => order.id);
  state.construction.completed = BUILD_NODES.map(node => node.id);
  for (let stage = 3; stage < 8; stage++) state.completedOrders.push(...MODERN_ORDERS.filter(order => order.stage === stage).slice(0, 3).map(order => order.id));
  state.coins = 10000;
  reconcileDeviceGrants(state);
  if (!activeDevices(state).some(device => device.id === 'microwave')) state = act(state, { type: 'retrieveDevice', device: 'microwave' });
  for (let nextLevel = 2; nextLevel <= level; nextLevel++) {
    const spare = `d${state.nextId}`;
    state = act(state, { type: 'buyDevice', family: 'microwave' });
    if (nextLevel === 3) {
      const second = `d${state.nextId}`;
      state = act(state, { type: 'buyDevice', family: 'microwave' });
      state = act(state, { type: 'mergeDevices', device: second, target: spare });
    }
    state = act(state, { type: 'mergeDevices', device: spare, target: 'microwave' });
  }
  return state;
}
function add(state: GameState, item: string) {
  const from = state.board.findIndex((value, index) => !value && getBoardEntity(state, index).kind === 'empty');
  expect(from).toBeGreaterThanOrEqual(0);
  state.board[from] = { uid: `g${state.nextId++}`, item };
  return from;
}

describe('Plan4 selected microwave dishes', () => {
  it.each(dishes)('cooks $name from its actual ingredients with the established output and timer', dish => {
    const recipe = MODERN_RECIPES.find(row => row.id === dish.id)!;
    expect(recipe).toMatchObject({ name: dish.name, output: `dish-${dish.id}`, deviceFamilyId: 'microwave', minDeviceLevel: dish.level, stage: 4, duration: dish.duration });
    expect(recipe.inputs).toEqual(dish.inputs.map(item => ({ item, count: 1 })));
    let state = microwaveReady(dish.level);
    const before = inventoryCount(state, recipe.output);
    for (const item of dish.inputs) state = act(state, { type: 'stageInput', from: add(state, item), appliance: 'microwave' });
    expect(getApplianceStatus(state, 'microwave', state.lastSeen)).toMatchObject({ canStart: true, recipe: { id: dish.id } });
    state = act(state, { type: 'startCooking', appliance: 'microwave', recipe: dish.id });
    const job = state.appliances.find(appliance => appliance.id === 'microwave')!.job!;
    expect(job.output).toBe(recipe.output);
    expect(job.endsAt - job.startedAt).toBe(getRecipeDurationAtLevel(state, recipe, dish.level));
    state = act(state, { type: 'recover' }, job.endsAt);
    state = act(state, { type: 'collectAppliance', appliance: 'microwave' });
    expect(inventoryCount(state, recipe.output)).toBe(before + 1);
    expect(ITEMS[recipe.output].name).toBe(dish.name);
  });

  it('rejects the unselected cinnamon recipe and continues plain cocoa into the retained marshmallow cocoa', () => {
    let state = microwaveReady(3);
    state = act(state, { type: 'stageInput', from: add(state, 'fresh-milk-1'), appliance: 'microwave' });
    const from = add(state, 'fresh-spice-7'), cinnamon = state.board[from];
    const rejected = execute(state, { type: 'stageInput', from, appliance: 'microwave' }, state.lastSeen);
    expect(rejected.ok).toBe(false);
    expect(rejected.state).toBe(state);
    expect(rejected.state.board[from]).toEqual(cinnamon);
    const incomplete = execute(state, { type: 'startCooking', appliance: 'microwave', recipe: 'fresh-ico-0163' }, state.lastSeen);
    expect(incomplete.ok).toBe(false);
    expect(incomplete.state).toBe(state);
    state = act(state, { type: 'stageInput', from: add(state, 'fresh-sweet-7'), appliance: 'microwave' });
    expect(getApplianceStatus(state, 'microwave', state.lastSeen)).toMatchObject({ canStart: true, recipe: { id: 'fresh-ico-0105' } });
    state = act(state, { type: 'stageInput', from: add(state, 'fresh-sweet-8'), appliance: 'microwave' });
    expect(getApplianceStatus(state, 'microwave', state.lastSeen)).toMatchObject({ canStart: true, recipe: { id: 'fresh-ico-0163', name: '棉花软糖热巧克力' } });
  });
  it('keeps the user-selected popcorn and cocoa variants with stable orders', () => {
    const microwave = MODERN_RECIPES.filter(recipe => recipe.deviceFamilyId === 'microwave');
    expect(microwave).toHaveLength(7);
    expect(microwave.filter(recipe => recipe.name.includes('爆米花')).map(recipe => recipe.id)).toEqual(['fresh-ico-0015']);
    expect(microwave.filter(recipe => recipe.name === '热可可').map(recipe => recipe.id)).toEqual(['fresh-ico-0105']);
    expect(microwave.find(recipe => recipe.id === 'fresh-ico-0163')?.name).toBe('棉花软糖热巧克力');
    expect(microwave.some(recipe => ['玉米花', '肉桂热牛奶'].includes(recipe.name))).toBe(false);
    for (const dish of dishes) {
      const output = `dish-${dish.id}`, recipe = EXPANSION.recipes.find(row => row.id === dish.id)!;
      expect(recipe.ancestorRank).toBe(dish.rank);
      expect(recipe.inputNames).toEqual(dish.inputs.map(item => ITEMS[item].name));
      expect(EXPANSION.orders.find(order => order.output === output)).toMatchObject({ id: dish.order, output, index: dish.index, minDeviceLevel: dish.level, stage: 4, coins: dish.coins, effort: recipe.effort });
      expect(ITEMS[output].sell).toBe(dish.sell);
      expect(MODERN_ORDERS.find(order => order.id === dish.order)).toMatchObject({ needs: [{ item: output, count: 1 }], coins: dish.coins });
      expect(MODERN_RECIPES.find(row => row.id === dish.id)!.description).toContain(recipe.inputNames.join('、'));
      expect(MODERN_RECIPES.filter(row => row.inputs.some(need => need.item === output))).toEqual([]);
    }
  });
});
