import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { B_ART, devicePresentation, itemImageUrl, itemPresentation, svgRasterSize, type ArtPresentation } from '../src/content/assets';
import V3_ART from '../src/content/v3-art.json';
import { activeDevices, homeCookingUnlocked, HOME_DEVICES } from '../src/content/board-layouts';
import { createFoodStyleState, FOOD_STYLE_ITEMS } from '../src/diagnostics/food-style-state';
import { execute, stateInvariantErrors } from '../src/domain/engine';
import { ItemArtProvider } from '../src/ui/ItemArtContext';
import { ItemIcon } from '../src/ui/parts';
import { ItemDetails } from '../src/ui/panels';
import { ITEMS } from '../src/content/catalog';

describe('B-only food art and isolated preview', () => {
  it('provides a full repeated-sausage board that frees a cell when merged', () => {
    const state = createFoodStyleState(20_000_000, 'sausages');
    expect(state.board.filter(Boolean)).toHaveLength(55);
    expect(state.board.filter(Boolean).every(item => item!.item === 'fresh-beast-1')).toBe(true);
    expect(stateInvariantErrors(state)).toEqual([]);
    const merged = execute(state, { type: 'move', from: 0, to: 1, expectedUid: state.board[0]!.uid }, state.lastSeen);
    expect(merged.ok).toBe(true);
    expect(merged.state.board.filter(Boolean)).toHaveLength(54);
    expect(merged.state.board[1]?.item).toBe('fresh-beast-2');
  });
  it('shows all 34 foods, old produce, duplicate food and eight devices on a valid playable board', () => {
    const state = createFoodStyleState(20_000_000);
    expect(stateInvariantErrors(state)).toEqual([]);
    expect(homeCookingUnlocked(state)).toBe(true);
    expect(activeDevices(state)).toHaveLength(8);
    for (const device of activeDevices(state)) expect(state.board[device.index]).toBeNull();
    expect(FOOD_STYLE_ITEMS).toHaveLength(34);
    for (const id of FOOD_STYLE_ITEMS) expect(state.board.some(item => item?.item === id)).toBe(true);
    expect(state.board.some(item => item?.item === 'fresh-veg-1')).toBe(true);
    expect(state.board.filter(Boolean).length).toBeLessThan(55);
    const merged = execute(state, { type: 'move', from: 0, to: 1, expectedUid: state.board[0]!.uid }, state.lastSeen);
    expect(merged.ok).toBe(true);
    expect(merged.state.board[1]?.item).toBe('fresh-beast-2');
    expect(stateInvariantErrors(merged.state)).toEqual([]);
  });

  it('uses default B files in React details, icons and board presentation without a preview override', () => {
    const state = createFoodStyleState(20_000_000);
    for (const id of FOOD_STYLE_ITEMS) {
      const html = renderToStaticMarkup(<ItemDetails state={state} item={id} onItem={() => {}} onCook={() => {}}/>);
      expect(html).toContain(`alt="${ITEMS[id].name}"`);
      expect(html).toContain('data-art-status="loading"');
      expect(itemImageUrl(id)).toContain(itemPresentation(id).path);
      const normal = renderToStaticMarkup(<ItemIcon item={id}/>);
      expect(renderToStaticMarkup(<ItemArtProvider value={{ renderer: 'canvas', pixelRatio: 3 }}><ItemIcon item={id}/></ItemArtProvider>)).toBe(normal);
    }
    expect(itemPresentation('fresh-veg-1').displaySize).toBeLessThanOrEqual(56);
  });

  it('uses the selected V3 canvas once without applying the historical B-art transform again', () => {
    const selectedHistoricalItems = Object.keys(B_ART).filter(id => id in V3_ART && ITEMS[id]?.assetId);
    expect(selectedHistoricalItems.length).toBeGreaterThan(0);
    for (const id of selectedHistoricalItems) {
      expect(renderToStaticMarkup(<ItemIcon item={id}/>), id).not.toContain('transform:');
      expect(itemPresentation(id), id).toEqual((V3_ART as Record<string, ArtPresentation>)[id]);
    }
  });

  it.each([1, 2, 3])('keeps canonical layout stable while raising SVG sampling at DPR %i', ratio => {
    const canonical = V3_ART as Record<string, ArtPresentation>;
    for (const id of Object.keys(B_ART)) {
      const device = HOME_DEVICES.some(device => device.id === id);
      const presentation = device ? devicePresentation(id) : itemPresentation(id);
      const selected = canonical[id] ?? (device ? canonical[id + '-l1'] : undefined);
      if (selected) expect(presentation, id).toEqual(selected);
      else expect(presentation, id).toEqual((B_ART as Record<string, ArtPresentation>)[id]);
      expect(Number.isFinite(presentation.svgSize), id).toBe(true);
      expect(presentation.svgSize, id).toBeGreaterThan(0);
      expect(svgRasterSize(presentation, ratio)).toBe(Math.max(presentation.svgSize,96 * ratio));
      expect(presentation.displaySize).toBeLessThanOrEqual(56);
    }
    expect(itemPresentation('fresh-beast-1').displaySize).toBeLessThanOrEqual(56);
    expect(itemPresentation('fresh-poultry-1').displaySize).toBeLessThanOrEqual(56);
    for (const device of HOME_DEVICES) {
      const selected = canonical[device.id] ?? canonical[device.id + '-l1'] ?? (B_ART as Record<string, ArtPresentation>)[device.id];
      expect(devicePresentation(device.id), device.id).toEqual(selected);
    }
  });
});
