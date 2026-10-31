import { cloneGameState } from '../src/domain/workspaces';
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
    listManualSlots: vi.fn().mockResolvedValue([]), readManualSlot: vi.fn(), saveManualSlot: vi.fn().mockResolvedValue(undefined),
  };
  const audio = { unlock: vi.fn().mockResolvedValue(undefined), configure: vi.fn(), play: vi.fn(), dispose: vi.fn() };
  const download = vi.fn();
  const acquire = vi.fn(async (change: (value: boolean) => void) => { change(readOnly); return session; });
  const controller = new GameController(download, { repository, audio, acquire, now: () => now });
  controllers.push(controller);
  return { controller, repository, session, audio, download };
}
afterEach(() => { controllers.splice(0).forEach((controller) => controller.dispose()); vi.restoreAllMocks(); });

describe('exclusive committed chapter changes',()=>{
  it('publishes purchase, wallet and workspace together only after saving; duplicate input is blocked',async()=>{
    const initial=createInitialState(now);initial.coins=60;
    const {controller,repository}=setup(initial);await controller.start();
    const gate=deferred<void>();repository.save.mockReturnValueOnce(gate.promise);
    const purchase=controller.dispatch({type:'unlockAndEnterChapter',chapter:7});
    await Promise.resolve();expect(controller.view.busy).toBe(true);expect(controller.view.state).toBe(initial);
    expect(await controller.dispatch({type:'unlockAndEnterChapter',chapter:7})).toBe(false);
    expect(await controller.dispatch({type:'generate',chain:'fresh-veg'})).toBe(false);
    gate.resolve();expect(await purchase).toBe(true);expect(controller.view.state?.coins).toBe(0);expect(controller.view.state?.activeWorkspaceId).toBe('chapter-7');
    expect(controller.view.sessionEpoch).toBe(1);expect(controller.view.workspaceEpoch).toBe(2);expect(repository.save).toHaveBeenCalledOnce();
  });
  it('keeps every asset, entitlement and coin on failure, and retries exactly once',async()=>{
    const initial=createInitialState(now);initial.coins=60;
    const {controller,repository}=setup(initial);await controller.start();const before=serializeSave(initial);
    repository.save.mockRejectedValueOnce(new SaveError('测试磁盘写入失败','storage'));
    expect(await controller.dispatch({type:'unlockAndEnterChapter',chapter:6})).toBe(false);
    expect(serializeSave(controller.view.state!)).toBe(before);expect(controller.view.workspaceEpoch).toBe(1);
    expect(await controller.dispatch({type:'unlockAndEnterChapter',chapter:6})).toBe(true);expect(controller.view.state?.coins).toBe(0);
    const current=controller.view.state!;repository.save.mockRejectedValueOnce(new SaveError('测试切换失败','storage'));
    expect(await controller.dispatch({type:'enterChapter',chapter:1})).toBe(false);expect(controller.view.state).toBe(current);
  });
  it('drains accepted writes, then cancels the purchase if any drained write failed',async()=>{
    const initial=createInitialState(now);initial.coins=60;const {controller,repository}=setup(initial);await controller.start();
    const gate=deferred<void>();repository.save.mockReturnValueOnce(gate.promise);
    const moving=controller.dispatch({type:'move',from:16,to:15});const entering=controller.dispatch({type:'unlockAndEnterChapter',chapter:8});
    gate.reject(new SaveError('测试旧操作保存失败','storage'));expect(await moving).toBe(false);expect(await entering).toBe(false);
    expect(controller.view.state).toBe(initial);expect(controller.view.state?.chapterAccess?.unlocked).toEqual([1]);
  });
});

