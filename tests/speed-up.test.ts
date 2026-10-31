import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { LEGACY_RECIPES } from '../src/content/catalog';
import { SPEED_UP_CONFIG } from '../src/content/production';
import { createInitialState, execute, getApplianceStatus, getBoardEntity, stateInvariantErrors } from '../src/domain/engine';
import type { GameState, SpeedUpTarget } from '../src/domain/types';
import { cloneGameState } from '../src/domain/workspaces';
import { parseImportSave, parseSave, resumeManualSlot, SaveRepository, serializeSave, validateSave } from '../src/persistence/save';
import legacyFixture from './persistence-v1.fixture.json';
import v0Fixture from './persistence-v0.fixture.json';
import v2Fixture from './persistence-v2.fixture.json';
import { historicalState } from './chapter-fixtures';

const now = 1_792_713_600_000;
function cooking(state = createInitialState(now), offset = 0) {
  const appliance = state.appliances[offset];
  const recipe = getApplianceStatus(state, appliance.id, now)!.recipes[0];
  appliance.inputSlots = recipe.inputs.flatMap(need => Array.from({ length: need.count }, () => ({ uid: `g${state.nextId++}`, item: need.item })));
  const result = execute(state, { type: 'startCooking', appliance: appliance.id, recipe: recipe.id }, now);
  expect(result.ok).toBe(true);
  const target: SpeedUpTarget = { appliance: appliance.id, expectedJobId: result.state.appliances[offset].job!.id };
  return { state: result.state, target, applianceId: appliance.id, output: recipe.output };
}
const speedUp = (state: GameState, target: SpeedUpTarget, time = now) => execute(state, { type: 'speedUpCooking', ...target, expectedWorkspaceId: state.activeWorkspaceId }, time);

