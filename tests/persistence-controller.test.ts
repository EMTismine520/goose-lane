import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, execute } from '../src/domain/engine';
import type { GameState } from '../src/domain/types';
import { GameController } from '../src/platform/game-controller';
import type { GameSession } from '../src/platform/session';
import { SaveError, SaveRepository, serializeSave } from '../src/persistence/save';

const controllers: GameController[] = [];
let id = 0;
const now = 1792713600000;
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup(initial: GameState | null = createInitialState(now), readonly = false) {
  let readOnly = readonly;
  const session: GameSession = {
    get readOnly() { return readOnly; }, supported: true,
    takeover: vi.fn(async () => { readOnly = false; return true; }), release: vi.fn(),
  };
  const repository = {
    open: vi.fn().mockResolvedValue({ state: initial, recovered: false }), save: vi.fn().mockResolvedValue(undefined),
    restorePrevious: vi.fn().mockResolvedValue(null), replaceCorrupt: vi.fn().mockResolvedValue(undefined),
    exportRaw: vi.fn().mockResolvedValue('{"original":true}'), close: vi.fn(),
  };
  const audio = { unlock: vi.fn().mockResolvedValue(undefined), configure: vi.fn(), play: vi.fn(), dispose: vi.fn() };
  const download = vi.fn();
  const acquire = vi.fn(async (change: (value: boolean) => void) => { change(readOnly); return session; });
  const controller = new GameController(download, { repository, audio, acquire, now: () => now });
  controllers.push(controller);
  return { controller, repository, session, audio, download };
}
afterEach(() => { controllers.splice(0).forEach((controller) => controller.dispose()); vi.restoreAllMocks(); });

