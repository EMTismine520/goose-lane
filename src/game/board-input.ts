import { getApplianceStatus, getBoardEntity, mergeTarget } from '../domain/engine';
import type { Command, GameState } from '../domain/types';

export const BOARD_COLUMNS = 7;
export const BOARD_ROWS = 9;
export const CELL_SIZE = 50;
export const BOARD_WIDTH = BOARD_COLUMNS * CELL_SIZE;
export const BOARD_HEIGHT = BOARD_ROWS * CELL_SIZE;
export const DRAG_THRESHOLD = 7;

export const cellCenter = (index: number) => ({
  x: (index % BOARD_COLUMNS) * CELL_SIZE + CELL_SIZE / 2,
  y: Math.floor(index / BOARD_COLUMNS) * CELL_SIZE + CELL_SIZE / 2,
});

/** Coordinates are in the fixed 350 × 450 design space, independent of CSS scale. */
export function cellAt(x: number, y: number): number | null {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return null;
  return Math.floor(y / CELL_SIZE) * BOARD_COLUMNS + Math.floor(x / CELL_SIZE);
}

export type DropKind = 'move' | 'merge' | 'swap' | 'stage' | 'blocked' | 'same';

/** This is a preview only; the authoritative reducer repeats every capability and UID check. */
export function dropKind(state: GameState, from: number, to: number): DropKind {
  if (from === to) return 'same';
  const source = getBoardEntity(state, from);
  const target = getBoardEntity(state, to);
  if (!source.canMove || !source.item) return 'blocked';
  if (target.kind === 'empty') return 'move';
  if (target.kind === 'appliance') {
    const status = getApplianceStatus(state, target.id);
    const canStage = target.canAccept && status?.recipes.some(recipe => recipe.inputs.some(need => need.item === source.item!.item && status.appliance.inputSlots.filter(input => input.item === need.item).length < need.count));
    return canStage ? 'stage' : 'blocked';
  }
  if (target.kind !== 'item' || !target.canMove || !target.item) return 'blocked';
  if (source.canMerge && target.canMerge && source.item.item === target.item.item && mergeTarget(source.item.item)) return 'merge';
  return 'swap';
}

/** Capture object identity at gesture start and target version at release. */
export function moveCommand(state: GameState, from: number, to: number, expectedUid: string): Command | null {
  const source = getBoardEntity(state, from);
  if (source.item?.uid !== expectedUid || !source.canMove || from === to) return null;
  const target = getBoardEntity(state, to);
  return { type: 'move', from, to, expectedUid, expectedTargetUid: target.item?.uid ?? null, expectedTargetVersion: target.version };
}

export interface DropSelection { index: number; sourceUid: string; mergedItem: string | null; priorTargetUid: string | null; }

export function selectionAfterDrop(state: GameState, from: number, to: number, sourceUid: string): DropSelection {
  const item = state.board[from];
  return { index: to, sourceUid, mergedItem: dropKind(state, from, to) === 'merge' && item ? mergeTarget(item.item) : null, priorTargetUid: state.board[to]?.uid ?? null };
}

/** A dispatch promise may resolve before React commits its snapshot. Never select an old occupant. */
export function isDropCommitted(state: GameState, selection: DropSelection): boolean {
  const target = getBoardEntity(state, selection.index);
  if (target.kind === 'appliance') return !!target.appliance?.inputSlots.some(input => input.uid === selection.sourceUid);
  if (target.item?.uid === selection.sourceUid) return true;
  return !!selection.mergedItem && target.item?.item === selection.mergedItem && target.item.uid !== selection.priorTargetUid;
}

export function nextKeyboardCell(index: number, key: string): number {
  const row = Math.floor(index / BOARD_COLUMNS);
  const column = index % BOARD_COLUMNS;
  if (key === 'ArrowLeft') return row * BOARD_COLUMNS + Math.max(0, column - 1);
  if (key === 'ArrowRight') return row * BOARD_COLUMNS + Math.min(BOARD_COLUMNS - 1, column + 1);
  if (key === 'ArrowUp') return Math.max(0, index - BOARD_COLUMNS);
  if (key === 'ArrowDown') return Math.min(BOARD_COLUMNS * BOARD_ROWS - 1, index + BOARD_COLUMNS);
  if (key === 'Home') return row * BOARD_COLUMNS;
  if (key === 'End') return row * BOARD_COLUMNS + BOARD_COLUMNS - 1;
  return index;
}
