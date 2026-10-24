import { ALL_DEVICES } from './board-layouts';
import { ITEMS } from './catalog';
import B_ART from './b-art.json';
import V3_ART from './v3-art.json';

export { B_ART };

/** Same paths for React and Phaser, relative to Vite's public base. */
export function itemAssetPath(item: string): string | null {
  const expanded = (V3_ART as Record<string, ArtPresentation>)[item];
  if (expanded) return expanded.path;
  const def = ITEMS[item];
  return def?.assetPath ?? (def?.assetId ? `assets/items/${def.assetId}.svg` : null);
}
export function deviceAssetPath(id: string): string {
  const expanded = (V3_ART as Record<string, ArtPresentation>)[id];
  if (expanded) return expanded.path;
  if (/-l1$/.test(id)) return deviceAssetPath(id.slice(0, -3));
  return ALL_DEVICES.find(device => device.id === id)?.assetPath ?? `assets/entities/${id}.svg`;
}

export interface ArtPresentation {
  path: string;
  displaySize: number;
  offsetX: number;
  offsetY: number;
  svgSize: number;
}

export function itemPresentation(item: string) {
  const custom = (V3_ART as Record<string, ArtPresentation>)[item] ?? (B_ART as Record<string, ArtPresentation>)[item];
  const def = ITEMS[item];
  return {
    path: custom?.path ?? itemAssetPath(item),
    displaySize: custom?.displaySize ?? (def?.assetId ? def.kind === 'dish' ? 50 : 54 : 44),
    offsetX: custom?.offsetX ?? 0,
    offsetY: custom?.offsetY ?? -2,
    svgSize: custom?.svgSize ?? 96,
  };
}

export function devicePresentation(id: string): ArtPresentation {
  return (V3_ART as Record<string, ArtPresentation>)[id] ?? (B_ART as Record<string, ArtPresentation>)[id] ?? {
    path: deviceAssetPath(id), displaySize: 47, offsetX: 0, offsetY: -2, svgSize: 96,
  };
}

/** Texture sampling is independent of the board's display size. */
export function svgRasterSize(presentation: { svgSize: number }, pixelRatio: number) {
  return Math.max(presentation.svgSize, 96 * pixelRatio);
}

export function itemImageUrl(item: string): string {
  const path = itemPresentation(item).path;
  if (!path) return '';
  return path.startsWith('/') ? path : `${import.meta.env.BASE_URL}${path}`;
}
