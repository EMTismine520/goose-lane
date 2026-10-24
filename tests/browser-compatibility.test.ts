import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SaveRepository } from '../src/persistence/save';
import { GameController } from '../src/platform/game-controller';

const controllers: GameController[] = [];
let sequence = 0;
const now = 1792800000000;

beforeEach(() => {
  vi.stubGlobal('navigator', {});
  vi.stubGlobal('BroadcastChannel', undefined);
  vi.stubGlobal('isSecureContext', true);
});
afterEach(() => {
  controllers.splice(0).forEach(controller => controller.dispose());
  vi.unstubAllGlobals();
});

function controller(database: string) {
  const instance = new GameController(vi.fn(), {
    repository: new SaveRepository(database), now: () => now,
    audio: { unlock: vi.fn().mockResolvedValue(undefined), configure: vi.fn(), play: vi.fn(), dispose: vi.fn() },
  });
  controllers.push(instance);
  return instance;
}

describe('mobile browsers without Web Locks', () => {
  it('saves and reloads, rejects a stale background page, and resumes only from the latest save', async () => {
    const database = `mobile-compatibility-${++sequence}`;
    const first = controller(database);
    await first.start();
    expect(first.view.readOnly).toBe(false);
    expect(first.view.error).toBe('');
    const second = controller(database);
    await second.start();
    const stale = second.view.state;
    expect(await first.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(true);
    expect(await second.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    expect(second.view.state).toBe(stale);
    expect(second.view.readOnly).toBe(true);
    expect(second.view.error).toContain('另一页面');
    await second.retry();
    expect(second.view.state).toEqual(first.view.state);
    expect(second.view.readOnly).toBe(false);
    expect(await second.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(true);
    // An old tab still cannot overwrite after the other tab reloads and advances.
    expect(await first.dispatch({ type: 'generate', chain: 'fresh-veg' })).toBe(false);
    expect(first.view.readOnly).toBe(true);
    await first.retry();
    expect(first.view.state).toEqual(second.view.state);
    await first.saveSlot(1);
    expect((await first.listSlots())[0].status).toBe('ready');
    const reloaded = controller(database);
    await reloaded.start();
    expect(reloaded.view.state).toEqual(first.view.state);
  });

  it('commits only one initial save when two pages start on an empty device together', async () => {
    const database = `mobile-first-open-${++sequence}`;
    const first = controller(database), second = controller(database);
    await Promise.all([first.start(), second.start()]);
    const reader = controller(database);
    await reader.start();
    expect(reader.view.state?.revision).toBe(0);
    expect(reader.view.state?.energy.value).toBe(60);
    // A racing loser may see a boot error, but never publishes an uncommitted state.
    for (const page of [first, second]) {
      if (page.view.bootError) {
        expect(page.view.state).toBeNull();
        await page.retry();
      }
      expect(page.view.state).toEqual(reader.view.state);
    }
  });
});