describe('targeted cooking speed-up', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8])('completes every cooking device in chapter %i with exactly one ticket per task', chapter => {
    let state = createInitialState(now); state.coins = 1000;
    state = execute(state, { type: 'unlockAndEnterChapter', chapter }, now).state;
    const count = state.appliances.length;
    for (let offset = 0; offset < count; offset++) {
      const task = cooking(state, offset), accelerated = speedUp(task.state, task.target);
      expect(accelerated.ok).toBe(true); state = parseSave(serializeSave(accelerated.state));
      expect(state.appliances[offset].outputSlot!.item).toBe(task.output);
    }
    expect(state.speedUpTickets).toBe(100 - count); expect(state.stats.cooked).toBe(0);
  });
  it('starts at 100 globally and completes only the chosen job; collecting counts once', () => {
    const first = cooking();
    const second = cooking(first.state, 1);
    const other = structuredClone(second.state.appliances[1].job);
    const before = cloneGameState(second.state);
    const result = speedUp(second.state, first.target);
    expect(result.ok).toBe(true); expect(result.state.speedUpTickets).toBe(99);
    const pot = result.state.appliances[0];
    expect(pot.job).toMatchObject({ id: first.target.expectedJobId, endsAt: now });
    expect(pot.outputSlot?.item).toBe(first.output);
    expect(result.state.appliances[1].job).toEqual(other); expect(result.state.stats.cooked).toBe(0);
    expect(second.state).toEqual(before); expect(stateInvariantErrors(result.state)).toEqual([]);
    const again = speedUp(result.state, first.target);
    expect(again.ok).toBe(true); expect(again.state.speedUpTickets).toBe(99); expect(again.state.appliances[0].outputSlot).toEqual(pot.outputSlot);
    const collected = execute(again.state, { type: 'collectAppliance', ...first.target }, now);
    expect(collected.ok).toBe(true); expect(collected.state.stats.cooked).toBe(1);
    expect(collected.state.board.filter(item => item?.uid === pot.outputSlot!.uid)).toHaveLength(1);
    expect(execute(collected.state, { type: 'collectAppliance', ...first.target }, now).ok).toBe(false);
    expect(speedUp(collected.state, second.target).state.speedUpTickets).toBe(98);
  });

  it('spends the last ticket, preserves zero across saves, and never refills', () => {
    const { state, target } = cooking(); state.speedUpTickets = 1;
    const result = speedUp(state, target);
    expect(result.state.speedUpTickets).toBe(0);
    const restored = parseSave(serializeSave(result.state));
    expect(restored.speedUpTickets).toBe(0);
    expect(execute(restored, { type: 'recover' }, now + 1000).state.speedUpTickets).toBe(0);
    const next = cooking(restored, 1);
    const rejected = speedUp(next.state, next.target);
    expect(rejected.ok).toBe(false); expect(rejected.state).toBe(next.state);
  });

  it.each([-1, 0, 1])('settles the same job at its deadline %+i ms without an extra debit', delta => {
    const { state, target } = cooking(); const end = state.appliances[0].job!.endsAt;
    state.speedUpTickets = delta < 0 ? 1 : 0;
    const result = speedUp(state, target, end + delta);
    expect(result.ok).toBe(true); expect(result.state.speedUpTickets).toBe(0);
    expect(result.events.find(event => event.type === 'speed-up')?.amount).toBe(delta < 0 ? 1 : 0);
    expect(result.state.appliances[0].outputSlot).not.toBeNull();
    expect(parseSave(serializeSave(result.state)).appliances[0]).toEqual(result.state.appliances[0]);
  });

  it('accepts a naturally completed same job even if its appliance version changed', () => {
    const { state, target } = cooking(); const version = state.appliances[0].version;
    const ready = execute(state, { type: 'recover' }, state.appliances[0].job!.endsAt).state;
    const result = execute(ready, { type: 'speedUpCooking', ...target, expectedVersion: version }, ready.lastSeen);
    expect(result.ok).toBe(true); expect(result.state.speedUpTickets).toBe(100);
    expect(result.state.appliances[0].outputSlot).toEqual(ready.appliances[0].outputSlot);
  });

  it('retains the finished output on a full board and collects its UID only once after space is freed', () => {
    const { state, target, output } = cooking();
    for (let i = 0; i < state.board.length; i++) if (getBoardEntity(state, i).kind === 'empty') state.board[i] = { uid: `g${state.nextId++}`, item: 'fresh-veg-1' };
    const result = speedUp(state, target); expect(result.ok).toBe(true);
    const uid = result.state.appliances[0].outputSlot!.uid;
    expect(execute(result.state, { type: 'collectAppliance', ...target }, now).ok).toBe(false);
    const index = result.state.board.findIndex(Boolean);
    const space = execute(result.state, { type: 'store', index }, now).state;
    const collected = execute(space, { type: 'collectAppliance', ...target }, now).state;
    expect(collected.board).toContainEqual({ uid, item: output }); expect(collected.speedUpTickets).toBe(99);
    expect(stateInvariantErrors(collected)).toEqual([]);
  });

  it('rejects duplicate command IDs, replaced jobs and switched workspaces', () => {
    const { state, target } = cooking();
    const first = execute(state, { type: 'speedUpCooking', ...target, commandId: 'speed-1' }, now);
    expect(execute(first.state, { type: 'speedUpCooking', ...target, commandId: 'speed-1' }, now).state).toBe(first.state);
    const replacement = cloneGameState(state); replacement.appliances[0].job!.id = `g${replacement.nextId++}`;
    expect(speedUp(replacement, target).ok).toBe(false); expect(replacement.speedUpTickets).toBe(100);
    state.coins = 1000;
    const switched = execute(state, { type: 'unlockAndEnterChapter', chapter: 2 }, now).state;
    expect(switched.speedUpTickets).toBe(100);
    expect(execute(switched, { type: 'speedUpCooking', ...target, expectedWorkspaceId: 'chapter-1' }, now).ok).toBe(false);
    switched.speedUpTickets = 17;
    const returned = execute(switched, { type: 'enterChapter', chapter: 1 }, now).state;
    expect(speedUp(returned, target).state.speedUpTickets).toBe(16);
  });

  it('uses the same debit rule for historical cooking slots and protects collection from a stale job', () => {
    const state = parseSave(JSON.stringify(legacyFixture));
    const recipe = LEGACY_RECIPES.find(recipe => recipe.appliance === 0)!;
    state.jobs[0] = { id: `g${state.nextId++}`, recipe: recipe.id, startedAt: state.lastSeen, endsAt: state.lastSeen + recipe.duration, output: recipe.output };
    const target: SpeedUpTarget = { slot: 0, expectedJobId: state.jobs[0].id };
    const result = speedUp(state, target, state.lastSeen);
    expect(result.ok).toBe(true); expect(result.state.speedUpTickets).toBe(99);
    expect(result.state.jobs[0]!.endsAt).toBe(result.state.lastSeen);
    expect(parseSave(serializeSave(result.state)).jobs[0]).toEqual(result.state.jobs[0]);
    expect(execute(result.state, { type: 'collect', slot: 0, expectedJobId: 'stale' }, result.state.lastSeen).ok).toBe(false);
    expect(execute(result.state, { type: 'collect', ...target }, result.state.lastSeen).state.stats.cooked).toBe(state.stats.cooked + 1);
  });
});

