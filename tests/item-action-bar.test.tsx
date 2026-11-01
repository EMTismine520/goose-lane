import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createUiPreviewState, type UiScenario } from '../src/diagnostics/ui-preview-state';
import { availableOrders, execute } from '../src/domain/engine';
import type { GameState } from '../src/domain/types';
import { ItemActionBar } from '../src/ui/ItemActionBar';
import { getApplianceTarget, type ApplianceTarget } from '../src/ui/ui-guidance';
import { MODERN_ORDERS } from '../src/content/catalog';

const now = 100_000, pot = 'home-cooking-pot';
const noop = () => {};
function render(state: GameState, override?: ApplianceTarget) {
  const appliance = state.appliances.find(value => value.id === pot)!;
  const target = override ?? getApplianceTarget(state, pot, 'home-order-02')!;
  return renderToStaticMarkup(<ItemActionBar state={state} selected={appliance.index} now={now} act={async () => true}
    onBook={noop} onItem={noop} onDevices={noop} onAppliance={noop} applianceTargets={{ [pot]: target }}/>);
}

describe('inline appliance ingredients', () => {
  it('shows the meal and real device as icons with one loaded and two muted ingredients', () => {
    const state = createUiPreviewState('prefix', now);
    const appliance = state.appliances.find(value => value.id === pot)!;
    const input = appliance.inputSlots.find(value => value.item === 'fresh-spice-2')!;
    const html = render(execute(state, { type: 'withdrawInput', appliance: pot, uid: input.uid }, now).state);
    expect(html).toContain('aria-label="打开料理锅管理"');
    expect(html).toContain('alt="料理锅 1级"');
    expect(html.match(/class="recipe-ingredient /g)).toHaveLength(3);
    expect(html.match(/class="recipe-ingredient is-missing"/g)).toHaveLength(2);
    expect(html.match(/class="recipe-quantity is-complete"/g)).toHaveLength(1);
    expect(html).toContain('alt="番茄炒蛋"');
    expect(html).toContain('目标番茄炒蛋');
    expect(html).toContain('番茄，未投入 0/1，查看介绍');
    expect(html).toContain('鸡蛋，已投入 1/1，查看介绍');
    expect(html).toContain('香葱，未投入 0/1，查看介绍');
    expect(html).not.toContain('已投1份');
    expect(html).not.toContain('查看缺料');
    expect(html).not.toContain('aria-label="开火');
    expect(html.replace(/<[^>]*>/g, '')).not.toMatch(/番茄炒蛋|料理锅|食谱|待投料|材料齐了/);
  });

  it('keeps the full recipe visible and offers the matching start action once complete', () => {
    const html = render(createUiPreviewState('loaded', now));
    expect(html.match(/class="recipe-quantity is-complete"/g)).toHaveLength(3);
    expect(html).not.toContain('is-missing');
    expect(html).toContain('aria-label="开火 · 番茄炒蛋"');
    expect(html).toContain('aria-label="打开料理锅管理"');
  });

  it('does not offer the ready short recipe while the displayed order is missing tomato', () => {
    const html = render(createUiPreviewState('prefix', now));
    expect(html).toContain('番茄，未投入 0/1，查看介绍');
    expect(html).not.toContain('aria-label="开火');
  });

  it('returns a withdrawn ingredient to gray without removing its place in the recipe', () => {
    const state = createUiPreviewState('loaded', now);
    const input = state.appliances.find(value => value.id === pot)!.inputSlots[0];
    const html = render(execute(state, { type: 'withdrawInput', appliance: pot, uid: input.uid }, now).state);
    expect(html.match(/class="recipe-ingredient /g)).toHaveLength(3);
    expect(html.match(/class="recipe-ingredient is-missing"/g)).toHaveLength(1);
    expect(html).toContain('番茄，未投入 0/1，查看介绍');
  });

  it('keeps a partially loaded multi-unit ingredient colored and shows its exact quantity', () => {
    const state = createUiPreviewState('prefix', now);
    const target = getApplianceTarget(state, pot, 'home-order-02')!;
    target.recipe = { ...target.recipe, inputs: target.recipe.inputs.map(need => need.item === 'fresh-poultry-1' ? { ...need, count: 2 } : need) };
    target.ingredients = target.ingredients.map(need => need.item === 'fresh-poultry-1' ? { ...need, required: 2, complete: false } : need);
    const html = render(state, target);
    expect(html).toContain('鸡蛋，部分投入 1/2，查看介绍');
    expect(html).toContain('>1/2</span>');
    expect(html.match(/class="recipe-ingredient has-input"/g)).toHaveLength(2);
    expect(html.match(/class="recipe-quantity is-complete"/g)).toHaveLength(1);
  });

  it.each([
    ['cooking', '进度'], ['ready', '领取'], ['full', '整理'],
  ] as [UiScenario, string][])('retains the existing %s progress and collection action', (scenario, text) => {
    const html = render(createUiPreviewState(scenario, now));
    expect(html).toContain('data-phase="' + (scenario === 'full' ? 'ready' : scenario) + '"');
    expect(html).toContain(text);
    expect(html.replace(/<[^>]*>/g, '')).not.toMatch(/番茄炒蛋|料理锅|食谱|做好啦|棋盘已满/);
    expect(html).toContain('alt="番茄炒蛋"');
    expect(html.match(/class="recipe-ingredient /g)).toHaveLength(3);
    expect(html.match(/class="recipe-quantity is-complete"/g)).toHaveLength(3);
    expect(html).not.toContain('is-missing');
  });

  it('previews the order recipe without offering to start after the tray is emptied', () => {
    let state = createUiPreviewState('prefix', now);
    for (const input of [...state.appliances.find(value => value.id === pot)!.inputSlots]) {
      state = execute(state, { type: 'withdrawInput', appliance: pot, uid: input.uid }, now).state;
    }
    const html = render(state);
    expect(html.replace(/<[^>]*>/g, '')).not.toContain('待投料');
    expect(html.match(/class="recipe-ingredient is-missing"/g)).toHaveLength(3);
    expect(html).not.toContain('aria-label="开火');
  });
  it('does not guess a recipe when an empty appliance has no outstanding matching order', () => {
    let state = createUiPreviewState('prefix', now);
    for (const input of [...state.appliances.find(value => value.id === pot)!.inputSlots]) {
      state = execute(state, { type: 'withdrawInput', appliance: pot, uid: input.uid }, now).state;
    }
    state.completedOrders = MODERN_ORDERS.map(order => order.id);
    expect(getApplianceTarget(state, pot, null)).toBeNull();
    const html = render(state);
    expect(html).toContain('aria-label="打开料理锅管理"');
    expect(html.replace(/<[^>]*>/g, '')).not.toMatch(/食谱|料理锅|待投料/);
    expect(html).not.toContain('class="recipe-ingredient ');
    expect(html).not.toContain('aria-label="开火');
  });
});

describe('direct order details', () => {
  function orderHtml(state: GameState) {
    return renderToStaticMarkup(<ItemActionBar state={state} selected={null} now={now} act={async () => true}
      onBook={noop} onItem={noop} focusOrder={availableOrders(state).find(order => order.needs[0].item === 'dish-fresh-ico-0077')}/>);
  }
  it('shows the actual dish and recipe, keeping unavailable icons clickable', () => {
    const state = createUiPreviewState('harbor-orders', now);
    const html = orderHtml(state);
    expect(html).toContain('流沙奶黄包');
    expect(html).toContain('alt="流沙奶黄包"');
    expect(html).toContain('vector-item muted');
    expect(html).toContain('>0/1');
    expect(html).toContain('aria-label="打开蒸笼管理"');
    for (const name of ['软面团', '鸡蛋', '黄油']) expect(html).toContain(name + '，已有 0/1，查看介绍');
    expect(html.match(/class="recipe-ingredient /g)).toHaveLength(3);
    expect(html).not.toMatch(/心愿|查看缺料|找一对|disabled/);
    expect(html.replace(/<[^>]*>/g, '')).not.toMatch(/流沙奶黄包|蒸笼|食谱|已有/);
  });
  it('counts stored dishes and ingredients independently of discovery history', () => {
    const state = createUiPreviewState('harbor-orders', now);
    const order = availableOrders(state).find(order => order.needs[0].item === 'dish-fresh-ico-0077')!;
    state.discovered.push(order.needs[0].item);
    expect(orderHtml(state)).toContain('>0/1');
    state.storage.push({ uid: 'stored-bun', item: order.needs[0].item }, { uid: 'stored-butter', item: 'fresh-milk-2' });
    const html = orderHtml(state);
    expect(html).toContain('order-stock is-complete');
    expect(html).toContain('>1/1');
    expect(html).toContain('黄油，已有 1/1，查看介绍');
  });
  it('keeps the empty dock quiet and offers undo after a sale', () => {
    let state = createUiPreviewState('chapter-1', now);
    const props = { selected: null, now, act: async () => true, onBook: noop, onItem: noop };
    const html = renderToStaticMarkup(<ItemActionBar state={state} {...props}/>);
    expect(html).not.toMatch(/找一对|看食谱/);
    const index = state.board.findIndex(Boolean);
    state = execute(state, { type: 'sell', index }, now).state;
    expect(renderToStaticMarkup(<ItemActionBar state={state} {...props}/>)).toContain('撤销出售');
  });
});
