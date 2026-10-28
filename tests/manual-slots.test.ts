import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, execute, getApplianceStatus, getEnergyStatus } from '../src/domain/engine';
import type { GameState } from '../src/domain/types';
import { RECIPES } from '../src/content/catalog';
import { SaveError, SaveRepository, parseSave, resumeManualSlot, serializeSave } from '../src/persistence/save';
import type { ManualSlot, SaveSlotId } from '../src/persistence/save';
import { GameController } from '../src/platform/game-controller';
import type { GameSession } from '../src/platform/session';
import legacyFixture from './persistence-v1.fixture.json';

const now = 1_792_713_600_000;
let sequence = 0;
const repositories: SaveRepository[] = [], controllers: GameController[] = [];
afterEach(() => { controllers.splice(0).forEach(controller => controller.dispose()); repositories.splice(0).forEach(repository => repository.close()); vi.restoreAllMocks(); });
async function repository() {
  const name = `manual-slots-${++sequence}`;
  const repo = new SaveRepository(name); repositories.push(repo);
  await repo.open(); await repo.save(createInitialState(now));
  return { repo, name };
}
async function rawWrite(name: string, key: string, value: unknown) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => { const result = indexedDB.open(name, 1); result.onsuccess = () => resolve(result.result); result.onerror = () => reject(result.error); });
  try { await new Promise<void>((resolve, reject) => { const transaction = database.transaction('snapshots', 'readwrite'); transaction.oncomplete = () => resolve(); transaction.onabort = () => reject(transaction.error); transaction.objectStore('snapshots').put(value, key); }); }
  finally { database.close(); }
}
async function harness(readOnly = false) {
  const { repo, name } = await repository();
  const clock = { now };
  const session: GameSession = { readOnly, supported: true, takeover: async () => !readOnly, release: vi.fn() };
  const download = vi.fn();
  const controller = new GameController(download, { repository: repo, now: () => clock.now, acquire: async change => { change(readOnly); return session; }, audio: { unlock: async () => {}, configure: vi.fn(), play: vi.fn(), dispose: vi.fn() } });
  controllers.push(controller); await controller.start();
  return { repo, name, controller, clock, download };
}
function deferred() { let resolve!: () => void; const promise = new Promise<void>(yes => { resolve = yes; }); return { promise, resolve }; }

describe('gift energy in existing save workflows', () => {
  it('round-trips through slots and imports, while restart preserves the manual gifts', async () => {
    const { controller } = await harness();
    await controller.saveSlot(1);
    await controller.redeemGift('GOOSE100');
    await controller.saveSlot(2);
    const exported = serializeSave(controller.view.state!);
    await controller.redeemGift('GOOSE100');
    expect(controller.view.state?.energy.value).toBe(260);
    await controller.loadSlot(2); expect(controller.view.state?.energy.value).toBe(160);
    await controller.loadSlot(1); expect(controller.view.state?.energy.value).toBe(60);
    await controller.importSave(exported); expect(controller.view.state?.energy.value).toBe(160);
    await controller.restartGame(); expect(controller.view.state?.energy.value).toBe(60);
    const slots = await controller.listSlots();
    expect(slots.map(slot => slot.status === 'ready' ? slot.state.energy.value : null)).toEqual([60, 160, null]);
    await controller.redeemGift('GOOSE100'); expect(controller.view.state?.energy.value).toBe(160);
  });
});

