import { describe, expect, it, vi } from 'vitest';
import { refreshBoardViewport } from '../src/game/board-viewport';

describe('board viewport recovery', () => {
  it('remeasures hidden parent bounds before applying FIT so the canvas cannot stay at zero', () => {
    let cachedWidth = 0;
    let displayWidth = 0;
    const parent = { getBoundingClientRect: () => ({ width: 294, height: 378 } as DOMRect) };
    const scale = {
      getParentBounds: vi.fn(() => { cachedWidth = parent.getBoundingClientRect().width; return true; }),
      refresh: vi.fn(() => { displayWidth = cachedWidth; }),
    };
    refreshBoardViewport(scale, parent);
    expect(displayWidth).toBe(294);
    expect(scale.getParentBounds.mock.invocationCallOrder[0]).toBeLessThan(scale.refresh.mock.invocationCallOrder[0]);
  });

  it('does not apply zero dimensions while the page is hidden, then recovers without a window resize', () => {
    let width = 0;
    const parent = { getBoundingClientRect: () => ({ width, height: width * 9 / 7 } as DOMRect) };
    const scale = { getParentBounds: vi.fn(() => true), refresh: vi.fn() };
    expect(refreshBoardViewport(scale, parent)).toBe(false);
    expect(scale.refresh).not.toHaveBeenCalled();
    width = 350;
    expect(refreshBoardViewport(scale, parent)).toBe(true);
    expect(scale.refresh).toHaveBeenCalledOnce();
  });
});
