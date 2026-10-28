import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { BoardRenderer } from '../src/game/board-render';
import { createInitialState } from '../src/domain/engine';
import { reconcileHomeDevices } from '../src/domain/home-progression';
import { FRESH_ORDERS } from '../src/content/catalog';
import { BUILD_NODES } from '../src/content/board-layouts';

/** Small scene double: checks lifetime and ownership, without testing Phaser itself. */
function visual() {
  const node: Record<string, unknown> = { x: 0, y: 0, width: 20 };
  for (const key of ['setDepth', 'setOrigin', 'setPosition', 'setDisplaySize', 'setScale', 'setAlpha', 'setText', 'setTexture', 'setVisible', 'setColor', 'add', 'removeAll', 'clear', 'fillStyle', 'lineStyle', 'fillRoundedRect', 'strokeRoundedRect', 'fillRect', 'fillCircle', 'strokeCircle', 'fillTriangle', 'strokeTriangle', 'lineBetween']) node[key] = vi.fn(() => node);
  node.destroy = vi.fn();
  return node;
}
function scene() {
  return { add: { graphics: visual, container: visual, image: visual, ellipse: visual, text: visual, circle: visual }, textures: { exists: () => true }, time: { now: 0 }, tweens: { killTweensOf: vi.fn(), add: vi.fn() } } as unknown as Phaser.Scene;
}
describe('device lifetime when restoring earlier saves', () => {
  it('updates loaded textures in place without replacing unrelated items or their animation owners', () => {
    const state = createInitialState(1000), renderer = new BoardRenderer(scene(), () => state);
    renderer.sync(false);
    const vegetable = renderer.items.get('g1')!, fruit = renderer.items.get('g3')!;
    renderer.refreshArt(['item:fresh-veg-1']);
    expect(renderer.items.get('g1')).toBe(vegetable);
    expect(renderer.items.get('g3')).toBe(fruit);
    expect(vegetable.container.destroy).not.toHaveBeenCalled();
    expect(vegetable.image.setTexture).toHaveBeenCalledWith('item:fresh-veg-1', undefined);
    expect(fruit.image.setTexture).not.toHaveBeenCalled();
  });
  it('does not redraw unchanged idle device graphics on clock ticks', () => {
    const state = createInitialState(1000), renderer = new BoardRenderer(scene(), () => state);
    renderer.sync(false);
    const board = renderer.devices.get('chopping-board')!;
    const count = (board.activity.clear as any).mock.calls.length;
    renderer.updateClock(1000, true); renderer.updateClock(1200, true);
    expect((board.activity.clear as any).mock.calls.length).toBe(count);
  });
  it('removes all four later devices and recreates them after another unlock', () => {
    let state = createInitialState(1000);
    state.settings.reducedMotion = true;
    const renderer = new BoardRenderer(scene(), () => state);
    renderer.sync(false);
    expect([...renderer.devices.keys()]).toEqual(['vegetable-cart', 'fruit-cart', 'chopping-board', 'fruit-press']);
    state = structuredClone(state);
    state.completedOrders = FRESH_ORDERS.map(order => order.id);
    state.construction.completed = BUILD_NODES.map(node => node.id);
    reconcileHomeDevices(state); renderer.sync(false);
    expect(renderer.devices.size).toBe(8);
    const oldPot = renderer.devices.get('home-cooking-pot')!.container;
    state = createInitialState(1000); renderer.sync(false);
    expect(renderer.devices.size).toBe(4);
    expect(oldPot.destroy).toHaveBeenCalledWith(true);
    expect(renderer.devices.has('home-cooking-pot')).toBe(false);
    state.completedOrders = FRESH_ORDERS.map(order => order.id);
    state.construction.completed = BUILD_NODES.map(node => node.id);
    reconcileHomeDevices(state); renderer.sync(false);
    expect(renderer.devices.size).toBe(8);
    expect(renderer.devices.get('home-cooking-pot')!.container).not.toBe(oldPot);
  });
});
