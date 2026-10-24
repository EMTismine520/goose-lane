import { HOME_ORDERS, ITEMS, RECIPES } from '../content/catalog';
import { activeDevices } from '../content/board-layouts';
import { availableOrders, execute, getEnergyStatus, inventoryCount, stateInvariantErrors } from '../domain/engine';
import type { Command } from '../domain/types';
import { simulateOpening } from './opening';

/** Legal production/merge/stage/cook/deliver commands, starting from the played opening. */
export function simulateHomeCooking(seed = 0x6f657321) {
  const opening = simulateOpening(seed);
  let state = opening.state, now = state.lastSeen;
  const startedAt = now;
  let actions = 0, waitMs = 0, cookingWaitMs = 0, recoveryWaitMs = 0;
  let peakOccupancy = state.board.filter(Boolean).length;
  const orders: { id: string; dish: string; generated: number; actions: number; peakOccupancy: number; cookingWaitMs: number; recoveryWaitMs: number; virtualElapsedMs: number }[] = [];
  const act = (command: Command) => {
    now += 2500;
    const result = execute(state, { ...command, commandId: `home-sim-${actions + 1}` }, now);
    if (!result.ok) throw new Error(`${JSON.stringify(command)}: ${result.events.map(event => event.message).join('/')}`);
    state = result.state; actions++;
    peakOccupancy = Math.max(peakOccupancy, state.board.filter(Boolean).length);
    const errors = stateInvariantErrors(state);
    if (errors.length) throw new Error(errors.join('/'));
    if (actions > 5000) throw new Error('Home simulation did not converge');
  };
  const wait = (until: number, cooking: boolean) => {
    const elapsed = Math.max(0, until - now); now += elapsed; waitMs += elapsed;
    if (cooking) cookingWaitMs += elapsed; else recoveryWaitMs += elapsed;
  };
  const ensure = (item: string, count: number): void => {
    while (inventoryCount(state, item) < count) {
      const definition = ITEMS[item];
      if (definition.level === 1) {
        if (getEnergyStatus(state, now).value === 0) wait(now + getEnergyStatus(state, now).nextRecoveryIn, false);
        act({ type: 'generate', chain: definition.chain });
      } else {
        const lower = `${definition.chain}-${definition.level - 1}`;
        ensure(lower, 2);
        const matches = state.board.flatMap((value, index) => value?.item === lower ? [index] : []);
        act({ type: 'move', from: matches[0], to: matches[1], expectedUid: state.board[matches[0]]!.uid, expectedTargetUid: state.board[matches[1]]!.uid });
      }
    }
  };
  for (const order of HOME_ORDERS) {
    if (!availableOrders(state).some(value => value.id === order.id)) throw new Error('Home order is not available');
    const recipe = RECIPES.find(value => value.output === order.needs[0].item)!;
    const appliance = activeDevices(state).find(device => device.slot === recipe.appliance)!;
    const before = { generated: state.stats.generated, actions, cookingWaitMs, recoveryWaitMs };
    for (const need of recipe.inputs) {
      ensure(need.item, need.count);
      for (let i = 0; i < need.count; i++) {
        const from = state.board.findIndex(item => item?.item === need.item);
        act({ type: 'stageInput', from, appliance: appliance.id, expectedUid: state.board[from]!.uid });
      }
    }
    act({ type: 'startCooking', appliance: appliance.id, recipe: recipe.id });
    wait(state.appliances.find(value => value.id === appliance.id)!.job!.endsAt, true);
    act({ type: 'collectAppliance', appliance: appliance.id });
    act({ type: 'deliver', order: order.id });
    orders.push({ id: order.id, dish: recipe.name, generated: state.stats.generated - before.generated, actions: actions - before.actions, peakOccupancy, cookingWaitMs: cookingWaitMs - before.cookingWaitMs, recoveryWaitMs: recoveryWaitMs - before.recoveryWaitMs, virtualElapsedMs: now - startedAt });
  }
  return { state, report: { seed, opening: opening.report, home: { orders, actions, generated: orders.reduce((sum, order) => sum + order.generated, 0), peakOccupancy, waitMs, cookingWaitMs, recoveryWaitMs, virtualElapsedMs: now - startedAt, firstDishVirtualMs: orders[0].virtualElapsedMs, assumedHumanActionMs: 8000, estimatedActiveMs: actions * 8000, estimatedHumanElapsedMs: actions * 8000 + waitMs, humanTimingValidated: false, coins: state.coins, energy: state.energy.value, completedOrders: 10 } } };
}
