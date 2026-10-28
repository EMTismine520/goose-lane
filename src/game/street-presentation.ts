import { FRESH_ORDERS, HOME_ORDERS, MODERN_ORDERS } from '../content/catalog';
import { DEVICE_FAMILIES, THEME_NAMES } from '../content/expansion';
import { themeStage } from '../domain/devices';
import type { GameState } from '../domain/types';

/** Presentation only. Unlocks and rewards remain owned by the domain. */
export const STREET_THEMES = [
  { keepsake: '鲜果小篮', description: '把清晨的新鲜，留在街角。', accent: '#6b925b', display: '今天也有新鲜好滋味' },
  { keepsake: '家常小锅', description: '一锅热饭，等熟悉的人。', accent: '#bc774b', display: '一口家常，暖暖入心' },
  { keepsake: '晨光茶杯', description: '给慢慢醒来的街巷，一杯香气。', accent: '#6b8e83', display: '慢一点，喝杯热茶吧' },
  { keepsake: '金黄面包', description: '刚出炉的香气，飘过窗边。', accent: '#bd8b49', display: '刚刚出炉，请趁热尝' },
  { keepsake: '炭火小串', description: '灯一亮，邻居们就来了。', accent: '#b56647', display: '小串滋滋响，夜晚刚刚好' },
  { keepsake: '竹编蒸笼', description: '海风的鲜甜，藏进一笼热气。', accent: '#6c909a', display: '揭开蒸笼，是一桌鲜甜' },
  { keepsake: '甜点玻璃罩', description: '让普通的一天，多一点甜。', accent: '#bd7c8c', display: '留一个胃，装今天的甜' },
  { keepsake: '晚风小特调', description: '窗外有晚风，杯里有好心情。', accent: '#7c80a1', display: '今晚的好心情，已经调好' },
] as const;

export function streetThemeCards(state: GameState) {
  const unlockedStage = themeStage(state);
  return STREET_THEMES.map((presentation, index) => {
    const stage = index + 1;
    const orders = stage === 1 ? FRESH_ORDERS : stage === 2 ? HOME_ORDERS : MODERN_ORDERS.filter(order => order.stage === stage);
    const completed = orders.filter(order => state.completedOrders.includes(order.id)).length;
    return {
      ...presentation, stage, name: THEME_NAMES[index], completed, total: orders.length,
      unlocked: stage <= unlockedStage, current: stage === unlockedStage,
      families: DEVICE_FAMILIES.filter(family => family.stage === stage),
      nextCondition: stage === 1 ? '完成 12 份开张订单与 3 项建设' : stage === 2 ? '完成 10 份家常订单' : stage < 8 ? '完成本主题前 3 份基础订单' : '收集全部风味，慢慢款待每一位来客',
    };
  });
}
