import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CUSTOMERS, ITEMS, ORDERS } from '../content/catalog';
import type { GameEvent } from '../domain/types';
import { Goose, ItemIcon } from './parts';

export interface RewardFlightProps { event: GameEvent | null; reducedMotion: boolean; }
interface Point { x: number; y: number; }
interface Flight {
  id: number;
  source: Point;
  target: Point;
  amount: number;
  width: number;
  reduced: boolean;
  color?: string;
  accessory?: string;
  foods: { item: string; source: Point }[];
}

function Coin() {
  return <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
    <ellipse cx="16" cy="19" rx="12" ry="11" fill="#cf9232" stroke="#a8742c" strokeWidth="1.5"/>
    <circle cx="16" cy="15" r="12" fill="#ffd568" stroke="#a8742c" strokeWidth="1.5"/>
    <circle cx="16" cy="15" r="8.5" fill="#f4bd48" stroke="#ffe99b" strokeWidth="1.5"/>
    <path d="m16 8 2.1 4.3 4.8.7-3.5 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.5-3.3 4.8-.7Z" fill="#fff0af"/>
    <path d="M8 9q3-4 7-4" fill="none" stroke="#fff5c5" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}

function visibleElement(root: Element, selector: string): HTMLElement | null {
  const shell = root.getBoundingClientRect();
  return [...root.querySelectorAll<HTMLElement>(selector)].find(element => {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= shell.left || rect.left >= shell.right) return false;
    const strip = element.closest('.customer-strip')?.getBoundingClientRect();
    return !strip || Math.min(rect.right, strip.right) - Math.max(rect.left, strip.left) > 16;
  }) ?? null;
}

