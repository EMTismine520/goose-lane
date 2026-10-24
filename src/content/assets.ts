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
