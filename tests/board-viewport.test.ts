import { describe, expect, it, vi } from 'vitest';
import { boardPixelRatio, boardPoint, refreshBoardViewport } from '../src/game/board-viewport';
import { cellAt, cellCenter } from '../src/game/board-input';

describe('high density board coordinates', () => {
  it.each([1, 2, 3])('keeps all 63 cell centers and outside drops correct at %dx', ratio => {
    for (let index = 0; index < 63; index++) {
      const center = cellCenter(index);
      const point = boardPoint({ x: center.x * ratio, y: center.y * ratio }, ratio);
      expect(cellAt(point.x, point.y)).toBe(index);
    }
    for (const [x, y] of [[-1, 25], [350, 25], [25, -1], [25, 450]]) {
      const point = boardPoint({ x: x * ratio, y: y * ratio }, ratio);
      expect(cellAt(point.x, point.y)).toBeNull();
    }
  });

  it('bounds backing-store allocation and supports fractional desktop display scaling', () => {
    expect([0, 1, 1.25, 2, 2.5, 4, NaN, Infinity].map(boardPixelRatio)).toEqual([1, 1, 2, 2, 3, 3, 1, 1]);
  });
});

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