describe('three independent transactional checkpoints', () => {
  it('opens an existing automatic save with exactly three empty slots', async () => {
    const { repo } = await repository();
    expect(await repo.listManualSlots()).toEqual([1, 2, 3].map(id => ({ id, status: 'empty' })));
    expect((await repo.open()).state?.energy.value).toBe(60);
  });
  it('persists all three slots, overwrites only the chosen slot and survives reopening', async () => {
    const { repo, name } = await repository();
    for (const id of [1, 2, 3] as const) await repo.saveManualSlot(id, { ...createInitialState(now), revision: id, coins: id * 10 }, now + id);
    await repo.saveManualSlot(2, { ...createInitialState(now), revision: 4, coins: 99 }, now + 4);
    await repo.save({ ...createInitialState(now), revision: 5, coins: 200 });
    repo.close();
    const reopened = new SaveRepository(name); repositories.push(reopened); await reopened.open();
    const slots = await reopened.listManualSlots();
    expect(slots.map(slot => slot.status === 'ready' ? slot.state.coins : -1)).toEqual([10, 99, 30]);
    expect((await reopened.open()).state?.coins).toBe(200);
  });
  it('does not share references with the played state or returned previews', async () => {
    const { repo } = await repository(); const state = createInitialState(now);
    await repo.saveManualSlot(1, state, now); state.board[16] = null; state.coins = 90;
    const read = await repo.readManualSlot(1); read.state.board[17] = null;
    const untouched = await repo.readManualSlot(1);
    expect(untouched.state.board[16]?.uid).toBe('g1'); expect(untouched.state.board[17]?.uid).toBe('g2'); expect(untouched.state.coins).toBe(0);
  });
  it('rolls back current, previous and overwritten slot together when the slot write exceeds quota', async () => {
    const { repo } = await repository(); await repo.saveManualSlot(1, createInitialState(now), now);
    const before = await repo.exportRaw(); const put = IDBObjectStore.prototype.put;
    const spy = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function(this: IDBObjectStore, ...args: Parameters<typeof put>) {
      if (args[1] === 'manual-slot-1') throw new DOMException('No space', 'QuotaExceededError');
      return put.apply(this, args);
    });
    await expect(repo.saveManualSlot(1, { ...createInitialState(now), revision: 10, coins: 70 }, now)).rejects.toMatchObject({ code: 'storage' });
    expect(await repo.exportRaw()).toBe(before);
    spy.mockRestore(); await repo.saveManualSlot(1, { ...createInitialState(now), revision: 11, coins: 80 }, now);
    expect((await repo.readManualSlot(1)).state.coins).toBe(80);
  });
  it('rejects another writer without changing any checkpoint', async () => {
    const { repo, name } = await repository(); const stale = new SaveRepository(name); repositories.push(stale); await stale.open();
    await repo.saveManualSlot(1, { ...createInitialState(now), revision: 2, coins: 40 }, now);
    await expect(stale.saveManualSlot(2, { ...createInitialState(now), revision: 3, coins: 50 }, now)).rejects.toMatchObject({ code: 'conflict' });
    expect((await repo.listManualSlots())[1].status).toBe('empty');
    expect((await repo.open()).state?.coins).toBe(40);
  });
  it('isolates corrupt and future records and retains raw records for repair', async () => {
    const { repo, name } = await repository(); await repo.saveManualSlot(3, createInitialState(now), now);
    await rawWrite(name, 'manual-slot-1', { broken: true });
    await rawWrite(name, 'manual-slot-2', { format: 2, nextVersionField: true });
    expect((await repo.listManualSlots()).map(slot => slot.status)).toEqual(['corrupt', 'incompatible', 'ready']);
    await expect(repo.readManualSlot(1)).rejects.toBeInstanceOf(SaveError);
    await expect(repo.readManualSlot(2)).rejects.toMatchObject({ code: 'future' });
    expect(JSON.parse(await repo.exportRaw()).manualSlots[0]).toEqual({ broken: true });
    await repo.saveManualSlot(1, { ...createInitialState(now), revision: 1 }, now);
    expect((await repo.readManualSlot(1)).status).toBe('ready');
  });
  it('rejects missing slots, invalid IDs and invalid save state without writing', async () => {
    const { repo } = await repository(); const before = await repo.exportRaw();
    await expect(repo.readManualSlot(1)).rejects.toThrow(/没有存档/);
    await expect(repo.saveManualSlot(4 as SaveSlotId, createInitialState(now), now)).rejects.toMatchObject({ code: 'invalid' });
    await expect(repo.saveManualSlot(1, { ...createInitialState(now), coins: -1 }, now)).rejects.toMatchObject({ code: 'invalid' });
    expect(await repo.exportRaw()).toBe(before);
  });
  it('retains migrated legacy inventory, old jobs and progress in a manual checkpoint', async () => {
    const { repo } = await repository();
    const legacy = parseSave(JSON.stringify(legacyFixture)); legacy.revision = 10;
    await repo.saveManualSlot(1, legacy, now);
    const saved = await repo.readManualSlot(1);
    expect(saved.state).toEqual(legacy);
    const restored = resumeManualSlot(saved, now + 86_400_000);
    expect(restored.campaign).toBe('legacy'); expect(restored.board).toEqual(legacy.board); expect(restored.storage).toEqual(legacy.storage);
    expect(restored.completedOrders).toEqual(legacy.completedOrders);
    restored.jobs.forEach((job, index) => { if (job) expect(job.endsAt - restored.lastSeen).toBe(legacy.jobs[index]!.endsAt - legacy.lastSeen); });
  });
  it('distinguishes bad checkpoint metadata and incompatible game content from an empty slot', async () => {
    const { repo, name } = await repository(); await repo.saveManualSlot(1, createInitialState(now), now);
    const valid = JSON.parse(await repo.exportRaw()).manualSlots[0];
    await rawWrite(name, 'manual-slot-1', { ...valid, capturedAt: now + 1 });
    await rawWrite(name, 'manual-slot-2', { ...valid, slotId: 2, data: JSON.stringify({ ...createInitialState(now), contentVersion: '999.0.0' }) });
    await rawWrite(name, 'manual-slot-3', { ...valid, slotId: 3, savedAt: Number.MAX_SAFE_INTEGER });
    expect((await repo.listManualSlots()).map(slot => slot.status)).toEqual(['corrupt', 'incompatible', 'corrupt']);
  });
});

