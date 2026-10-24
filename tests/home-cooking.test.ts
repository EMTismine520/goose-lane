import { describe, expect, it } from 'vitest';
import { baseUnits, FRESH_ORDERS, HOME_CHAINS, HOME_ORDERS, HOME_RECIPES, ITEMS } from '../src/content/catalog';
import { activeDevices, BUILD_NODES, HOME_DEVICES, homeCookingUnlocked } from '../src/content/board-layouts';
import { availableOrders, createInitialState, execute, getApplianceStatus, getBoardEntity, getDayProgress, getGeneratorStatus, inventoryCount, mergeTarget, stateInvariantErrors } from '../src/domain/engine';
import { reconcileHomeDevices } from '../src/domain/home-progression';
import { parseSave, resumeManualSlot, serializeSave, validateSave } from '../src/persistence/save';
import type { Command, GameState, ItemInstance } from '../src/domain/types';
import oldOpening from './persistence-v2.fixture.json';

const now = 1792713600000;
function homeState(): GameState {
  const state = createInitialState(now);
  state.completedOrders = FRESH_ORDERS.map(order => order.id);
  state.construction.completed = BUILD_NODES.map(node => node.id);
  state.construction.hats = 3;
  state.tutorialState = { node: 'complete', completed: [], targetUid: null };
  reconcileHomeDevices(state);
  return state;
}
function act(state: GameState, command: Command, time = state.lastSeen) {
  const result = execute(state, command, time);
  expect(result.ok, result.events.map(event => event.message).join('/')).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  expect(parseSave(serializeSave(result.state))).toEqual(result.state);
  return result.state;
}
function add(state: GameState, item: string) {
  const index = state.board.findIndex((value, i) => !value && getBoardEntity(state, i).kind === 'empty');
  if (index < 0) throw new Error('Fixture full');
  state.board[index] = { uid: `g${state.nextId++}`, item };
  return index;
}
function fill(state: GameState) {
  for (let index = 0; index < 63; index++) if (getBoardEntity(state, index).kind === 'empty') state.board[index] = { uid: `g${state.nextId++}`, item: 'fresh-beast-10' };
}
const inventory = (state: GameState): ItemInstance[] => [...state.board.filter((item): item is ItemInstance => !!item), ...state.storage, ...state.migrationInbox, ...state.appliances.flatMap(a => [...a.inputSlots, ...(a.outputSlot ? [a.outputSlot] : [])])].sort((a, b) => a.uid.localeCompare(b.uid));

