import { availableOrders, createInitialState, execute, getApplianceStatus, getBoardEntity, getOrderReward, getRecipeDuration } from '../domain/engine';
import { FRESH_ORDERS } from '../content/catalog';
import { DEVICE_FAMILIES } from '../content/expansion';
import { resumeManualSlot, validateSave } from '../persistence/save';
import type { GameState } from '../domain/types';
import COOKING from './v3-cooking-sample.json';
import MILESTONES from './v3-milestones.json';
import COMPLETE from './v3-played-state.json';
import LEGACY from './ui-legacy-state.json';

export const UI_SCENARIOS = ['opening', 'orders', 'theme-unlock', 'prefix', 'loaded', 'cooking', 'ready', 'full', 'build', 'street', 'late', 'complete', 'legacy'] as const;
export type UiScenario = typeof UI_SCENARIOS[number];

/** Isolated visual fixtures. These are never loaded by the production game entry. */
export function createUiPreviewState(scenario: UiScenario, now = Date.now()): GameState {
  const captured = scenario === 'complete' ? COMPLETE : scenario === 'theme-unlock' ? MILESTONES['2'] : scenario === 'late' || scenario === 'street' ? MILESTONES['8'] : COOKING;
  let state = ['opening', 'orders', 'build'].includes(scenario) ? createInitialState(now)
    : scenario === 'legacy' ? resumeManualSlot({id:1,status:'ready',state:validateSave(LEGACY),capturedAt:LEGACY.lastSeen,savedAt:LEGACY.lastSeen},now)
    : resumeManualSlot({id:1,status:'ready',state:validateSave(captured),capturedAt:captured.lastSeen,savedAt:captured.lastSeen},now);
  state.settings.sound = false;
  state.settings.music = false;
  if (scenario !== 'opening') state.tutorialState.node = 'complete';
  if (scenario === 'theme-unlock') {
    // Rewind only the last delivery and its automatic gifts from the played milestone.
    // This is a visual fixture, not a claim that its restored serving was newly cooked.
    const order = FRESH_ORDERS.at(-1)!;
    const giftFamilies = new Set(DEVICE_FAMILIES.filter(family => family.stage === 2).map(family => family.id));
    const giftIds = new Set(state.devices.filter(device => giftFamilies.has(device.familyId)).map(device => device.id));
    state.completedOrders = state.completedOrders.filter(id => id !== order.id);
    const reward = getOrderReward(state, order);
    state.coins -= reward;
    state.reputation -= order.reputation;
    state.stats.earned -= reward;
    state.devices = state.devices.filter(device => !giftIds.has(device.id));
    state.appliances = state.appliances.filter(appliance => !giftIds.has(appliance.id));
    state.deviceGrants = state.deviceGrants.filter(family => !giftFamilies.has(family));
    state.deviceDiscovered = state.deviceDiscovered.filter(id => ![...giftFamilies].some(family => id.startsWith(family + '-l')));
    for (const need of order.needs) for (let count = 0; count < need.count; count++) {
      const index = state.board.findIndex((_, index) => getBoardEntity(state, index).kind === 'empty');
      if (index < 0) throw new Error('Theme unlock fixture needs room for its final serving');
      state.board[index] = { uid: `g${state.nextId++}`, item: need.item };
    }
    state.session = { page: 'merge', selectedUid: null, orderScroll: 0 };
  }
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
