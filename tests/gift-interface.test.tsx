import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createInitialState, createLegacyInitialState } from '../src/domain/engine';
import { ResourceBar } from '../src/ui/ResourceBar';
import { RedeemGiftPanel } from '../src/ui/RedeemGiftPanel';
import { GiftArtwork, giftTierFor } from '../src/ui/GiftArtwork';

const noop = () => {};
describe('gift interface accessibility contracts', () => {
  it.each([createInitialState, createLegacyInitialState])('provides the gift entry in each campaign', create => {
    const html = renderToStaticMarkup(<ResourceBar state={create(1000)} now={1000} onEnergy={noop} onSettings={noop} onRedeem={noop} onBook={noop}/>);
    expect(html).toContain('aria-label="兑换礼包"');
  });

  it('keeps the exact large energy accessible and shows the denominator only at or below the natural cap', () => {
    const state = createInitialState(1000);
    const render = () => renderToStaticMarkup(<ResourceBar state={state} now={1000} onEnergy={noop} onSettings={noop} onRedeem={noop} onBook={noop}/>);
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
    for (const code of ['GOOSE100','JIAJIABB','SISIBB']) expect(html).not.toContain(code);
    expect(html).not.toContain('autofocus');
    expect(html).toMatch(/type="submit" disabled/);
  });

  it('explains read-only recovery inside the panel and disables submission', () => {
    const html = renderToStaticMarkup(<RedeemGiftPanel busy={false} readOnly redeemGift={async () => ({ ok: false, message: '只读' })} onPendingChange={noop}/>);
    expect(html).toContain('role="status"'); expect(html).toContain('接管');
    expect(html).toMatch(/type="submit" disabled/);
  });
});

describe('tiered gift presentation', () => {
  it.each([[100,'little'],[999,'little'],[1000,'ribbon'],[9999,'ribbon'],[10000,'treasure'],[100000,'treasure']] as const)('uses the committed amount %i for the %s tier', (amount, tier) => {
    expect(giftTierFor(amount)).toBe(tier);
    const closed = renderToStaticMarkup(<GiftArtwork amount={amount}/>);
    const opened = renderToStaticMarkup(<GiftArtwork amount={amount} opened/>);
    expect(closed).toContain(`gift-artwork--${tier}`); expect(closed).not.toContain('is-open');
    expect(opened).toContain('is-open');
    expect(opened).toContain('aria-hidden="true"'); expect(opened).toContain('focusable="false"');
    expect(opened).not.toMatch(/<(?:image|img|foreignObject)\b|https?:\/\//);
    expect((opened.match(/class="gift-spark"/g) ?? []).length).toBeLessThanOrEqual(10);
  });

  it('isolates gradient IDs when several gifts share a document', () => {
    const html = renderToStaticMarkup(<><GiftArtwork/><GiftArtwork amount={1000}/><GiftArtwork amount={10000} opened/></>);
    const ids = [...html.matchAll(/id="(gift-[^"]+)"/g)].map(match => match[1]);
    expect(ids.length).toBeGreaterThan(0); expect(new Set(ids).size).toBe(ids.length);
  });
});