/** A single replaceable delivery flourish. Currency is already committed before this runs. */
export function RewardFlight({ event, reducedMotion }: RewardFlightProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const origin = useRef<{ x: number; y: number; at: number } | null>(null);
  const inventoryPositions = useRef(new Map<string, Point[]>());
  const seen = useRef(new Set<string>());
  const sequence = useRef(0);
  const lastFlight = useRef(-Infinity);
  const coins = useRef<(HTMLSpanElement | null)[]>([]);
  const foods = useRef<(HTMLSpanElement | null)[]>([]);
  const thanks = useRef<HTMLDivElement | null>(null);
  const amount = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.game-shell');
    setHost(shell);
    // Capture the original customer's position before the committed order replaces its card.
    const remember = (click: MouseEvent) => {
      if (!(click.target instanceof Element)) return;
      const button = click.target.closest('.serve-button');
      const card = button?.closest('.customer-card');
      if (!card || !shell?.contains(card)) return;
      const rect = card.getBoundingClientRect();
      origin.current = { x: rect.left + rect.width * 0.62, y: rect.top + rect.height * 0.7, at: performance.now() };
      const positions = new Map<string, Point[]>();
      for (const button of shell.querySelectorAll<HTMLButtonElement>('.board-keyboard-grid [role="gridcell"] > button')) {
        const name = button.getAttribute('aria-label')?.split('，')[1];
        const rect = button.getBoundingClientRect();
        if (!name || !rect.width || !rect.height) continue;
        positions.set(name, [...(positions.get(name) ?? []), { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
      }
      inventoryPositions.current = positions;
    };
    const clear = () => setFlight(null);
    const visibility = () => { if (document.hidden) clear(); };
    document.addEventListener('click', remember, true);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', clear);
    return () => {
      document.removeEventListener('click', remember, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', clear);
    };
  }, []);

  useEffect(() => {
    if (!host || event?.type !== 'deliver' || document.hidden) return;
    const identity = `${event.order ?? event.message}:${event.amount ?? 0}`;
    if (seen.current.has(identity)) return;
    seen.current.add(identity);
    if (seen.current.size > 32) seen.current.delete(seen.current.values().next().value!);
    const destination = visibleElement(host, '.resource-pill.coins');
    if (!destination) return;
    const shellRect = host.getBoundingClientRect();
    const targetRect = destination.getBoundingClientRect();
    const customerCard = visibleElement(host, '.customer-card.leaving') ?? visibleElement(host, '.customer-card');
    const cardRect = customerCard?.getBoundingClientRect();
    const recent = origin.current && performance.now() - origin.current.at < 4_000 ? origin.current : null;
    const source = recent ?? { x: cardRect ? cardRect.left + cardRect.width * 0.62 : shellRect.left + shellRect.width / 2, y: cardRect ? cardRect.top + cardRect.height * 0.7 : shellRect.top + 125 };
    const order = ORDERS.find(order => order.id === event.order);
    const customer = CUSTOMERS.find(customer => customer.id === order?.customer);
    const now = performance.now();
    // Rapid deliveries replace the previous flourish; no particle or animation queue is created.
    const reduced = reducedMotion || now - lastFlight.current < 120;
    lastFlight.current = now;
    origin.current = null;
    setFlight({
      id: ++sequence.current,
      source: { x: Math.max(22, Math.min(shellRect.width - 22, source.x - shellRect.left)), y: source.y - shellRect.top },
      target: { x: targetRect.left + 20 - shellRect.left, y: targetRect.top + targetRect.height / 2 - shellRect.top },
      amount: Math.max(0, event.amount ?? 0), width: shellRect.width, reduced,
      color: customer?.color, accessory: customer?.accessory,
      foods: (order?.needs ?? []).slice(0, 2).flatMap(need => {
        const point = recent ? inventoryPositions.current.get(ITEMS[need.item]?.name)?.[0] : undefined;
        return point ? [{ item: need.item, source: { x: point.x - shellRect.left, y: point.y - shellRect.top } }] : [];
      }),
    });
  }, [event, host, reducedMotion]);

  useLayoutEffect(() => {
    if (!flight) return;
    const animations: Animation[] = [];
    const timer = window.setTimeout(() => setFlight(current => current?.id === flight.id ? null : current), flight.reduced ? 850 : 750);
    if (!flight.reduced && !reducedMotion) {
      const dx = flight.target.x - flight.source.x;
      const dy = flight.target.y - flight.source.y;
      foods.current.forEach((food, index) => {
        const source = flight.foods[index]?.source;
        if (!food?.animate || !source) return;
        animations.push(food.animate([
          { transform: 'translate(0, 0) scale(.9)', opacity: 0.9 },
          { transform: `translate(${(flight.source.x - source.x) * 0.45}px, ${(flight.source.y - source.y) * 0.5 - 20}px) scale(1)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${flight.source.x - source.x}px, ${flight.source.y - source.y}px) scale(.4)`, opacity: 0 },
        ], { duration: 220, delay: index * 30, easing: 'ease-in-out', fill: 'both' }));
      });
      coins.current.forEach((coin, index) => {
        if (!coin?.animate) return;
        const spread = (index - 1) * 14;
        animations.push(coin.animate([
          { transform: `translate(${spread}px, 0) scale(.65) rotate(-15deg)`, opacity: 0, offset: 0 },
          { transform: `translate(${spread}px, -12px) scale(1.05) rotate(0deg)`, opacity: 1, offset: 0.15 },
          { transform: `translate(${dx * 0.46 + spread}px, ${dy * 0.3 - 26}px) scale(1) rotate(16deg)`, opacity: 1, offset: 0.58 },
          { transform: `translate(${dx}px, ${dy}px) scale(.45) rotate(40deg)`, opacity: 0, offset: 1 },
        ], { duration: 430 + index * 15, delay: 70 + index * 25, easing: 'cubic-bezier(.25,.55,.45,1)', fill: 'both' }));
      });
      if (thanks.current?.animate) animations.push(thanks.current.animate([
        { transform: 'translateY(5px) scale(.94)', opacity: 0 },
        { transform: 'translateY(0) scale(1)', opacity: 1, offset: 0.2 },
        { transform: 'translateY(0) scale(1)', opacity: 1, offset: 0.75 },
        { transform: 'translateY(-5px) scale(1)', opacity: 0 },
      ], { duration: 650, easing: 'ease-out', fill: 'both' }));
      if (amount.current?.animate) animations.push(amount.current.animate([
        { transform: 'translateY(3px) scale(.85)', opacity: 0 },
        { transform: 'translateY(0) scale(1.08)', opacity: 1, offset: 0.3 },
        { transform: 'translateY(-3px) scale(1)', opacity: 1, offset: 0.75 },
        { transform: 'translateY(-5px) scale(1)', opacity: 0 },
      ], { duration: 320, delay: 390, easing: 'ease-out', fill: 'both' }));
    }
    return () => { window.clearTimeout(timer); animations.forEach(animation => animation.cancel()); };
  }, [flight, reducedMotion]);

  if (!host || !flight) return null;
  const quiet = flight.reduced || reducedMotion;
  return createPortal(<div className="reward-flight" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 35, pointerEvents: 'none', overflow: 'hidden' }}>
    <style>{'.reward-flight .reward-flight-goose{display:block;width:38px;height:43px}'}</style>
    {!quiet && flight.foods.map((food, index) => <span key={`${flight.id}-${food.item}`} ref={node => { foods.current[index] = node; }} style={{ position: 'absolute', left: food.source.x - 21, top: food.source.y - 21, width: 42, height: 42, willChange: 'transform,opacity' }}><ItemIcon item={food.item} size={42}/></span>)}
    {!quiet && [0, 1, 2].map(index => <span key={`${flight.id}-${index}`} ref={node => { coins.current[index] = node; }} style={{ position: 'absolute', left: flight.source.x - 14, top: flight.source.y - 14, width: 28, height: 28, filter: 'drop-shadow(0 2px 2px #96652a44)', willChange: 'transform,opacity' }}><Coin/></span>)}
    {!quiet && <div ref={thanks} style={{ position: 'absolute', left: Math.max(8, Math.min(flight.width - 126, flight.source.x - 69)), top: Math.max(56, flight.source.y - 49), display: 'flex', alignItems: 'center', gap: 1, width: 118, height: 48, border: '1.5px solid #b5bd7c', borderRadius: 12, background: '#fff9de', boxShadow: '0 3px 10px #6a764329', padding: '2px 5px', willChange: 'transform,opacity' }}>
      <span style={{ display: 'block', width: 38, height: 43, flex: '0 0 38px' }}><Goose className="reward-flight-goose" color={flight.color} accessory={flight.accessory} expression="happy"/></span>
      <b style={{ fontSize: 12, color: '#66824a', whiteSpace: 'nowrap' }}>谢谢招待！</b>
    </div>}
    <div ref={amount} style={{ position: 'absolute', left: Math.max(6, Math.min(flight.width - (quiet ? 105 : 65), flight.target.x - 20)), top: flight.target.y + 17, minWidth: 47, padding: '2px 8px', textAlign: 'center', color: '#8c5b20', background: '#fff1b7', border: '1.5px solid #e4b650', borderRadius: 9, fontSize: quiet ? 11 : 13, lineHeight: '18px', fontWeight: 800, boxShadow: '0 2px 5px #90641e22', display: 'flex', alignItems: 'center', gap: 3 }}>{quiet && <svg width="12" height="12" viewBox="0 0 12 12"><path d="m2 6 3 3 5-6" fill="none" stroke="#70984b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}+{flight.amount}{quiet ? ' 已入账' : ''}</div>
  </div>, host);
}

export default RewardFlight;
