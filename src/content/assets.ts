import { ALL_DEVICES } from './board-layouts';
import { ITEMS } from './catalog';

/** Same paths for React and Phaser, relative to Vite's public base. */
export function itemAssetPath(item: string): string | null {
  const def = ITEMS[item];
  return def?.assetPath ?? (def?.assetId ? `assets/items/${def.assetId}.svg` : null);
}
export function deviceAssetPath(id: string): string {
  return ALL_DEVICES.find(device => device.id === id)?.assetPath ?? `assets/entities/${id}.svg`;
}

/** Visual overrides belong to a preview, never to an item or a saved game. */
export interface ItemArtOverride {
  path: string;
  displaySize: number;
  offsetX?: number;
  offsetY?: number;
  svgSize?: number;
}
export type ItemArtOverrides = Readonly<Record<string, ItemArtOverride>>;

export function itemPresentation(item: string, overrides?: ItemArtOverrides) {
  const custom = overrides?.[item];
  const def = ITEMS[item];
  return {
    path: custom?.path ?? itemAssetPath(item),
    displaySize: custom?.displaySize ?? (def?.assetId ? def.kind === 'dish' ? 50 : 54 : 44),
    offsetX: custom?.offsetX ?? 0,
    offsetY: custom?.offsetY ?? -2,
    svgSize: custom?.svgSize ?? 96,
  };
}

export function itemImageUrl(item: string, overrides?: ItemArtOverrides): string {
  const path = itemPresentation(item, overrides).path;
  if (!path) return '';
  return path.startsWith('/') ? path : `${import.meta.env.BASE_URL}${path}`;
}
