import { describe, expect, it } from 'vitest';
import { createUiPreviewState } from '../src/diagnostics/ui-preview-state';
import { availableOrders, createInitialState, execute, getApplianceStatus, getBoardEntity } from '../src/domain/engine';
import type { GameState } from '../src/domain/types';
import { boardTapAction } from '../src/game/board-input';
import { getApplianceTarget } from '../src/ui/ui-guidance';

const now = 100_000;
const pot = 'home-cooking-pot';
function withdraw(state: GameState, item: string) {
  const appliance = state.appliances.find(value => value.id === pot)!;
  const input = appliance.inputSlots.find(value => value.item === item)!;
  const result = execute(state, { type: 'withdrawInput', appliance: pot, uid: input.uid, expectedVersion: appliance.version }, now);
  expect(result.ok).toBe(true);
  return result.state;
}
function put(state: GameState, item: string) {
  const index = state.board.findIndex((_, index) => getBoardEntity(state, index).kind === 'empty');
  expect(index).toBeGreaterThanOrEqual(0);
  state.board[index] = { uid: `g${state.nextId++}`, item };
  return index;
}

describe('order-aware appliance targets', () => {
  it('does not offer an unavailable appliance or mutate the save while choosing a target', () => {
    expect(getApplianceTarget(createInitialState(now), pot, null)).toBeNull();
    const state = createUiPreviewState('prefix', now), before = JSON.stringify(state);
    const target = getApplianceTarget(state, pot, null)!;
    expect(target).toMatchObject({ orderId: 'home-order-02', canStart: false, recipe: { id: 'fresh-home-tomato-eggs' } });
    expect(JSON.stringify(state)).toBe(before);
  });

  it('shows the whole order after one input and counts only the appliance tray', () => {
    const state = withdraw(createUiPreviewState('prefix', now), 'fresh-spice-2');
    const target = getApplianceTarget(state, pot, null)!;
    expect(target.ingredients).toEqual([
      { item: 'fresh-veg-1', loaded: 0, required: 1, complete: false },
      { item: 'fresh-poultry-1', loaded: 1, required: 1, complete: true },
      { item: 'fresh-spice-2', loaded: 0, required: 1, complete: false },
    ]);
    expect(state.board.some(item => item?.item === 'fresh-veg-1')).toBe(true);
    expect(state.board.some(item => item?.item === 'fresh-spice-2')).toBe(true);
  });

  it('prioritizes a compatible focused order and returns to visible order order on clear', () => {
    const state = withdraw(createUiPreviewState('prefix', now), 'fresh-poultry-1');
    expect(getApplianceTarget(state, pot, null)?.orderId).toBe('home-order-02');
    expect(getApplianceTarget(state, pot, 'home-order-04')).toMatchObject({ orderId: 'home-order-04', recipe: { id: 'fresh-home-meatball-soup' } });
    expect(getApplianceTarget(state, pot, null)?.orderId).toBe('home-order-02');
  });

  it.each(['home-order-03', 'home-order-05', 'missing-order'])('falls back when focus %s is incompatible or unavailable', focus => {
    const state = createUiPreviewState('prefix', now);
    expect(getApplianceTarget(state, pot, focus)).toMatchObject({ orderId: 'home-order-02', recipe: { id: 'fresh-home-tomato-eggs' } });
  });

  it.each(['board', 'storage'] as const)('skips a focused order whose dish is already in %s', location => {
    const state = withdraw(createUiPreviewState('prefix', now), 'fresh-poultry-1');
    const item = 'dish-fresh-home-tomato-eggs';
    if (location === 'board') put(state, item);
    else state.storage.push({ uid: `g${state.nextId++}`, item });
    expect(getApplianceTarget(state, pot, 'home-order-02')?.orderId).toBe('home-order-04');
  });

  it('uses free cooking when no outstanding order is compatible', () => {
    const state = createUiPreviewState('prefix', now);
    put(state, 'dish-fresh-home-tomato-eggs');
    expect(getApplianceTarget(state, pot, 'home-order-02')).toMatchObject({ orderId: null, canStart: true, recipe: { id: 'fresh-home-scallion-egg-rice' } });
  });

  it('drops a delivered focus and finds the next compatible current order', () => {
    const state = createUiPreviewState('prefix', now);
    put(state, 'dish-fresh-home-tomato-eggs');
    const result = execute(state, { type: 'deliver', order: 'home-order-02' }, now);
    expect(result.ok).toBe(true);
    expect(availableOrders(result.state).some(order => order.id === 'home-order-02')).toBe(false);
    expect(getApplianceTarget(result.state, pot, 'home-order-02')).toMatchObject({ orderId: 'home-order-05', recipe: { id: 'fresh-home-chicken-roll' } });
  });

  it('does not light an ingredient for a rejected duplicate input', () => {
    const state = createUiPreviewState('prefix', now);
    const from = put(state, 'fresh-poultry-1');
    const before = getApplianceTarget(state, pot, null);
    const result = execute(state, { type: 'stageInput', from, appliance: pot }, now);
    expect(result.ok).toBe(false);
    expect(getApplianceTarget(result.state, pot, null)).toEqual(before);
  });

  it.each([null, 0, 35, 41])('does not start a short prefix when the longer order is missing input, from selection %s', selected => {
    const state = createUiPreviewState('prefix', now);
    const status = getApplianceStatus(state, pot, now)!;
    expect(status.canStart).toBe(true);
    const target = getApplianceTarget(state, pot, 'home-order-02')!;
    expect(boardTapAction(state, status.appliance.index, selected, target)).toEqual({ kind: 'select', index: status.appliance.index });
  });

  it('starts the exact displayed recipe with version checking, then pins the running job', () => {
    const state = createUiPreviewState('loaded', now);
    const target = getApplianceTarget(state, pot, 'home-order-02')!;
    const appliance = state.appliances.find(value => value.id === pot)!;
    const action = boardTapAction(state, appliance.index, 41, target);
    expect(action.kind).toBe('command');
    if (action.kind !== 'command') throw new Error('Expected the explicit recipe to start');
    expect(action.command).toEqual({ type: 'startCooking', appliance: pot, recipe: target.recipe.id, expectedVersion: appliance.version });
    const result = execute(state, action.command, now);
    expect(result.ok).toBe(true);
    expect(result.state.appliances.find(value => value.id === pot)?.inputSlots).toEqual([]);
    const cooking = getApplianceTarget(result.state, pot, 'home-order-04')!;
    expect(cooking.recipe.id).toBe(target.recipe.id);
    expect(cooking.canStart).toBe(false);
    expect(cooking.ingredients.every(need => need.complete)).toBe(true);
  });

  it('restores the missing ingredient on withdrawal and leaves collection available', () => {
    const state = withdraw(createUiPreviewState('loaded', now), 'fresh-veg-1');
    expect(getApplianceTarget(state, pot, null)?.ingredients[0]).toMatchObject({ loaded: 0, complete: false });
    const ready = createUiPreviewState('ready', now);
    const target = getApplianceTarget(ready, pot, 'home-order-04')!;
    const appliance = ready.appliances.find(value => value.id === pot)!;
    const action = boardTapAction(ready, appliance.index, null, target);
    expect(action).toMatchObject({ kind: 'command', command: { type: 'collectAppliance', appliance: pot } });
    expect(target.recipe.id).toBe(appliance.job?.recipe);
  });
});
