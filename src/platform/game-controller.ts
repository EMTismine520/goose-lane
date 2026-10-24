import type { Command, GameEvent, GameState } from '../domain/types';
import { createInitialState, execute } from '../domain/engine';
import { ORDERS, RECIPES } from '../content/catalog';
import { SaveError, SaveRepository, parseSave, serializeSave, resumeManualSlot } from '../persistence/save';
import type { SaveSlotId } from '../persistence/save';
import { acquireSession } from './session';
import type { GameSession } from './session';
import { audio } from './audio';

export interface GameView {
  state: GameState | null;
  readOnly: boolean;
  busy: boolean;
  error: string;
  bootError: string;
  notice: GameEvent | null;
  savedAt: number;
  recovered: boolean;
  pendingCommands: number;
  pendingUids: string[];
  sessionEpoch: number;
}
type Repository = Pick<SaveRepository, 'open' | 'save' | 'restorePrevious' | 'replaceCorrupt' | 'exportRaw' | 'close' | 'listManualSlots' | 'readManualSlot' | 'saveManualSlot'>;
interface Dependencies {
  repository?: Repository;
  acquire?: typeof acquireSession;
  audio?: Pick<typeof audio, 'unlock' | 'configure' | 'play' | 'dispose'>;
  now?: () => number;
}

/** Owns the async boundary: the UI only observes states whose transaction committed. */
export class GameController {
  view: GameView = { state: null, readOnly: true, busy: false, error: '', bootError: '', notice: null, savedAt: 0, recovered: false, pendingCommands: 0, pendingUids: [], sessionEpoch: 0 };
  private session: GameSession | null = null;
  private live = true;
  private conflict = false;
  private ready = false;
  private commands: { command: Command; reserved: string[]; check: (state: GameState) => boolean; resolve: (ok: boolean) => void }[] = [];
  private processing = false;
  private commandSequence = 0;
  private readonly commandSession = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  private reservations = new Set<string>();
  private updating = false;
  private exclusive = false;
  private updateOperation: Promise<void> | null = null;
  private idleWaiters: (() => void)[] = [];
  private writeFailures = 0;
  private listeners = new Set<(view: GameView) => void>();
  private readonly repository: Repository;
  private readonly acquire: typeof acquireSession;
  private readonly sound: NonNullable<Dependencies['audio']>;
  private readonly now: () => number;

  constructor(private readonly download: (source: string, filename: string) => void, dependencies: Dependencies = {}) {
    this.repository = dependencies.repository ?? new SaveRepository();
    this.acquire = dependencies.acquire ?? acquireSession;
    this.sound = dependencies.audio ?? audio;
    this.now = dependencies.now ?? Date.now;
  }

  subscribe(listener: (view: GameView) => void): () => void {
    this.listeners.add(listener);
    listener(this.view);
    return () => this.listeners.delete(listener);
  }

  private update(change: Partial<GameView>): void {
    if (!this.live) return;
    this.view = { ...this.view, ...change };
    this.listeners.forEach((listener) => listener(this.view));
  }

  setNotice = (notice: GameEvent | null): void => { this.update({ notice }); };

  async start(): Promise<void> {
    if (!this.live || this.view.busy || this.session) return;
    this.update({ busy: true });
    try {
      const ownedSession = await this.acquire((readOnly) => this.update({ readOnly: readOnly || this.conflict || !this.ready }));
      if (!this.live) { ownedSession.release(); return; }
      this.session = ownedSession;
      await this.loadLatest();
    } catch (cause) {
      this.update({ bootError: this.message(cause) });
    } finally { this.update({ busy: false }); }
  }

  private async loadLatest(): Promise<void> {
    this.ready = false;
    this.update({ readOnly: true });
    const loaded = await this.repository.open();
    if (!this.live) return;
    const state = loaded.state ?? createInitialState(this.now());
    const canWrite = this.session?.readOnly === false;
    if (!loaded.state && canWrite) await this.repository.save(state);
    if (!this.live) return;
    this.conflict = false;
    this.ready = true;
    this.publish(state, loaded.state || canWrite ? this.now() : 0, true);
    this.update({
      readOnly: !canWrite, recovered: loaded.recovered,
      error: this.session?.supported === false ? '当前浏览器无法安全协调存档写入，请使用 HTTPS 或本机地址，在支持 Web Locks 的浏览器中打开。' : '',
    });
  }

  private publish(state: GameState, savedAt = this.now(), restoreSession = false): void {
    if (!this.live) return;
    this.update({ state, savedAt, error: '', bootError: '', sessionEpoch: this.view.sessionEpoch + (restoreSession ? 1 : 0) });
    this.sound.configure(state.settings);
  }

  private message(cause: unknown): string { return cause instanceof Error ? cause.message : '本地保存暂时不可用，请保留此页面并重试。'; }

