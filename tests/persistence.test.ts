import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IDBObjectStore } from 'fake-indexeddb';
import { CONTENT_VERSION, RECIPES } from '../src/content/catalog';
import type { GameState } from '../src/domain/types';
import { createInitialState, execute, inventoryCount } from '../src/domain/engine';
import { parseSave, SaveRepository, serializeSave, validateSave } from '../src/persistence/save';
import prototypeSave from './persistence-v0.fixture.json';

const handles: SaveRepository[] = [];
let counter = 0;
function repository(name = `persistence-test-${++counter}`): SaveRepository { const repo = new SaveRepository(name); handles.push(repo); return repo; }
function fixture(): GameState { return validateSave(structuredClone(prototypeSave)); }
async function rawStore(name: string, edit: (store: IDBObjectStore) => void): Promise<void> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => { const req = indexedDB.open(name, 1); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction('snapshots', 'readwrite');
    tx.oncomplete = () => resolve(); tx.onabort = () => reject(tx.error);
    edit(tx.objectStore('snapshots') as unknown as IDBObjectStore);
  });
  database.close();
}
afterEach(() => { handles.splice(0).forEach((repo) => repo.close()); vi.restoreAllMocks(); });

describe('strict portable save validation', () => {
  it('migrates the fixed v0 fixture without discarding inventory or currency', () => {
    const state = fixture();
    expect(state.schemaVersion).toBe(3);
    expect(state.contentVersion).toBe(CONTENT_VERSION);
    expect(state.coins).toBe(42);
    expect(state.storage[0]).toEqual({ uid: 'g4', item: 'grain-1' });
    expect(state.board[0]).toEqual({ uid: 'g1', item: 'grain-2' });
    expect(state.settings).toEqual({ music: true, sound: true, volume: 0.4, reducedMotion: false });
    expect(state.storageCapacity).toBe(8);
    expect(parseSave(serializeSave(state))).toEqual(state);
  });
  it('preserves v0 mute preferences', () => {
    const raw = structuredClone(prototypeSave); raw.settings.muted = true;
    expect(validateSave(raw).settings.sound).toBe(false);
  });
  it('rejects future schemas and incompatible content explicitly', () => {
    expect(() => validateSave({ ...fixture(), schemaVersion: 99 })).toThrow(/较新版本/);
    expect(() => validateSave({ ...fixture(), contentVersion: '99.0.0' })).toThrow(/内容版本/);
  });
  it.each([
    ['unknown item', (state: GameState) => { state.board[0]!.item = 'not-real'; }],
    ['duplicate item id', (state: GameState) => { state.storage[0].uid = 'g1'; }],
    ['future instance id', (state: GameState) => { state.storage[0].uid = 'g9'; }],
    ['negative funds', (state: GameState) => { state.coins = -1; }],
    ['fractional funds', (state: GameState) => { state.coins = 0.5; }],
    ['invalid seed', (state: GameState) => { state.seed = NaN; }],
    ['too many generated items', (state: GameState) => { state.generators.grain.remaining = 13; }],
    ['invalid volume', (state: GameState) => { state.settings.volume = Infinity; }],
    ['too many board slots', (state: GameState) => { state.board.push(null); }],
    ['locked cell', (state: GameState) => { state.board[55] = state.board[0]; state.board[0] = null; }],
    ['unknown order', (state: GameState) => { state.completedOrders = ['mystery']; }],
    ['future order', (state: GameState) => { state.completedOrders = ['day-6-order-1']; }],
    ['invalid shop level', (state: GameState) => { state.shops.breakfast = 4; }],
    ['unknown decoration', (state: GameState) => { state.decorations = ['bad']; }],
    ['sparse board', (state: GameState) => { delete state.board[3]; }],
  ])('rejects %s', (_, mutate) => { const state = fixture(); mutate(state); expect(() => validateSave(state)).toThrow(); });
  it('rejects cooking jobs in the wrong appliance', () => {
    const state = fixture();
    state.jobs[3] = { id: 'g5', recipe: RECIPES[0].id, startedAt: 100, endsAt: 200 }; state.nextId = 6;
    expect(() => validateSave(state)).toThrow(/加工槽配方/);
  });
  it('rejects oversized JSON, malformed JSON and injected root properties', () => {
    expect(() => parseSave(' '.repeat(1_000_001))).toThrow(/1 MB/);
    expect(() => parseSave('{')).toThrow(/JSON/);
    expect(() => parseSave(serializeSave(fixture()).replace('"schemaVersion": 3,', '"__proto__": {}, "schemaVersion": 3,'))).toThrow();
  });
  it('returns a detached state and enforces sell undo invariants', () => {
    const state = fixture(); const cloned = validateSave(state); cloned.coins = 3;
    expect(state.coins).toBe(42);
    state.undo = { item: state.board[0]!, index: 0, coins: 2, revision: state.revision }; state.board[0] = null;
    expect(validateSave(state).undo?.coins).toBe(2);
    state.undo.revision--;
    expect(() => validateSave(state)).toThrow(/撤销状态/);
  });
});

