import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FRESH_ORDERS } from '../src/content/catalog';
import { BUILD_NODES, homeCookingUnlocked } from '../src/content/board-layouts';
import { execute } from '../src/domain/engine';
import { historicalState as createInitialState } from './chapter-fixtures';
import { reconcileHomeDevices } from '../src/domain/home-progression';
import { SaveRepository, resumeManualSlot } from '../src/persistence/save';
import { GameController } from '../src/platform/game-controller';
import oldOpening from './persistence-v2.fixture.json';

const now = 1792713600000;
let sequence = 0;
const repos: SaveRepository[] = [], controllers: GameController[] = [];
afterEach(() => { controllers.forEach(controller => controller.dispose()); repos.forEach(repo => repo.close()); vi.restoreAllMocks(); });
async function repository() {
  const name = `home-kitchen-${++sequence}`;
  const repo = new SaveRepository(name); repos.push(repo); await repo.open();
  return { repo, name };
}

describe('home kitchen persistence transactions', () => {
  it('rolls back construction on quota failure without automatically granting another chapter', async () => {
    const { repo } = await repository();
    const initial = createInitialState(now);
    initial.completedOrders = FRESH_ORDERS.map(order => order.id);
    initial.construction.completed = BUILD_NODES.slice(0, 2).map(node => node.id);
    initial.board[37] = { uid: `g${initial.nextId++}`, item: 'fresh-veg-3' };
    initial.coins = 108;
    await repo.save(initial);
    const controller = new GameController(() => {}, { repository: repo, now: () => now, acquire: async () => ({ readOnly: false, supported: true, takeover: async () => true, release: () => {} }), audio: { configure: () => {}, play: () => {}, unlock: async () => {}, dispose: () => {} } });
    controllers.push(controller); await controller.start();
    const rawBefore = await repo.exportRaw(), viewBefore = controller.view;
    const put = IDBObjectStore.prototype.put;
    const spy = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function(this: IDBObjectStore, ...args: Parameters<typeof put>) {
      if (args[1] === 'current') throw new DOMException('Quota full', 'QuotaExceededError');
      return put.apply(this, args);
    });
    expect(await controller.dispatch({ type: 'build', node: 'shop-counter' })).toBe(false);
    expect(controller.view.state).toBe(viewBefore.state);
    expect(controller.view.notice?.type).not.toBe('home-unlocked');
    expect(await repo.exportRaw()).toBe(rawBefore);
    spy.mockRestore();
    expect(await controller.dispatch({ type: 'build', node: 'shop-counter' })).toBe(true);
    const state = controller.view.state!;
    expect(homeCookingUnlocked(state)).toBe(true);
    expect(state.board[37]?.uid).toBe(initial.board[37]!.uid);
    expect(state.chapterAccess!.unlocked).toEqual([1]);
    expect(state.board.some(item => item?.uid === initial.board[37]!.uid)).toBe(true);
    expect(state.coins).toBe(0);
    expect(controller.view.notice?.type).toBe('build');
    expect((await repo.open()).state).toEqual(state);
  });
  it('normalizes an old manual checkpoint without rewriting its raw record during list/read', async () => {
    const { repo, name } = await repository(); await repo.save(createInitialState(now));
    const old = structuredClone(oldOpening);
    old.completedOrders = FRESH_ORDERS.map(order => order.id) as never;
    old.construction.completed = BUILD_NODES.map(node => node.id) as never;
    const record = { format: 1, slotId: 1, token: 'old-content-checkpoint', savedAt: now, capturedAt: now, data: JSON.stringify(old) };
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const req = indexedDB.open(name, 1); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
    await new Promise<void>((resolve, reject) => { const transaction = db.transaction('snapshots', 'readwrite'); transaction.objectStore('snapshots').put(record, 'manual-slot-1'); transaction.oncomplete = () => resolve(); transaction.onabort = () => reject(transaction.error); }); db.close();
    const rawBefore = await repo.exportRaw();
    const listed = await repo.listManualSlots();
    expect(listed[0].status).toBe('ready');
    const read = await repo.readManualSlot(1);
    expect(read.state.contentVersion).toBe('5.0.0');
    expect(read.state.appliances).toHaveLength(3);
    expect(await repo.exportRaw()).toBe(rawBefore);
  });
  it('stores independent loaded, cooking and ready pot checkpoints with stable UID and frozen time', async () => {
    const { repo } = await repository();
    let state = createInitialState(now);
    state.completedOrders = FRESH_ORDERS.map(order => order.id);
    state.construction.completed = BUILD_NODES.map(node => node.id); reconcileHomeDevices(state);
    for (const [i, item] of ['fresh-poultry-1', 'fresh-spice-2'].entries()) {
      state.board[i] = { uid: `g${state.nextId++}`, item };
      state = execute(state, { type: 'stageInput', from: i, appliance: 'home-cooking-pot' }, now).state;
    }
    await repo.saveManualSlot(1, state, now);
    state = execute(state, { type: 'startCooking', appliance: 'home-cooking-pot' }, now).state;
    state = execute(state, { type: 'recover' }, now + 8000).state;
    await repo.saveManualSlot(2, state, now + 8000);
    state = execute(state, { type: 'recover' }, now + 18000).state;
    await repo.saveManualSlot(3, state, now + 18000);
    const slots = await repo.listManualSlots();
    const pots = slots.map(slot => slot.status === 'ready' ? slot.state.appliances.at(-1)! : null);
    expect(pots[0]?.inputSlots).toHaveLength(2);
    expect(pots[1]?.job).not.toBeNull(); expect(pots[1]?.outputSlot).toBeNull();
    expect(pots[2]?.outputSlot?.uid).toBe(state.appliances.at(-1)!.outputSlot!.uid);
    const slot = await repo.readManualSlot(2), resumed = resumeManualSlot(slot, now + 86400000);
    expect(resumed.appliances.at(-1)!.job!.endsAt - resumed.lastSeen).toBe(10000);
  });
});
