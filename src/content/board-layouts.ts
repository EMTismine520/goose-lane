import { FRESH_ORDERS } from './catalog';
import type { GameState } from '../domain/types';

export interface DeviceDefinition { id: string; kind: 'generator' | 'appliance'; index: number; name: string; unlockDay: number; chain?: string; slot?: number; assetPath?: string; }
export interface BlockerDefinition { id: string; index: number; footprint: number[]; unlockDay: number; name: string; buildNode: string; buildLabel: string; }

/** Project-designed layout; lower boxes are not claimed to reproduce the original game's hidden rules. */
export const BOARD_LAYOUT = {
  id: 'market-opening', columns: 7, rows: 9,
  entities: [
    { id: 'vegetable-cart', kind: 'generator', index: 35, name: '蔬菜推车', unlockDay: 1, chain: 'fresh-veg' },
    { id: 'fruit-cart', kind: 'generator', index: 36, name: '鲜果木箱', unlockDay: 1, chain: 'fresh-fruit' },
    { id: 'chopping-board', kind: 'appliance', index: 40, name: '小鹅砧板', unlockDay: 1, slot: 0 },
    { id: 'fruit-press', kind: 'appliance', index: 41, name: '鲜果料理台', unlockDay: 1, slot: 1 },
  ] satisfies DeviceDefinition[],
  blockers: [
    { id: 'crate-garden', index: 42, footprint: Array.from({ length: 7 }, (_, i) => 42 + i), unlockDay: 3, name: '第 3 天扩建', buildNode: 'clear-crates', buildLabel: '清理纸箱后解锁' },
    { id: 'crate-river', index: 49, footprint: Array.from({ length: 7 }, (_, i) => 49 + i), unlockDay: 4, name: '第 4 天扩建', buildNode: 'vegetable-shelf', buildLabel: '货架完成后解锁' },
    { id: 'crate-celebration', index: 56, footprint: Array.from({ length: 7 }, (_, i) => 56 + i), unlockDay: 5, name: '第 5 天扩建', buildNode: 'shop-counter', buildLabel: '柜台完成后解锁' },
  ] satisfies BlockerDefinition[],
};

export const BUILD_NODES = [
  { id: 'clear-crates', name: '清理门前纸箱', description: '搬开纸箱，让清晨的阳光照进小店。', cost: 24, energy: 20, hats: 1, progress: 33 },
  { id: 'vegetable-shelf', name: '搭建蔬菜货架', description: '把新鲜蔬菜摆上木架，迎接第一批邻居。', cost: 72, energy: 25, hats: 1, progress: 67 },
  { id: 'shop-counter', name: '整理迎客柜台', description: '擦亮柜台，今日鲜果蔬店正式开张。', cost: 108, energy: 30, hats: 1, progress: 100 },
] as const;

export const HOME_DEVICES: DeviceDefinition[] = [
  { id: 'beast-meat-cart', kind: 'generator', index: 37, name: '兽肉推车', unlockDay: 1, chain: 'fresh-beast', assetPath: 'assets/entities/beast-meat-cart.webp' },
  { id: 'poultry-cart', kind: 'generator', index: 38, name: '禽肉推车', unlockDay: 1, chain: 'fresh-poultry', assetPath: 'assets/entities/poultry-cart.webp' },
  { id: 'spice-box', kind: 'generator', index: 39, name: '香料盒', unlockDay: 1, chain: 'fresh-spice', assetPath: 'assets/entities/spice-box.webp' },
  { id: 'home-cooking-pot', kind: 'appliance', index: 47, name: '料理锅', unlockDay: 1, slot: 4, assetPath: 'assets/entities/home-cooking-pot.webp' },
];
export const ALL_DEVICES: DeviceDefinition[] = [...BOARD_LAYOUT.entities, ...HOME_DEVICES];
export type ProgressState = Pick<GameState, 'schemaVersion' | 'campaign' | 'completedOrders' | 'construction'>;
export function homeCookingUnlocked(state: ProgressState): boolean {
  return state.schemaVersion >= 2 && state.campaign === 'fresh' && FRESH_ORDERS.every(order => state.completedOrders.includes(order.id)) && BUILD_NODES.every(node => state.construction.completed.includes(node.id));
}
export function activeDevices(state: ProgressState): DeviceDefinition[] {
  return state.schemaVersion < 2 ? [] : homeCookingUnlocked(state) ? ALL_DEVICES : BOARD_LAYOUT.entities;
}
export const HOME_UNLOCK_HINT = '完成首段 12 份订单和 3 项建设后开放';
