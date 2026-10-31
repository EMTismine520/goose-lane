import { CHAINS, ITEMS, MODERN_RECIPES } from '../content/catalog';
import { chapterDefinition, regularTemplates } from '../content/chapters';
import { DEVICE_FAMILIES } from '../content/expansion';
import { availableApplianceRecipes, mergeTarget, unlockedCells } from '../domain/engine';
import { productionFor } from '../domain/devices';
import { activeWorkspace, familyAllowed } from '../domain/workspaces';
import type { GameState, OrderDef } from '../domain/types';

/** Re-derive requirements from recipes and production, independently of the entry equipment plan. */
export function auditChapter(state: GameState, chapter: number) {
  const definition = chapterDefinition(chapter)!, workspace = activeWorkspace(state)!;
  if (workspace.chapter !== chapter) throw new Error('Audit requires the active chapter');
  const supported = new Set(availableApplianceRecipes(state).map(r => r.id));
  const allRequired = new Map<string, { minimumLevel: number; level: number }>();
  const recipes = new Set<string>();
  const inspect = (order: OrderDef) => {
    const required = new Map<string, { minimumLevel: number; level: number }>();
    const ingredients = new Map<string, number>();
    const paths: { item: string; name: string; count: number; via: string[]; family: string; recipe?: string }[] = [];
    const visiting = new Set<string>();
    const requireFamily = (family: string, minimumLevel: number, level: number) => {
      const previous = required.get(family);
      required.set(family, { minimumLevel: Math.max(previous?.minimumLevel ?? 1, minimumLevel), level: Math.max(previous?.level ?? 1, level) });
    };
    const visit = (item: string, count: number, via: string[]) => {
      const chain = CHAINS.find(c => c.items.includes(item));
      if (chain) {
        const family = chain.producer!;
        if (!familyAllowed(state, family) || chain.unlockDay > state.day) throw new Error('Locked source: ' + item);
        const level = ITEMS[item].level, band = Math.floor((level - 1) / 3);
        const base = productionFor(chain.id, 0), desired = productionFor(chain.id, band);
        if (!base || !desired || !base.drops.some(d => d.item === chain.items[0])) throw new Error('Missing production: ' + item);
        for (let i = 1; i < level; i++) if (mergeTarget(chain.items[i - 1]) !== chain.items[i]) throw new Error('Broken merge path: ' + item);
        requireFamily(family, base.minLevel, desired.minLevel);
        ingredients.set(item, (ingredients.get(item) ?? 0) + count);
        paths.push({ item, name: ITEMS[item].name, count, via, family });
        return;
      }
      if (visiting.has(item)) throw new Error('Recipe cycle: ' + item);
      const recipe = MODERN_RECIPES.find(r => r.output === item);
      if (!recipe?.deviceFamilyId || !supported.has(recipe.id)) throw new Error('Missing recipe: ' + item);
      recipes.add(recipe.id);
      requireFamily(recipe.deviceFamilyId, recipe.minDeviceLevel ?? 1, recipe.minDeviceLevel ?? 1);
      paths.push({ item, name: ITEMS[item].name, count, via, family: recipe.deviceFamilyId, recipe: recipe.id });
      visiting.add(item);
      recipe.inputs.forEach(n => visit(n.item, n.count * count, [...via, recipe.name]));
      visiting.delete(item);
    };
    order.needs.forEach(n => visit(n.item, n.count, []));
    const requirements = [...required].map(([family, need]) => {
      const previous = allRequired.get(family);
      allRequired.set(family, { minimumLevel: Math.max(previous?.minimumLevel ?? 1, need.minimumLevel), level: Math.max(previous?.level ?? 1, need.level) });
      const device = workspace.devices.filter(d => d.familyId === family).sort((a, b) => b.level - a.level || Number(b.index !== null) - Number(a.index !== null))[0];
      const onBoard = workspace.devices.some(d => d.familyId === family && d.level >= need.level && d.index !== null && d.index >= 0 && d.index < unlockedCells(state));
      return { family, name: DEVICE_FAMILIES.find(f => f.id === family)!.name, ...need, ownedLevel: device?.level ?? 0, onBoard };
    });
    return {
      id: order.id, targets: order.needs.map(n => ({ ...n, name: ITEMS[n.item].name })), paths,
      ingredients: [...ingredients].map(([item, count]) => ({ item, name: ITEMS[item].name, count })), requirements,
      hardDeficits: requirements.filter(r => r.ownedLevel < r.minimumLevel),
      targetDeficits: requirements.filter(r => r.ownedLevel < r.level),
      hidden: requirements.filter(r => !r.onBoard),
    };
  };
  const orders = definition.orders.map(inspect), regular = regularTemplates(chapter).map(inspect);
  const equipment = [...allRequired].map(([family, need]) => {
    const device = workspace.devices.find(d => d.familyId === family)!;
    return { family, name: DEVICE_FAMILIES.find(f => f.id === family)!.name, ...need, deviceId: device?.id, actualLevel: device?.level ?? 0, index: device?.index ?? null };
  });
  return {
    chapter, name: definition.name, orders, regular, recipes: [...recipes], equipment,
    onBoard: workspace.devices.filter(d => d.index !== null).length,
    hardBlockedOrders: orders.filter(o => o.hardDeficits.length > 0).length,
    targetBlockedOrders: orders.filter(o => o.targetDeficits.length > 0).length,
    hiddenOrderSources: [...orders, ...regular].filter(o => o.hidden.length > 0).length,
  };
}