describe('committed gift redemption feedback', () => {
  it('preserves the exact amount and balance for different high-value gifts in the same queue', async () => {
    const { controller, repository } = setup(); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const first = controller.redeemGift('jiajiabb'), second = controller.redeemGift('sisibb');
    expect(controller.view.state?.energy.value).toBe(60);
    save.resolve();
    expect(await first).toEqual({ ok: true, energyAdded: 1000, energyValue: 1060 });
    expect(await second).toEqual({ ok: true, energyAdded: 10000, energyValue: 11060 });
  });

  it.each([['jiajiabb',1000],['sisibb',10000]] as const)('does not publish %s until its retry actually commits', async (key, amount) => {
    const { controller, repository, audio } = setup(); await controller.start();
    repository.save.mockRejectedValueOnce(new SaveError('测试写入失败','storage'));
    expect(await controller.redeemGift(key)).toMatchObject({ ok: false });
    expect(controller.view.state?.energy.value).toBe(60);
    expect(controller.view.notice?.type).not.toBe('redeem'); expect(audio.play).not.toHaveBeenCalled();
    expect(await controller.redeemGift(key)).toEqual({ ok: true, energyAdded: amount, energyValue: 60 + amount });
    expect(audio.play).toHaveBeenCalledExactlyOnceWith('complete');
  });

  it('waits for storage before publishing the amount, feedback or completion sound', async () => {
    const { controller, repository, audio } = setup(); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    let settled = false;
    const redeem = controller.redeemGift('GOOSE100').then(result => { settled = true; return result; });
    await Promise.resolve();
    expect(controller.view.state?.energy.value).toBe(60);
    expect(controller.view.notice?.type).not.toBe('redeem');
    expect(settled).toBe(false); expect(audio.play).not.toHaveBeenCalled();
    save.resolve();
    expect(await redeem).toEqual({ ok: true, energyAdded: 100, energyValue: 160 });
    expect(controller.view.state?.energy.value).toBe(160);
    expect(audio.play).toHaveBeenCalledExactlyOnceWith('complete');
  });

  it('returns each transaction result even when several redemptions are queued', async () => {
    const { controller, repository } = setup(); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const first = controller.redeemGift('goose100'), second = controller.redeemGift(' GOOSE100 ');
    save.resolve();
    expect(await first).toEqual({ ok: true, energyAdded: 100, energyValue: 160 });
    expect(await second).toEqual({ ok: true, energyAdded: 100, energyValue: 260 });
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('returns the actual failure, cancels queued work and grants once on explicit retry', async () => {
    const { controller, repository, audio } = setup(); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const first = controller.redeemGift('GOOSE100'), queued = controller.redeemGift('GOOSE100');
    save.reject(new SaveError('磁盘空间不足', 'storage'));
    expect(await first).toEqual({ ok: false, message: '兑换未完成，体力未增加。磁盘空间不足' });
    expect(await queued).toMatchObject({ ok: false, message: expect.stringContaining('上一操作') });
    expect(controller.view.state?.energy.value).toBe(60); expect(audio.play).not.toHaveBeenCalled();
    expect(await controller.redeemGift('GOOSE100')).toEqual({ ok: true, energyAdded: 100, energyValue: 160 });
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(audio.play).toHaveBeenCalledExactlyOnceWith('complete');
  });

  it('does not mistake an old notice for the current invalid-code result', async () => {
    const { controller, repository } = setup(); await controller.start();
    controller.setNotice({ type: 'redeem', message: '旧成功信息', amount: 999 });
    expect(await controller.redeemGift('wrong')).toEqual({ ok: false, message: '兑换码无效，请检查后重试。' });
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('returns a useful reason when not ready, busy or read-only', async () => {
    const { controller, repository } = setup(undefined, true);
    expect(await controller.redeemGift('GOOSE100')).toMatchObject({ ok: false, message: expect.stringContaining('打开游戏') });
    await controller.start();
    expect(await controller.redeemGift('GOOSE100')).toMatchObject({ ok: false, message: expect.stringContaining('只读') });
    expect(repository.save).not.toHaveBeenCalled();
    const writable = setup(); await writable.controller.start();
    const activation = deferred<void>();
    const updating = writable.controller.applyUpdate(() => activation.promise);
    expect(await writable.controller.redeemGift('GOOSE100')).toMatchObject({ ok: false, message: expect.stringContaining('稍候') });
    activation.resolve(); await updating;
  });

  it('requires a fresh state after a conflicting writer before another gift can be applied', async () => {
    const { controller, repository } = setup(); await controller.start();
    repository.save.mockRejectedValueOnce(new SaveError('另一窗口已保存新进度', 'conflict'));
    expect(await controller.redeemGift('GOOSE100')).toMatchObject({ ok: false, message: expect.stringContaining('另一窗口') });
    expect(controller.view.state?.energy.value).toBe(60); expect(controller.view.readOnly).toBe(true);
    expect((await controller.redeemGift('GOOSE100')).ok).toBe(false);
    const latest = createInitialState(now); latest.revision = 7; latest.energy.value = 200;
    repository.open.mockResolvedValue({ state: latest, recovered: false });
    await controller.retry();
    expect(await controller.redeemGift('GOOSE100')).toEqual({ ok: true, energyAdded: 100, energyValue: 300 });
    expect(controller.view.state?.revision).toBe(8);
  });
});

describe('UI persistence orchestration', () => {
  it('skips identical selection and scroll writes without skipping page events', async () => {
    const { controller, repository } = setup(); await controller.start();
    expect(await controller.dispatch({type:'session',session:{selectedUid:null,orderScroll:0}})).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
    expect(await controller.dispatch({type:'session',session:{page:'merge'}})).toBe(true);
    expect(repository.save).toHaveBeenCalledOnce();
  });
  it('retains a later selection cancellation while an earlier selection write is pending', async () => {
    const {controller,repository}=setup();await controller.start();
    const saved=deferred<void>();repository.save.mockReturnValueOnce(saved.promise);
    const selected=controller.dispatch({type:'session',session:{selectedUid:'g1'}});
    const cancelled=controller.dispatch({type:'session',session:{selectedUid:null}});
    saved.resolve();expect(await selected).toBe(true);expect(await cancelled).toBe(true);
    expect(controller.view.state?.session.selectedUid).toBeNull();
    expect(repository.save).toHaveBeenCalledTimes(2);
  });
  it('increments the scene restore epoch only when loading or replacing a session', async () => {
    const { controller, repository } = setup(); await controller.start();
    expect(controller.view.sessionEpoch).toBe(1);
    await controller.dispatch({ type: 'generate', chain: 'fresh-veg' });
    expect(controller.view.sessionEpoch).toBe(1);
    const imported = createInitialState(now);
    imported.session = { page: 'street', selectedUid: 'g3', orderScroll: 120 };
    await controller.importSave(serializeSave(imported));
    expect(controller.view.sessionEpoch).toBe(2);
    expect(controller.view.state?.session).toEqual(imported.session);
    const restored=cloneGameState(imported);restored.revision=3;restored.session.orderScroll=20;
    repository.restorePrevious.mockResolvedValue(restored);
    await controller.recoverPrevious();
    expect(controller.view.sessionEpoch).toBe(3);
    expect(controller.view.state?.session.orderScroll).toBe(20);
    repository.open.mockResolvedValue({ state: restored, recovered: false });
    await controller.retry();
    expect(controller.view.sessionEpoch).toBe(4);
  });
  it('freezes new gestures and drains both queued writes before activating an update', async () => {
    const { controller, repository } = setup(); await controller.start();
    const save = deferred<void>(), activation = deferred<void>();
    repository.save.mockReturnValueOnce(save.promise);
    const first = controller.dispatch({ type: 'move', from: 16, to: 15 });
    const second = controller.dispatch({ type: 'move', from: 23, to: 22 });
    const activate = vi.fn(() => activation.promise);
    const updating = controller.applyUpdate(activate);
    expect(controller.view.busy).toBe(true);
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    await Promise.resolve(); expect(activate).not.toHaveBeenCalled();
    save.resolve(); expect(await Promise.all([first, second])).toEqual([true, true]);
    await Promise.resolve(); expect(activate).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(2);
    activation.resolve(); await updating;
    expect(controller.view.busy).toBe(true);
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
  });
  it('unfreezes after update activation failure and permits an explicit retry', async () => {
    const { controller } = setup(); await controller.start();
    const activate = vi.fn(() => { throw new Error('更新等待超时'); });
    await expect(controller.applyUpdate(activate)).rejects.toThrow('更新等待超时');
    expect(controller.view.busy).toBe(false);
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(true);
    await controller.applyUpdate(async () => undefined);
    expect(controller.view.busy).toBe(true);
  });
  it('aborts activation if a queued persistence transaction fails while draining', async () => {
    const { controller, repository } = setup(); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const command = controller.dispatch({ type: 'generate', chain: 'fresh-veg' });
    const activate = vi.fn().mockResolvedValue(undefined);
    const updating = controller.applyUpdate(activate);
    save.reject(new SaveError('保存失败', 'storage'));
    expect(await command).toBe(false);
    await expect(updating).rejects.toThrow(/尚未保存成功/);
    expect(activate).not.toHaveBeenCalled(); expect(controller.view.busy).toBe(false);
  });
  it('queues independent gestures during storage without blocking the board', async () => {
    const { controller, repository } = setup(); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const first = controller.dispatch({ type: 'move', from: 16, to: 15 });
    const second = controller.dispatch({ type: 'move', from: 23, to: 22 });
    expect(controller.view.busy).toBe(false);
    expect(controller.view.pendingCommands).toBe(2);
    expect(controller.view.pendingUids).toEqual(expect.arrayContaining(['g1', 'g3']));
    expect(controller.view.state?.board[16]?.uid).toBe('g1');
    save.resolve();
    expect(await Promise.all([first, second])).toEqual([true, true]);
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(controller.view.state?.board[15]?.uid).toBe('g1');
    expect(controller.view.state?.board[22]?.uid).toBe('g3');
    expect(controller.view.pendingCommands).toBe(0);
    expect(controller.view.pendingUids).toEqual([]);
  });
  it('rejects a duplicate in-flight UID and revalidates an empty destination at execution', async () => {
    const { controller, repository } = setup(); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const first = controller.dispatch({ type: 'move', from: 16, to: 15 });
    expect(await controller.dispatch({ type: 'sell', index: 16 })).toBe(false);
    const collision = controller.dispatch({ type: 'move', from: 23, to: 15 });
    save.resolve();
    expect(await first).toBe(true); expect(await collision).toBe(false);
    expect(controller.view.state?.board[15]?.uid).toBe('g1');
    expect(controller.view.state?.board[23]?.uid).toBe('g3');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
  it('cancels queued commands after a failed write and preserves the random sequence', async () => {
    const { controller, repository } = setup(); await controller.start();
    const original = controller.view.state!;
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const first = controller.dispatch({ type: 'generate', chain: 'fresh-veg' });
    const second = controller.dispatch({ type: 'generate', chain: 'fresh-veg' });
    const third = controller.dispatch({ type: 'move', from: 16, to: 15 });
    save.reject(new SaveError('磁盘写入失败', 'storage'));
    expect(await Promise.all([first, second, third])).toEqual([false, false, false]);
    expect(controller.view.state).toBe(original);
    expect(controller.view.state?.seed).toBe(original.seed);
    expect(controller.view.pendingCommands).toBe(0);
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(true);
    expect(controller.view.state?.seed).toBe(execute(original, { type: 'generate', chain: 'fresh-veg' }, now).state.seed);
  });
  it('honors the UID supplied by pointer-down rather than replacing it at dispatch', async () => {
    const { controller, repository } = setup(); await controller.start();
    const state = controller.view.state;
    expect(await controller.dispatch({ type: 'move', from: 16, to: 15, expectedUid: 'g999' })).toBe(false);
    expect(controller.view.state).toBe(state); expect(repository.save).not.toHaveBeenCalled();
  });
  it('reserves the actual order ingredients until its transaction finishes', async () => {
    let state = createInitialState(now);
    state = execute(state, { type: 'move', from: 16, to: 17 }, now).state;
    const { controller, repository } = setup(state); await controller.start();
    const save = deferred<void>(); repository.save.mockReturnValueOnce(save.promise);
    const delivery = controller.dispatch({ type: 'deliver', order: 'opening-order-1' });
    expect(await controller.dispatch({ type: 'sell', index: 17 })).toBe(false);
    save.resolve(); expect(await delivery).toBe(true);
    expect(controller.view.state?.completedOrders).toContain('opening-order-1');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
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
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('keeps UI state unchanged on an aborted command and allows a successful retry', async () => {
    const { controller, repository } = setup(); await controller.start(); const original = controller.view.state;
    repository.save.mockRejectedValueOnce(new SaveError('事务未提交', 'storage'));
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    expect(controller.view.state).toBe(original); expect(controller.view.error).toBe('事务未提交');
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(true);
    expect(controller.view.state?.revision).toBe(1); expect(controller.view.state?.stats.generated).toBe(1);
  });
  it('blocks all future gameplay after a conflict until latest state is reloaded', async () => {
    const { controller, repository } = setup(); await controller.start();
    repository.save.mockRejectedValueOnce(new SaveError('新进度已在另一页保存', 'conflict'));
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    expect(controller.view.readOnly).toBe(true);
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    expect(repository.save).toHaveBeenCalledTimes(1);
    const newer = { ...createInitialState(now), revision: 7, coins: 123 };
    repository.open.mockResolvedValue({ state: newer, recovered: false });
    await controller.retry();
    expect(controller.view.state).toEqual(newer); expect(controller.view.readOnly).toBe(false);
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(true);
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
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
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
    expect(await controller.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
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
      repository: { open, close, save: vi.fn(), replaceCorrupt: vi.fn(), restorePrevious: vi.fn(), exportRaw: vi.fn(), listManualSlots: vi.fn(), readManualSlot: vi.fn(), saveManualSlot: vi.fn() },
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
