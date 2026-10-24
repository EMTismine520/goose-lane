import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HOME_CHAINS, HOME_RECIPES } from '../src/content/catalog';
import { HOME_DEVICES } from '../src/content/board-layouts';
import { deviceAssetPath, itemAssetPath } from '../src/content/assets';

describe('home kitchen published assets', () => {
  it('ships every independent icon, preserving existing manifest entries and the runtime budget', () => {
    const items = [...HOME_CHAINS.flatMap(chain => chain.items), ...HOME_RECIPES.map(recipe => recipe.output)];
    const paths = [...items.map(item => [item, itemAssetPath(item)!]), ...HOME_DEVICES.map(device => [device.id, deviceAssetPath(device.id)])];
    expect(paths).toHaveLength(38);
    const manifest = JSON.parse(readFileSync('public/assets/manifest.json', 'utf8')) as { assetId: string; frame: string }[];
    expect(manifest.some(row => row.assetId === 'fresh-veg-1' && row.frame.endsWith('.svg'))).toBe(true);
    let bytes = 0;
    for (const [id, path] of paths) {
      const file = readFileSync('public/' + path);
      expect(file.subarray(8, 12).toString()).toBe('WEBP');
      bytes += file.byteLength;
      expect(manifest.filter(row => row.assetId === id)).toEqual([expect.objectContaining({ frame: path })]);
      const png = readFileSync('art/home-cooking/masters/' + id + '.png');
      expect(png.readUInt32BE(16)).toBe(512); expect(png.readUInt32BE(20)).toBe(512);
      expect(statSync('art/home-cooking/masters/' + id + '.png').size).toBeGreaterThan(1000);
    }
    expect(bytes).toBeLessThanOrEqual(1024 * 1024);
  });
});
