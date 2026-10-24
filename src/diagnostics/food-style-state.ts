import { getBoardEntity } from '../domain/engine';
import { resumeManualSlot } from '../persistence/save';
import { simulateOpening } from './opening';

export const FOOD_STYLE_ITEMS = ['fresh-beast-1', 'fresh-beast-2', 'fresh-beast-3', 'fresh-poultry-1', 'fresh-spice-1'] as const;

/** A visual fixture after the real opening simulation, isolated from the player's saves. */
export function createFoodStyleState(now = Date.now()) {
  const played = simulateOpening().state;
  const state = resumeManualSlot({ id: 1, status: 'ready', state: played, capturedAt: played.lastSeen, savedAt: played.lastSeen }, now);
  state.board.fill(null);
  state.undo = null;
  state.settings.sound = false;
  state.settings.music = false;
  const s = 'fresh-beast-1', b = 'fresh-beast-2', m = 'fresh-beast-3', e = 'fresh-poultry-1', p = 'fresh-spice-1';
  const rows: (string | null)[][] = [
    ['fresh-veg-4', 'fresh-veg-3', s, b, m, e, p],
    [s, b, s, e, p, null, null],
    [s, s, 'fresh-fruit-3', e, p, null, null],
    ['fresh-veg-1', 'fresh-fruit-1', s, b, p, null, null],
    [m, e, 'fresh-veg-1', p, s, null, null],
    [null, null, null, null, null, null, null],
    [s, b, m, e, p, null, null],
    [s, s, m, s, 'fresh-fruit-1', null, null],
    [null, b, m, s, null, null, null],
  ];
  rows.flat().forEach((item, index) => {
    if (item && getBoardEntity(state, index).kind === 'empty') {
      state.board[index] = { uid: `g${state.nextId++}`, item };
    }
  });
  state.discovered = [...new Set([...state.discovered, ...rows.flat().filter((id): id is string => !!id)])];
  state.session = { page: 'merge', selectedUid: state.board[2]!.uid, orderScroll: 0 };
  return state;
}
