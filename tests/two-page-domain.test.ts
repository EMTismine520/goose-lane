import { describe, expect, it } from 'vitest';
import { baseUnits, FRESH_CHAINS, FRESH_ORDERS, FRESH_RECIPES, ITEMS, RECIPES } from '../src/content/catalog';
import { BOARD_LAYOUT, BUILD_NODES } from '../src/content/board-layouts';
import { ENERGY_CONFIG } from '../src/content/production';
import { createInitialState, execute, getApplianceStatus, getBoardEntity, getDayProgress, getEnergyStatus, getTutorialStep, inventoryCount, mergeTarget, stateInvariantErrors, unlockedCells } from '../src/domain/engine';
import { simulateOpening } from '../src/diagnostics/opening';
import type { Command, GameState } from '../src/domain/types';

function act(state: GameState, command: Command, now = state.lastSeen) {
  const result = execute(state, command, now);
  expect(result.ok, result.events.map(event => event.message).join(', ')).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  return result.state;
}
function fill(state: GameState) {
  for (let index = 0; index < state.board.length; index++) if (getBoardEntity(state, index).kind === 'empty') state.board[index] = { uid: `g${state.nextId++}`, item: 'fresh-veg-7' };
}

describe('opening content and production', () => {
  it('ships two complete chains, six independent dishes, twelve reachable opening orders and 7x9 layout', () => {
    expect([FRESH_CHAINS.length, FRESH_RECIPES.length, FRESH_ORDERS.length]).toEqual([2, 6, 12]);
    expect(new Set(FRESH_RECIPES.map(recipe => ITEMS[recipe.output].assetId)).size).toBe(6);
    expect(mergeTarget('fresh-veg-3')).toBe('fresh-veg-4');
    const state = createInitialState(1000);
    expect(state.board).toHaveLength(63);
    expect(BOARD_LAYOUT.entities.map(entity => getBoardEntity(state, entity.index).kind)).toEqual(['generator', 'generator', 'appliance', 'appliance']);
    expect(stateInvariantErrors(state)).toEqual([]);
  });
  it('charges energy only on successful production and commits random seed with the item', () => {
    const initial = createInitialState(1000);
    let state = act(initial, { type: 'generate', chain: 'fresh-veg', commandId: 'once' });
    expect(state.energy.value).toBe(initial.energy.value - 1);
    expect(state.seed).not.toBe(initial.seed);
    expect(execute(state, { type: 'generate', chain: 'fresh-veg', commandId: 'once' }).state).toBe(state);
    const retry = execute(initial, { type: 'generate', chain: 'fresh-veg' });
    expect(retry.state.board).toEqual(state.board);
    const energy = state.energy.value;
    state = act(state, { type: 'move', from: 16, to: 17 });
    expect(state.energy.value).toBe(energy);
    fill(state);
    const snapshot = JSON.stringify(state);
    expect(execute(state, { type: 'generate', chain: 'fresh-veg' }).state).toBe(state);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
  it('has bounded natural recovery and permits construction reward overflow', () => {
    let state = createInitialState(1000);
    state.energy.value = 99;
    expect(getEnergyStatus(state, 1000 + ENERGY_CONFIG.recoveryInterval * 20).value).toBe(100);
    expect(getEnergyStatus(state, 0).value).toBe(99);
    state.coins = 24;
    state = act(state, { type: 'build', node: BUILD_NODES[0].id });
    expect(state.energy.value).toBe(119);
    expect(getEnergyStatus(state, 1_000_000).value).toBe(119);
    expect(execute(state, { type: 'build', node: BUILD_NODES[0].id }).state).toBe(state);
  });
  it('opens one row per new construction node and keeps historical locks tied to days', () => {
    let state = createInitialState(1000);
    state.coins = 204;
    expect(getBoardEntity(state, 42).name).toBe('清理纸箱后解锁');
    for (const [index, node] of BUILD_NODES.entries()) {
      state = act(state, { type: 'build', node: node.id });
      expect(unlockedCells(state)).toBe(49 + index * 7);
      expect(getBoardEntity(state, 42 + index * 7).kind).toBe('empty');
    }
    const legacy = { ...state, campaign: 'legacy' as const, day: 1 };
    expect(unlockedCells(legacy)).toBe(42);
    expect(getBoardEntity(legacy, 42).name).toBe('第 3 天扩建');
    expect(unlockedCells({ ...legacy, day: 5 })).toBe(63);
  });
});

describe('exclusive input ownership and timed appliance settlement', () => {
  it('stages, refresh-roundtrips and withdraws the same UID without exposing input to orders', () => {
    let state = createInitialState(1000);
    const input = state.board[16]!;
    const before = inventoryCount(state, input.item);
    state = act(state, { type: 'move', from: 16, to: 40, expectedUid: input.uid, expectedTargetUid: null, expectedTargetVersion: 0 });
    expect(state.board[16]).toBeNull();
    expect(state.appliances[0].inputSlots[0]).toEqual(input);
    expect(inventoryCount(state, input.item)).toBe(before - 1);
    state = JSON.parse(JSON.stringify(state));
    expect(getApplianceStatus(state, 'chopping-board', 1000)?.phase).toBe('loaded');
    state = act(state, { type: 'withdrawInput', appliance: 'chopping-board', uid: input.uid });
    expect(state.board.some(item => item?.uid === input.uid)).toBe(true);
    expect(state.appliances[0].inputSlots).toEqual([]);
  });
  it('wrong ingredient, full-board withdrawal and stale drag leave all assets untouched', () => {
    let state = createInitialState(1000);
    expect(execute(state, { type: 'stageInput', from: 23, appliance: 'chopping-board' }).state).toBe(state);
    const uid = state.board[16]!.uid;
    state = act(state, { type: 'stageInput', from: 16, appliance: 'chopping-board' });
    fill(state);
    expect(execute(state, { type: 'withdrawInput', appliance: 'chopping-board', uid }).state).toBe(state);
    expect(execute(state, { type: 'move', from: 16, to: 17, expectedUid: uid }).state).toBe(state);
    expect(execute(state, { type: 'move', from: 17, to: 18, expectedTargetVersion: 999 }).state).toBe(state);
  });
  it('requires explicit start, keeps completed output on a full board and prevents duplicate collect', () => {
    let state = createInitialState(1000);
    state = act(state, { type: 'stageInput', from: 16, appliance: 'chopping-board' });
    state = act(state, { type: 'startCooking', appliance: 'chopping-board' });
    const job = state.appliances[0].job!;
    expect(state.appliances[0].inputSlots).toEqual([]);
    expect(execute(state, { type: 'collectAppliance', appliance: 'chopping-board' }, job.endsAt - 1).state).toBe(state);
    state = JSON.parse(JSON.stringify(state));
    fill(state);
    state = act(state, { type: 'recover' }, job.endsAt);
    const output = state.appliances[0].outputSlot!;
    expect(getApplianceStatus(state, 'chopping-board', job.endsAt)?.phase).toBe('ready');
    expect(execute(state, { type: 'collectAppliance', appliance: 'chopping-board' }, job.endsAt).state).toBe(state);
    expect(state.appliances[0].outputSlot).toEqual(output);
    state = JSON.parse(JSON.stringify(state));
    state = act(state, { type: 'sell', index: 0 }, job.endsAt);
    state = act(state, { type: 'collectAppliance', appliance: 'chopping-board', expectedJobId: job.id }, job.endsAt);
    expect(state.board.some(item => item?.uid === output.uid)).toBe(true);
    expect(execute(state, { type: 'collectAppliance', appliance: 'chopping-board', expectedJobId: job.id }, job.endsAt).state).toBe(state);
  });
  it('multi-input recipe reserves all ingredients and does not start early', () => {
    let state = createInitialState(1000);
    state.board[16]!.item = 'fresh-veg-5'; state.board[17]!.item = 'fresh-veg-3';
    state = act(state, { type: 'stageInput', from: 16, appliance: 'chopping-board' });
    expect(execute(state, { type: 'startCooking', appliance: 'chopping-board' }).state).toBe(state);
    state = act(state, { type: 'stageInput', from: 17, appliance: 'chopping-board' });
    state = act(state, { type: 'startCooking', appliance: 'chopping-board' });
    expect(state.appliances[0].job!.recipe).toBe('fresh-garden-bowl');
    expect(state.appliances[0].job!.output).toBe('dish-fresh-garden-bowl');
    expect(state.appliances[0].job!.endsAt - state.appliances[0].job!.startedAt).toBe(30_000);
  });
  it('does not accept the retired orange ingredient for a new harvest bowl', () => {
    let state = createInitialState(1000);
    state.board[16]!.item = 'fresh-veg-5';
    state.board[17]!.item = 'fresh-fruit-2';
    const orange = state.board[17];
    state = act(state, { type: 'stageInput', from: 16, appliance: 'chopping-board' });
    const rejected = execute(state, { type: 'stageInput', from: 17, appliance: 'chopping-board' });
    expect(rejected.ok).toBe(false);
    expect(rejected.state).toBe(state);
    expect(state.board[17]).toEqual(orange);
    expect(getApplianceStatus(state, 'chopping-board')?.canStart).toBe(false);
  });
});

describe('new campaign continuity', () => {
  it('keeps sale undo through selection, switches, settings and passive time recovery', () => {
    let state = createInitialState(1000);
    const item = state.board[16]!;
    state = act(state, { type: 'sell', index: 16 });
    state = act(state, { type: 'session', session: { selectedUid: 'vegetable-cart', page: 'street' } });
    state = act(state, { type: 'settings', settings: { sound: false } });
    state = act(state, { type: 'recover' }, 2000);
    expect(state.undo!.revision).toBe(state.revision);
    state = act(state, { type: 'undo' });
    expect(state.board[16]).toEqual(item);
  });
  it('conserves material and ownership across 1800 mixed, stale and cancelled operations', () => {
    let state = createInitialState(1000);
    let random = 987654321;
    const pick = (max: number) => { random ^= random << 13; random ^= random >>> 17; random ^= random << 5; return (random >>> 0) % max; };
    const units = (value: GameState) => {
      const physical = [...value.board.filter(item => item !== null), ...value.storage, ...value.migrationInbox, ...value.appliances.flatMap(appliance => [...appliance.inputSlots, ...(appliance.outputSlot ? [appliance.outputSlot] : [])])].reduce((sum, item) => sum + baseUnits(item.item), 0);
      return physical + value.appliances.reduce((sum, appliance) => sum + (appliance.job && !appliance.outputSlot ? RECIPES.find(recipe => recipe.id === appliance.job!.recipe)!.inputs.reduce((cost, input) => cost + baseUnits(input.item) * input.count, 0) : 0), 0);
    };
    for (let step = 0; step < 1800; step++) {
      const from = pick(67) - 2;
      const to = pick(67) - 2;
      const appliance = state.appliances[pick(2)];
      const commands: Command[] = [
        { type: 'generate', chain: FRESH_CHAINS[pick(2)].id }, { type: 'move', from, to },
        { type: 'stageInput', from, appliance: appliance.id }, { type: 'withdrawInput', appliance: appliance.id, uid: appliance.inputSlots[0]?.uid ?? 'missing' },
        { type: 'startCooking', appliance: appliance.id }, { type: 'collectAppliance', appliance: appliance.id },
        { type: 'deliver', order: FRESH_ORDERS[pick(12)].id }, { type: 'sell', index: from }, { type: 'undo' },
        { type: 'session', session: { page: pick(2) ? 'merge' : 'street' } }, { type: 'store', index: from },
        { type: 'retrieve', uid: state.storage[0]?.uid ?? 'missing' }, { type: 'recover' },
      ];
      const command = commands[pick(commands.length)];
      const before = units(state);
      const serialized = JSON.stringify(state);
      const result = execute(state, command, 1000 + step * 997);
      expect(JSON.stringify(state)).toBe(serialized);
      if (!result.ok) expect(result.state).toBe(state);
      else {
        let expected = before;
        if (command.type === 'generate') expected += baseUnits(result.events.find(event => event.type === 'generate')!.item!);
        if (command.type === 'sell') expected -= baseUnits(state.board[command.index]!.item);
        if (command.type === 'undo') expected += baseUnits(state.undo!.item.item);
        if (command.type === 'deliver') expected -= FRESH_ORDERS.find(order => order.id === command.order)!.needs.reduce((sum, input) => sum + baseUnits(input.item) * input.count, 0);
        expect(units(result.state)).toBe(expected);
      }
      state = result.state;
      expect(stateInvariantErrors(state)).toEqual([]);
    }
  });
  it('keeps state through twenty switches and arbitrates competing deliveries once', () => {
    let state = act(createInitialState(1000), { type: 'move', from: 16, to: 17 });
    const uid = state.board[17]!.uid;
    state = act(state, { type: 'session', session: { selectedUid: uid, orderScroll: 130 } });
    for (let count = 0; count < 20; count++) state = act(state, { type: 'session', session: { page: count % 2 ? 'merge' : 'street' } });
    expect(state.session.selectedUid).toBe(uid);
    expect(state.session.orderScroll).toBe(130);
    state = act(state, { type: 'deliver', order: FRESH_ORDERS[0].id });
    const coins = state.coins;
    expect(execute(state, { type: 'deliver', order: FRESH_ORDERS[0].id }).state).toBe(state);
    expect(state.coins).toBe(coins);
  });
  it.each([0x6f657321, 42, 123456789])('legally completes the opening and three construction nodes for seed %i', seed => {
    const { state, report } = simulateOpening(seed);
    expect(report.orders).toBe(12);
    expect(report.dishes).toBe(6);
    expect(report.completedNodes).toBe(3);
    expect(report.firstBuild!.coinsEarned).toBeGreaterThanOrEqual(24);
    expect(report.peakOccupancy).toBeLessThan(38);
    expect(report.tutorialComplete).toBe(true);
    expect(report.humanTimingValidated).toBe(false);
    expect(getDayProgress(state).canAdvance).toBe(false);
    expect(execute(state, { type: 'nextDay' }).state).toBe(state);
    expect(stateInvariantErrors(state)).toEqual([]);
  });
});

describe('event-driven, resumable tutorial', () => {
  it('failed commands never advance; an early merge and delivery are skipped when production happens later', () => {
    let state = createInitialState(1000);
    const failed = execute(state, { type: 'move', from: 16, to: 42 });
    expect(failed.state.tutorialState).toEqual(state.tutorialState);
    state = act(state, { type: 'move', from: 16, to: 17 });
    state = act(state, { type: 'deliver', order: FRESH_ORDERS[0].id });
    expect(state.tutorialState.node).toBe('produce');
    state = act(state, { type: 'generate', chain: 'fresh-veg' });
    expect(state.tutorialState.node).toBe('load');
    expect(state.tutorialState.completed).toEqual(expect.arrayContaining(['produce', 'merge', 'first-order']));
    expect(new Set(state.tutorialState.completed).size).toBe(state.tutorialState.completed.length);
  });
  it('resolves tutorial targets by UID across moves and follows whichever appliance was actually loaded', () => {
    let state = act(createInitialState(1000), { type: 'generate', chain: 'fresh-veg' });
    const target = getTutorialStep(state)!.target;
    const from = state.board.findIndex(item => item?.uid === target);
    state = act(state, { type: 'move', from, to: 0 });
    expect(getTutorialStep(state)!.target).toBe(target);
    expect(state.board[0]?.uid).toBe(target);
    state = act(state, { type: 'move', from: 0, to: 17 });
    state = act(state, { type: 'deliver', order: FRESH_ORDERS[0].id });
    state = act(state, { type: 'stageInput', from: 23, appliance: 'fruit-press' });
    expect(state.tutorialState.node).toBe('start');
    expect(state.tutorialState.targetUid).toBe('fruit-press');
    state = JSON.parse(JSON.stringify(state));
    expect(getTutorialStep(state)!.target).toBe('fruit-press');
    state = act(state, { type: 'startCooking', appliance: 'fruit-press' });
    state = act(state, { type: 'generate', chain: 'fresh-fruit' });
    expect(state.tutorialState.node).toBe('collect');
    expect(getTutorialStep(state)!.target).toBe('fruit-press');
    expect(getTutorialStep(state)!.text).toContain('正在制作');
  });
  it('an early collected dish skips the optional waiting action and can continue after refresh and page switches', () => {
    let state = createInitialState(1000);
    state = act(state, { type: 'stageInput', from: 16, appliance: 'chopping-board' });
    state = act(state, { type: 'startCooking', appliance: 'chopping-board' });
    const endsAt = state.appliances[0].job!.endsAt;
    state = act(state, { type: 'session', session: { page: 'street' } });
    state = JSON.parse(JSON.stringify(state));
    state = act(state, { type: 'session', session: { page: 'merge' } }, endsAt);
    state = act(state, { type: 'collectAppliance', appliance: 'chopping-board' }, endsAt);
    state = act(state, { type: 'deliver', order: FRESH_ORDERS[1].id }, endsAt);
    expect(state.tutorialState.completed).toEqual(expect.arrayContaining(['load', 'start', 'wait', 'collect', 'dish-order', 'visit-street']));
    state = act(state, { type: 'generate', chain: 'fresh-veg' }, endsAt);
    const pair = state.board.filter(item => item?.item === 'fresh-fruit-1');
    const indices = pair.map(item => state.board.findIndex(value => value?.uid === item!.uid));
    state = act(state, { type: 'move', from: indices[0], to: indices[1] }, endsAt);
    expect(state.tutorialState.node).toBe('build');
  });
});