describe('home content and gated production', () => {
  it('ships 34 unique items, ten independently costed dishes and a four-customer order sequence', () => {
    expect(HOME_CHAINS.map(chain => chain.items.length)).toEqual([10, 7, 7]);
    const ids = [...HOME_CHAINS.flatMap(chain => chain.items), ...HOME_RECIPES.map(recipe => recipe.output)];
    expect(new Set(ids).size).toBe(34);
    expect(ids.every(id => ITEMS[id].assetPath?.endsWith('.svg'))).toBe(true);
    expect(HOME_RECIPES.reduce((sum, recipe) => sum + baseUnits(recipe.output), 0)).toBe(126);
    expect(HOME_ORDERS.reduce((sum, order) => sum + order.coins, 0)).toBe(498);
    expect(new Set(HOME_ORDERS.map(order => order.customer)).size).toBe(4);
    expect(new Set(HOME_ORDERS.map(order => order.needs[0].item)).size).toBe(10);
  });
  it('opens on either last order or last build, independent of claiming the energy reward', () => {
    let state = createInitialState(now);
    state.completedOrders = FRESH_ORDERS.map(order => order.id);
    state.construction.completed = BUILD_NODES.slice(0, 2).map(node => node.id);
    state.coins = 108;
    expect(homeCookingUnlocked(state)).toBe(false);
    expect(availableOrders(state)).toEqual([]);
    state = act(state, { type: 'build', node: 'shop-counter' });
    expect(homeCookingUnlocked(state)).toBe(true);
    expect(state.construction.rewardClaimed).toBe(false);
    expect(activeDevices(state)).toHaveLength(8);
    expect(state.appliances).toHaveLength(3);
    expect(state.jobs).toHaveLength(4);
    expect(getDayProgress(state)).toMatchObject({ phase: 'home', completed: 0, total: 10 });
    expect(availableOrders(state).map(order => order.id)).toEqual(['home-order-01', 'home-order-02', 'home-order-03']);
    state = createInitialState(now);
    state.completedOrders = FRESH_ORDERS.slice(0, -1).map(order => order.id);
    state.construction.completed = BUILD_NODES.map(node => node.id);
    add(state, FRESH_ORDERS.at(-1)!.needs[0].item);
    state = act(state, { type: 'deliver', order: FRESH_ORDERS.at(-1)!.id });
    expect(homeCookingUnlocked(state)).toBe(true);
  });
  it.each(HOME_CHAINS)('rejects locked $id without spending energy, seed or UID', chain => {
    const state = createInitialState(now), snapshot = JSON.stringify(state);
    expect(getGeneratorStatus(state, chain.id, now).unlocked).toBe(false);
    expect(execute(state, { type: 'generate', chain: chain.id }, now).state).toBe(state);
    expect(JSON.stringify(state)).toBe(snapshot);
    let opened = homeState();
    const before = opened;
    opened = act(opened, { type: 'generate', chain: chain.id, commandId: chain.id });
    const produced = inventory(opened).filter(item => !inventory(before).some(old => old.uid === item.uid));
    expect(produced).toHaveLength(1);
    expect(chain.items.slice(0, 3)).toContain(produced[0].item);
    expect(opened.energy.value).toBe(before.energy.value - 1);
    expect(opened.seed).not.toBe(before.seed);
    expect(execute(opened, { type: 'generate', chain: chain.id, commandId: chain.id }, now).state).toBe(opened);
    opened.energy.value = 0;
    expect(execute(opened, { type: 'generate', chain: chain.id }, now).state).toBe(opened);
    opened.energy.value = 10; fill(opened);
    expect(execute(opened, { type: 'generate', chain: chain.id }, now).state).toBe(opened);
  });
  it('merges beyond seven all the way to ten and preserves the terminal tier', () => {
    let state = homeState();
    for (let level = 7; level < 10; level++) {
      const from = add(state, `fresh-beast-${level}`), to = add(state, `fresh-beast-${level}`);
      state = act(state, { type: 'move', from, to });
      expect(state.board[to]?.item).toBe(`fresh-beast-${level + 1}`);
    }
    expect(mergeTarget('fresh-beast-10')).toBeNull();
    expect(mergeTarget('fresh-poultry-7')).toBeNull();
    expect(mergeTarget('fresh-spice-7')).toBeNull();
    expect(mergeTarget('fresh-veg-7')).toBeNull();
  });
});

