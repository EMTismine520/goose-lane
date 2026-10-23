import { APPLIANCES, CHAINS, CONTENT_VERSION, DECORATIONS, ITEMS, ORDERS, RECIPES, SCHEMA_VERSION, SHOPS } from '../content/catalog';
import type { GameState, ItemInstance } from '../domain/types';

const MAX_SAVE_BYTES = 1_000_000;
const MAX_COUNTER = 1_000_000_000_000;
const STORE = 'snapshots';
type RecordValue = Record<string, unknown>;
interface Snapshot { format: 1; token: string; data: string; savedAt: number; }

export class SaveError extends Error {
  constructor(message: string, public readonly code: 'invalid' | 'future' | 'conflict' | 'storage' | 'corrupt', options?: ErrorOptions) {
    super(message, options);
    this.name = 'SaveError';
  }
}

const invalid = (path: string): never => { throw new SaveError(`存档中的「${path}」无效，未修改现有进度。`, 'invalid'); };
function object(value: unknown, path: string, keys?: string[]): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid(path);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return invalid(path);
  const record = value as RecordValue;
  if (Object.keys(record).some((key) => key === '__proto__' || key === 'constructor' || key === 'prototype' || (keys && !keys.includes(key)))) return invalid(path);
  return record;
}
function integer(value: unknown, path: string, min = 0, max = MAX_COUNTER): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) return invalid(path);
  return value;
}
function boolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') return invalid(path);
  return value;
}
function text(value: unknown, path: string, max = 80): string {
  if (typeof value !== 'string' || !value.length || value.length > max || /[\u0000-\u001f]/.test(value)) return invalid(path);
  return value;
}
function array(value: unknown, path: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) return invalid(path);
  for (let index = 0; index < value.length; index++) if (!(index in value)) return invalid(path);
  return value;
}
function known(value: unknown, choices: readonly string[], path: string): string {
  const id = text(value, path);
  if (!choices.includes(id)) return invalid(path);
  return id;
}
function uniqueIds(value: unknown, choices: readonly string[], path: string): string[] {
  const ids = array(value, path, choices.length).map((entry) => known(entry, choices, path));
  if (new Set(ids).size !== ids.length) return invalid(path);
  return ids;
}

/** v0 was the local prototype: same inventory, muted flag, no contentVersion/capacity/undo. */
function migrate(value: unknown): RecordValue {
  const source = object(value, '根对象');
  const version = integer(source.schemaVersion, '版本', 0, Number.MAX_SAFE_INTEGER);
  if (version > SCHEMA_VERSION) throw new SaveError('这是较新版本的存档，请使用新版游戏打开。原档已保留。', 'future');
  if (version === SCHEMA_VERSION) return source;
  if (version !== 0) return invalid('版本');
  const settings = object(source.settings, '旧版设置', ['muted', 'volume']);
  boolean(settings.muted, '旧版静音');
  if ('contentVersion' in source || 'storageCapacity' in source || 'undo' in source) return invalid('旧版结构');
  return {
    ...source, schemaVersion: SCHEMA_VERSION, contentVersion: CONTENT_VERSION, storageCapacity: 8, undo: null,
    settings: { music: !settings.muted, sound: !settings.muted, volume: settings.volume, reducedMotion: false },
  };
}

