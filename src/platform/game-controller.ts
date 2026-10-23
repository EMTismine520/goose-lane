import type { Command, GameEvent, GameState } from '../domain/types';
import { createInitialState, execute } from '../domain/engine';
import { SaveError, SaveRepository, parseSave, serializeSave } from '../persistence/save';
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
}
type Repository = Pick<SaveRepository, 'open' | 'save' | 'restorePrevious' | 'replaceCorrupt' | 'exportRaw' | 'close'>;
interface Dependencies {
  repository?: Repository;
  acquire?: typeof acquireSession;
  audio?: Pick<typeof audio, 'unlock' | 'configure' | 'play' | 'dispose'>;
  now?: () => number;
}

/** Owns the async boundary: the UI only observes states whose transaction committed. */
export class GameController {
  view: GameView = { state: null, readOnly: true, busy: false, error: '', bootError: '', notice: null, savedAt: 0, recovered: false };
  private session: GameSession | null = null;
  private live = true;
  private conflict = false;
  private ready = false;
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
    this.publish(state, loaded.state || canWrite ? this.now() : 0);
    this.update({
      readOnly: !canWrite, recovered: loaded.recovered,
      error: this.session?.supported === false ? '当前浏览器无法安全协调存档写入，请使用 HTTPS 或本机地址，在支持 Web Locks 的浏览器中打开。' : '',
    });
  }

  private publish(state: GameState, savedAt = this.now()): void {
    if (!this.live) return;
    this.update({ state, savedAt, error: '', bootError: '' });
    this.sound.configure(state.settings);
  }

  private message(cause: unknown): string { return cause instanceof Error ? cause.message : '本地保存暂时不可用，请导出备份后重试。'; }

  private failed(cause: unknown): void {
    if (cause instanceof SaveError && cause.code === 'conflict') this.conflict = true;
    this.update({ error: this.message(cause), readOnly: this.conflict || !this.ready || this.session?.readOnly !== false });
  }

  private ensureWriter(requireReady = true): void {
    if (!this.live) throw new Error('此页面已经关闭，请重新打开游戏。');
    if (this.view.busy) throw new Error('正在保存，请稍候再操作。');
    if (requireReady && !this.ready) throw new Error('请先重新载入最新存档，再继续经营。');
    if (this.conflict || this.session?.readOnly !== false) throw new Error('本窗口暂时只读，请先重新取得经营权限并载入最新进度。');
  }

  dispatch = async (command: Command): Promise<boolean> => {
    if (!this.live || !this.view.state || this.view.busy) return false;
    try { this.ensureWriter(); } catch (cause) { this.setNotice({ type: 'error', message: this.message(cause) }); return false; }
    const original = this.view.state;
    void this.sound.unlock().catch(() => undefined);
    const result = execute(original, command, this.now());
    if (!result.ok) { this.setNotice(result.events[0] ?? { type: 'error', message: '现在还不能进行这个操作。' }); return false; }
    this.update({ busy: true });
    try {
      await this.repository.save(result.state);
      if (!this.live) return false;
      this.publish(result.state);
      const event = result.events.find((entry) => entry.type !== 'move');
      if (event) this.setNotice(event);
      if (command.type === 'move' && result.state.stats.merges > original.stats.merges) this.sound.play('merge');
      else if (command.type === 'generate' || command.type === 'deliver' || command.type === 'cook' || command.type === 'upgrade') this.sound.play(command.type);
      else this.sound.play('click');
      return true;
    } catch (cause) { this.failed(cause); return false; }
    finally { this.update({ busy: false }); }
  };

  exportSave = (): void => {
    if (this.view.state) this.download(serializeSave(this.view.state), `鹅巷食光-第${this.view.state.day}天-${this.now()}.json`);
  };

  private async backupBeforeReplacement(): Promise<void> {
    if (this.view.state) this.exportSave();
    else this.download(await this.repository.exportRaw(), `鹅巷食光-恢复前原始存档-${this.now()}.json`);
  }

  importSave = async (source: string): Promise<void> => {
    this.ensureWriter(false);
    const next = parseSave(source);
    next.revision = (this.view.state?.revision ?? 0) + 1;
    next.undo = null;
    this.update({ busy: true });
    try {
      await this.backupBeforeReplacement();
      await this.repository.replaceCorrupt(next);
      this.ready = true;
      this.publish(next);
      this.update({ readOnly: false, recovered: false, notice: { type: 'import', message: '替换前的进度已导出，备份恢复成功。' } });
    } catch (cause) { this.failed(cause); throw cause; }
    finally { this.update({ busy: false }); }
  };

  recoverPrevious = async (): Promise<void> => {
    this.ensureWriter(false);
    this.update({ busy: true });
    try {
      await this.backupBeforeReplacement();
      const previous = await this.repository.restorePrevious();
      if (!previous) throw new Error('没有可用的上一份快照，请导入你导出的备份。');
      this.ready = true;
      this.publish(previous);
      this.update({ readOnly: false, recovered: true, notice: { type: 'restore', message: '恢复前的进度已导出，已恢复上一份快照。' } });
    } catch (cause) { this.failed(cause); throw cause; }
    finally { this.update({ busy: false }); }
  };

  retry = async (): Promise<void> => {
    if (!this.live || this.view.busy) return;
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
    this.listeners.clear();
    this.repository.close();
    this.session?.release();
    this.sound.dispose();
  }
}
