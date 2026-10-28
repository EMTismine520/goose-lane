import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createInitialState, createLegacyInitialState } from '../src/domain/engine';
import { ResourceBar } from '../src/ui/ResourceBar';
import { RedeemGiftPanel } from '../src/ui/RedeemGiftPanel';

const noop = () => {};
describe('gift interface accessibility contracts', () => {
  it.each([createInitialState, createLegacyInitialState])('provides the gift entry in each campaign', create => {
    const html = renderToStaticMarkup(<ResourceBar state={create(1000)} now={1000} onEnergy={noop} onSettings={noop} onRedeem={noop}/>);
    expect(html).toContain('aria-label="兑换礼包"');
  });

  it('keeps the exact large energy accessible and shows the denominator only at or below the natural cap', () => {
    const state = createInitialState(1000);
    const render = () => renderToStaticMarkup(<ResourceBar state={state} now={1000} onEnergy={noop} onSettings={noop} onRedeem={noop}/>);
    expect(render()).toContain('/100');
    state.energy.value = 12345678;
    const html = render();
    expect(html).toContain('aria-label="体力 12345678，查看恢复规则"');
    expect(html).toContain('1230万'); expect(html).not.toContain('/100');
  });

  it('labels a paste-friendly input without exposing the valid code or opening the keyboard automatically', () => {
    const html = renderToStaticMarkup(<RedeemGiftPanel busy={false} readOnly={false} redeemGift={async () => ({ ok: true, energyAdded: 100, energyValue: 160 })} onPendingChange={noop}/>);
    expect(html).toContain('兑换码'); expect(html).toContain('for=');
    expect(html).toContain('maxLength="64"'); expect(html).toContain('spellCheck="false"');
    expect(html).toContain('autoComplete="off"'); expect(html).toContain('aria-describedby=');
    expect(html).toContain('可重复使用');
    expect(html).not.toContain('GOOSE100'); expect(html).not.toContain('autofocus');
    expect(html).toMatch(/type="submit" disabled/);
  });

  it('explains read-only recovery inside the panel and disables submission', () => {
    const html = renderToStaticMarkup(<RedeemGiftPanel busy={false} readOnly redeemGift={async () => ({ ok: false, message: '只读' })} onPendingChange={noop}/>);
    expect(html).toContain('role="status"'); expect(html).toContain('接管');
    expect(html).toMatch(/type="submit" disabled/);
  });
});