describe('resume the frozen instant', () => {
  function cookingState() {
    const state = createInitialState(now);
    const recipe = RECIPES.find(entry => entry.id === 'fresh-tomato-salad')!;
    state.nextId = 8; state.energy = { value: 35, lastRecoveryAt: now - 90_000 };
    state.appliances[0].job = { id: 'g5', recipe: recipe.id, output: recipe.output, startedAt: now - 10_000, endsAt: now + 10_000 };
    state.jobs[0] = { id: 'g6', recipe: recipe.id, startedAt: now - 10_000, endsAt: now + 10_000 };
    state.generators['fresh-veg'] = { remaining: 0, readyAt: now + 4_000 };
    return parseSave(serializeSave(state));
  }
  function slot(state: GameState): Extract<ManualSlot, { status: 'ready' }> { return { id: 1, status: 'ready', state, capturedAt: now, savedAt: now }; }
  it('keeps cooking, old jobs, energy progress and generator cooldown after a day', () => {
    const saved = cookingState(); const time = now + 86_400_000; const restored = resumeManualSlot(slot(saved), time);
    expect(getApplianceStatus(restored, restored.appliances[0].id, time)!.remaining).toBe(10_000);
    expect(restored.jobs[0]!.endsAt - time).toBe(10_000);
    expect(getEnergyStatus(restored, time)).toMatchObject({ value: 35, nextRecoveryIn: 30_000 });
    expect(restored.generators['fresh-veg'].readyAt - time).toBe(4_000);
    expect(restored.generators['fresh-fruit'].readyAt).toBe(0);
    expect(getEnergyStatus(restored, time + 30_000).value).toBe(36);
    expect(execute(restored, { type: 'recover' }, time + 10_000).state.appliances[0].outputSlot).not.toBeNull();
    expect(saved.lastSeen).toBe(now);
  });
  it('repeated loads and a backward wall clock keep the same remaining time', () => {
    const saved = slot(cookingState());
    for (const time of [now + 86_400_000, now + 172_800_000, now - 86_400_000]) {
      const restored = resumeManualSlot(saved, time);
      expect(restored.appliances[0].job!.endsAt - time).toBe(10_000);
      expect(getEnergyStatus(restored, time).nextRecoveryIn).toBe(30_000);
    }
  });
  it('keeps completed output without minting a second UID', () => {
    const state = cookingState(); state.appliances[0].job!.endsAt = now;
    const ready = execute(state, { type: 'recover' }, now).state;
    const restored = resumeManualSlot(slot(ready), now + 86_400_000);
    expect(restored.appliances[0].outputSlot).toEqual(ready.appliances[0].outputSlot);
    const reconciled = execute(restored, { type: 'recover' }, restored.lastSeen).state;
    expect(reconciled.nextId).toBe(ready.nextId);
  });
  it('preserves valid sale undo, scene, inventory, seed and current preferences', () => {
    const sold = execute(createInitialState(now), { type: 'sell', index: 16 }, now).state;
    sold.session = { page: 'street', selectedUid: 'g3', orderScroll: 153 };
    const current = createInitialState(now); current.revision = 500; current.settings.volume = 0.1; current.settings.reducedMotion = true;
    const restored = resumeManualSlot(slot(sold), now + 50_000, current);
    expect(restored.revision).toBe(501); expect(restored.undo?.revision).toBe(501);
    expect(execute(restored, { type: 'undo' }, restored.lastSeen).ok).toBe(true);
    expect(restored.settings).toEqual(current.settings); expect(restored.session).toEqual(sold.session); expect(restored.seed).toBe(sold.seed); expect(restored.nextId).toBe(sold.nextId);
  });
});

