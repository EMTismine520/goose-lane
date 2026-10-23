import { baseUnits, CHAINS, DECORATIONS, ITEMS, ORDERS, RECIPES, SHOPS } from '../content/catalog';
import { availableOrders, canAffordRequirements, createInitialState, execute, getGeneratorStatus, inventoryCount, stateInvariantErrors, unlockedCells } from '../domain/engine';
import type { Command, GameState, Requirement } from '../domain/types';

export type SimulationStrategy = 'simple-first' | 'reward-first' | 'stockpile' | 'storage-heavy';
export interface ChapterResult { day: number; orders: number; income: number; necessaryCost: number; allStagesCost: number; balance: number; actions: number; generated: number; waitMs: number; }
export interface SimulationReport { strategy: SimulationStrategy; completedOrders: number; chapters: ChapterResult[]; actions: number; generated: number; merges: number; cooked: number; peakBoardOccupancy: number; fullBoardRate: number; waitingMs: number; virtualElapsedMs: number; finalCoins: number; decorations: number; discovered: number; invariantChecks: number; allContentReachable: boolean; }

/** Deterministic legal-command agent. No inventory, money or chapter state is injected. */
export function simulateCampaign(strategy: SimulationStrategy = 'simple-first', completionist = true): { report: SimulationReport; state: GameState } {
  const startedAt = 1_000_000;
  let state = createInitialState(startedAt);
  let now = startedAt;
  let actions = 0;
  let waitingMs = 0;
  let peak = 0;
  let fullBoard = 0;
  let invariantChecks = 0;
  const chapters: ChapterResult[] = [];

  const dispatch = (command: Command) => {
    now += 400;
    const result = execute(state, command, now);
    if (!result.ok) throw new Error(`Simulation ${strategy} day ${state.day}: ${JSON.stringify(command)}: ${result.events[0].message}`);
    state = result.state;
    actions++;
    invariantChecks++;
    const errors = stateInvariantErrors(state);
    if (errors.length) throw new Error(errors.join(', '));
    const occupied = state.board.filter(Boolean).length;
    peak = Math.max(peak, occupied);
    if (occupied === unlockedCells(state)) fullBoard++;
    if (actions > 50_000) throw new Error('Simulation did not converge');
  };
  const waitUntil = (timestamp: number) => {
    const delay = Math.max(0, timestamp - now);
    now += delay;
    waitingMs += delay;
  };
  const maybeStore = (item: string) => {
    if (strategy !== 'storage-heavy' || state.storage.length >= state.storageCapacity || actions % 3 !== 0) return;
    const index = state.board.findIndex(instance => instance?.item === item);
    if (index >= 0) dispatch({ type: 'store', index });
  };
  const ensure = (item: string, count: number): void => {
    while (inventoryCount(state, item) < count) {
      const definition = ITEMS[item];
      if (!definition) throw new Error(`Unknown requested item: ${item}`);
      if (definition.kind === 'dish') {
        const recipe = RECIPES.find(recipe => recipe.output === item)!;
        for (const need of recipe.inputs) ensure(need.item, need.count);
        dispatch({ type: 'cook', recipe: recipe.id, slot: recipe.appliance });
        waitUntil(state.jobs[recipe.appliance]!.endsAt);
        dispatch({ type: 'collect', slot: recipe.appliance });
      } else if (definition.level === 1) {
        const status = getGeneratorStatus(state, definition.chain, now);
        waitUntil(now + status.waiting);
        dispatch({ type: 'generate', chain: definition.chain });
      } else {
        const lower = `${definition.chain}-${definition.level - 1}`;
        ensure(lower, 2);
        while (state.board.filter(instance => instance?.item === lower).length < 2) {
          const stored = state.storage.find(instance => instance.item === lower);
          if (!stored) throw new Error(`Missing merge input ${lower}`);
          dispatch({ type: 'retrieve', uid: stored.uid });
        }
        const indices = state.board.flatMap((instance, index) => instance?.item === lower ? [index] : []);
        dispatch({ type: 'move', from: indices[0], to: indices[1] });
      }
      maybeStore(item);
    }
  };
  const ensureNeeds = (needs: Requirement[]) => { for (const need of needs) ensure(need.item, need.count); };

  for (let day = 1; day <= 6; day++) {
    const startActions = actions;
    const startGenerated = state.stats.generated;
    const startEarned = state.stats.earned;
    const startWaiting = waitingMs;
    const shop = SHOPS.find(shop => shop.day === day)!;
    if (strategy === 'stockpile') ensure(`${CHAINS.find(chain => chain.unlockDay === day)!.id}-${Math.min(6, day + 2)}`, 1);
    while (availableOrders(state).length) {
      const orders = availableOrders(state);
      orders.sort((a, b) => strategy === 'reward-first' ? b.coins - a.coins : a.needs.reduce((n, need) => n + baseUnits(need.item) * need.count, 0) - b.needs.reduce((n, need) => n + baseUnits(need.item) * need.count, 0));
      const order = orders[0];
      ensureNeeds(order.needs);
      if (!canAffordRequirements(state, order.needs)) throw new Error('Requirements unresolved');
      dispatch({ type: 'deliver', order: order.id });
      while (state.shops[shop.id] < 3 && state.coins >= shop.costs[state.shops[shop.id]]) dispatch({ type: 'upgrade', shop: shop.id });
    }
    if (state.shops[shop.id] !== 3) throw new Error(`Chapter ${day} cannot afford full renovation`);
    const income = state.stats.earned - startEarned;
    const allStagesCost = shop.costs.reduce((a, b) => a + b, 0);
    if (income < allStagesCost) throw new Error(`Chapter ${day} income ${income} below full renovation ${allStagesCost}`);
    chapters.push({ day, orders: ORDERS.filter(order => order.day === day).length, income, necessaryCost: shop.costs[0] + shop.costs[1], allStagesCost, balance: state.coins, actions: actions - startActions, generated: state.stats.generated - startGenerated, waitMs: waitingMs - startWaiting });
    if (day < 6) dispatch({ type: 'nextDay' });
  }
  if (completionist) {
    for (const chain of CHAINS) ensure(chain.items[6], 1);
    for (const decoration of DECORATIONS) dispatch({ type: 'decorate', decoration: decoration.id });
  }
  const allContentReachable = state.completedOrders.length === 84 && state.discovered.length === Object.keys(ITEMS).length && state.decorations.length === 24 && Object.values(state.shops).every(stage => stage === 3);
  return { state, report: { strategy, completedOrders: state.completedOrders.length, chapters, actions, generated: state.stats.generated, merges: state.stats.merges, cooked: state.stats.cooked, peakBoardOccupancy: peak, fullBoardRate: fullBoard / actions, waitingMs, virtualElapsedMs: now - startedAt, finalCoins: state.coins, decorations: state.decorations.length, discovered: state.discovered.length, invariantChecks, allContentReachable } };
}
