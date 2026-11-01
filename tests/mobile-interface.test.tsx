import { Children, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createUiPreviewState } from '../src/diagnostics/ui-preview-state';
import { availableOrders, createInitialState, createLegacyInitialState } from '../src/domain/engine';
import { ItemActionBar } from '../src/ui/ItemActionBar';
import { ResourceBar } from '../src/ui/ResourceBar';
import { SettingsPanel } from '../src/ui/panels';

const noop = () => {};
function button(node: ReactNode, label: string): { onClick?: () => void; disabled?: boolean } | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ children?: ReactNode; 'aria-label'?: string; onClick?: () => void; disabled?: boolean }>(child)) continue;
    if (child.type === 'button' && child.props['aria-label'] === label) return child.props;
    // Expand only this pure routing component; art components use React hooks.
    if (typeof child.type === 'function' && child.type.name === 'RecipeDevice') {
      const render = child.type as (props: unknown) => ReactNode;
      const rendered = render(child.props);
      const found = button(rendered, label);
      if (found) return found;
    }
    const found = button(child.props.children, label);
    if (found) return found;
  }
}
describe('mobile navigation and independent ingredient buttons', () => {
  it.each([true, false])('routes an order device to its actual instance or shelf, available=%s', available => {
    const state = createUiPreviewState('harbor-orders', 100_000);
    const order = availableOrders(state).find(order => order.needs[0].item === 'dish-fresh-ico-0077')!;
    const steamer = state.devices.find(device => device.familyId === 'steamer')!;
    if (!available) steamer.index = null;
    const before = JSON.stringify(state);
    const onAppliance = vi.fn(), onDevices = vi.fn(), act = vi.fn(async () => true);
    const dock = ItemActionBar({ state, selected: null, now: 100_000, focusOrder: order,
      act, onBook: noop, onItem: noop, onAppliance, onDevices });
    button(dock, '打开蒸笼管理' + (available ? '' : '，本厨房暂无可用器具'))!.onClick!();
    expect(onAppliance.mock.calls).toEqual(available ? [[steamer.id]] : []);
    expect(onDevices.mock.calls).toEqual(available ? [] : [['steamer']]);
    expect(act).not.toHaveBeenCalled();
    expect(JSON.stringify(state)).toBe(before);
    expect(renderToStaticMarkup(dock)).not.toContain('aria-label="开火');
  });
  it('opens the producer for a direct ingredient order without generating or cooking', () => {
    const state = createUiPreviewState('chapter-1', 100_000), before = JSON.stringify(state);
    const act = vi.fn(async () => true), onDevices = vi.fn(), onAppliance = vi.fn();
    const dock = ItemActionBar({ state, selected: null, now: 100_000, focusOrder: availableOrders(state)[0],
      act, onBook: noop, onItem: noop, onDevices, onAppliance });
    button(dock, '打开蔬菜推车管理')!.onClick!();
    expect(onDevices.mock.calls).toEqual([['vegetable-cart']]);
    expect(onAppliance).not.toHaveBeenCalled();
    expect(act).not.toHaveBeenCalled();
    expect(JSON.stringify(state)).toBe(before);
  });
  it('routes the appliance and loaded/missing ingredients to separate destinations without changing inputs', () => {
    const state = createUiPreviewState('one-input', 100_000), before = JSON.stringify(state);
    const onItem = vi.fn(), onAppliance = vi.fn(), act = vi.fn(async () => true);
    const dock = ItemActionBar({ state, selected: state.appliances.find(a => a.id === 'home-cooking-pot')!.index, now: 100_000,
      act, onBook: noop, onItem, onAppliance });
    button(dock, '打开料理锅管理')!.onClick!();
    expect(onAppliance.mock.calls).toEqual([['home-cooking-pot']]);
    expect(act).not.toHaveBeenCalled(); expect(JSON.stringify(state)).toBe(before);
    const html = renderToStaticMarkup(dock);
    expect(html).toContain('鸡蛋，已投入 1/1，查看介绍');
    expect(html).toContain('番茄，未投入 0/1，查看介绍');
    expect(html).not.toContain('disabled');
    expect(html).not.toMatch(/<button\b[^>]*>(?:(?!<\/button>)[\s\S])*?<button\b/);
    expect(html).not.toContain('tool-rail');
    expect(html).not.toContain('打开图鉴');
    expect(html).not.toContain('打开仓库');
  });
  it.each([createInitialState, createLegacyInitialState])('puts a working discovery guide beside energy in each campaign', create => {
    const onBook = vi.fn();
    const bar = ResourceBar({ state: create(1000), now: 1000, onBook, newDiscoveries: 12, onSettings: noop, onRedeem: noop, onEnergy: noop });
    button(bar, '打开图鉴')!.onClick!();
    expect(onBook).toHaveBeenCalledOnce();
    const html = renderToStaticMarkup(bar);
    expect(html.indexOf('resource-pill energy')).toBeLessThan(html.indexOf('codex-button'));
    expect(html.indexOf('codex-button')).toBeLessThan(html.indexOf('resource-pill coins'));
    expect(html).toContain('12个新发现'); expect(html).toContain('9+');
    expect(html).toContain('兑换礼包'); expect(html).toContain('设置与存档');
  });
  it('keeps the management and storage entrypoints in settings with actual capacity', () => {
    const state = createInitialState(1000);
    state.storage.push({ uid: 'stored-ingredient', item: 'fresh-veg-1' });
    const html = renderToStaticMarkup(<SettingsPanel state={state} dispatch={async () => true} onSave={noop} onLoad={noop} onRestart={noop} onDevices={noop} onStorage={noop}/>);
    expect(html).toContain('设备与收纳'); expect(html).toContain('打开设备架'); expect(html).toContain('打开仓库，1/8');
    expect(html).toContain('保存存档'); expect(html).toContain('读取存档');
  });
});
