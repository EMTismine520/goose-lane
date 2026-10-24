import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createInitialState, execute } from '../src/domain/engine';
import { FRESH_ORDERS } from '../src/content/catalog';
import { BUILD_NODES } from '../src/content/board-layouts';
import { reconcileHomeDevices } from '../src/domain/home-progression';
import { Codex } from '../src/ui/Codex';
import { ItemDetails } from '../src/ui/panels';
import { ItemActionBar } from '../src/ui/ItemActionBar';

const noop = () => {};
describe('home kitchen interface contracts', () => {
  it('shows source and lock conditions before opening, with no legacy stove fallback', () => {
    const state = createInitialState(1000);
    const html = renderToStaticMarkup(<ItemDetails state={state} item="dish-fresh-home-tomato-eggs" onItem={noop} onCook={noop}/>);
    expect(html).toContain('料理锅');
    expect(html).toContain('完成首段 12 份订单和 3 项建设后开放');
    expect(html).toContain('disabled');
    expect(html).not.toContain('鲜果料理台');
    expect(html).toContain('dish-fresh-home-tomato-eggs.svg');
  });
  it('renders exact codex category denominators and masks undiscovered icons with a question mark', () => {
    const state = createInitialState(1000);
    const html = renderToStaticMarkup(<Codex state={state} onItem={noop}/>);
    expect(html).toMatch(/兽肉.*?\(0\/10\)/);
    expect(html).toMatch(/禽肉.*?\(0\/7\)/);
    expect(html).toMatch(/香料调料.*?\(0\/7\)/);
    expect(html).toMatch(/家常菜.*?\(0\/10\)/);
    expect(html).toContain('codex-question');
    expect(html).not.toContain('fresh-beast-1.svg');
    expect(html).toContain('fresh-veg-1.svg');
  });
  it('explains the complete two-input prefix and longer three-input recipe in the same control', () => {
    let state = createInitialState(1000);
    state.completedOrders = FRESH_ORDERS.map(order => order.id);
    state.construction.completed = BUILD_NODES.map(node => node.id); reconcileHomeDevices(state);
    for (const [from, item] of ['fresh-poultry-1', 'fresh-spice-2'].entries()) {
      state.board[from] = { uid: `g${state.nextId++}`, item };
      state = execute(state, { type: 'stageInput', from, appliance: 'home-cooking-pot' }, 1000).state;
    }
    const html = renderToStaticMarkup(<ItemActionBar state={state} selected={47} now={1000} act={async () => true} onStorage={noop} onBook={noop} onItem={noop}/>);
    expect(html).toContain('葱香蛋饭');
    expect(html).toContain('可开火 · 也可继续补料');
    expect(html).toContain('番茄炒蛋');
    expect(html).toContain('取回鸡蛋');
    expect(html).toContain('取回香葱');
  });
});
