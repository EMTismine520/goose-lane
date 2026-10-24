import { HOME_CHAINS, HOME_RECIPES } from '../content/catalog';
import { getBoardEntity } from '../domain/engine';
import { resumeManualSlot } from '../persistence/save';
import { simulateOpening } from './opening';
import { B_ART } from '../content/assets';

export const FOOD_STYLE_ITEMS = [...HOME_CHAINS.flatMap(chain => chain.items), ...HOME_RECIPES.map(recipe => recipe.output)].filter(id=>id in B_ART);

/** All 34 B foods, eight intact devices, old produce, and room for real play. */
export function createFoodStyleState(now = Date.now(), layout: 'showcase' | 'sausages' = 'showcase') {
  const played = simulateOpening().state;
  const state = resumeManualSlot({ id: 1, status: 'ready', state: played, capturedAt: played.lastSeen, savedAt: played.lastSeen }, now);
  state.board.fill(null);
  state.undo = null;
  state.settings.sound = false;
  state.settings.music = false;
  const showcase = [
    'fresh-beast-1', 'fresh-beast-1', 'fresh-beast-1',
    'fresh-veg-4', 'fresh-veg-3', 'fresh-veg-1', 'fresh-fruit-1',
    'fresh-veg-2', 'fresh-veg-5', 'fresh-fruit-2', 'fresh-fruit-3',
    ...FOOD_STYLE_ITEMS.filter(id => id !== 'fresh-beast-1'), 'fresh-poultry-1',
  ];
  const empty = state.board.flatMap((_, index) => getBoardEntity(state, index).kind === 'empty' ? [index] : []);
  const contents = layout === 'sausages' ? empty.map(() => 'fresh-beast-1') : showcase;
  if (contents.length > empty.length) throw new Error('B showcase exceeds board capacity');
  contents.forEach((item, position) => { state.board[empty[position]] = { uid: `g${state.nextId++}`, item }; });
  state.discovered = [...new Set([...state.discovered, ...contents])];
  state.session = { page: 'merge', selectedUid: state.board[0]!.uid, orderScroll: 0 };
  return state;
}
