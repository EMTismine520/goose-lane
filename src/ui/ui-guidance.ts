import { CHAINS, CUSTOMERS, ITEMS, RECIPES } from '../content/catalog';
import { DEVICE_FAMILIES } from '../content/expansion';
import { activeDevices } from '../content/board-layouts';
import { availableOrders, getApplianceStatus, inventoryCount } from '../domain/engine';
import type { GameState, OrderDef, RecipeDef } from '../domain/types';

export type LayoutDensity = 'regular' | 'compact' | 'short' | 'tiny';
export function layoutDensity(height: number): LayoutDensity {
  return height < 606 ? 'tiny' : height < 640 ? 'short' : height < 740 ? 'compact' : 'regular';
}

export function focusedOrder(state: GameState, id: string | null): OrderDef | null {
  return availableOrders(state).find(order => order.id === id) ?? null;
}

export interface ApplianceTarget {
  recipe: RecipeDef;
  orderId: string | null;
  ingredients: { item: string; loaded: number; required: number; complete: boolean }[];
  canStart: boolean;
}
export type ApplianceTargets = Readonly<Partial<Record<string, ApplianceTarget>>>;

/** An order guides the UI; only the appliance's committed inputs count as loaded. */
export function getApplianceTarget(state: GameState, applianceId: string, focusedOrderId: string | null): ApplianceTarget | null {
  const status = getApplianceStatus(state, applianceId);
  if (!status) return null;
  const { appliance } = status;
  const committed = !!(appliance.job || appliance.outputSlot);
  let recipe = appliance.job ? RECIPES.find(value => value.id === appliance.job!.recipe)
    : appliance.outputSlot ? RECIPES.find(value => value.output === appliance.outputSlot!.item) : status.recipe;
  let orderId: string | null = null;
  if (!committed) {
    const orders = availableOrders(state);
    const focus = orders.find(order => order.id === focusedOrderId);
    for (const order of focus ? [focus, ...orders.filter(order => order.id !== focus.id)] : orders) {
      const candidate = status.candidates.find(({ recipe }) => order.needs.some(need => need.item === recipe.output && inventoryCount(state, need.item) < need.count));
      if (candidate) { recipe = candidate.recipe; orderId = order.id; break; }
    }
  }
  if (!recipe) return null;
  const ingredients = recipe.inputs.map(need => {
    const loaded = committed ? need.count : appliance.inputSlots.filter(input => input.item === need.item).length;
    return { item: need.item, loaded, required: need.count, complete: loaded >= need.count };
  });
  return { recipe, orderId, ingredients, canStart: status.phase === 'loaded' && ingredients.every(need => need.complete) };
}

export function orderSummary(state: GameState, order: OrderDef): string {
  const customer = CUSTOMERS.find(value => value.id === order.customer)?.name ?? '客人';
  const missing = order.needs.filter(need => inventoryCount(state, need.item) < need.count);
  return missing.length
    ? `${customer}的心愿 · ${missing.map(need => `${ITEMS[need.item].name} ${Math.min(inventoryCount(state, need.item), need.count)}/${need.count}`).join('、')}`
    : `${customer}的心愿备齐啦，去交付吧`;
}

export type ItemLocation = { kind: 'board'; uids: string[]; message: string } | { kind: 'storage'; message: string } | { kind: 'shelf'; family: string; message: string } | { kind: 'unavailable'; message: string };

/** Presentation only. Locating never changes equipment configuration or inventory. */
export function locateItem(state: GameState, id: string): ItemLocation {
  const name = ITEMS[id]?.name ?? '食物';
  const exact = state.board.filter(item => item?.item === id).map(item => item!.uid);
  if (exact.length) return { kind: 'board', uids: exact, message: `${name}在这里，拖动继续料理吧。` };
  if (state.storage.some(item => item.item === id)) return { kind: 'storage', message: `${name}已在仓库中。` };
  const output = state.appliances.filter(device => device.outputSlot?.item === id || device.job && RECIPES.find(recipe => recipe.id === device.job!.recipe)?.output === id);
  if (output.length) return { kind: 'board', uids: output.map(device => device.id), message: `${name}正在这件厨具里。` };
  const chain = CHAINS.find(value => value.items.includes(id));
  const recipes = RECIPES.filter(recipe => recipe.output === id);
  const family = DEVICE_FAMILIES.find(value => chain ? value.chains.includes(chain.id) : recipes.some(recipe => recipe.deviceFamilyId === value.id));
  const devices = activeDevices(state).filter(device => family ? device.familyId === family.id || device.id === family.id : chain ? device.chain === chain.id : recipes.some(recipe => recipe.appliance === device.slot));
  if (devices.length) return { kind: 'board', uids: devices.map(device => device.id), message: chain ? `从${devices[0].name}产出，再沿食材链合成。` : `在${devices[0].name}中配齐材料制作。` };
  if (family) return { kind: 'shelf', family: family.id, message: `到设备架查看${family.name}。` };
  return { kind: 'unavailable', message: '查看食材来源，继续完成当前主题心愿。' };
}
