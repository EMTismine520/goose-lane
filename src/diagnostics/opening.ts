import { FRESH_ORDERS, ITEMS, RECIPES } from '../content/catalog';
import { BUILD_NODES, BOARD_LAYOUT } from '../content/board-layouts';
import { availableOrders, canAffordRequirements, createInitialState, execute, getEnergyStatus, inventoryCount, stateInvariantErrors } from '../domain/engine';
import type { Command } from '../domain/types';

/** Every asset comes from a legal command. Simulation time is reported separately from human playtime. */
export function simulateOpening(seed = 0x6f657321) {
  let now = 1_000_000;
  let state = createInitialState(now);
  state.seed = seed;
  let actions = 0;
  let waitMs = 0;
  let peakOccupancy = state.board.filter(Boolean).length;
  let firstBuild: { actions: number; generated: number; energySpent: number; coinsEarned: number; coinsRemaining: number; peakOccupancy: number; waitMs: number; elapsedMs: number } | null = null;
  const act = (command: Command) => {
    now += 2500;
    const result = execute(state, { ...command, commandId: `simulation-${actions + 1}` }, now);
    if (!result.ok) throw new Error(`${JSON.stringify(command)}: ${result.events.map(event => event.message).join(' / ')}`);
    state = result.state; actions++;
    peakOccupancy = Math.max(peakOccupancy, state.board.filter(Boolean).length);
    const errors = stateInvariantErrors(state);
    if (errors.length) throw new Error(errors.join(', '));
    if (actions > 5000) throw new Error('Opening simulation did not converge');
  };
  const waitUntil = (time: number) => { const delay = Math.max(0, time - now); waitMs += delay; now += delay; };
  const ensure = (item: string, count: number): void => {
    while (inventoryCount(state, item) < count) {
      const definition = ITEMS[item];
      if (definition.kind === 'dish') {
        const recipe = RECIPES.find(value => value.output === item)!;
        for (const need of recipe.inputs) ensure(need.item, need.count);
        const appliance = BOARD_LAYOUT.entities.find(value => value.kind === 'appliance' && value.slot === recipe.appliance)!;
        for (const need of recipe.inputs) for (let i = 0; i < need.count; i++) {
          const from = state.board.findIndex(value => value?.item === need.item);
          act({ type: 'stageInput', appliance: appliance.id, from, expectedUid: state.board[from]!.uid });
        }
        act({ type: 'startCooking', appliance: appliance.id, recipe: recipe.id });
        // Use part of the wait to continue useful production, teaching that cooking never locks the board.
        if (state.tutorialState.node === 'wait') act({ type: 'generate', chain: 'fresh-veg' });
        waitUntil(state.appliances.find(value => value.id === appliance.id)!.job!.endsAt);
        act({ type: 'collectAppliance', appliance: appliance.id });
      } else if (definition.level === 1) {
        if (getEnergyStatus(state, now).value === 0) waitUntil(now + getEnergyStatus(state, now).nextRecoveryIn);
        act({ type: 'generate', chain: definition.chain });
      } else {
        const lower = `${definition.chain}-${definition.level - 1}`;
        ensure(lower, 2);
        const matches = state.board.flatMap((value, index) => value?.item === lower ? [index] : []);
        act({ type: 'move', from: matches[0], to: matches[1], expectedUid: state.board[matches[0]]!.uid, expectedTargetUid: state.board[matches[1]]!.uid });
      }
    }
  };
  act({ type: 'generate', chain: 'fresh-veg' });
  while (FRESH_ORDERS.some(order => !state.completedOrders.includes(order.id))) {
    const order = availableOrders(state)[0];
    for (const need of order.needs) ensure(need.item, need.count);
    if (!canAffordRequirements(state, order.needs)) throw new Error('Order requirements not met');
    act({ type: 'deliver', order: order.id });
    let next = BUILD_NODES[state.construction.completed.length];
    while (next && state.coins >= next.cost) {
      act({ type: 'session', session: { page: 'street' } });
      act({ type: 'build', node: next.id });
      if (!firstBuild) firstBuild = { actions, generated: state.stats.generated, energySpent: state.stats.generated, coinsEarned: state.stats.earned, coinsRemaining: state.coins, peakOccupancy, waitMs, elapsedMs: now - 1_000_000 };
      act({ type: 'session', session: { page: 'merge' } });
      next = BUILD_NODES[state.construction.completed.length];
    }
  }
  act({ type: 'claimConstructionReward' });
  return { state, report: { seed, orders: state.completedOrders.filter(id => FRESH_ORDERS.some(order => order.id === id)).length, actions, generated: state.stats.generated, merges: state.stats.merges, dishes: state.stats.cooked, firstBuild, peakOccupancy, waitMs, virtualElapsedMs: now - 1_000_000, assumedHumanActionMs: 8000, estimatedHumanElapsedMs: actions * 8000 + waitMs, humanTimingValidated: false, coins: state.coins, energy: state.energy.value, completedNodes: state.construction.completed.length, tutorialComplete: state.tutorialState.node === 'complete' } };
}
