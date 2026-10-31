import { Children, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createUiPreviewState } from '../src/diagnostics/ui-preview-state';
import { createInitialState, createLegacyInitialState } from '../src/domain/engine';
import { ItemActionBar } from '../src/ui/ItemActionBar';
import { ResourceBar } from '../src/ui/ResourceBar';
import { SettingsPanel } from '../src/ui/panels';

const noop = () => {};
function button(node: ReactNode, label: string): { onClick?: () => void; disabled?: boolean } | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ children?: ReactNode; 'aria-label'?: string; onClick?: () => void; disabled?: boolean }>(child)) continue;
    if (child.type === 'button' && child.props['aria-label'] === label) return child.props;
    const found = button(child.props.children, label);
    if (found) return found;
  }
}
describe('mobile navigation and independent ingredient buttons', () => {
  it('routes the appliance and loaded/missing ingredients to separate destinations without changing inputs', () => {
    const state = createUiPreviewState('one-input', 100_000), before = JSON.stringify(state);
    const onItem = vi.fn(), onAppliance = vi.fn(), act = vi.fn(async () => true);
    const dock = ItemActionBar({ state, selected: state.appliances.find(a => a.id === 'home-cooking-pot')!.index, now: 100_000,
      act, onBook: noop, onItem, onAppliance });
    button(dock, '查看料理锅食谱与进度')!.onClick!();
    const egg = button(dock, '鸡蛋，已投入 1/1，查看介绍')!;
    const tomato = button(dock, '番茄，未投入 0/1，查看介绍')!;
    expect(egg.disabled).not.toBe(true); expect(tomato.disabled).not.toBe(true);
    egg.onClick!(); tomato.onClick!();
    expect(onAppliance.mock.calls).toEqual([['home-cooking-pot']]);
    expect(onItem.mock.calls).toEqual([['fresh-poultry-1'], ['fresh-veg-1']]);
    expect(act).not.toHaveBeenCalled(); expect(JSON.stringify(state)).toBe(before);
    const html = renderToStaticMarkup(dock);
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
