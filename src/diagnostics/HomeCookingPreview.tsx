/** Dev-only QA entry. Actual App, isolated saves; never bundled into the published build. */
import { createRoot } from 'react-dom/client';
import { HOME_CHAINS, HOME_RECIPES } from '../content/catalog';
import { execute, getBoardEntity } from '../domain/engine';
import { SaveRepository, resumeManualSlot } from '../persistence/save';
import App from '../ui/App';
import { simulateOpening } from './opening';
import '../ui/game.css';

const scene = new URLSearchParams(location.search).get('scene') ?? 'play';
if (scene === 'styles') {
  const { renderFoodStylePreview } = await import('./FoodStylePreview');
  await renderFoodStylePreview();
} else {
const played = simulateOpening().state;
const state = resumeManualSlot({ id: 1, status: 'ready', state: played, capturedAt: played.lastSeen, savedAt: played.lastSeen }, Date.now());
const ids = [...HOME_CHAINS.flatMap(chain => chain.items), ...HOME_RECIPES.map(recipe => recipe.output)];
if (scene === 'showcase') {
  for (const item of ids) {
    const index = state.board.findIndex((value, i) => !value && getBoardEntity(state, i).kind === 'empty');
    state.board[index] = { uid: `g${state.nextId++}`, item };
  }
  state.discovered = [...new Set([...state.discovered, ...ids])];
}
let initial = state;
if (scene === 'three') {
  for (const item of ['fresh-poultry-1', 'fresh-spice-2', 'fresh-veg-1']) {
    const from = initial.board.findIndex((value, i) => !value && getBoardEntity(initial, i).kind === 'empty');
    initial.board[from] = { uid: `g${initial.nextId++}`, item };
    initial = execute(initial, { type: 'stageInput', from, appliance: 'home-cooking-pot' }, initial.lastSeen).state;
  }
}
const repository = new SaveRepository('goose-lane-v4-home-qa-' + scene);
if (scene === 'three') initial.session.selectedUid = 'home-cooking-pot';
const previous = await repository.open();
initial.revision = Math.max(initial.revision, previous.state?.revision ?? -1) + 1;
await repository.save(initial);
createRoot(document.getElementById('root')!).render(<App repository={repository} sessionScope={'v4-home-qa-' + scene}/>);
}
