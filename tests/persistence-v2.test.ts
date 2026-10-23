import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState, execute, inventoryCount } from '../src/domain/engine';
import { BOARD_LAYOUT, BUILD_NODES } from '../src/content/board-layouts';
import { parseSave, SaveRepository, serializeSave, validateSave } from '../src/persistence/save';
import type { GameState, ItemInstance } from '../src/domain/types';
import prototypeSave from './persistence-v0.fixture.json';
import schemaOneSave from './persistence-v1.fixture.json';
import schemaTwoSave from './persistence-v2.fixture.json';

const now = 1792713600000;
const repositories: SaveRepository[] = [];
afterEach(() => repositories.splice(0).forEach((repository) => repository.close()));
const inventory = (state: GameState) => [...state.board.filter((item): item is ItemInstance => item !== null), ...state.storage, ...state.migrationInbox, ...state.appliances.flatMap((appliance) => [...appliance.inputSlots, ...(appliance.outputSlot ? [appliance.outputSlot] : [])])].sort((a, b) => a.uid.localeCompare(b.uid));
function legacy(day: number, occupied: number) {
  const source = structuredClone(prototypeSave);
  const board = Array.from({ length: 56 }, (_, index) => index < occupied ? { uid: `g${index + 1}`, item: 'grain-1' } : null);
  return { ...source, schemaVersion: 1, contentVersion: '1.0.0', day, board,
    completedOrders: [] as string[],
    storage: Array.from({ length: 8 }, (_, index) => ({ uid: `g${occupied + index + 1}`, item: 'coffee-1' })),
    nextId: occupied + 10, storageCapacity: 8, undo: null,
    settings: { music: false, sound: true, volume: 0.4, reducedMotion: true },
    jobs: [{ id: `g${occupied + 9}`, recipe: 'toast', startedAt: now - 1000, endsAt: now + 9876 }, null, null, null],
  };
}