  private failed(cause: unknown): void {
    if (cause instanceof SaveError && cause.code === 'conflict') this.conflict = true;
    this.update({ error: this.message(cause), readOnly: this.conflict || !this.ready || this.session?.readOnly !== false });
  }

  private ensureWriter(requireReady = true, drainingUpdate = false): void {
    if (!this.live) throw new Error('此页面已经关闭，请重新打开游戏。');
    if (this.view.busy && !(drainingUpdate && (this.updating || this.exclusive))) throw new Error('正在保存或恢复存档，请稍候再操作。');
    if (requireReady && !this.ready) throw new Error('请先重新载入最新存档，再继续经营。');
    if (this.conflict || this.session?.readOnly !== false) throw new Error('本窗口暂时只读，请先重新取得经营权限并载入最新进度。');
  }

  /** Capture identity at pointer-up, never reinterpret stale cell indices after an earlier save. */
  dispatch = (input: Command): Promise<boolean> => {
    if (!this.live || !this.view.state || this.view.busy) return Promise.resolve(false);
    try { this.ensureWriter(); } catch (cause) { this.setNotice({ type: 'error', message: this.message(cause) }); return Promise.resolve(false); }
    if (this.commands.length >= 64) { this.setNotice({ type: 'error', message: '操作正在依次保存，请稍候片刻。' }); return Promise.resolve(false); }
    const original = this.view.state;
    const command = { ...input, commandId: input.commandId ?? `${this.commandSession}:${++this.commandSequence}` } as Command;
    const checks: ((state: GameState) => boolean)[] = [];
    const reserved: string[] = [];
    const captureCell = (index: number, target = false) => {
      const entry = original.board[index];
      const uid = entry?.uid ?? null;
      const version = original.cellVersions[index];
      if (uid) reserved.push(uid);
      checks.push((state) => (state.board[index]?.uid ?? null) === uid && state.cellVersions[index] === version);
      if (target) {
        if (command.expectedTargetUid === undefined) command.expectedTargetUid = uid;
        if (command.expectedTargetVersion === undefined) command.expectedTargetVersion = version;
      } else if (uid && command.expectedUid === undefined) command.expectedUid = uid;
    };
    if ('from' in command && typeof command.from === 'number') captureCell(command.from);
    if ('index' in command && typeof command.index === 'number' && ['store', 'sell', 'load'].includes(command.type)) captureCell(command.index);
    if ('to' in command && typeof command.to === 'number') captureCell(command.to, true);
    if ('uid' in command && typeof command.uid === 'string') {
      const uid = command.uid; reserved.push(uid);
      checks.push((state) => [...state.storage, ...state.migrationInbox, ...state.appliances.flatMap((entry) => entry.inputSlots)].some((entry) => entry.uid === uid));
    }
    if ('slot' in command && typeof command.slot === 'number') {
      const slot = command.slot;
      const appliance = original.appliances.find((entry) => entry.slot === slot);
      const signature = JSON.stringify([original.jobs[slot], appliance]);
      reserved.push(`appliance:${slot}`);
      checks.push((state) => JSON.stringify([state.jobs[slot], state.appliances.find((entry) => entry.slot === slot)]) === signature);
      if (appliance && command.expectedVersion === undefined) command.expectedVersion = appliance.version;
      const job = original.jobs[slot] ?? appliance?.job;
      if (job && command.expectedJobId === undefined) command.expectedJobId = job.id;
    }
    if ('appliance' in command && typeof command.appliance === 'string') {
      const id = command.appliance;
      const appliance = original.appliances.find((entry) => entry.id === id);
      const signature = JSON.stringify(appliance);
      reserved.push(`appliance:${id}`);
      checks.push((state) => JSON.stringify(state.appliances.find((entry) => entry.id === id)) === signature);
      if (appliance && command.expectedVersion === undefined) command.expectedVersion = appliance.version;
      if (appliance?.job && command.expectedJobId === undefined) command.expectedJobId = appliance.job.id;
    }
    const requirements = command.type === 'deliver' ? ORDERS.find((order) => order.id === command.order)?.needs
      : command.type === 'cook' ? RECIPES.find((recipe) => recipe.id === command.recipe)?.inputs : undefined;
    if (requirements) {
      const available = [...original.board.filter((item) => item !== null), ...[...original.storage].reverse()];
      const chosen = new Set<string>();
      for (const need of requirements) {
        let remaining = need.count;
        for (const item of available) if (remaining > 0 && item.item === need.item && !chosen.has(item.uid)) {
          chosen.add(item.uid); reserved.push(item.uid); remaining--;
        }
      }
      checks.push((state) => [...chosen].every((uid) => [...state.board, ...state.storage].some((item) => item?.uid === uid)));
    }
    if (command.type === 'upgrade') {
      const shop = command.shop, stage = original.shops[shop];
      reserved.push(`shop:${shop}`);
      checks.push((state) => state.shops[shop] === stage);
    }
    if (reserved.some((uid) => this.reservations.has(uid))) {
      this.setNotice({ type: 'error', message: '这件物品正在落定，请等它落稳后再操作。' });
      return Promise.resolve(false);
    }
    reserved.forEach((uid) => this.reservations.add(uid));
    void this.sound.unlock().catch(() => undefined);
    const result = new Promise<boolean>((resolve) => this.commands.push({ command, reserved, check: (state) => checks.every((check) => check(state)), resolve }));
    this.update({ pendingCommands: this.commands.length + (this.processing ? 1 : 0), pendingUids: [...this.reservations] });
    void this.processCommands();
    return result;
  };

