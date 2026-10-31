import { describe, expect, it } from 'vitest';
import { createInitialState, execute } from '../src/domain/engine';
import { FRESH_ORDERS, HOME_ORDERS, MODERN_ORDERS } from '../src/content/catalog';
import { BUILD_NODES } from '../src/content/board-layouts';
import { streetThemeCards } from '../src/game/street-presentation';

describe('street album follows real progress', () => {
  it('does not unlock another chapter by completing opening orders or construction', () => {
    const state=createInitialState(1000);
    state.completedOrders=FRESH_ORDERS.map(order=>order.id);
    state.day=99;
    let cards=streetThemeCards(state);
    expect(cards.filter(card=>card.unlocked).map(card=>card.stage)).toEqual([1]);
    expect(cards[0].completed).toBe(12);
    state.construction.completed=BUILD_NODES.map(node=>node.id);
    cards=streetThemeCards(state);
    expect(cards.filter(card=>card.unlocked).map(card=>card.stage)).toEqual([1]);
    expect(cards[0].current).toBe(true);
  });

  it('keeps partial theme collections visible when the next theme has already opened', () => {
    let state=createInitialState(1000);
    state.coins=500;state=execute(state,{type:'unlockAndEnterChapter',chapter:3},1000).state;state=execute(state,{type:'unlockAndEnterChapter',chapter:4},1000).state;
    state.construction.completed=BUILD_NODES.map(node=>node.id);
    const teaOrders=MODERN_ORDERS.filter(order=>order.stage===3);
    state.completedOrders=[...FRESH_ORDERS,...HOME_ORDERS,...teaOrders.slice(0,3)].map(order=>order.id);
    const before=JSON.stringify(state),cards=streetThemeCards(state);
    expect(cards.find(card=>card.current)?.stage).toBe(4);
    expect(cards[2].completed).toBe(3);
    expect(cards[2].total).toBeGreaterThan(3);
    expect(cards[2].unlocked).toBe(true);
    expect(cards[3].families.length).toBeGreaterThan(0);
    expect(cards[4].unlocked).toBe(false);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('does not attribute modern theme unlocks to a legacy save', () => {
    const state=createInitialState(1000);
    state.campaign='legacy';
    state.completedOrders=MODERN_ORDERS.map(order=>order.id);
    state.construction.completed=BUILD_NODES.map(node=>node.id);
    const cards=streetThemeCards(state);
    expect(cards.filter(card=>card.unlocked).map(card=>card.stage)).toEqual([1]);
  });
});