/** Validate every persisted field and build a detached, bounded, known-shape state. */
export function validateSave(input: unknown): GameState {
  const value = object(migrate(input), '根对象', ['schemaVersion', 'contentVersion', 'revision', 'seed', 'nextId', 'board', 'storage', 'storageCapacity', 'generators', 'jobs', 'completedOrders', 'day', 'coins', 'reputation', 'shops', 'decorations', 'discovered', 'stats', 'tutorial', 'settings', 'lastSeen', 'undo']);
  if (value.contentVersion !== CONTENT_VERSION) throw new SaveError('存档内容版本不兼容，请使用对应版本游戏；原档未被覆盖。', 'future');
  const day = integer(value.day, '经营日', 1, 6);
  const revision = integer(value.revision, '修订号');
  const nextId = integer(value.nextId, '下一个编号', 1);
  const itemIds = Object.keys(ITEMS);
  const used = new Set<string>();
  const takeUid = (value: unknown, path: string): string => {
    const uid = text(value, path);
    const match = /^g([1-9]\d*)$/.exec(uid);
    if (!match || !Number.isSafeInteger(Number(match[1])) || Number(match[1]) >= nextId || used.has(uid)) return invalid(path);
    used.add(uid);
    return uid;
  };
  const item = (raw: unknown, path: string): ItemInstance => {
    const entry = object(raw, path, ['uid', 'item']);
    return { uid: takeUid(entry.uid, `${path}编号`), item: known(entry.item, itemIds, `${path}物品`) };
  };
  const board = array(value.board, '棋盘', 56).map((raw, index) => raw === null ? null : item(raw, `棋盘${index + 1}`));
  if (board.length !== 56 || board.some((entry, index) => entry && index >= (day < 3 ? 42 : day < 5 ? 49 : 56))) return invalid('棋盘格数');
  const storageCapacity = integer(value.storageCapacity, '仓库容量', 8, 8);
  const storage = array(value.storage, '仓库', storageCapacity).map((raw, index) => item(raw, `仓库${index + 1}`));
  const generatorKeys = CHAINS.map((chain) => chain.id);
  const generatorRaw = object(value.generators, '生产器', generatorKeys);
  const generators = Object.fromEntries(generatorKeys.map((id) => {
    const entry = object(generatorRaw[id], `生产器${id}`, ['remaining', 'readyAt']);
    return [id, { remaining: integer(entry.remaining, '生产器配额', 0, 12), readyAt: integer(entry.readyAt, '生产器时间', 0, Number.MAX_SAFE_INTEGER) }];
  }));
  const jobs = array(value.jobs, '加工槽', APPLIANCES.length).map((raw, slot) => {
    if (raw === null) return null;
    const entry = object(raw, '加工任务', ['id', 'recipe', 'startedAt', 'endsAt']);
    const recipe = known(entry.recipe, RECIPES.map((recipe) => recipe.id), '加工配方');
    const definition = RECIPES.find((entry) => entry.id === recipe)!;
    const startedAt = integer(entry.startedAt, '开始时间', 0, Number.MAX_SAFE_INTEGER);
    const endsAt = integer(entry.endsAt, '结束时间', startedAt, Number.MAX_SAFE_INTEGER);
    if (definition.appliance !== slot || definition.unlockDay > day) return invalid('加工槽配方');
    return { id: takeUid(entry.id, '加工编号'), recipe, startedAt, endsAt };
  });
  if (jobs.length !== APPLIANCES.length) return invalid('加工槽数量');
  const completedOrders = uniqueIds(value.completedOrders, ORDERS.map((order) => order.id), '已完成订单');
  if (completedOrders.some((id) => ORDERS.find((order) => order.id === id)!.day > day)) return invalid('订单经营日');
  const coins = integer(value.coins, '金币');
  const shopKeys = SHOPS.map((shop) => shop.id);
  const shopRaw = object(value.shops, '店铺', shopKeys);
  const shops = Object.fromEntries(SHOPS.map((shop) => [shop.id, integer(shopRaw[shop.id], `店铺${shop.id}`, 0, shop.costs.length)]));
  const decorations = uniqueIds(value.decorations, DECORATIONS.map((entry) => entry.id), '装饰');
  const discovered = uniqueIds(value.discovered, itemIds, '图鉴');
  const statsRaw = object(value.stats, '统计', ['merges', 'generated', 'cooked', 'earned']);
  const settingsRaw = object(value.settings, '设置', ['music', 'sound', 'reducedMotion', 'volume']);
  if (typeof settingsRaw.volume !== 'number' || !Number.isFinite(settingsRaw.volume) || settingsRaw.volume < 0 || settingsRaw.volume > 1) return invalid('音量');
  let undo: GameState['undo'] = null;
  if (value.undo !== null) {
    const entry = object(value.undo, '撤销', ['item', 'index', 'coins', 'revision']);
    const index = integer(entry.index, '撤销位置', 0, (day < 3 ? 42 : day < 5 ? 49 : 56) - 1);
    const undoItem = item(entry.item, '撤销物品');
    const undoCoins = integer(entry.coins, '撤销金币', 0, coins);
    if (board[index] !== null || entry.revision !== revision || ITEMS[undoItem.item].sell !== undoCoins) return invalid('撤销状态');
    undo = { item: undoItem, index, coins: undoCoins, revision };
  }
  return {
    schemaVersion: SCHEMA_VERSION, contentVersion: CONTENT_VERSION, revision,
    seed: integer(value.seed, '随机种子', 0, 0xffffffff), nextId, board, storage, storageCapacity,
    generators, jobs, completedOrders, day, coins, reputation: integer(value.reputation, '声望'), shops, decorations, discovered,
    stats: { merges: integer(statsRaw.merges, '合成统计'), generated: integer(statsRaw.generated, '生产统计'), cooked: integer(statsRaw.cooked, '料理统计'), earned: integer(statsRaw.earned, '收入统计') },
    tutorial: integer(value.tutorial, '教学进度', 0, 5),
    settings: { music: boolean(settingsRaw.music, '音乐开关'), sound: boolean(settingsRaw.sound, '音效开关'), reducedMotion: boolean(settingsRaw.reducedMotion, '减少动态'), volume: settingsRaw.volume },
    lastSeen: integer(value.lastSeen, '最后游玩时间', 0, Number.MAX_SAFE_INTEGER), undo,
  };
}