  private async processCommands(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    while (this.live && this.commands.length) {
      const pending = this.commands.shift()!;
      let ok = false;
      try {
        this.ensureWriter(true, true);
        const original = this.view.state!;
        if (!pending.check(original)) {
          this.setNotice({ type: 'error', message: '物品或落点已经改变，这次操作已安全取消。' });
        } else {
          const result = execute(original, pending.command, this.now());
          if (!result.ok) this.setNotice(result.events[0] ?? { type: 'error', message: '现在还不能进行这个操作。' });
          else {
            await this.repository.save(result.state);
            if (this.live) {
              this.publish(result.state);
              const event = result.events.find(entry => entry.type === 'home-unlocked') ?? result.events.find((entry) => entry.type !== 'move');
              if (event) this.setNotice(event);
              if (result.events.some((event) => event.type === 'ready')) this.sound.play('complete');
              else if (result.state.stats.merges > original.stats.merges) this.sound.play('merge');
              else if (pending.command.type === 'generate') this.sound.play('generate');
              else if (pending.command.type === 'deliver') this.sound.play('deliver');
              else if (['cook', 'startCooking'].includes(pending.command.type)) this.sound.play('cook');
              else if (['upgrade', 'build'].includes(pending.command.type)) this.sound.play('upgrade');
              else if (['collect', 'collectAppliance'].includes(pending.command.type)) this.sound.play('complete');
              else if (!['session', 'recover'].includes(pending.command.type)) this.sound.play('click');
              ok = true;
            }
          }
        }
      } catch (cause) {
        this.writeFailures++;
        this.failed(cause);
        // A failed persistence transaction breaks the submitted command chain. No invisible retry.
        this.cancelQueued();
        this.setNotice({ type: 'error', message: `${this.message(cause)} 后续操作已取消，物品仍在原处。` });
      } finally {
        pending.reserved.forEach((uid) => this.reservations.delete(uid));
        pending.resolve(ok);
        this.update({ pendingCommands: this.commands.length, pendingUids: [...this.reservations] });
      }
    }
    this.processing = false;
    this.idleWaiters.splice(0).forEach((resolve) => resolve());
  }

  private cancelQueued(): void {
    this.commands.splice(0).forEach((entry) => { entry.reserved.forEach((uid) => this.reservations.delete(uid)); entry.resolve(false); });
  }

  /** Accept no new input; finish every already accepted write before taking a checkpoint. */
  private async withExclusive(operation: () => Promise<void>, requireReady = true): Promise<void> {
    this.ensureWriter(requireReady);
    this.exclusive = true;
    this.update({ busy: true });
    const failures = this.writeFailures;
    try {
      await Promise.resolve();
      if (this.processing) await new Promise<void>(resolve => this.idleWaiters.push(resolve));
      if (this.writeFailures !== failures) throw new Error('此前操作尚未保存成功，本次操作已取消。请重试。');
      this.ensureWriter(requireReady, true);
      await operation();
    } catch (cause) { this.failed(cause); throw cause; }
    finally { this.exclusive = false; this.update({ busy: false }); }
  }

  canWriteSaves = (): boolean => this.live && !this.conflict && this.session?.readOnly === false;
  listSlots = () => this.repository.listManualSlots();

  saveSlot = (id: SaveSlotId): Promise<void> => this.withExclusive(async () => {
    const now = this.now();
    const captured = execute(this.view.state!, { type: 'recover' }, now);
    if (!captured.ok) throw new Error(captured.events[0]?.message ?? '当前状态暂时无法保存。');
    await this.repository.saveManualSlot(id, captured.state, now);
    this.publish(captured.state, now);
    this.setNotice({ type: 'saved', message: `已保存至存档 ${id}` });
  });

  loadSlot = (id: SaveSlotId): Promise<void> => this.withExclusive(async () => {
    const slot = await this.repository.readManualSlot(id);
    const restored = resumeManualSlot(slot, this.now(), this.view.state);
    await this.repository.replaceCorrupt(restored);
    this.ready = true;
    this.publish(restored, this.now(), true);
    this.update({ readOnly: false, recovered: false, notice: { type: 'loaded', message: `已回到存档 ${id}，继续这段时光吧。` } });
  }, false);

