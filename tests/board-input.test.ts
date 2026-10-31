import { cloneGameState } from '../src/domain/workspaces';
import { describe, expect, it } from 'vitest';
import { createInitialState, execute, getApplianceStatus, stateInvariantErrors } from '../src/domain/engine';
import { CHAINS } from '../src/content/catalog';
import { BOARD_HEIGHT, BOARD_WIDTH, boardTapAction, cellAt, cellCenter, dropKind, isDropCommitted, moveCommand, nextKeyboardCell, selectionAfterDrop } from '../src/game/board-input';

describe('portrait board coordinate and gesture contract', () => {
  it('maps all 63 cell centres and excludes the complete outer boundary', () => {
    expect([BOARD_WIDTH, BOARD_HEIGHT]).toEqual([350, 450]);
    for (let index = 0; index < 63; index++) {
      const at = cellCenter(index);
      expect(cellAt(at.x, at.y)).toBe(index);
    }
    for (const point of [[-1, 0], [0, -1], [350, 10], [10, 450], [NaN, 10], [Infinity, 10]]) expect(cellAt(...point as [number, number])).toBeNull();
    expect(cellAt(349.99, 449.99)).toBe(62);
  });

  it('keyboard movement cannot jump rows or leave the board', () => {
    expect(nextKeyboardCell(6, 'ArrowRight')).toBe(6);
    expect(nextKeyboardCell(7, 'ArrowLeft')).toBe(7);
    expect(nextKeyboardCell(0, 'ArrowUp')).toBe(0);
    expect(nextKeyboardCell(62, 'ArrowDown')).toBe(62);
    expect(nextKeyboardCell(31, 'Home')).toBe(28);
    expect(nextKeyboardCell(31, 'End')).toBe(34);
  });

  it('differentiates moves, merges, swaps and non-movable devices', () => {
    const state = createInitialState(1_000);
    state.board.fill(null);
    state.board[0] = { uid: 'a', item: 'fresh-veg-3' };
    state.board[1] = { uid: 'b', item: 'fresh-veg-3' };
    state.board[2] = { uid: 'c', item: 'fresh-fruit-1' };
    expect(dropKind(state, 0, 0)).toBe('same');
    expect(dropKind(state, 0, 1)).toBe('merge');
    expect(dropKind(state, 0, 2)).toBe('swap');
    expect(dropKind(state, 0, 3)).toBe('move');
    expect(dropKind(state, 0, 35)).toBe('blocked');
    expect(dropKind(state, 0, 42)).toBe('blocked');
    expect(dropKind(state, 35, 0)).toBe('blocked');
  });

  it('previews compatible input and rejects the wrong appliance before dropping', () => {
    const state = createInitialState(1_000);
    state.board[0] = { uid: 'tomato', item: 'fresh-veg-1' };
    expect(dropKind(state, 0, 40)).toBe('stage');
    expect(dropKind(state, 0, 41)).toBe('blocked');
    state.appliances[0].inputSlots = [{ uid: 'already-loaded', item: 'fresh-veg-1' }];
    expect(dropKind(state, 0, 40)).toBe('blocked');
  });

  it.each(['fresh-veg', 'fresh-mixer'])('swaps two top-level %s items without consuming either UID', chain => {
    const state = createInitialState(1_000);
    const item = CHAINS.find(entry => entry.id === chain)!.items.at(-1)!;
    state.board[0] = { uid: 'top-a', item };
    state.board[1] = { uid: 'top-b', item };
    expect(dropKind(state, 0, 1)).toBe('swap');
    const result = execute(state, moveCommand(state, 0, 1, 'top-a')!, 1_001);
    expect(result.ok).toBe(true);
    expect(result.state.board[0]?.uid).toBe('top-b');
    expect(result.state.board[1]?.uid).toBe('top-a');
    expect(result.state.stats.merges).toBe(0);
  });

  it('never submits a gesture against a replacement occupant', () => {
    const state = createInitialState(1_000);
    state.board[0] = { uid: 'replacement', item: 'fresh-veg-1' };
    expect(moveCommand(state, 0, 1, 'original')).toBeNull();
  });

  it('captures target UID and cell version so queued drops cannot hit a replacement', () => {
    const state = createInitialState(1_000);
    state.board[0] = { uid: 'dragged', item: 'fresh-veg-1' };
    state.board[1] = null;
    const command = moveCommand(state, 0, 1, 'dragged');
    expect(command).toMatchObject({ expectedUid: 'dragged', expectedTargetUid: null, expectedTargetVersion: 0 });
    state.board[1] = { uid: 'replacement', item: 'fresh-fruit-1' };
    state.cellVersions[1]++;
    const result = execute(state, command!, 1_001);
    expect(result.ok).toBe(false);
    expect(result.state.board[0]?.uid).toBe('dragged');
    expect(result.state.board[1]?.uid).toBe('replacement');
  });

  it('retains one UID through thirty alternating legal moves', () => {
    let state = createInitialState(1_000);
    state.board.fill(null);
    state.board[0] = { uid: 'dragged', item: 'fresh-veg-1' };
    let source = 0;
    for (let index = 0; index < 30; index++) {
      const target = source === 0 ? 1 : 0;
      const command = moveCommand(state, source, target, 'dragged');
      const result = execute(state, command!, 1_001 + index);
      expect(result.ok).toBe(true);
      state = result.state;
      expect(state.board.filter(item => item?.uid === 'dragged')).toHaveLength(1);
      expect(stateInvariantErrors(state)).toEqual([]);
      source = target;
    }
  });

  it('waits for the committed merge snapshot before selecting the destination UID', () => {
    const state = createInitialState(1_000);
    state.board[0] = { uid: 'dragged', item: 'fresh-veg-3' };
    state.board[1] = { uid: 'old-target', item: 'fresh-veg-3' };
    const selection = selectionAfterDrop(state, 0, 1, 'dragged');
    expect(isDropCommitted(state, selection)).toBe(false);
    const result = execute(state, moveCommand(state, 0, 1, 'dragged')!, 1_001);
    expect(result.ok).toBe(true);
    expect(result.state.board[1]?.item).toBe('fresh-veg-4');
    expect(isDropCommitted(result.state, selection)).toBe(true);
  });

  it('preserves appliance selection only after input ownership has actually changed', () => {
    const state = createInitialState(1_000);
    state.board[0] = { uid: 'tomato', item: 'fresh-veg-1' };
    const selection = selectionAfterDrop(state, 0, 40, 'tomato');
    expect(isDropCommitted(state, selection)).toBe(false);
    const result = execute(state, moveCommand(state, 0, 40, 'tomato')!, 1_001);
    expect(result.ok).toBe(true);
    expect(isDropCommitted(result.state, selection)).toBe(true);
  });
});

