import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ORDERS } from '../src/content/catalog';
import { availableOrders, createInitialState, createLegacyInitialState } from '../src/domain/engine';
import { themeProgress } from '../src/domain/devices';
import { CustomerStrip } from '../src/ui/CustomerStrip';
import { ResourceBar } from '../src/ui/ResourceBar';
import type { GameState } from '../src/domain/types';

const noop = () => {};
const customers = (state: GameState, focusedOrderId?: string) => renderToStaticMarkup(<CustomerStrip state={state} active act={async () => true} onItem={noop} onScroll={noop} onFocus={noop} focusedOrderId={focusedOrderId}/>);
const card = (html: string, id: string) => html.split('<article').find(part => part.includes(`data-order-id="${id}"`))!.split('</article>')[0];

describe('guest-facing order and resource contracts', () => {
  it('shows actual modern theme progress and retains the legacy business day', () => {
    const modern = createInitialState(1000);
    const modernHtml = renderToStaticMarkup(<ResourceBar state={modern} now={1000} onSettings={noop} onEnergy={noop} onRedeem={noop} onTheme={noop}/>);
    expect(modernHtml).toContain(themeProgress(modern).name);
    expect(modernHtml).toContain('查看风味进度');
    expect(modernHtml).not.toContain('营业日');
    const legacy = createLegacyInitialState(1000);
    legacy.day = 4;
    const legacyHtml = renderToStaticMarkup(<ResourceBar state={legacy} now={1000} onSettings={noop} onEnergy={noop} onRedeem={noop}/>);
    expect(legacyHtml).toContain('营业日');
    expect(legacyHtml).toContain('<b>4</b>');
    expect(legacyHtml).not.toContain('查看风味进度');
  });

  it('keeps the exact coin amount accessible while shortening the visible large number', () => {
    const state = createInitialState(1000);
    state.coins = 12345678;
    const html = renderToStaticMarkup(<ResourceBar state={state} now={1000} onSettings={noop} onEnergy={noop} onRedeem={noop}/>);
    expect(html).toContain('data-resource-anchor="coins"');
    expect(html).toContain('aria-label="金币 12345678"');
    expect(html).toContain('1230万');
  });

  it('distinguishes missing, partial and deliverable inventory, including stored food', () => {
    const order = ORDERS.find(value => value.id.startsWith('day-') && value.needs.length === 2)!;
    const state = createLegacyInitialState(1000);
    state.day = order.day;
    const dayOrders = ORDERS.filter(value => value.id.startsWith(`day-${order.day}-order-`));
    state.completedOrders = dayOrders.slice(0, dayOrders.findIndex(value => value.id === order.id)).map(value => value.id);
    state.board.fill(null);
    state.storage = [];
    expect(availableOrders(state).some(value => value.id === order.id)).toBe(true);
    expect(card(customers(state), order.id)).toContain('data-demand-status="missing"');
    state.storage.push({ uid: 'guest-stored-1', item: order.needs[0].item });
    const partial = card(customers(state, order.id), order.id);
    expect(partial).toContain('data-demand-status="partial"');
    expect(partial).toContain('备料中');
    expect(partial).toContain('aria-pressed="true"');
    expect(partial).toContain('data-expression="expectant"');
    state.board[0] = { uid: 'guest-board-1', item: order.needs[1].item };
    const ready = card(customers(state, order.id), order.id);
    expect(ready).toContain('data-demand-status="ready"');
    expect(ready).toContain('data-expression="eager"');
    const delivery = ready.split('data-deliver-order=')[1].split('</button>')[0];
    expect(delivery).not.toContain('disabled');
    expect(ready).toContain('查看来源');
    expect(ready).toContain('取消关注');
  });
});