describe('IndexedDB atomic lifecycle', () => {
  it('round-trips actual engine commands through merge, cook, refresh, collect and sell undo', async () => {
    const name = `engine-lifecycle-${++counter}`;
    const first = repository(name); await first.open();
    let state = createInitialState(1792713600000);
    state.campaign = 'legacy';
    state.board[16]!.item = state.board[17]!.item = 'grain-1';
    state.board[23]!.item = state.board[24]!.item = 'coffee-1';
    state = execute(state, { type: 'move', from: 16, to: 17 }, state.lastSeen).state;
    expect(inventoryCount(state, 'grain-2')).toBe(1);
    state = execute(state, { type: 'cook', recipe: 'toast', slot: 0 }, state.lastSeen).state;
    expect(state.jobs[0]?.recipe).toBe('toast');
    await first.save(state); first.close();
    const second = repository(name); state = (await second.open()).state!;
    state = execute(state, { type: 'collect', slot: 0 }, state.lastSeen + 5000).state;
    expect(inventoryCount(state, 'dish-toast')).toBe(1);
    expect(execute(state, { type: 'collect', slot: 0 }, state.lastSeen).ok).toBe(false);
    const index = state.board.findIndex((item) => item?.item === 'dish-toast');
    const coins = state.coins;
    state = execute(state, { type: 'sell', index }, state.lastSeen).state;
    await second.save(state); second.close();
    const third = repository(name); state = (await third.open()).state!;
    expect(state.undo?.item.item).toBe('dish-toast');
    state = execute(state, { type: 'undo' }, state.lastSeen).state;
    expect(state.coins).toBe(coins); expect(inventoryCount(state, 'dish-toast')).toBe(1);
    await third.save(state);
  });
  it('loads a new device, saves and recovers the exact inventory after reopening', async () => {
    const name = `lifecycle-${++counter}`; const repo = repository(name);
    expect(await repo.open()).toEqual({ state: null, recovered: false });
    const state = fixture(); await repo.save(state); repo.close();
    expect(await repository(name).open()).toEqual({ state, recovered: false });
  });
  it('preserves a previous valid snapshot and rebases explicit restoration', async () => {
    const repo = repository(); await repo.open();
    const first = fixture(); await repo.save(first);
    const second = { ...first, revision: 5, coins: 100 }; await repo.save(second);
    const restored = await repo.restorePrevious();
    expect(restored?.coins).toBe(42); expect(restored?.revision).toBe(6);
    expect((await repo.open()).state).toEqual(restored);
  });
  it('serializes queued writes and never accepts an older command later', async () => {
    const repo = repository(); await repo.open(); const state = fixture();
    await Promise.all([repo.save(state), repo.save({ ...state, revision: 5, coins: 70 }), repo.save({ ...state, revision: 6, coins: 80 })]);
    await expect(repo.save(state)).rejects.toMatchObject({ code: 'conflict' });
    expect((await repo.open()).state?.coins).toBe(80);
  });
  it('detects cross-instance writes even when both revisions have the same number', async () => {
    const name = `competition-${++counter}`; const a = repository(name); const b = repository(name);
    await a.open(); const first = fixture(); await a.save(first); await b.open();
    await a.save({ ...first, revision: 5, coins: 77 });
    await expect(b.save({ ...first, revision: 5, coins: 99 })).rejects.toMatchObject({ code: 'conflict' });
    expect((await b.open()).state?.coins).toBe(77);
  });
  it('allows only one winner for two empty-device writers', async () => {
    const name = `empty-competition-${++counter}`; const a = repository(name); const b = repository(name);
    await Promise.all([a.open(), b.open()]);
    const results = await Promise.allSettled([a.save(fixture()), b.save(fixture())]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });
  it('recovers previous from corrupt current without replacing the good backup with corruption', async () => {
    const name = `corrupt-${++counter}`; const repo = repository(name); await repo.open();
    const first = fixture(); await repo.save(first); await repo.save({ ...first, revision: 5, coins: 100 }); repo.close();
    await rawStore(name, (store) => { store.put({ format: 1, token: 'corrupt', savedAt: 1, data: '{broken' }, 'current'); });
    const recovery = repository(name);
    expect(await recovery.open()).toEqual({ state: first, recovered: true });
    await recovery.save({ ...first, revision: 6, coins: 120 });
    expect((await recovery.restorePrevious())?.coins).toBe(42);
    expect(await recovery.exportRaw()).toContain('{broken');
  });
  it('keeps unreadable originals exportable and rejects overwriting without successful open', async () => {
    const name = `both-broken-${++counter}`; const repo = repository(name); await repo.open(); repo.close();
    await rawStore(name, (store) => { store.put({ bad: true }, 'current'); store.put({ bad: true }, 'previous'); });
    const recovery = repository(name);
    await expect(recovery.open()).rejects.toMatchObject({ code: 'corrupt' });
    expect(await recovery.exportRaw()).toContain('"bad": true');
    await expect(recovery.save(fixture())).rejects.toMatchObject({ code: 'storage' });
  });
  it('never falls back over a future-version current snapshot', async () => {
    const name = `future-${++counter}`; const repo = repository(name); await repo.open(); await repo.save(fixture()); repo.close();
    await rawStore(name, (store) => { store.put({ format: 1, token: 'future', savedAt: 1, data: JSON.stringify({ ...fixture(), schemaVersion: 99 }) }, 'current'); });
    await expect(repository(name).open()).rejects.toMatchObject({ code: 'future' });
  });
  it('preserves the exact v0 source as previous on the first migrated write', async () => {
    const name = `migration-${++counter}`; const repo = repository(name); await repo.open(); repo.close();
    const original = JSON.stringify(prototypeSave);
    await rawStore(name, (store) => { store.put({ format: 1, token: 'v0', savedAt: 1, data: original }, 'current'); });
    const migrated = repository(name); const opened = await migrated.open(); await migrated.save(opened.state!);
    expect(JSON.parse(await migrated.exportRaw()).previous.data).toBe(original);
  });
  it('surfaces write failure and preserves both committed snapshots', async () => {
    const name = `abort-${++counter}`; const repo = repository(name); await repo.open(); const first = fixture();
    await repo.save(first); await repo.save({ ...first, revision: 5, coins: 90 });
    const put = IDBObjectStore.prototype.put;
    const spy = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, ...args: Parameters<typeof put>) {
      const result = put.apply(this, args);
      if (args[1] === 'current') this.transaction.abort();
      return result;
    });
    await expect(repo.save({ ...first, revision: 6, coins: 123 })).rejects.toMatchObject({ code: 'storage' });
    spy.mockRestore();
    expect((await repo.open()).state?.coins).toBe(90);
    expect((await repo.restorePrevious())?.coins).toBe(42);
  });
  it('reports quota exhaustion clearly and allows a later retry without losing the current save', async () => {
    const repo = repository(); await repo.open(); const state = fixture(); await repo.save(state);
    const spy = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    await expect(repo.save({ ...state, revision: 5 })).rejects.toThrow(/空间不足/);
    spy.mockRestore();
    await repo.save({ ...state, revision: 5, coins: 100 });
    expect((await repo.open()).state?.coins).toBe(100);
  });
});