export function serializeSave(state: GameState): string { return JSON.stringify(validateSave(state), null, 2); }
export function parseSave(source: string): GameState {
  if (typeof source !== 'string' || source.length > MAX_SAVE_BYTES || new TextEncoder().encode(source).length > MAX_SAVE_BYTES) throw new SaveError('存档文件超过 1 MB 限制。', 'invalid');
  let value: unknown;
  try { value = JSON.parse(source); } catch (cause) { throw new SaveError('存档不是有效的 JSON 文件，现有进度未修改。', 'invalid', { cause }); }
  return validateSave(value);
}

function request<T>(result: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { result.onsuccess = () => resolve(result.result); result.onerror = () => reject(result.error); });
}
function completed(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('事务已中止'));
    transaction.onerror = () => { /* onabort carries the final transaction outcome. */ };
  });
}
function snapshot(raw: unknown): Snapshot | null {
  if (raw === undefined || raw === null) return null;
  const record = object(raw, '存储记录', ['format', 'token', 'data', 'savedAt']);
  if (record.format !== 1 || typeof record.data !== 'string') return invalid('存储记录');
  return { format: 1, token: text(record.token, '存储标记', 120), data: record.data, savedAt: integer(record.savedAt, '保存时间', 0, Number.MAX_SAFE_INTEGER) };
}
function tokenOf(raw: unknown): unknown { return raw && typeof raw === 'object' ? (raw as { token?: unknown }).token : null; }
function newToken(): string { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function storageError(cause: unknown): SaveError {
  if (cause instanceof SaveError) return cause;
  const name = cause && typeof cause === 'object' && 'name' in cause ? String(cause.name) : '';
  return new SaveError(name === 'QuotaExceededError' ? '设备存储空间不足，进度未保存。请先导出备份，再清理空间。' : '无法保存到设备。请保留此页面并导出备份，再检查浏览器存储权限。', 'storage', { cause });
}

export class SaveRepository {
  private database: IDBDatabase | null = null;
  private expectedToken: unknown = null;
  private revision = -1;
  private opened = false;
  private corrupt = false;
  private queue: Promise<void> = Promise.resolve();
  private opening: Promise<{ state: GameState | null; recovered: boolean }> | null = null;

  constructor(private readonly databaseName = 'goose-lane-v1') {}

  async open(): Promise<{ state: GameState | null; recovered: boolean }> {
    if (this.opening) return this.opening;
    this.opening = this.openInternal();
    try { return await this.opening; } finally { this.opening = null; }
  }

  private async openInternal(): Promise<{ state: GameState | null; recovered: boolean }> {
    this.corrupt = false;
    try {
      if (!this.database) {
        if (typeof indexedDB === 'undefined') throw new Error('此浏览器没有 IndexedDB');
        this.database = await new Promise<IDBDatabase>((resolve, reject) => {
          const opening = indexedDB.open(this.databaseName, 1);
          opening.onupgradeneeded = () => { if (!opening.result.objectStoreNames.contains(STORE)) opening.result.createObjectStore(STORE); };
          opening.onsuccess = () => resolve(opening.result);
          opening.onerror = () => reject(opening.error);
          opening.onblocked = () => reject(new SaveError('存档升级被其他页面占用，请关闭其他游戏页面后重试。', 'storage'));
        });
        this.database.onversionchange = () => { this.database?.close(); this.database = null; this.opened = false; };
      }
      const transaction = this.database.transaction(STORE, 'readonly');
      const done = completed(transaction);
      const [rawCurrent, rawPrevious] = await Promise.all([request(transaction.objectStore(STORE).get('current')), request(transaction.objectStore(STORE).get('previous'))]);
      await done;
      this.expectedToken = tokenOf(rawCurrent);
      if (rawCurrent === undefined && rawPrevious === undefined) {
        this.opened = true; this.revision = -1;
        return { state: null, recovered: false };
      }
      let state: GameState | null = null;
      let currentFailure: unknown;
      try { const current = snapshot(rawCurrent); if (current) state = parseSave(current.data); } catch (cause) { currentFailure = cause; }
      if (currentFailure instanceof SaveError && currentFailure.code === 'future') throw currentFailure;
      const recovered = state === null;
      if (!state) {
        try { const previous = snapshot(rawPrevious); if (previous) state = parseSave(previous.data); } catch { /* Keep both original records for export. */ }
        if (!state) throw new SaveError('当前存档和上一份备份均无法读取。请导出原档或导入有效备份；原档仍被保留。', 'corrupt', { cause: currentFailure });
      }
      this.opened = true; this.revision = state.revision;
      return { state, recovered };
    } catch (cause) { this.opened = false; this.corrupt = cause instanceof SaveError && cause.code === 'corrupt'; throw storageError(cause); }
  }

  save(state: GameState): Promise<void> {
    let data: string;
    try { data = serializeSave(state); } catch (cause) { return Promise.reject(cause); }
    const revision = state.revision;
    const operation = this.queue.then(() => this.commit(data, revision, false));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  private async commit(data: string, revision: number, restoring: boolean, replacingCorrupt = false): Promise<void> {
    if (!this.database || (!this.opened && !(replacingCorrupt && this.corrupt))) throw new SaveError('存档尚未成功打开，不能覆盖设备上的原档。请先导出备份。', 'storage');
    if (!restoring && revision < this.revision) throw new SaveError('这份进度已过期，未覆盖较新的存档。请重新载入。', 'conflict');
    const database = this.database;
    const candidate: Snapshot = { format: 1, token: newToken(), data, savedAt: Date.now() };
    let failure: SaveError | null = null;
    try {
      const transaction = database.transaction(STORE, 'readwrite');
      const done = completed(transaction);
      const store = transaction.objectStore(STORE);
      const currentRequest = store.get('current');
      const previousRequest = replacingCorrupt ? store.get('previous') : null;
      // All reads, comparison and both writes execute inside this one IDB transaction.
      const write = () => {
        try {
          const rawCurrent: unknown = currentRequest.result;
          if (tokenOf(rawCurrent) !== this.expectedToken) {
            failure = new SaveError('另一页面已保存新进度，此页面已停止写入。请导出当前进度或重新载入。', 'conflict');
            transaction.abort();
            return;
          }
          if (replacingCorrupt) {
            store.put({ current: rawCurrent, previous: previousRequest?.result }, 'recovery');
            store.delete('previous');
          } else if (rawCurrent !== undefined) {
            let valid: Snapshot | null = null;
            try { const current = snapshot(rawCurrent); if (current) { parseSave(current.data); valid = current; } } catch { /* Preserve damaged input verbatim. */ }
            // Never turn a corrupt current snapshot into the last known-good backup.
            if (valid) store.put(valid, 'previous');
            else store.put(rawCurrent, 'recovery');
          }
          store.put(candidate, 'current');
        } catch (cause) {
          failure = storageError(cause);
          transaction.abort();
        }
      };
      if (previousRequest) previousRequest.onsuccess = write;
      else currentRequest.onsuccess = write;
      await done;
      this.expectedToken = candidate.token;
      this.revision = revision;
      this.opened = true;
      this.corrupt = false;
    } catch (cause) { throw failure || storageError(cause); }
  }

  /** Explicit user import only: preserve both unreadable originals before replacing them. */
  replaceCorrupt(state: GameState): Promise<void> {
    if (!this.corrupt) return this.save(state);
    let data: string;
    try { data = serializeSave(state); } catch (cause) { return Promise.reject(cause); }
    const operation = this.queue.then(() => this.commit(data, state.revision, true, true));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  async restorePrevious(): Promise<GameState | null> {
    await this.queue;
    if (!this.database || !this.opened) throw new SaveError('请先成功打开存档，再恢复备份。', 'storage');
    const transaction = this.database.transaction(STORE, 'readonly');
    const done = completed(transaction);
    const rawPrevious = await request(transaction.objectStore(STORE).get('previous'));
    await done;
    const previous = snapshot(rawPrevious);
    if (!previous) return null;
    const restored = parseSave(previous.data);
    // Rebase the restored inventory to a new revision, so outstanding older writes stay stale.
    restored.revision = Math.max(this.revision, restored.revision) + 1;
    restored.undo = null;
    const operation = this.queue.then(() => this.commit(serializeSave(restored), restored.revision, true));
    this.queue = operation.catch(() => undefined);
    await operation;
    return restored;
  }

  /** Export untouched records even if semantic validation fails; for repair/support only. */
  async exportRaw(): Promise<string> {
    if (!this.database) throw new SaveError('设备存储当前不可访问，无法读取原始存档。', 'storage');
    const transaction = this.database.transaction(STORE, 'readonly');
    const done = completed(transaction);
    const store = transaction.objectStore(STORE);
    const [current, previous, recovery] = await Promise.all(['current', 'previous', 'recovery'].map((key) => request(store.get(key))));
    await done;
    return JSON.stringify({ format: 'goose-lane-recovery-v1', current, previous, recovery }, null, 2);
  }

  close(): void { this.database?.close(); this.database = null; this.opened = false; this.corrupt = false; }
}