describe('clicks inspect objects and operate devices without transporting the previous selection', () => {
  function kitchen(phase: 'idle' | 'loaded' | 'cooking' | 'ready' = 'idle') {
    let state = createInitialState(Date.now());
    state.board.fill(null);
    state.board[0] = { uid: `g${state.nextId++}`, item: 'fresh-veg-3' };
    state.board[1] = { uid: `g${state.nextId++}`, item: 'fresh-veg-1' };
    if (phase !== 'idle') {
      state = execute(state, { type: 'stageInput', from: 1, appliance: 'chopping-board' }, state.lastSeen).state;
      if (phase !== 'loaded') state = execute(state, { type: 'startCooking', appliance: 'chopping-board' }, state.lastSeen).state;
      if (phase === 'ready') state = execute(state, { type: 'recover' }, state.appliances[0].job!.endsAt).state;
    }
    expect(getApplianceStatus(state, 'chopping-board')?.phase).toBe(phase);
    return state;
  }

  it.each([null, 0, 35, 41])('collects exactly one ready dish with preceding selection %s', selected => {
    const state = kitchen('ready'), output = state.appliances[0].outputSlot;
    const action = boardTapAction(state, 40, selected);
    expect(action.kind).toBe('command');
    if (action.kind !== 'command') throw new Error('Expected a collect command');
    expect(action.command).toEqual({ type: 'collectAppliance', appliance: 'chopping-board', expectedJobId: state.appliances[0].job!.id });
    const result = execute(state, action.command, state.lastSeen);
    expect(result.ok).toBe(true);
    expect(result.state.stats.cooked).toBe(1);
    expect(result.state.board[0]).toEqual(state.board[0]);
    expect(result.state.board.filter(item => item?.uid === output!.uid)).toHaveLength(1);
    expect(result.state.appliances[0].job).toBeNull();
    expect(boardTapAction(result.state, 40, 40)).toEqual({ kind: 'select', index: 40 });
    expect(stateInvariantErrors(result.state)).toEqual([]);
  });

  it('produces exactly twenty times while alternating generators and preceding selections', () => {
    let state = kitchen();
    for (let n = 0; n < 20; n++) {
      const action = boardTapAction(state, n % 2 ? 36 : 35, [null, 0, 35, 40][n % 4]);
      if (action.kind !== 'command') throw new Error('Expected a generate command');
      const result = execute(state, action.command, state.lastSeen);
      expect(result.ok).toBe(true);
      state = result.state;
    }
    expect(state.stats.generated).toBe(20);
    expect(state.energy.value).toBe(40);
    expect(state.board[0]?.uid).toBe('g8');
    expect(state.devices.find(device => device.id === 'vegetable-cart')?.index).toBe(35);
    expect(stateInvariantErrors(state)).toEqual([]);
  });

  it.each([null, 0, 35, 41])('starts a loaded appliance with preceding selection %s', selected => {
    const state = kitchen('loaded');
    const action = boardTapAction(state, 40, selected);
    if (action.kind !== 'command') throw new Error('Expected a start command');
    expect(action.command).toEqual({ type: 'startCooking', appliance: 'chopping-board' });
    const result = execute(state, action.command, state.lastSeen);
    expect(result.ok).toBe(true);
    expect(result.state.appliances[0].job).not.toBeNull();
    expect(result.state.board[0]).toEqual(state.board[0]);
  });

  it.each(['idle', 'cooking'] as const)('inspects or confirms an %s appliance without changing its inputs on a second tap', phase => {
    const state = kitchen(phase);
    const before = cloneGameState(state);
    for (const selected of [null, 0, 1, 35, 40, 41]) {
      expect(boardTapAction(state, 40, selected)).toEqual(phase === 'cooking' ? { kind: 'confirmSpeedup', appliance: state.appliances[0].id, jobId: state.appliances[0].job!.id } : { kind: 'select', index: 40 });
      expect(boardTapAction(state, 41, selected)).toEqual({ kind: 'select', index: 41 });
    }
    expect(state).toEqual(before);
  });

  it('only switches or clears selection for same-level food, different food, empty cells and locks', () => {
    const state = kitchen(), before = cloneGameState(state);
    state.board[2] = { uid: `g${state.nextId++}`, item: 'fresh-veg-3' };
    const snapshot = cloneGameState(state);
    for (const selected of [null, 0, 1, 2, 35, 40]) {
      expect(boardTapAction(state, 2, selected)).toEqual({ kind: 'select', index: selected === 2 ? null : 2 });
      expect(boardTapAction(state, 3, selected)).toEqual({ kind: 'select', index: null });
      expect(boardTapAction(state, 42, selected)).toEqual({ kind: 'select', index: null });
    }
    expect(boardTapAction(state, 0, 35)).toEqual({ kind: 'select', index: 0 });
    expect(boardTapAction(state, 1, 0)).toEqual({ kind: 'select', index: 1 });
    expect(state).toEqual(snapshot);
    expect(state.board[0]).toEqual(before.board[0]);
  });

  it('only selects an incomplete appliance even when the selected ingredient could complete its recipe', () => {
    let state = kitchen();
    state.board[2] = { uid: `g${state.nextId++}`, item: 'fresh-veg-5' };
    state.board[3] = { uid: `g${state.nextId++}`, item: 'fresh-veg-3' };
    state = execute(state, { type: 'stageInput', from: 2, appliance: 'chopping-board' }, state.lastSeen).state;
    const before = cloneGameState(state);
    expect(getApplianceStatus(state, 'chopping-board')?.canStart).toBe(false);
    expect(dropKind(state, 3, 40)).toBe('stage');
    expect(boardTapAction(state, 40, 3)).toEqual({ kind: 'select', index: 40 });
    expect(state).toEqual(before);
  });

  it('preserves a full-board ready output and insufficient-energy resources on failed device taps', () => {
    const ready = kitchen('ready');
    for (let i = 0; i < 35; i++) ready.board[i] ??= { uid: `g${ready.nextId++}`, item: 'fresh-veg-1' };
    for (const i of [37, 38, 39]) ready.board[i] = { uid: `g${ready.nextId++}`, item: 'fresh-veg-1' };
    const collect = boardTapAction(ready, 40, 0);
    if (collect.kind !== 'command') throw new Error('Expected collection');
    const failed = execute(ready, collect.command, ready.lastSeen);
    expect(failed.ok).toBe(false);
    expect(failed.state).toBe(ready);
    expect(failed.state.appliances[0].outputSlot).not.toBeNull();

    const tired = kitchen(); tired.energy.value = 0;
    const generate = boardTapAction(tired, 35, 0);
    if (generate.kind !== 'command') throw new Error('Expected generation');
    const denied = execute(tired, generate.command, tired.lastSeen);
    expect(denied.ok).toBe(false);
    expect(denied.state).toBe(tired);
  });
});