  restartGame = (): Promise<void> => this.withExclusive(async () => {
    const previous = this.view.state!;
    const next = createInitialState(this.now());
    next.settings = { ...previous.settings };
    next.revision = previous.revision + 1;
    await this.repository.save(next);
    this.publish(next, this.now(), true);
    this.update({ recovered: false, notice: { type: 'restart', message: '新的一天，从第一份新鲜开始。原有手动存档已保留。' } });
  });

  /** Freeze new gestures, drain committed commands, then hold the barrier until reload. */
  applyUpdate = (activate: () => Promise<void>): Promise<void> => {
    if (this.updateOperation) return this.updateOperation;
    try { this.ensureWriter(); } catch (cause) { return Promise.reject(cause); }
    this.updating = true;
    this.update({ busy: true });
    const failures = this.writeFailures;
    const operation = (async () => {
      try {
        await Promise.resolve();
        if (this.processing) await new Promise<void>((resolve) => this.idleWaiters.push(resolve));
        if (!this.live) throw new Error('此页面已经关闭，请重新打开游戏。');
        if (this.writeFailures !== failures) throw new Error('操作尚未保存成功，已暂停更新。请保留此页面并重试。');
        this.ensureWriter(true, true);
        await activate();
        // Successful activation reloads the page. Keep controls frozen until that happens.
      } catch (cause) {
        this.updating = false;
        this.updateOperation = null;
        this.update({ busy: false });
        throw cause;
      }
    })();
    this.updateOperation = operation;
    return operation;
  };

  exportSave = (): void => {
    if (this.view.state) this.download(serializeSave(this.view.state), `鹅巷食光-第${this.view.state.day}天-${this.now()}.json`);
  };

  private async backupBeforeReplacement(): Promise<void> {
    if (this.view.state) this.exportSave();
    else this.download(await this.repository.exportRaw(), `鹅巷食光-恢复前原始存档-${this.now()}.json`);
  }

  importSave = async (source: string): Promise<void> => {
    if (this.processing) throw new Error('正在保存，请稍候再导入。');
    this.ensureWriter(false);
    const next = parseSave(source);
    next.revision = (this.view.state?.revision ?? 0) + 1;
    next.undo = null;
    this.update({ busy: true });
    try {
      await this.backupBeforeReplacement();
      await this.repository.replaceCorrupt(next);
      this.ready = true;
      this.publish(next, this.now(), true);
      this.update({ readOnly: false, recovered: false, notice: { type: 'import', message: '替换前的进度已导出，备份恢复成功。' } });
    } catch (cause) { this.failed(cause); throw cause; }
    finally { this.update({ busy: false }); }
  };

  recoverPrevious = async (): Promise<void> => {
    if (this.processing) throw new Error('正在保存，请稍候再恢复。');
    this.ensureWriter(false);
    this.update({ busy: true });
    try {
      await this.backupBeforeReplacement();
      const previous = await this.repository.restorePrevious();
      if (!previous) throw new Error('没有可用的上一份快照，请导入你导出的备份。');
      this.ready = true;
      this.publish(previous, this.now(), true);
      this.update({ readOnly: false, recovered: true, notice: { type: 'restore', message: '恢复前的进度已导出，已恢复上一份快照。' } });
    } catch (cause) { this.failed(cause); throw cause; }
    finally { this.update({ busy: false }); }
  };

  retry = async (): Promise<void> => {
    if (!this.live || this.view.busy || this.processing) return;
    this.update({ busy: true });
    try {
      if (!this.session?.supported) throw new Error('此浏览器暂不支持安全写入，请使用 HTTPS 或本机地址，在支持 Web Locks 的浏览器中打开。');
      if (!await this.session.takeover()) throw new Error('另一窗口仍在经营，关闭它后再试。');
      // Taking the lock must also refresh the state and optimistic revision token.
      await this.loadLatest();
    } catch (cause) {
      this.failed(cause);
      if (!this.view.state) this.update({ bootError: this.message(cause) });
      this.setNotice({ type: 'error', message: this.message(cause) });
    } finally { this.update({ busy: false }); }
  };

  exportRaw = async (): Promise<void> => {
    try { this.download(await this.repository.exportRaw(), '鹅巷食光-原始存档.json'); }
    catch (cause) {
      this.failed(cause);
      if (!this.view.state) this.update({ bootError: this.message(cause) });
    }
  };

  dispose(): void {
    if (!this.live) return;
    this.live = false;
    this.cancelQueued();
    this.listeners.clear();
    this.repository.close();
    this.session?.release();
    this.sound.dispose();
  }
}