describe('controller save/load/restart boundary', () => {
  it('round trips A and B, restarts without deleting slots, then continues B after reopening', async () => {
    const { controller, repo, clock, download } = await harness();
    await controller.dispatch({ type: 'generate', chain: 'fresh-veg' }); await controller.saveSlot(1);
    const a = structuredClone(controller.view.state!);
    await controller.dispatch({ type: 'generate', chain: 'fresh-fruit' }); await controller.dispatch({ type: 'session', session: { page: 'street', selectedUid: 'g3', orderScroll: 120 } }); await controller.saveSlot(2);
    const b = structuredClone(controller.view.state!);
    await controller.dispatch({ type: 'settings', settings: { volume: 0.2, reducedMotion: true } });
    clock.now += 86_400_000;
    await controller.loadSlot(1); expect(controller.view.state!.board).toEqual(a.board); expect(controller.view.state!.energy.value).toBe(a.energy.value);
    const saved = await repo.exportRaw(); await controller.restartGame();
    const fresh = createInitialState(clock.now);
    expect(controller.view.state).toEqual({ ...fresh, revision: controller.view.state!.revision, settings: { ...fresh.settings, volume: 0.2, reducedMotion: true } });
    expect(JSON.parse(await repo.exportRaw()).manualSlots).toEqual(JSON.parse(saved).manualSlots);
    await controller.loadSlot(2); expect(controller.view.state!.board).toEqual(b.board); expect(controller.view.state!.session).toEqual(b.session);
    expect((await repo.open()).state).toEqual(controller.view.state);
    expect(download).not.toHaveBeenCalled();
    const replay = execute(controller.view.state!, { type: 'generate', chain: 'fresh-veg' }, clock.now).state;
    const originalReplay = execute(b, { type: 'generate', chain: 'fresh-veg' }, b.lastSeen).state;
    expect(replay.board).toEqual(originalReplay.board); expect(replay.seed).toBe(originalReplay.seed);
  });
  it('drains accepted commands and blocks new commands or competing replacements', async () => {
    const { controller, repo } = await harness(); const wait = deferred(); const save = repo.save.bind(repo);
    vi.spyOn(repo, 'save').mockImplementationOnce(async state => { await wait.promise; return save(state); });
    const first = controller.dispatch({ type: 'settings', settings: { volume: 0.3 } });
    const second = controller.dispatch({ type: 'session', session: { page: 'street' } });
    const checkpoint = controller.saveSlot(1);
    expect(controller.view.busy).toBe(true); expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    await expect(controller.restartGame()).rejects.toThrow(/稍候/);
    wait.resolve(); await Promise.all([first, second, checkpoint]);
    expect((await repo.readManualSlot(1)).state).toMatchObject({ settings: { volume: 0.3 }, session: { page: 'street' } });
    expect(controller.view.busy).toBe(false);
  });
  it('aborts a checkpoint when a preceding accepted write fails', async () => {
    const { controller, repo } = await harness(); const wait = deferred();
    vi.spyOn(repo, 'save').mockImplementationOnce(async () => { await wait.promise; throw new SaveError('磁盘不可用', 'storage'); });
    const command = controller.dispatch({ type: 'generate', chain: 'fresh-veg' }); const checkpoint = controller.saveSlot(1);
    const rejected = expect(checkpoint).rejects.toThrow(/此前操作/);
    wait.resolve(); expect(await command).toBe(false); await rejected;
    expect((await repo.listManualSlots())[0].status).toBe('empty'); expect(controller.view.busy).toBe(false);
  });
  it('does not publish a load or restart before commit and retains the old scene after write failure', async () => {
    const { controller, repo } = await harness(); await controller.saveSlot(1);
    await controller.dispatch({ type: 'generate', chain: 'fresh-veg' });
    const before = controller.view.state, epoch = controller.view.sessionEpoch; const wait = deferred();
    vi.spyOn(repo, 'replaceCorrupt').mockImplementationOnce(async () => { await wait.promise; throw new SaveError('读取后的保存失败', 'storage'); });
    const load = controller.loadSlot(1); const rejected = expect(load).rejects.toThrow(/保存失败/);
    await Promise.resolve(); expect(controller.view.state).toBe(before); wait.resolve(); await rejected;
    expect(controller.view.state).toBe(before); expect(controller.view.sessionEpoch).toBe(epoch); expect(controller.view.busy).toBe(false);
    vi.spyOn(repo, 'save').mockRejectedValueOnce(new SaveError('重开保存失败', 'storage'));
    await expect(controller.restartGame()).rejects.toThrow(/重开保存失败/); expect(controller.view.state).toBe(before);
  });
  it('permits read-only browsing but rejects all three mutations', async () => {
    const { controller } = await harness(true);
    expect(await controller.listSlots()).toHaveLength(3);
    await expect(controller.saveSlot(1)).rejects.toThrow(/只读/);
    await expect(controller.loadSlot(1)).rejects.toThrow(/只读/);
    await expect(controller.restartGame()).rejects.toThrow(/只读/);
  });
  it('restores a manual slot from the boot failure screen without discarding corrupt originals', async () => {
    const { repo, name } = await repository(); await repo.saveManualSlot(1, createInitialState(now), now); repo.close();
    await rawWrite(name, 'current', { broken: 'current' }); await rawWrite(name, 'previous', { broken: 'previous' });
    const recovered = new SaveRepository(name); repositories.push(recovered);
    const controller = new GameController(vi.fn(), { repository: recovered, now: () => now + 1_000, acquire: async () => ({ readOnly: false, supported: true, takeover: async () => true, release: () => {} }) });
    controllers.push(controller); await controller.start(); expect(controller.view.bootError).toBeTruthy(); expect(controller.canWriteSaves()).toBe(true);
    await controller.loadSlot(1); expect(controller.view.bootError).toBe(''); expect(controller.view.state?.energy.value).toBe(60);
    const raw = JSON.parse(await recovered.exportRaw()); expect(raw.recovery).toEqual({ current: { broken: 'current' }, previous: { broken: 'previous' } });
  });
  it('never overwrites a future-version current save through a manual slot', async () => {
    const { repo, name } = await repository(); await repo.saveManualSlot(1, createInitialState(now), now); repo.close();
    await rawWrite(name, 'current', { format: 1, token: 'future-current', savedAt: now, data: JSON.stringify({ ...createInitialState(now), schemaVersion: 99 }) });
    const future = new SaveRepository(name); repositories.push(future);
    const controller = new GameController(vi.fn(), { repository: future, acquire: async () => ({ readOnly: false, supported: true, takeover: async () => true, release: () => {} }) });
    controllers.push(controller); await controller.start(); const before = await future.exportRaw();
    await expect(controller.loadSlot(1)).rejects.toThrow(/原档/);
    expect(await future.exportRaw()).toBe(before); expect(controller.view.state).toBeNull();
  });
});
