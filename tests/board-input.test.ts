import { describe, expect, it } from 'vitest';
import { createInitialState, execute, stateInvariantErrors } from '../src/domain/engine';
import { BOARD_HEIGHT, BOARD_WIDTH, cellAt, cellCenter, dropKind, isDropCommitted, moveCommand, nextKeyboardCell, selectionAfterDrop } from '../src/game/board-input';

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
