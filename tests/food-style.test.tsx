import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { itemImageUrl, itemPresentation, type ItemArtOverrides } from '../src/content/assets';
import { activeDevices, homeCookingUnlocked } from '../src/content/board-layouts';
import { createFoodStyleState, FOOD_STYLE_ITEMS } from '../src/diagnostics/food-style-state';
import { execute, stateInvariantErrors } from '../src/domain/engine';
import { ItemArtProvider } from '../src/ui/ItemArtContext';
import { ItemIcon } from '../src/ui/parts';
import { ItemDetails } from '../src/ui/panels';

const painted: ItemArtOverrides = Object.fromEntries(FOOD_STYLE_ITEMS.map(id => [id, {
  path: `/art/food-styles/painted/items/${id}.webp`, displaySize: id === 'fresh-poultry-1' ? 34 / .75 : 48, offsetX: -1, offsetY: -3,
}]));
const cartoon: ItemArtOverrides = Object.fromEntries(FOOD_STYLE_ITEMS.map(id => [id, { ...painted[id], path: `/art/food-styles/cartoon/items/${id}.svg`, svgSize: 256 }]));

describe('isolated food art preview', () => {
  it('provides a valid unlocked, dense board with all five samples and intact devices', () => {
    const state = createFoodStyleState(20_000_000);
    expect(stateInvariantErrors(state)).toEqual([]);
    expect(homeCookingUnlocked(state)).toBe(true);
    expect(activeDevices(state)).toHaveLength(8);
    for (const device of activeDevices(state)) expect(state.board[device.index]).toBeNull();
    for (const id of FOOD_STYLE_ITEMS) expect(state.board.filter(item => item?.item === id).length).toBeGreaterThan(1);
    expect(state.board.filter(Boolean).length).toBeGreaterThan(35);
    const merged = execute(state, { type: 'move', from: 14, to: 15, expectedUid: state.board[14]!.uid }, state.lastSeen);
    expect(merged.ok).toBe(true);
    expect(merged.state.board[15]?.item).toBe('fresh-beast-2');
    expect(stateInvariantErrors(merged.state)).toEqual([]);
  });

  it('uses the chosen files in React details as well as the shared board presentation', () => {
    const state = createFoodStyleState(20_000_000);
    for (const items of [painted, cartoon]) for (const id of FOOD_STYLE_ITEMS) {
      const html = renderToStaticMarkup(<ItemArtProvider value={{ items }}><ItemDetails state={state} item={id} onItem={() => {}} onCook={() => {}}/></ItemArtProvider>);
      expect(html).toContain(items[id].path);
      expect(itemImageUrl(id, items)).toBe(items[id].path);
      expect(itemPresentation(id, items).displaySize * .75).toBeCloseTo(id === 'fresh-poultry-1' ? 34 : 36);
    }
  });

  it('leaves old produce untouched and cannot leak a preview override into another app', () => {
    const oldIcon = renderToStaticMarkup(<ItemIcon item="fresh-veg-1"/>);
    for (const items of [painted, cartoon]) {
      expect(renderToStaticMarkup(<ItemArtProvider value={{ items }}><ItemIcon item="fresh-veg-1"/></ItemArtProvider>)).toBe(oldIcon);
      expect(renderToStaticMarkup(<ItemArtProvider value={{ items }}><ItemIcon item="fresh-beast-1"/></ItemArtProvider>)).toContain(items['fresh-beast-1'].path);
    }
    const normal = renderToStaticMarkup(<ItemIcon item="fresh-beast-1"/>);
    expect(normal).toContain('assets/items/fresh-beast-1.webp');
    expect(normal).not.toContain('/art/');
    expect(itemPresentation('fresh-beast-1').displaySize).toBe(54);
  });
});