describe('UI persistence orchestration', () => {
  it('does not expose successful gameplay or a saved badge when storage fails during boot', async () => {
    const { controller, repository } = setup(null);
    repository.save.mockRejectedValue(new SaveError('设备存储空间不足', 'storage'));
    await controller.start();
    expect(controller.view.state).toBeNull();
    expect(controller.view.savedAt).toBe(0);
    expect(controller.view.bootError).toContain('空间不足');
    expect(controller.view.busy).toBe(false);
  });
  it('shows an empty-device read-only preview without creating a save', async () => {
    const { controller, repository } = setup(null, true); await controller.start();
    expect(controller.view.state?.revision).toBe(0);
    expect(controller.view.readOnly).toBe(true); expect(controller.view.savedAt).toBe(0);
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('keeps UI state unchanged on an aborted command and allows a successful retry', async () => {
    const { controller, repository } = setup(); await controller.start(); const original = controller.view.state;
    repository.save.mockRejectedValueOnce(new SaveError('事务未提交', 'storage'));
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(false);
    expect(controller.view.state).toBe(original); expect(controller.view.error).toBe('事务未提交');
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(true);
    expect(controller.view.state?.revision).toBe(1); expect(controller.view.state?.stats.generated).toBe(1);
  });
  it('blocks all future gameplay after a conflict until latest state is reloaded', async () => {
    const { controller, repository } = setup(); await controller.start();
    repository.save.mockRejectedValueOnce(new SaveError('新进度已在另一页保存', 'conflict'));
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(false);
    expect(controller.view.readOnly).toBe(true);
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(false);
    expect(repository.save).toHaveBeenCalledTimes(1);
    const newer = { ...createInitialState(now), revision: 7, coins: 123 };
    repository.open.mockResolvedValue({ state: newer, recovered: false });
    await controller.retry();
    expect(controller.view.state).toEqual(newer); expect(controller.view.readOnly).toBe(false);
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(true);
    expect(controller.view.state?.revision).toBe(8);
  });
  it('reloads the old writer progress after takeover and never saves its stale preview', async () => {
    const { controller, repository } = setup(null, true); await controller.start();
    const latest = { ...createInitialState(now), revision: 10, coins: 450 };
    repository.open.mockResolvedValue({ state: latest, recovered: false });
    await controller.retry();
    expect(repository.open).toHaveBeenCalledTimes(2); expect(repository.save).not.toHaveBeenCalled();
    expect(controller.view.state).toEqual(latest); expect(controller.view.readOnly).toBe(false);
  });
  it('keeps a failed takeover reload read-only, even after obtaining the writer lock', async () => {
    const { controller, repository } = setup(createInitialState(now), true); await controller.start();
    repository.open.mockRejectedValueOnce(new SaveError('暂时无法读取', 'storage'));
    await controller.retry();
    expect(controller.view.readOnly).toBe(true);
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('exports first, rebases import to current revision and invalidates imported sell undo', async () => {
    const initial = { ...createInitialState(now), revision: 7 };
    const { controller, repository, download } = setup(initial); await controller.start();
    const sold = execute(createInitialState(now), { type: 'sell', index: 16 }, now).state;
    sold.revision = 100; sold.undo!.revision = 100;
    await controller.importSave(serializeSave(sold));
    const imported = repository.replaceCorrupt.mock.calls[0][0] as GameState;
    expect(imported.revision).toBe(8); expect(imported.undo).toBeNull();
    expect(download.mock.invocationCallOrder[0]).toBeLessThan(repository.replaceCorrupt.mock.invocationCallOrder[0]);
    expect(JSON.parse(download.mock.calls[0][0]).revision).toBe(7);
    expect(controller.view.state).toEqual(imported);
  });
  it('rejects corrupt imports before exporting or replacing anything', async () => {
    const { controller, repository, download } = setup(); await controller.start();
    await expect(controller.importSave('{')).rejects.toThrow(/JSON/);
    expect(download).not.toHaveBeenCalled(); expect(repository.replaceCorrupt).not.toHaveBeenCalled();
  });
  it('serializes restore against commands and imports, publishing only after committed restoration', async () => {
    const { controller, repository, audio, download } = setup(); await controller.start();
    const wait = deferred<GameState>(); repository.restorePrevious.mockReturnValue(wait.promise);
    const operation = controller.recoverPrevious(); await Promise.resolve();
    expect(controller.view.busy).toBe(true);
    expect(await controller.dispatch({ type: 'generate', chain: 'grain' })).toBe(false);
    await expect(controller.importSave(serializeSave(createInitialState(now)))).rejects.toThrow(/正在保存/);
    expect(download.mock.invocationCallOrder[0]).toBeLessThan(repository.restorePrevious.mock.invocationCallOrder[0]);
    const restored = { ...createInitialState(now), revision: 3, coins: 30 }; wait.resolve(restored); await operation;
    expect(controller.view.state).toEqual(restored); expect(controller.view.savedAt).toBe(now);
    expect(audio.configure).toHaveBeenLastCalledWith(restored.settings); expect(controller.view.recovered).toBe(true);
  });
  it('preserves current UI state when restore fails and clears busy', async () => {
    const { controller, repository } = setup(); await controller.start(); const previous = controller.view.state;
    repository.restorePrevious.mockRejectedValueOnce(new SaveError('不能恢复', 'storage'));
    await expect(controller.recoverPrevious()).rejects.toThrow(/不能恢复/);
    expect(controller.view.state).toBe(previous); expect(controller.view.busy).toBe(false);
  });
  it('releases only its own late acquisition after unmount without opening a repository', async () => {
    const acquisition = deferred<GameSession>();
    const owned: GameSession = { readOnly: false, supported: true, takeover: vi.fn(), release: vi.fn() };
    const close = vi.fn(); const open = vi.fn();
    const controller = new GameController(vi.fn(), {
      acquire: () => acquisition.promise,
      repository: { open, close, save: vi.fn(), replaceCorrupt: vi.fn(), restorePrevious: vi.fn(), exportRaw: vi.fn() },
      audio: { unlock: vi.fn(), configure: vi.fn(), play: vi.fn(), dispose: vi.fn() },
    });
    controllers.push(controller);
    const starting = controller.start(); controller.dispose(); acquisition.resolve(owned); await starting;
    expect(owned.release).toHaveBeenCalledTimes(1); expect(open).not.toHaveBeenCalled(); expect(close).toHaveBeenCalledTimes(1);
  });
  it('recovers a corrupt device by explicit validated import while retaining both originals', async () => {
    const name = `controller-corruption-${++id}`;
    const repository = new SaveRepository(name); await repository.open(); repository.close();
    const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(name, 1); request.onsuccess = () => resolve(request.result); });
    await new Promise<void>((resolve) => {
      const transaction = database.transaction('snapshots', 'readwrite');
      transaction.objectStore('snapshots').put({ damaged: 'current' }, 'current');
      transaction.objectStore('snapshots').put({ damaged: 'previous' }, 'previous');
      transaction.oncomplete = () => resolve();
    }); database.close();
    const download = vi.fn();
    const controller = new GameController(download, { repository, acquire: async () => ({ readOnly: false, supported: true, takeover: async () => true, release() {} }), now: () => now });
    controllers.push(controller); await controller.start();
    expect(controller.view.state).toBeNull(); expect(controller.view.bootError).toContain('均无法读取');
    await controller.importSave(serializeSave(createInitialState(now)));
    expect(controller.view.state?.revision).toBe(1); expect(controller.view.bootError).toBe(''); expect(controller.view.readOnly).toBe(false);
    const raw = JSON.parse(await repository.exportRaw());
    expect(raw.recovery.current).toEqual({ damaged: 'current' }); expect(raw.recovery.previous).toEqual({ damaged: 'previous' });
    expect(raw.previous).toBeUndefined(); expect(download.mock.calls[0][0]).toContain('damaged');
    expect((await repository.open()).state?.revision).toBe(1);
  });
});
