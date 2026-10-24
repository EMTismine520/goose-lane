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
  for (const key of ['setDepth', 'setOrigin', 'setPosition', 'setDisplaySize', 'setScale', 'setAlpha', 'setText', 'setColor', 'add', 'removeAll', 'clear', 'fillStyle', 'lineStyle', 'fillRoundedRect', 'strokeRoundedRect', 'fillRect', 'fillCircle', 'strokeCircle', 'fillTriangle', 'strokeTriangle', 'lineBetween']) node[key] = vi.fn(() => node);
  node.destroy = vi.fn();
  return node;
}
function scene() {
  return { add: { graphics: visual, container: visual, image: visual, ellipse: visual, text: visual, circle: visual }, textures: { exists: () => true }, time: { now: 0 }, tweens: { killTweensOf: vi.fn(), add: vi.fn() } } as unknown as Phaser.Scene;
}
describe('device lifetime when restoring earlier saves', () => {
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
