import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { B_ART, devicePresentation, itemImageUrl, itemPresentation, svgRasterSize } from '../src/content/assets';
import { activeDevices, homeCookingUnlocked, HOME_DEVICES } from '../src/content/board-layouts';
import { createFoodStyleState, FOOD_STYLE_ITEMS } from '../src/diagnostics/food-style-state';
import { execute, stateInvariantErrors } from '../src/domain/engine';
import { ItemArtProvider } from '../src/ui/ItemArtContext';
import { ItemIcon } from '../src/ui/parts';
import { ItemDetails } from '../src/ui/panels';

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
      expect(html).toContain(`assets/items/${id}.svg`);
      expect(itemImageUrl(id)).toContain(itemPresentation(id).path);
      const normal = renderToStaticMarkup(<ItemIcon item={id}/>);
      expect(renderToStaticMarkup(<ItemArtProvider value={{ renderer: 'canvas', pixelRatio: 3 }}><ItemIcon item={id}/></ItemArtProvider>)).toBe(normal);
    }
    expect(itemPresentation('fresh-veg-1').displaySize).toBe(54);
  });

  it.each([1, 2, 3])('keeps layout stable while raising SVG sampling at DPR %i', ratio => {
    for (const id of Object.keys(B_ART)) {
      const presentation = HOME_DEVICES.some(device => device.id === id) ? devicePresentation(id) : itemPresentation(id);
      expect(presentation.svgSize).toBe(96);
      expect(svgRasterSize(presentation, ratio)).toBe(96 * ratio);
      expect(presentation.displaySize).toBeLessThanOrEqual(56);
    }
    expect(itemPresentation('fresh-beast-1')).toMatchObject({ displaySize: 48, offsetX: -1, offsetY: -3 });
    expect(itemPresentation('fresh-poultry-1').displaySize).toBeCloseTo(34 / .75);
    for (const device of HOME_DEVICES) expect(devicePresentation(device.id).displaySize * .75).toBe(42);
  });
});
