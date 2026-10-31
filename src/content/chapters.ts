import { CHAINS, FRESH_ORDERS, HOME_ORDERS, ITEMS, MODERN_ORDERS, MODERN_RECIPES } from './catalog';
import { BAND_LEVELS, DEVICE_FAMILIES, THEME_NAMES } from './expansion';
import type { OrderDef, RecipeDef } from '../domain/types';

export const CHAPTER_PRICE = { first: 60, later: 120 } as const;
export const MAX_DEVICES = 384;
export const chapterOrders = (chapter: number): OrderDef[] => {
  const orders = chapter === 1 ? FRESH_ORDERS : chapter === 2 ? HOME_ORDERS : MODERN_ORDERS.filter(o => o.stage === chapter);
  if (chapter !== 8) return orders;
  const signature = orders.find(o => o.needs.some(n => ITEMS[n.item].name === '香甜蛋奶饮'));
  return signature ? [signature, ...orders.filter(o => o !== signature)] : orders;
};
export interface Dependencies { items: string[]; recipes: RecipeDef[]; families: string[]; levels: Record<string, number>; bands: Record<string, number>; }
export function resolveDependencies(targets: string[]): Dependencies {
  const items = new Set<string>(), recipes = new Set<RecipeDef>(), families = new Set<string>();
  const levels: Record<string, number> = {}, bands: Record<string, number> = {};
  const visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error('Circular chapter recipe: ' + id);
    const chain = CHAINS.find(c => c.items.includes(id));
    if (chain) {
      if (!chain.producer) throw new Error('Missing producer: ' + id);
      families.add(chain.producer);
      const band = Math.min(4, Math.floor((ITEMS[id].level - 1) / 3));
      bands[chain.producer] = Math.max(bands[chain.producer] ?? 0, band);
      levels[chain.producer] = Math.max(levels[chain.producer] ?? 1, [1, 2, 3, 3, 3][band]);
      chain.items.forEach(i => items.add(i));
      return;
    }
    if (items.has(id)) return;
    const recipe = MODERN_RECIPES.find(r => r.output === id);
    if (!recipe?.deviceFamilyId) throw new Error('Missing chapter source: ' + id);
    visiting.add(id); recipes.add(recipe); families.add(recipe.deviceFamilyId);
    levels[recipe.deviceFamilyId] = Math.max(levels[recipe.deviceFamilyId] ?? 1, recipe.minDeviceLevel ?? 1);
    recipe.inputs.forEach(n => visit(n.item));
    visiting.delete(id); items.add(id);
  };
  targets.forEach(visit);
  return { items: [...items], recipes: [...recipes], families: [...families], levels, bands };
}
function makeRegularTemplates(chapter: number, orders: OrderDef[], starter: Dependencies): OrderDef[] {
  const producer = DEVICE_FAMILIES.find(f => starter.families.includes(f.id) && f.kind === 'generator')!;
  const chain = CHAINS.find(c => c.id === producer.chains[0])!;
  const band = starter.bands[producer.id] ?? 0;
  // Every drop in the selected band is useful; the first template is the income floor.
  const direct = chain.items.slice(band * 3, band * 3 + 3).map(item => ({
    id: 'regular-template:' + item, day: 1, stage: chapter, customer: 'momo', title: '邻居常来', message: '新鲜食材也想带一份回家。', thanks: '收好啦，下次还来！',
    needs: [{ item, count: 1 }], coins: Math.max(4, ITEMS[item].sell + 3), reputation: 0,
  }));
  return [...direct.slice(0, 1), ...orders.slice(0, 2).map(o => ({ ...o, day: 1, stage: chapter, coins: Math.max(8, Math.floor(o.coins * .8)), reputation: 0 }))];
}

export interface ChapterEquipment {
  familyId: string;
  kind: 'generator' | 'appliance';
  minimumLevel: number;
  level: number;
  bands: number[];
  initialBand: number;
  index: number;
  orderIds: string[];
  recipeIds: string[];
}
const openingPositions: Record<string, number> = { 'vegetable-cart': 35, 'fruit-cart': 36, 'chopping-board': 40, 'fruit-press': 41 };

/** One derived contract for entry, resource preparation, previews and equipment management. */
function equipmentPlan(chapter: number, dependencies: Dependencies, starter: Dependencies, orders: OrderDef[]): ChapterEquipment[] {
  const families = dependencies.families.map(id => DEVICE_FAMILIES.find(f => f.id === id)!)
    .sort((a, b) => Number(a.kind === 'appliance') - Number(b.kind === 'appliance'));
  const sources = orders.map(order => ({ id: order.id, dependencies: resolveDependencies(order.needs.map(n => n.item)) }));
  const recipes = dependencies.recipes.map(recipe => ({ id: recipe.id, dependencies: resolveDependencies([recipe.output]) }));
  const firstRow = 9 - Math.ceil(families.length / 7);
  return families.map((f, slot) => {
    const row = Math.floor(slot / 7), rowCount = Math.min(7, families.length - row * 7);
    const level = dependencies.levels[f.id] ?? 1;
    const chain = CHAINS.find(c => c.id === f.chains[0]);
    return {
      familyId: f.id, kind: f.kind, minimumLevel: f.kind === 'generator' ? 1 : level, level,
      bands: f.kind === 'generator' ? BAND_LEVELS.flatMap((required, band) => required <= level && band * 3 < chain!.items.length ? [band] : []) : [],
      initialBand: starter.bands[f.id] ?? 0,
      index: chapter === 1 ? openingPositions[f.id] : (firstRow + row) * 7 + slot % 7 + Math.floor((7 - rowCount) / 2),
      orderIds: sources.filter(s => s.dependencies.families.includes(f.id)).map(s => s.id),
      recipeIds: recipes.filter(s => s.dependencies.families.includes(f.id)).map(s => s.id),
    };
  });
}
export const CHAPTERS = THEME_NAMES.map((name, index) => {
  const id = index + 1, orders = chapterOrders(id);
  const starter = resolveDependencies(orders.slice(0, 3).flatMap(o => o.needs.map(n => n.item)));
  if (id === 1 && !starter.families.includes('fruit-press')) starter.families.push('fruit-press');
  const regular = makeRegularTemplates(id, orders, starter);
  const dependencies = resolveDependencies([...orders, ...regular].flatMap(o => o.needs.map(n => n.item)));
  return { id, name, orders, dependencies, starter, regular, equipment: equipmentPlan(id, dependencies, starter, [...orders, ...regular]) };
});
export const chapterDefinition = (chapter: number) => CHAPTERS.find(c => c.id === chapter);
export const regularTemplates = (chapter: number) => chapterDefinition(chapter)!.regular;
