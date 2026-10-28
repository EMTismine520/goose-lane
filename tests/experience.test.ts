import { describe, expect, it } from 'vitest';
import { FRESH_ORDERS } from '../src/content/catalog';
import { BUILD_NODES } from '../src/content/board-layouts';
import { createInitialState, execute, getBoardEntity, getApplianceStatus, unlockedCells } from '../src/domain/engine';
import { reconcileHomeDevices } from '../src/domain/home-progression';
import type { Command, GameState } from '../src/domain/types';
import { getApplianceDrawerModel } from '../src/ui/ApplianceDrawer';
import { getDeviceShelfFamilies } from '../src/ui/DeviceShelf';

const now = 1000;
function act(state: GameState, command: Command, time = now) {
  const result = execute(state, command, time);
  expect(result.ok).toBe(true);
  return result.state;
}
function kitchen() {
  const state = createInitialState(now);
  state.completedOrders = FRESH_ORDERS.map(order => order.id);
  state.construction.completed = BUILD_NODES.map(node => node.id);
  reconcileHomeDevices(state);
  return state;
}
function load(state: GameState, item: string) {
  const from = Array.from({ length: unlockedCells(state) }, (_, i) => i).find(i => getBoardEntity(state, i).kind === 'empty')!;
  state.board[from] = { uid: `g${state.nextId++}`, item };
  return act(state, { type: 'stageInput', from, appliance: 'home-cooking-pot' });
}

describe('kitchen experience presentation', () => {
  it('keeps a complete short recipe separate from its longer continuation without changing default cooking', () => {
    const state = load(load(kitchen(), 'fresh-poultry-1'), 'fresh-spice-2');
    const before = JSON.stringify(state);
    const domain = getApplianceStatus(state, 'home-cooking-pot', now)!;
    const model = getApplianceDrawerModel(state, 'home-cooking-pot', now)!;
    const short = model.ready.find(candidate => candidate.recipe.output === 'dish-fresh-home-scallion-egg-rice')!;
    const long = model.later.find(candidate => candidate.recipe.output === 'dish-fresh-home-tomato-eggs')!;
    expect(short.missing).toEqual([]);
    expect(long.missing).toEqual([{ item: 'fresh-veg-1', count: 1 }]);
    expect(model.status.recipe?.id).toBe(domain.recipe?.id);
    expect(JSON.stringify(state)).toBe(before);
    const explicit = act(state, { type: 'startCooking', appliance: 'home-cooking-pot', recipe: short.recipe.id });
    const direct = act(state, { type: 'startCooking', appliance: 'home-cooking-pot' });
    expect(explicit.appliances.find(a => a.id === 'home-cooking-pot')!.job?.recipe).toBe(direct.appliances.find(a => a.id === 'home-cooking-pot')!.job?.recipe);
  });

  it('requires the third ingredient for the specified longer recipe and never consumes a missing recipe attempt', () => {
    let state = load(load(kitchen(), 'fresh-poultry-1'), 'fresh-spice-2');
    const long = getApplianceDrawerModel(state, 'home-cooking-pot', now)!.later.find(candidate => candidate.recipe.output === 'dish-fresh-home-tomato-eggs')!;
    const attempt = execute(state, { type: 'startCooking', appliance: 'home-cooking-pot', recipe: long.recipe.id }, now);
    expect(attempt.ok).toBe(false);
    expect(attempt.state).toBe(state);
    state = load(state, 'fresh-veg-1');
    const model = getApplianceDrawerModel(state, 'home-cooking-pot', now)!;
    expect(model.ready.some(candidate => candidate.recipe.id === long.recipe.id)).toBe(true);
    state = act(state, { type: 'startCooking', appliance: 'home-cooking-pot', recipe: long.recipe.id, expectedVersion: model.status.appliance.version });
    expect(state.appliances.find(a => a.id === 'home-cooking-pot')!.job?.output).toBe('dish-fresh-home-tomato-eggs');
  });

  it('reports a full board while preserving a ready dish, then allows collection after one food is stored', () => {
    let state = load(load(kitchen(), 'fresh-poultry-1'), 'fresh-spice-2');
    state = act(state, { type: 'startCooking', appliance: 'home-cooking-pot' });
    const job = state.appliances.find(a => a.id === 'home-cooking-pot')!.job!;
    for (let index = 0; index < unlockedCells(state); index++) if (getBoardEntity(state, index).kind === 'empty') state.board[index] = { uid: `g${state.nextId++}`, item: 'fresh-veg-1' };
    const model = getApplianceDrawerModel(state, 'home-cooking-pot', job.endsAt)!;
    expect(model.status.phase).toBe('ready');
    expect(model.freeCells).toBe(0);
    const rejected = execute(state, { type: 'collectAppliance', appliance: 'home-cooking-pot', expectedJobId: job.id }, job.endsAt);
    expect(rejected.ok).toBe(false);
    expect(rejected.state.appliances.find(a => a.id === 'home-cooking-pot')!.job?.id).toBe(job.id);
    const index = state.board.findIndex(Boolean);
    state = act(state, { type: 'store', index, expectedUid: state.board[index]!.uid }, job.endsAt);
    expect(getApplianceDrawerModel(state, 'home-cooking-pot', job.endsAt)!.freeCells).toBe(1);
    state = act(state, { type: 'collectAppliance', appliance: 'home-cooking-pot', expectedJobId: job.id }, job.endsAt);
    expect(state.appliances.find(a => a.id === 'home-cooking-pot')!.job).toBeNull();
    expect(state.board.filter(item => item?.item === job.output)).toHaveLength(1);
  });

  it('places a stored owned device before on-board and locked families without moving equipment', () => {
    const state = act(createInitialState(now), { type: 'storeDevice', device: 'fruit-cart' });
    const before = JSON.stringify(state);
    expect(getDeviceShelfFamilies(state)[0].id).toBe('fruit-cart');
    expect(getDeviceShelfFamilies(state, 'generator')[0].id).toBe('fruit-cart');
    expect(JSON.stringify(state)).toBe(before);
  });
});
