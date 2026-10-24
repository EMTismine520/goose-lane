import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HOME_CHAINS, HOME_RECIPES } from '../src/content/catalog';
import { HOME_DEVICES } from '../src/content/board-layouts';
import { B_ART, deviceAssetPath, devicePresentation, itemAssetPath, itemPresentation } from '../src/content/assets';

describe('published B kitchen artwork', () => {
  it('ships 38 editable 96×96 icons and versioned masters with one shared presentation', () => {
    const items = [...HOME_CHAINS.flatMap(chain => chain.items), ...HOME_RECIPES.map(recipe => recipe.output)].filter(id=>id in B_ART);
    const paths = [...items.map(item => [item, (B_ART as Record<string,{path:string}>)[item].path]), ...HOME_DEVICES.map(device => [device.id, (B_ART as Record<string,{path:string}>)[device.id].path])];
    expect(paths).toHaveLength(38);
    expect(Object.keys(B_ART).sort()).toEqual(paths.map(([id]) => id).sort());
    const manifest = JSON.parse(readFileSync('public/assets/manifest.json', 'utf8')) as { assetId: string; frame: string; master?: string }[];
    let bytes = 0;
    for (const [id, path] of paths) {
      expect(path).toBe(`assets/${HOME_DEVICES.some(device => device.id === id) ? 'entities' : 'items'}/${id}.svg`);
      const svg = readFileSync('public/' + path, 'utf8');
      expect(svg).toMatch(/<svg[^>]*width="96"[^>]*height="96"/);
      expect(svg).not.toMatch(/<image|data:|<foreignObject/i);
      const row = manifest.filter(entry => entry.assetId === id);
      expect(row).toHaveLength(1);
      expect(row[0].frame).toBe(path);
      expect(readFileSync(row[0].master!, 'utf8')).toMatch(/width="96" height="96"/);
      const presentation = (B_ART as Record<string,{path:string;svgSize:number}>)[id];
      expect(presentation.path).toBe(path);
      expect(presentation.svgSize).toBe(96);
      bytes += Buffer.byteLength(svg);
    }
    expect(bytes).toBeLessThanOrEqual(256 * 1024);
    expect(itemAssetPath('fresh-veg-1')).toBe('assets/v3-b/fresh-veg-1.webp');
  });
});