describe('multi-ingredient pot ownership', () => {
  it.each(HOME_RECIPES)('cooks and delivers $name through real commands, including reversed input order', recipe => {
    let state = homeState();
    state.completedOrders.push(...HOME_ORDERS.filter(order => order.needs[0].item !== recipe.output).map(order => order.id));
    expect(execute(state, { type: 'cook', recipe: recipe.id, slot: 4 }, now).state).toBe(state);
    for (const need of [...recipe.inputs].reverse()) {
      const from = add(state, need.item), uid = state.board[from]!.uid;
      state = act(state, { type: 'stageInput', from, appliance: 'home-cooking-pot', expectedUid: uid });
      expect(state.appliances.at(-1)!.inputSlots.some(item => item.uid === uid)).toBe(true);
    }
    expect(getApplianceStatus(state, 'home-cooking-pot', now)).toMatchObject({ canStart: true, recipe: { id: recipe.id } });
    expect(state.appliances.at(-1)!.job).toBeNull();
    state = act(state, { type: 'startCooking', appliance: 'home-cooking-pot', recipe: recipe.id, commandId: 'start-once' });
    const job = state.appliances.at(-1)!.job!;
    expect(execute(state, { type: 'startCooking', appliance: 'home-cooking-pot' }, now).state).toBe(state);
    expect(execute(state, { type: 'collectAppliance', appliance: 'home-cooking-pot' }, job.endsAt - 1).state).toBe(state);
    state = act(state, { type: 'recover' }, job.endsAt);
    const output = state.appliances.at(-1)!.outputSlot!;
    state = act(state, { type: 'collectAppliance', appliance: 'home-cooking-pot', expectedJobId: job.id }, job.endsAt);
    expect(inventory(state).filter(item => item.uid === output.uid)).toHaveLength(1);
    expect(execute(state, { type: 'collectAppliance', appliance: 'home-cooking-pot', expectedJobId: job.id }, job.endsAt).state).toBe(state);
    const order = HOME_ORDERS.find(order => order.needs[0].item === recipe.output)!;
    const coins = state.coins;
    state = act(state, { type: 'deliver', order: order.id }, job.endsAt);
    expect(state.coins).toBe(coins + order.coins);
    expect(execute(state, { type: 'deliver', order: order.id }, job.endsAt).state).toBe(state);
    expect(availableOrders(state)).toEqual([]);
  });
  it('keeps the egg-rice prefix ready and accepts tomato to match the longer recipe', () => {
    let state = homeState();
    for (const item of ['fresh-poultry-1', 'fresh-spice-2']) state = act(state, { type: 'stageInput', appliance: 'home-cooking-pot', from: add(state, item) });
    let status = getApplianceStatus(state, 'home-cooking-pot', now)!;
    expect(status.recipe?.id).toBe('fresh-home-scallion-egg-rice');
    expect(status.canStart).toBe(true);
    expect(status.candidates[0].missing).toEqual([]);
    expect(status.appliance.job).toBeNull();
    state = act(state, { type: 'stageInput', appliance: 'home-cooking-pot', from: add(state, 'fresh-veg-1') });
    status = getApplianceStatus(state, 'home-cooking-pot', now)!;
    expect(status.recipe?.id).toBe('fresh-home-tomato-eggs');
    expect(status.recipes).toHaveLength(1);
  });
  it('rejects wrong/extra input, reserves staged ownership and retains output on a full board', () => {
    let state = homeState();
    const wrong = add(state, 'fresh-fruit-7');
    expect(execute(state, { type: 'stageInput', appliance: 'home-cooking-pot', from: wrong }, now).state).toBe(state);
    state = act(state, { type: 'stageInput', appliance: 'home-cooking-pot', from: add(state, 'fresh-poultry-1') });
    const extra = add(state, 'fresh-poultry-1');
    expect(execute(state, { type: 'stageInput', appliance: 'home-cooking-pot', from: extra }, now).state).toBe(state);
    const input = state.appliances.at(-1)!.inputSlots[0];
    expect(inventoryCount(state, input.item)).toBe(1);
    fill(state);
    expect(execute(state, { type: 'withdrawInput', appliance: 'home-cooking-pot', uid: input.uid }, now).state).toBe(state);
    state = act(state, { type: 'sell', index: extra });
    state = act(state, { type: 'withdrawInput', appliance: 'home-cooking-pot', uid: input.uid });
    const from = state.board.findIndex(item => item?.uid === input.uid);
    state = act(state, { type: 'stageInput', appliance: 'home-cooking-pot', from });
    state = act(state, { type: 'stageInput', appliance: 'home-cooking-pot', from: add(state, 'fresh-spice-2') });
    state = act(state, { type: 'startCooking', appliance: 'home-cooking-pot' });
    fill(state);
    const job = state.appliances.at(-1)!.job!;
    state = act(state, { type: 'recover' }, job.endsAt);
    const output = state.appliances.at(-1)!.outputSlot!;
    expect(execute(state, { type: 'collectAppliance', appliance: 'home-cooking-pot' }, job.endsAt).state).toBe(state);
    expect(state.appliances.at(-1)!.outputSlot).toEqual(output);
    state = act(state, { type: 'sell', index: 2 }, job.endsAt);
    state = act(state, { type: 'collectAppliance', appliance: 'home-cooking-pot' }, job.endsAt);
    expect(inventory(state).filter(item => item.uid === output.uid)).toHaveLength(1);
  });
});

