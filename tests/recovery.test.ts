import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const html = await readFile('public/recover.html', 'utf8');
const script = html.match(/<script>([\s\S]+?)<\/script>/)![1];
const gameScope = 'https://emtismine520.github.io/goose-lane/';
const previewRoot = 'https://emtismine520.github.io/goose-lane-art-preview/';

function recoveryHarness(serviceWorker?: { getRegistration: ReturnType<typeof vi.fn> }) {
  let click!: () => Promise<void>;
  const button = { disabled: false, addEventListener: (_event: string, handler: typeof click) => { click = handler; } };
  const status = { textContent: '' };
  const location = { href: previewRoot + 'recover.html', replace: vi.fn() };
  const storage = { deleteDatabase: vi.fn(), clear: vi.fn(), delete: vi.fn() };
  runInNewContext(script, {
    URL, Promise, navigator: { serviceWorker }, location,
    document: { getElementById: (id: string) => id === 'repair' ? button : status },
    indexedDB: storage, localStorage: storage, sessionStorage: storage, caches: storage,
  });
  return { click: () => click(), button, status, location, storage };
}

describe('recovery outside the broken game worker scope', () => {
  it('unregisters only the exact old game worker and opens the isolated comparison without deleting any storage', async () => {
    const unregister = vi.fn(async () => true);
    const getRegistration = vi.fn(async () => ({ scope: gameScope, unregister }));
    const page = recoveryHarness({ getRegistration });
    await page.click();
    expect(getRegistration).toHaveBeenCalledExactlyOnceWith(gameScope);
    expect(unregister).toHaveBeenCalledOnce();
    expect(page.location.replace).toHaveBeenCalledExactlyOnceWith(previewRoot + 'food-styles.html');
    expect(page.location.href.startsWith(gameScope)).toBe(false);
    expect(page.storage.deleteDatabase).not.toHaveBeenCalled();
    expect(page.storage.clear).not.toHaveBeenCalled();
    expect(page.storage.delete).not.toHaveBeenCalled();
  });

  it('leaves an unrelated broader worker intact', async () => {
    const unregister = vi.fn(async () => true);
    const page = recoveryHarness({ getRegistration: vi.fn(async () => ({ scope: 'https://emtismine520.github.io/', unregister })) });
    await page.click();
    expect(unregister).not.toHaveBeenCalled();
    expect(page.location.replace).toHaveBeenCalledWith(previewRoot + 'food-styles.html');
  });

  it.each([undefined, { getRegistration: vi.fn(async () => undefined) }])('opens the preview when no worker needs repair', async serviceWorker => {
    const page = recoveryHarness(serviceWorker);
    await page.click();
    expect(page.location.replace).toHaveBeenCalledWith(previewRoot + 'food-styles.html');
  });

  it('keeps retry and direct preview available if unregister fails', async () => {
    const page = recoveryHarness({ getRegistration: vi.fn(async () => ({ scope: gameScope, unregister: async () => { throw new Error('unavailable'); } })) });
    await page.click();
    expect(page.location.replace).not.toHaveBeenCalled();
    expect(page.button.disabled).toBe(false);
    expect(page.status.textContent).toContain('请重试');
    expect(html).toContain('href="./food-styles.html"');
  });
});
