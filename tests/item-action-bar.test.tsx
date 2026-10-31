import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createUiPreviewState, type UiScenario } from '../src/diagnostics/ui-preview-state';
import { execute } from '../src/domain/engine';
import type { GameState } from '../src/domain/types';
import { ItemActionBar } from '../src/ui/ItemActionBar';
import { getApplianceTarget, type ApplianceTarget } from '../src/ui/ui-guidance';

const now = 100_000, pot = 'home-cooking-pot';
const noop = () => {};
function render(state: GameState, override?: ApplianceTarget) {
  const appliance = state.appliances.find(value => value.id === pot)!;
  const target = override ?? getApplianceTarget(state, pot, 'home-order-02')!;
  return renderToStaticMarkup(<ItemActionBar state={state} selected={appliance.index} now={now} act={async () => true}
    onBook={noop} onItem={noop} onDevices={noop} onAppliance={noop} applianceTargets={{ [pot]: target }}/>);
}

describe('inline appliance ingredients', () => {
  it('places all three ingredients after the appliance name with one loaded and two muted', () => {
    const state = createUiPreviewState('prefix', now);
    const appliance = state.appliances.find(value => value.id === pot)!;
    const input = appliance.inputSlots.find(value => value.item === 'fresh-spice-2')!;
    const html = render(execute(state, { type: 'withdrawInput', appliance: pot, uid: input.uid }, now).state);
    expect(html).toContain('class="appliance-name">料理锅</b>');
    expect(html.indexOf('appliance-name')).toBeLessThan(html.indexOf('appliance-ingredients'));
    expect(html.match(/class="appliance-ingredient /g)).toHaveLength(3);
    expect(html.match(/class="appliance-ingredient is-missing"/g)).toHaveLength(2);
    expect(html.match(/class="appliance-ingredient-check"/g)).toHaveLength(1);
    expect(html).toContain('目标番茄炒蛋');
    expect(html).toContain('番茄，未投入 0/1，查看介绍');
    expect(html).toContain('鸡蛋，已投入 1/1，查看介绍');
    expect(html).toContain('香葱，未投入 0/1，查看介绍');
    expect(html).not.toContain('已投1份');
    expect(html).not.toContain('查看缺料');
    expect(html).not.toContain('aria-label="开火');
    expect(html).toContain('>食谱</span>');
  });

  it('keeps the full recipe visible and offers the matching start action once complete', () => {
    const html = render(createUiPreviewState('loaded', now));
    expect(html.match(/class="appliance-ingredient-check"/g)).toHaveLength(3);
    expect(html).not.toContain('is-missing');
    expect(html).toContain('aria-label="开火 · 番茄炒蛋"');
    expect(html).toContain('class="appliance-name">料理锅</b>');
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
    expect(html.match(/class="appliance-ingredient /g)).toHaveLength(3);
    expect(html.match(/class="appliance-ingredient is-missing"/g)).toHaveLength(1);
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
    expect(html.match(/class="appliance-ingredient has-input"/g)).toHaveLength(2);
    expect(html.match(/class="appliance-ingredient-check"/g)).toHaveLength(1);
  });

  it.each([
    ['cooking', '制作中'], ['ready', '做好啦'], ['full', '棋盘已满'],
  ] as [UiScenario, string][])('retains the existing %s progress and collection presentation', (scenario, text) => {
    const html = render(createUiPreviewState(scenario, now));
    expect(html).toContain(text);
    expect(html).not.toContain('appliance-inline');
    expect(html).not.toContain('is-missing');
  });

  it('restores the idle hint after the tray is emptied', () => {
    let state = createUiPreviewState('prefix', now);
    for (const input of [...state.appliances.find(value => value.id === pot)!.inputSlots]) {
      state = execute(state, { type: 'withdrawInput', appliance: pot, uid: input.uid }, now).state;
    }
    const html = render(state);
    expect(html).toContain('拖入食材 · 查看食谱');
    expect(html).not.toContain('appliance-inline');
  });
});
