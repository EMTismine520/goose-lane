import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALL_DEVICES } from '../src/content/board-layouts';
import { deviceAssetPath, itemAssetPath } from '../src/content/assets';
import { ITEMS } from '../src/content/catalog';

describe('native SVG image loading', () => {
  it('gives every board SVG an intrinsic size so Canvas draws the full icon without Blob conversion', () => {
    const paths = new Set([
      ...Object.keys(ITEMS).map(itemAssetPath),
      ...ALL_DEVICES.map(device => deviceAssetPath(device.id)),
      'assets/entities/crate.svg',
    ].filter((path): path is string => !!path?.endsWith('.svg')));
    expect(paths.size).toBeGreaterThan(0);
    for (const path of paths) {
      const root = readFileSync('public/' + path, 'utf8').match(/<svg\b[^>]*>/)?.[0];
      expect(root, path).toMatch(/\bwidth="96"/);
      expect(root, path).toMatch(/\bheight="96"/);
      expect(root, path).toContain('viewBox="0 0 96 96"');
    }
  });
});
