import { afterEach, describe, expect, it, vi } from 'vitest';
import { installGameViewport } from '../src/platform/viewport';

let cleanup: (() => void) | undefined;
afterEach(() => { cleanup?.(); cleanup = undefined; vi.unstubAllGlobals(); });

function environment(mobile = true, wide = false) {
  const values = new Map<string, string>();
  const root = { dataset: {} as Record<string, string>, style: {
    getPropertyValue: (key: string) => values.get(key) ?? '',
    setProperty: (key: string, value: string) => values.set(key, value),
    removeProperty: (key: string) => values.delete(key),
  } };
  const original = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  const viewport = { content: original };
  const visual = Object.assign(new EventTarget(), { height: wide ? 1500 : 780, scale: wide ? 0.52 : 1 });
  const page = Object.assign(new EventTarget(), { innerWidth: wide ? 750 : 390, innerHeight: wide ? 1500 : 780, screen: { width: 390 }, visualViewport: visual });
  vi.stubGlobal('window', page);
  vi.stubGlobal('navigator', { userAgent: mobile ? 'Mozilla/5.0 Android Quark/7.8.0' : 'Mozilla/5.0 Windows Chrome/142' });
  vi.stubGlobal('document', { documentElement: root, querySelector: () => viewport });
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  return { page, root, viewport, visual, values, original };
}

describe('game viewport sizing', () => {
  it('repairs a wide mobile viewport and follows browser toolbar height changes', () => {
    const { page, root, viewport, visual, values, original } = environment(true, true);
    cleanup = installGameViewport();
    expect(viewport.content).toBe('width=390, initial-scale=1.0, viewport-fit=cover');
    expect(root.dataset.mobileViewport).toBe('true');
    page.innerWidth = 390; page.innerHeight = 780; visual.scale = 1; visual.height = 700;
    visual.dispatchEvent(new Event('resize'));
    expect(values.get('--app-height')).toBe('700px');
    visual.height = 780;
    page.dispatchEvent(new Event('resize'));
    expect(values.get('--app-height')).toBe('780px');
    page.dispatchEvent(new Event('orientationchange'));
    expect(viewport.content).toBe(original);
    cleanup(); cleanup = undefined;
    expect(values.has('--app-height')).toBe(false);
    expect(root.dataset.mobileViewport).toBeUndefined();
    visual.height = 600; visual.dispatchEvent(new Event('resize'));
    expect(values.has('--app-height')).toBe(false);
  });

  it('preserves pinch zoom rather than shrinking the layout to the zoomed visual area', () => {
    const { page, visual, viewport, values, original } = environment();
    cleanup = installGameViewport();
    visual.scale = 2; visual.height = 390;
    visual.dispatchEvent(new Event('resize'));
    expect(values.get('--app-height')).toBe(`${page.innerHeight}px`);
    expect(viewport.content).toBe(original);
  });

  it('does not apply mobile layout or change the desktop viewport', () => {
    const { page, root, viewport, values, original } = environment(false);
    page.innerWidth = 1280; page.innerHeight = 1024; page.visualViewport.height = 1024;
    cleanup = installGameViewport();
    expect(root.dataset.mobileViewport).toBeUndefined();
    expect(viewport.content).toBe(original);
    expect(values.get('--app-height')).toBe('1024px');
  });
});
