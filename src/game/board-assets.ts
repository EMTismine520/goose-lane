import { activeDevices } from '../content/board-layouts';
import { CHAINS, ITEMS, RECIPES } from '../content/catalog';
import { devicePresentation, itemPresentation, sizedArtPath } from '../content/assets';
import { mergeTarget } from '../domain/engine';
import { productionFor } from '../domain/devices';
import { PRODUCTION } from '../content/production';
import type { GameState } from '../domain/types';

export interface BoardAsset { key: string; path: string; }
export interface BoardAssetPlan { critical: BoardAsset[]; soon: BoardAsset[]; }

/** Unlock/discovery history never expands the blocking set. Only visible ownership does. */
export function planBoardAssets(state: GameState, pixelRatio = 2): BoardAssetPlan {
  const critical = new Map<string, BoardAsset>(), soon = new Map<string, BoardAsset>();
  const addItem = (item: string, target: Map<string, BoardAsset>) => {
    const definition = ITEMS[item];
    if (!definition?.assetId) { target.set('legacy-foods', { key: 'legacy-foods', path: 'assets/foods.webp' }); return; }
    const key = `item:${definition.assetId}`;
    const presentation = itemPresentation(item);
    target.set(key, { key, path: sizedArtPath(presentation.path!, presentation.displaySize, pixelRatio) });
  };
  for (const item of state.board) if (item) addItem(item.item, critical);
  for (const device of activeDevices(state)) {
    const id = device.artId ?? device.id, key = `entity:${id}`;
    const presentation = devicePresentation(id);
    critical.set(key, { key, path: sizedArtPath(presentation.path, presentation.displaySize, pixelRatio) });
  }
  // Crates have a tiny native SVG; historical sheet art is requested only by historical items.
  critical.set('entity:crate', { key: 'entity:crate', path: 'assets/entities/crate.svg' });
  for (const item of state.board) {
    const next = item && mergeTarget(item.item);
    if (next) addItem(next, soon);
  }
  for (const device of activeDevices(state).filter(device => device.kind === 'generator')) {
    const owned = state.devices.find(entry => entry.id === device.id);
    const chain = owned?.selectedChain ?? device.chain;
    if (!chain) continue;
    const drops = productionFor(chain, owned?.band ?? 0)?.drops ?? PRODUCTION[chain]?.drops;
    for (const drop of drops ?? []) addItem(drop.item, soon);
    if (!drops) for (const item of CHAINS.find(entry => entry.id === chain)?.items.slice(0, 3) ?? []) addItem(item, soon);
  }
  for (const appliance of state.appliances) {
    if (appliance.outputSlot) addItem(appliance.outputSlot.item, soon);
    const recipe = RECIPES.find(entry => entry.id === appliance.job?.recipe);
    if (recipe) addItem(recipe.output, soon);
  }
  for (const key of critical.keys()) soon.delete(key);
  return { critical: [...critical.values()], soon: [...soon.values()] };
}
