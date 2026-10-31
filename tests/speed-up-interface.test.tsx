import { Children, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createInitialState, getApplianceStatus, getBoardEntity } from '../src/domain/engine';
import { boardTapAction } from '../src/game/board-input';
import { ResourceBar } from '../src/ui/ResourceBar';
import { getSpeedUpModel, SpeedUpBalance, SpeedUpPanel } from '../src/ui/SpeedUpPanel';

const now = Date.now();
const noop = () => {};
function fixture() {
  const state = createInitialState(now), a = state.appliances[0], recipe = getApplianceStatus(state, a.id, now)!.recipes[0];
  a.job = { id: `g${state.nextId++}`, recipe: recipe.id, output: recipe.output, startedAt: now, endsAt: now + 20_000 };
  return { state, a, target: { appliance: a.id, expectedJobId: a.job.id, expectedWorkspaceId: state.activeWorkspaceId } };
}
function findButton(node: ReactNode, label: string): { onClick?: () => void } | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ children?: ReactNode; 'aria-label'?: string; onClick?: () => void }>(child)) continue;
    if (child.type === 'button' && child.props['aria-label'] === label) return child.props;
    const found = findButton(child.props.children, label); if (found) return found;
  }
}
describe('speed-up entrypoints and fixed-target presentation', () => {
  it('places an independent ticket balance after coins, retaining full accessible amounts and a rules-only action', () => {
    const state = createInitialState(now); state.speedUpTickets = 1_000_000_000_000;
    const onSpeedUp = vi.fn();
    const bar = ResourceBar({ state, now, onSpeedUp, onSettings: noop, onEnergy: noop, onBook: noop, onRedeem: noop });
    findButton(bar, '加速券 1000000000000 张，查看使用说明')!.onClick!(); expect(onSpeedUp).toHaveBeenCalledOnce();
    const html = renderToStaticMarkup(bar);
    expect(html.indexOf('resource-pill coins')).toBeLessThan(html.indexOf('resource-pill speed-tickets'));
    expect(html.indexOf('resource-pill speed-tickets')).toBeLessThan(html.indexOf('gift-button'));
    expect(html).not.toContain('/100</b>'); expect(state.speedUpTickets).toBe(1_000_000_000_000);
    expect(renderToStaticMarkup(<SpeedUpBalance tickets={0} onClose={noop}/>)).toContain('确认消耗 1 张');
  });

  it('opens confirmation rather than submitting a debit when a cooking appliance is tapped', () => {
    const { state, a, target } = fixture();
    expect(boardTapAction(state, a.index, null)).toEqual({ kind: 'confirmSpeedup', appliance: a.id, jobId: target.expectedJobId });
    expect(state.speedUpTickets).toBe(100);
  });

  it('describes cost and resulting balance, then replaces cost with free collection at the natural deadline', () => {
    const { state, target } = fixture();
    const props = { state, target, busy: false, readOnly: false, speedUpCooking: vi.fn(), act: vi.fn(), onPendingChange: noop, onClose: noop, onStorage: noop };
    const confirm = renderToStaticMarkup(<SpeedUpPanel {...props} now={now}/>);
    expect(confirm).toContain('消耗加速券 1 张'); expect(confirm).toContain('使用后剩余'); expect(confirm).toContain('99'); expect(confirm).toContain('取消');
    const ready = renderToStaticMarkup(<SpeedUpPanel {...props} now={now + 20_000}/>);
    expect(ready).toContain('本次未消耗加速券'); expect(ready).toContain('领取成品'); expect(ready).not.toContain('使用 1 张，立即完成');
    state.speedUpTickets = 0;
    expect(renderToStaticMarkup(<SpeedUpPanel {...props} now={now}/>)).toContain('加速券不足，可以等待自然完成');
  });

  it('keeps full-board dishes safe and never follows a replacement job or kitchen', () => {
    const { state, a, target } = fixture();
    for (let index = 0; index < state.board.length; index++) if (getBoardEntity(state, index).kind === 'empty') state.board[index] = { uid: `g${state.nextId++}`, item: 'fresh-veg-1' };
    expect(getSpeedUpModel(state, target, now + 20_000)).toMatchObject({ ready: true, canCollect: false });
    const html = renderToStaticMarkup(<SpeedUpPanel state={state} target={target} now={now + 20_000} busy={false} readOnly={false} speedUpCooking={vi.fn()} act={vi.fn()} onPendingChange={noop} onClose={noop} onStorage={noop}/>);
    expect(html).toContain('成品已做好，为你保留'); expect(html).toContain('整理棋盘'); expect(html).toContain('打开仓库');
    expect(getSpeedUpModel(state, { ...target, expectedWorkspaceId: 'chapter-2' }, now)).toBeNull();
    a.job!.id = `g${state.nextId++}`; expect(getSpeedUpModel(state, target, now)).toBeNull();
  });
});
