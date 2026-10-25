import { describe, expect, it } from 'vitest';
import { createInitialState, execute, getApplianceStatus, stateInvariantErrors } from '../src/domain/engine';
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

describe('device taps after selecting an ingredient or another device', () => {
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

  it.each([
    [null, null], [0, 'g5'], [35, 'vegetable-cart'], [41, 'fruit-press'],
  ] as const)('collects a ready dish with selection %s without trying to load or move it', (selected, uid) => {
    const state = kitchen('ready');
    const selectedItem = state.board[0];
    const output = state.appliances[0].outputSlot;
    const action = boardTapAction(state, 40, selected, uid);
    expect(action.kind).toBe('command');
    if (action.kind !== 'command') throw new Error('Expected a collect command');
    expect(action.command).toEqual({ type: 'collectAppliance', appliance: 'chopping-board', expectedJobId: state.appliances[0].job!.id });
    const result = execute(state, action.command, state.lastSeen);
    expect(result.ok).toBe(true);
    expect(result.state.stats.cooked).toBe(1);
    expect(result.state.board[0]).toEqual(selectedItem);
    expect(result.state.board.filter(item => item?.uid === output!.uid)).toHaveLength(1);
    expect(result.state.appliances[0].job).toBeNull();
    expect(boardTapAction(result.state, 40, 40, 'chopping-board')).toEqual({ kind: 'select', index: 40 });
    expect(stateInvariantErrors(result.state)).toEqual([]);
  });

  it('produces from consecutive generators even when the preceding selection is movable', () => {
    let state = kitchen();
    for (const [index, selected, uid] of [[35, 0, 'g5'], [36, 35, 'vegetable-cart'], [35, 40, 'chopping-board']] as const) {
      const action = boardTapAction(state, index, selected, uid);
      expect(action.kind).toBe('command');
      if (action.kind !== 'command') throw new Error('Expected a generate command');
      expect(action.command.type).toBe('generate');
      const result = execute(state, action.command, state.lastSeen);
      expect(result.ok).toBe(true);
      state = result.state;
    }
    expect(state.stats.generated).toBe(3);
    expect(state.energy.value).toBe(57);
    expect(state.board[0]?.uid).toBe('g5');
    expect(state.devices.find(device => device.id === 'vegetable-cart')?.index).toBe(35);
    expect(stateInvariantErrors(state)).toEqual([]);
  });

  it('selects an ingredient after a generator tap instead of trying to move the generator onto it', () => {
    expect(boardTapAction(kitchen(), 0, 35, 'vegetable-cart')).toEqual({ kind: 'select', index: 0 });
  });

  it('starts a loaded appliance while preserving the selected ingredient', () => {
    const state = kitchen('loaded');
    const action = boardTapAction(state, 40, 0, 'g5');
    expect(action.kind).toBe('command');
    if (action.kind !== 'command') throw new Error('Expected a start command');
    expect(action.command).toEqual({ type: 'startCooking', appliance: 'chopping-board' });
    const result = execute(state, action.command, state.lastSeen);
    expect(result.ok).toBe(true);
    expect(result.state.appliances[0].job).not.toBeNull();
    expect(result.state.board[0]).toEqual(state.board[0]);
  });

  it('selects busy and incompatible appliances without submitting an invalid input', () => {
    expect(boardTapAction(kitchen('cooking'), 40, 0, 'g5')).toEqual({ kind: 'select', index: 40 });
    expect(boardTapAction(kitchen(), 41, 1, 'g6')).toEqual({ kind: 'select', index: 41 });
  });

  it('retains tap-to-load for a compatible idle appliance and the original ingredient UID', () => {
    const state = kitchen();
    const action = boardTapAction(state, 40, 1, 'g6');
    expect(action).toEqual({ kind: 'drop', from: 1, uid: 'g6' });
    if (action.kind !== 'drop') throw new Error('Expected an input drop');
    const result = execute(state, moveCommand(state, action.from, 40, action.uid)!, state.lastSeen);
    expect(result.ok).toBe(true);
    expect(result.state.board[1]).toBeNull();
    expect(result.state.appliances[0].inputSlots).toEqual([state.board[1]]);
  });

  it('retains item moves and merges, device moves to empty cells, and stale-selection protection', () => {
    const state = kitchen();
    state.board[2] = { uid: `g${state.nextId++}`, item: 'fresh-veg-3' };
    expect(boardTapAction(state, 2, 0, 'g5')).toEqual({ kind: 'drop', from: 0, uid: 'g5' });
    expect(boardTapAction(state, 3, 0, 'g5')).toEqual({ kind: 'drop', from: 0, uid: 'g5' });
    expect(boardTapAction(state, 3, 35, 'vegetable-cart')).toEqual({ kind: 'drop', from: 35, uid: 'vegetable-cart' });
    expect(boardTapAction(state, 3, 0, 'replaced-uid')).toEqual({ kind: 'select', index: null });
    expect(boardTapAction(state, 0, 0, 'g5')).toEqual({ kind: 'select', index: null });
  });
});