describe('schema two ownership and migration', () => {
  it('round-trips new cells unlocked by construction without advancing the day', () => {
    let state = createInitialState(now); state.coins = 1000;
    for (const [index, node] of BUILD_NODES.entries()) {
      state = execute(state, { type: 'build', node: node.id }, now).state;
      state = execute(state, { type: 'move', from: index === 0 ? 16 : 42 + (index - 1) * 7, to: 42 + index * 7 }, now).state;
      state = parseSave(serializeSave(state));
      expect(state.day).toBe(1);
      expect(state.board[42 + index * 7]?.uid).toBe('g1');
    }
  });
  it('keeps explicit old and new portable fixtures and maps numeric tutorial nodes', () => {
    expect(validateSave(schemaOneSave).tutorialState.node).toBe('first-order');
    expect(validateSave(schemaOneSave).tutorialState.completed).toEqual(['produce', 'merge']);
    expect(validateSave(schemaTwoSave)).toEqual(createInitialState(now));
    expect(parseSave(serializeSave(validateSave(schemaTwoSave)))).toEqual(schemaTwoSave);
  });
  it('preserves all 56 legacy cells, full storage, cooking identity, reward history and shop progress', () => {
    const source = legacy(6, 56);
    source.completedOrders = ['day-1-order-1'];
    source.shops.breakfast = 3;
    source.coins = 987654; source.reputation = 321;
    const migrated = validateSave(source);
    const before = [...source.board.filter((item): item is ItemInstance => item !== null), ...source.storage].sort((a, b) => a.uid.localeCompare(b.uid));
    expect(inventory(migrated)).toEqual(before);
    expect(migrated.board).toHaveLength(63);
    expect(migrated.jobs[0]).toEqual({ ...source.jobs[0], output: 'dish-toast' });
    expect(migrated.completedOrders).toEqual(source.completedOrders);
    expect(migrated.shops).toEqual(source.shops);
    expect(migrated.coins).toBe(987654); expect(migrated.reputation).toBe(321);
    expect(migrated.tutorialState.node).toBe('complete');
    expect(migrated.campaign).toBe('legacy');
    expect(parseSave(serializeSave(migrated))).toEqual(migrated);
  });
  it('retains every overflow UID in the migration inbox when day one and storage are full', () => {
    const source = legacy(1, 42);
    const migrated = validateSave(source);
    expect(migrated.migrationInbox).toHaveLength(4);
    expect(migrated.storage).toEqual(source.storage);
    expect(inventory(migrated)).toHaveLength(50);
    expect(new Set(inventory(migrated).map((item) => item.uid)).size).toBe(50);
    BOARD_LAYOUT.entities.forEach((entity) => expect(migrated.board[entity.index]).toBeNull());
    expect(execute(migrated, { type: 'claimMigration', uid: migrated.migrationInbox[0].uid }, now).ok).toBe(false);
  });
  it('preserves an undo asset and relocates its empty destination if a device now occupies it', () => {
    const source = legacy(1, 42);
    const sold = source.board[35]!; source.board[35] = null;
    source.undo = { item: sold, index: 35, coins: 1, revision: source.revision } as never;
    const migrated = validateSave(source);
    expect(migrated.undo?.item).toEqual(sold);
    expect(migrated.board[migrated.undo!.index]).toBeNull();
    expect(BOARD_LAYOUT.entities.some((entity) => entity.index === migrated.undo!.index)).toBe(false);
    const restored = execute(migrated, { type: 'undo' }, now);
    expect(restored.ok).toBe(true); expect(inventory(restored.state)).toHaveLength(50);
  });
  it('rejects duplicate ownership across board, loaded inputs, outputs and migration inbox', () => {
    const initial = createInitialState(now);
    initial.appliances[0].inputSlots = [initial.board[16]!];
    expect(() => validateSave(initial)).toThrow(/编号/);
    initial.appliances[0].inputSlots = [];
    initial.migrationInbox = [initial.board[16]!];
    expect(() => validateSave(initial)).toThrow(/编号/);
  });
  it('round-trips loaded, cooking and completed states with exactly one collectible output', () => {
    let state = createInitialState(now);
    state = execute(state, { type: 'stageInput', from: 16, appliance: 'chopping-board' }, now).state;
    state = parseSave(serializeSave(state));
    expect(state.appliances[0].inputSlots[0].uid).toBe('g1');
    expect(inventoryCount(state, 'fresh-veg-1')).toBe(1);
    state = execute(state, { type: 'startCooking', appliance: 'chopping-board' }, now).state;
    state = parseSave(serializeSave(state));
    const job = state.appliances[0].job!;
    expect(job.output).toBe('dish-fresh-tomato-salad');
    state = execute(state, { type: 'recover' }, job.endsAt).state;
    state = parseSave(serializeSave(state));
    const uid = state.appliances[0].outputSlot!.uid;
    const collected = execute(state, { type: 'collectAppliance', appliance: 'chopping-board', expectedJobId: job.id }, job.endsAt);
    expect(collected.ok).toBe(true);
    expect(inventory(collected.state).filter((item) => item.uid === uid)).toHaveLength(1);
    expect(execute(collected.state, { type: 'collectAppliance', appliance: 'chopping-board', expectedJobId: job.id }, job.endsAt).ok).toBe(false);
  });
  it('keeps the untouched migration snapshot after later saves rotate both ordinary snapshots', async () => {
    const name = `migration-durable-${Date.now()}`;
    const repository = new SaveRepository(name); repositories.push(repository); await repository.open(); repository.close();
    const source = JSON.stringify(legacy(1, 42));
    const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(name, 1); request.onsuccess = () => resolve(request.result); });
    await new Promise<void>((resolve) => {
      const transaction = database.transaction('snapshots', 'readwrite');
      transaction.objectStore('snapshots').put({ format: 1, token: 'original-v1', savedAt: 1, data: source }, 'current');
      transaction.oncomplete = () => resolve();
    }); database.close();
    const opened = (await repository.open()).state!;
    await repository.save(opened);
    await repository.save({ ...opened, revision: opened.revision + 1 });
    await repository.save({ ...opened, revision: opened.revision + 2 });
    const raw = JSON.parse(await repository.exportRaw());
    expect(raw.migrationV1.data).toBe(source);
    expect(JSON.parse(raw.previous.data).schemaVersion).toBe(2);
  });
});
