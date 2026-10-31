import { availableOrders, createInitialState, execute, getApplianceStatus, getBoardEntity, getOrderReward, getRecipeDuration } from '../domain/engine';
import { FRESH_ORDERS } from '../content/catalog';
import { DEVICE_FAMILIES } from '../content/expansion';
import { resumeManualSlot, validateSave } from '../persistence/save';
import type { GameState } from '../domain/types';
import COOKING from './v3-cooking-sample.json';
import MILESTONES from './v3-milestones.json';
import COMPLETE from './v3-played-state.json';
import LEGACY from './ui-legacy-state.json';

export const UI_SCENARIOS = ['chapters-all', 'chapter-dessert', 'chapter-harbor', 'opening', 'orders', 'theme-unlock', 'prefix', 'one-input', 'natural-cap', 'large-resources', 'max-resources', 'two-ingredients', 'long-name', 'loaded', 'cooking', 'ready', 'full', 'build', 'street', 'late', 'complete', 'legacy'] as const;
export type UiScenario = typeof UI_SCENARIOS[number];

/** Isolated visual fixtures. These are never loaded by the production game entry. */
export function createUiPreviewState(scenario: UiScenario, now = Date.now()): GameState {
  const captured = scenario === 'complete' ? COMPLETE : scenario === 'theme-unlock' ? MILESTONES['2'] : scenario === 'late' || scenario === 'street' ? MILESTONES['8'] : COOKING;
  let state = ['opening', 'orders', 'build'].includes(scenario) ? createInitialState(now)
    : scenario === 'legacy' ? resumeManualSlot({id:1,status:'ready',state:validateSave(LEGACY),capturedAt:LEGACY.lastSeen,savedAt:LEGACY.lastSeen},now)
    : resumeManualSlot({id:1,status:'ready',state:validateSave(captured),capturedAt:captured.lastSeen,savedAt:captured.lastSeen},now);
  if(['chapters-all','chapter-dessert','chapter-harbor'].includes(scenario)){
    state=createInitialState(now);state.coins=10000;state.tutorialState.node='complete';
    for(const chapter of scenario==='chapters-all'?[6,2,8,4,7,3,5]:[scenario==='chapter-dessert'?7:6])state=execute(state,{type:'unlockAndEnterChapter',chapter},now).state;
  }
  state.settings.sound = false;
  state.settings.music = false;
  if (scenario !== 'opening') state.tutorialState.node = 'complete';
  if (scenario === 'theme-unlock') {state=createInitialState(now);state.coins=60;state.tutorialState.node='complete';}
  if (scenario === 'orders') {
    for (const need of availableOrders(state).slice(0,2).flatMap(order => order.needs)) {
      for (let count=0; count<need.count; count++) {
        const index = state.board.findIndex((_, index) => getBoardEntity(state,index).kind === 'empty');
        if (index >= 0) state.board[index] = {uid:`g${state.nextId++}`,item:need.item};
      }
    }
  }
  if (scenario === 'build') { state.coins=24; state.session.page='street'; }
  if (scenario === 'street') state.session.page='street';
  if (scenario === 'late') state.coins=9_999_999;
  if (scenario === 'prefix') {
    const appliance=state.appliances.find(value=>value.id==='home-cooking-pot')!;
    const input=appliance.inputSlots.find(value=>value.item==='fresh-veg-1');
    if (input) state=execute(state,{type:'withdrawInput',appliance:appliance.id,uid:input.uid},now).state;
  }
  if (['one-input', 'natural-cap', 'large-resources', 'max-resources', 'two-ingredients'].includes(scenario)) {
    const appliance = state.appliances.find(value => value.id === 'home-cooking-pot')!;
    for (const input of [...appliance.inputSlots]) {
      if (scenario !== 'two-ingredients' && input.item === 'fresh-poultry-1') continue;
      state = execute(state, { type: 'withdrawInput', appliance: appliance.id, uid: input.uid }, now).state;
    }
    if (scenario === 'two-ingredients') {
      const from = state.board.findIndex((_, index) => getBoardEntity(state, index).kind === 'empty');
      state.board[from] = { uid: `g${state.nextId++}`, item: 'fresh-veg-2' };
      state = execute(state, { type: 'stageInput', from, appliance: appliance.id }, now).state;
    }
  }
  if (scenario === 'large-resources') { state.energy.value = 11_111; state.coins = 9_999_999; }
  if (scenario === 'natural-cap') state.energy.value = 100;
  if (scenario === 'max-resources') { state.energy.value = 1_000_000_000_000; state.coins = 1_000_000_000_000; }
  if (scenario === 'long-name') {
    const from = state.board.findIndex((_, index) => getBoardEntity(state, index).kind === 'empty');
    state.board[from] = { uid: `g${state.nextId++}`, item: 'fresh-fruit-1' };
    state = execute(state, { type: 'stageInput', from, appliance: 'fruit-press' }, now).state;
    state.session.selectedUid = 'fruit-press';
  }
  if (['cooking','ready','full'].includes(scenario)) {
    const status=getApplianceStatus(state,'home-cooking-pot',now)!;
    if (!status.canStart || !status.recipe) throw new Error('Cooking visual fixture must have a complete recipe');
    state=execute(state,{type:'startCooking',appliance:status.appliance.id,recipe:status.recipe.id},now).state;
    if(scenario!=='cooking'){
      const job=state.appliances.find(value=>value.id===status.appliance.id)!.job!;
      const elapsed=getRecipeDuration(state,status.recipe,status.appliance.id)+1000;
      job.startedAt-=elapsed;job.endsAt-=elapsed;
      state=execute(state,{type:'recover'},now).state;
    }
  }
  if (scenario === 'full') state.board.forEach((_,index)=>{
    if(getBoardEntity(state,index).kind==='empty')state.board[index]={uid:`g${state.nextId++}`,item:'fresh-veg-1'};
  });
  state.lastSeen=now;
  return validateSave(state);
}