describe('content 2.0 migration and portable pot states', () => {
  function oldFull() {
    const old = structuredClone(oldOpening) as unknown as GameState;
    old.completedOrders = FRESH_ORDERS.map(order => order.id);
    old.construction.completed = BUILD_NODES.map(node => node.id);
    old.construction.hats = 3;
    for (let i = 0; i < 63; i++) if (![35, 36, 40, 41].includes(i)) old.board[i] = { uid: `g${old.nextId++}`, item: 'fresh-veg-1' };
    return old;
  }
  it('validates old data before relocating four conflicts into the inbox without loss', () => {
    const source = oldFull(), serialized = JSON.stringify(source), before = inventory(source);
    const result = validateSave(source);
    expect(JSON.stringify(source)).toBe(serialized);
    expect(result.contentVersion).toBe('2.1.0');
    expect(result.migrationInbox).toHaveLength(4);
    expect(inventory(result)).toEqual(before);
    expect(result.seed).toBe(source.seed);
    expect(result.nextId).toBe(source.nextId);
    expect(result.coins).toBe(source.coins);
    expect(stateInvariantErrors(result)).toEqual([]);
    HOME_DEVICES.forEach(device => expect(result.board[device.index]).toBeNull());
    const corrupt = oldFull(); corrupt.board[2] = corrupt.board[0];
    expect(() => validateSave(corrupt)).toThrow(/编号/);
    expect(() => validateSave({ ...source, contentVersion: '2.2.0' })).toThrow(/版本/);
  });
  it('keeps an old undo valid and supports a previously full migration inbox', () => {
    const source = oldFull();
    source.migrationInbox = Array.from({ length: 256 }, () => ({ uid: `g${source.nextId++}`, item: 'fresh-veg-1' }));
    const sold = source.board[37]!; source.board[37] = null; source.coins++;
    source.undo = { item: sold, index: 37, coins: 1, revision: source.revision };
    const before = inventory(source);
    const migrated = validateSave(source);
    expect(migrated.migrationInbox.length).toBe(260);
    expect(migrated.board[migrated.undo!.index]).toBeNull();
    expect(activeDevices(migrated).some(device => device.index === migrated.undo!.index)).toBe(false);
    const restored = act(migrated, { type: 'undo' });
    expect(inventory(restored)).toEqual([...before, sold].sort((a, b) => a.uid.localeCompare(b.uid)));
  });
  it('round-trips staged, cooking and completed pot states and freezes the remaining time', () => {
    let state = homeState();
    for (const item of ['fresh-poultry-1', 'fresh-spice-2']) state = act(state, { type: 'stageInput', from: add(state, item), appliance: 'home-cooking-pot' });
    state = parseSave(serializeSave(state));
    expect(state.appliances.at(-1)!.inputSlots).toHaveLength(2);
    state = act(state, { type: 'startCooking', appliance: 'home-cooking-pot' });
    const captured = now + 8000;
    const resumed = resumeManualSlot({ id: 1, status: 'ready', state, capturedAt: captured, savedAt: captured }, now + 86400000);
    expect(resumed.appliances.at(-1)!.job!.endsAt - resumed.lastSeen).toBe(10000);
    state = act(state, { type: 'recover' }, state.appliances.at(-1)!.job!.endsAt);
    const completed = parseSave(serializeSave(state));
    expect(completed.appliances.at(-1)!.outputSlot).toEqual(state.appliances.at(-1)!.outputSlot);
  });
  it('relocates occupied device cells in the same command that completes the opening', () => {
    let state = createInitialState(now);
    state.completedOrders = FRESH_ORDERS.map(order => order.id);
    state.construction.completed = BUILD_NODES.slice(0, 2).map(node => node.id);
    state.coins = 108;
    for (const index of [37, 38, 39, 47]) state.board[index] = { uid: `g${state.nextId++}`, item: 'fresh-veg-2' };
    const before = inventory(state);
    state = act(state, { type: 'build', node: 'shop-counter' });
    expect(inventory(state)).toEqual(before);
    expect(state.cellVersions[47]).toBeGreaterThan(0);
  });
});