function schemaFour(state: GameState) {
  const raw = JSON.parse(JSON.stringify(state));
  delete raw.speedUpTickets; raw.schemaVersion = 4; raw.contentVersion = '5.0.0'; return raw;
}

describe('global ticket wallet migration and persistence', () => {
  it.each([v0Fixture, legacyFixture, v2Fixture, historicalState(now)])('grants the initial global wallet to schema $schemaVersion only during migration', raw => {
    const before = JSON.stringify(raw), state = validateSave(raw);
    expect(state.speedUpTickets).toBe(100); expect(JSON.stringify(raw)).toBe(before);
    state.speedUpTickets = 27;
    expect(parseSave(serializeSave(state)).speedUpTickets).toBe(27);
  });
  it('migrates a complete v4 multi-kitchen snapshot once without changing any progress', () => {
    let state = cooking().state; state.coins = 1000;
    state = execute(state, { type: 'unlockAndEnterChapter', chapter: 6 }, now).state;
    const source = schemaFour(state), before = JSON.stringify(source);
    const migrated = validateSave(source);
    expect(migrated.speedUpTickets).toBe(100); expect(migrated.schemaVersion).toBe(5); expect(migrated.contentVersion).toBe('5.1.0');
    expect(schemaFour(migrated)).toEqual(source); expect(JSON.stringify(source)).toBe(before);
    expect(Object.values(migrated.workspaces!).every(w => !('speedUpTickets' in w))).toBe(true);
    migrated.speedUpTickets = 0;
    expect(parseImportSave(serializeSave(migrated)).speedUpTickets).toBe(0);
  });

  it.each([undefined, null, -1, 0.5, Infinity, NaN, SPEED_UP_CONFIG.maxValue + 1, '100'])('rejects damaged v5 balance %j instead of granting fresh tickets', value => {
    const raw = JSON.parse(serializeSave(createInitialState(now))); raw.speedUpTickets = value;
    expect(() => validateSave(raw)).toThrow('加速券');
  });

  it('validates old progress and whitelists before granting tickets', () => {
    const raw = schemaFour(createInitialState(now)); raw.speedUpTickets = 100;
    expect(() => validateSave(raw)).toThrow(); delete raw.speedUpTickets;
    raw.workspaces['chapter-1'].board[0] = { uid: 'g999999', item: 'missing' };
    expect(() => validateSave(raw)).toThrow();
  });

  it('restores the wallet and cooking together from a frozen manual checkpoint', () => {
    const { state, target } = cooking(); state.speedUpTickets = 1;
    const current = speedUp(state, target).state;
    const restored = resumeManualSlot({ id: 1, status: 'ready', state, capturedAt: now, savedAt: now }, now + 86_400_000, current);
    expect(restored.speedUpTickets).toBe(1); expect(restored.appliances[0].outputSlot).toBeNull();
    expect(restored.appliances[0].job!.endsAt - restored.lastSeen).toBe(state.appliances[0].job!.endsAt - now);
    expect(parseSave(serializeSave(current)).speedUpTickets).toBe(0);
    expect(createInitialState(now).speedUpTickets).toBe(100);
  });

  it('keeps the original v4 bytes, zero balance, previous snapshot and manual slots through repository writes', async () => {
    const name = `speed-up-${crypto.randomUUID()}`, repo = new SaveRepository(name);
    const source = JSON.stringify(schemaFour(cooking().state));
    try {
      await repo.open(); repo.close();
      const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open(name, 1); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
      await new Promise<void>((resolve, reject) => { const tx = db.transaction('snapshots', 'readwrite'); tx.objectStore('snapshots').put({ format: 1, token: 'schema-four', data: source, savedAt: now }, 'current'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close();
      let state = (await repo.open()).state!; expect(state.speedUpTickets).toBe(100);
      state.speedUpTickets = 1; const target = { appliance: state.appliances[0].id, expectedJobId: state.appliances[0].job!.id };
      state = speedUp(state, target).state; await repo.save(state); await repo.saveManualSlot(1, state, now);
      state = execute(state, { type: 'recover' }, now + 1).state; await repo.save(state);
      const raw = JSON.parse(await repo.exportRaw()); expect(raw.migrationV4.data).toBe(source);
      expect(JSON.parse(raw.current.data).speedUpTickets).toBe(0); expect(JSON.parse(raw.previous.data).speedUpTickets).toBe(0);
      expect((await repo.readManualSlot(1)).status).toBe('ready');
      repo.close(); expect((await repo.open()).state!.speedUpTickets).toBe(0);
    } finally { repo.close(); }
  });
});
