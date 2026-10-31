import { describe, expect, it } from 'vitest';
import { getMergeLayout } from '../src/ui/ui-guidance';

const input = (width: number, height: number) => ({ width, height,
  resourceHeight: height >= 740 ? 56 : 48, ordersHeight: height < 640 ? 78 : height < 740 ? 92 : 112, guideHeight: 24 });
describe('mobile board and enlarged dock geometry', () => {
  it.each([
    [360, 720, 47, 109], [390, 780, 51, 105], [390, 844, 51, 144], [430, 932, 57, 144],
  ])('uses the planned square board at %i×%i', (width, height, cell, footerHeight) => {
    expect(getMergeLayout(input(width, height))).toEqual({ cell, footerHeight, scroll: false });
  });
  it.each([320, 360, 390, 430])('keeps all nine rows reachable at width %i across toolbar and density changes', width => {
    for (const height of [500, 568, 605, 606, 639, 640, 700, 739, 740, 780, 844, 932]) {
      const sizes = input(width, height), layout = getMergeLayout(sizes);
      const available = height - sizes.resourceHeight - sizes.ordersHeight - sizes.guideHeight - layout.footerHeight;
      expect(layout.cell * 7 + 12).toBeLessThanOrEqual(width - 16);
      expect(layout.footerHeight).toBeGreaterThanOrEqual(104);
      expect(layout.footerHeight).toBeLessThanOrEqual(144);
      expect(layout.scroll).toBe(layout.cell * 9 + 12 > available);
      if (!layout.scroll) expect(layout.cell * 9 + 12).toBeLessThanOrEqual(available);
    }
  });
  it('scrolls short screens even outside the old tiny density bucket', () => {
    expect(getMergeLayout(input(320, 606))).toEqual({ cell: 40, footerHeight: 104, scroll: true });
    expect(getMergeLayout(input(360, 639)).scroll).toBe(false);
    expect(getMergeLayout(input(390, 500)).scroll).toBe(true);
  });
  it('responds to measured chrome rather than assuming device screen height', () => {
    const original = input(390, 780);
    const before = getMergeLayout(original);
    const after = getMergeLayout({ ...original, height: 700, ordersHeight: 112 });
    expect(after.cell).toBeLessThan(before.cell);
    expect(after.footerHeight).toBe(104);
  });
  it('does not invent overflow from browser subpixel measurement error at an exact fit', () => {
    expect(getMergeLayout({ ...input(360, 640), height: 639.99999, resourceHeight: 48.000004, ordersHeight: 92.000004, guideHeight: 24.000002 }))
      .toEqual({ cell: 40, footerHeight: 104, scroll: false });
  });
});
