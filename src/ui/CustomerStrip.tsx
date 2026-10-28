import { memo, useEffect, useRef, useState } from 'react';
import { Check, Coins, LoaderCircle, Pin } from 'lucide-react';
import { availableOrders, canAffordRequirements, getDayProgress, getOrderReward, inventoryCount } from '../domain/engine';
import { CUSTOMERS, ITEMS } from '../content/catalog';
import type { GameState, Command } from '../domain/types';
import { Goose, ItemIcon } from './parts';
import { themeProgress } from '../domain/devices';
interface CustomerStripProps {
  active: boolean;
  state: GameState;
  act: (command: Command) => Promise<boolean>;
  onItem: (id: string) => void;
  onScroll: (position: number) => void;
  focusedOrderId?: string | null;
  onFocus?: (id: string | null) => void;
}

function CustomerStripView({ state, act, onItem, onScroll, active, focusedOrderId = null, onFocus }: CustomerStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const restored = useRef(false);
  const pending = useRef(new Set<string>());
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const currentFocus = useRef(focusedOrderId);
  currentFocus.current = focusedOrderId;
  const orders = availableOrders(state);
  const progress = getDayProgress(state);
  const theme = themeProgress(state);

  useEffect(() => {
    if (active && ref.current && ref.current.clientWidth > 0 && !restored.current) {
      ref.current.scrollLeft = state.session.orderScroll;
      restored.current = true;
    }
  }, [state.session.orderScroll, active]);

  const focus = (id: string) => onFocus?.(currentFocus.current === id ? null : id);
  const deliver = async (id: string) => {
    if (pending.current.has(id)) return;
    pending.current.add(id);
    setPendingIds([...pending.current]);
    try {
      if (await act({ type: 'deliver', order: id })) {
        if (currentFocus.current === id) onFocus?.(null);
      }
    } finally {
      pending.current.delete(id);
      setPendingIds([...pending.current]);
    }
  };

  return <section className={`customer-section guest-orders ${state.campaign === 'fresh' ? 'v3-orders' : ''}`} aria-label="顾客订单">
    <div className="customer-caption"><span>小馆来客</span><span>{state.campaign === 'fresh' ? theme.name : '今日款待'} <b>{state.campaign === 'fresh' ? theme.completed : progress.completed}/{state.campaign === 'fresh' ? theme.total : progress.total}</b></span></div>
    <div className="customer-strip" data-order-strip ref={ref} onScroll={event => onScroll(event.currentTarget.scrollLeft)}>
      {orders.map(order => {
        const ready = canAffordRequirements(state, order.needs);
        const partial = order.needs.some(need => inventoryCount(state, need.item) > 0);
        const customer = CUSTOMERS.find(person => person.id === order.customer);
        const focused = focusedOrderId === order.id;
        const processing = pendingIds.includes(order.id);
        const demand = ready ? 'ready' : partial ? 'partial' : 'missing';
        return <article key={order.id} className={`customer-card ${ready ? 'ready' : ''} ${focused ? 'focused' : ''}`} data-order-id={order.id} data-demand-status={demand} data-focused={focused || undefined}
          onClick={event => { if (!(event.target as Element).closest('button')) focus(order.id); }}>
          <button className="customer-portrait" onClick={() => focus(order.id)} aria-label={`${focused ? '取消关注' : '关注'}${customer?.name ?? '顾客'}的订单`} aria-pressed={focused}>
            <Goose color={customer?.color} accessory={customer?.accessory} expression={ready ? 'eager' : partial || focused ? 'expectant' : 'waiting'}/>
            <span>{customer?.name}</span>
            {focused && <Pin className="order-focus-pin" size={11} fill="currentColor"/>}
          </button>
          <div className="customer-wants">
            {order.needs.map(need => {
              const count = Math.min(inventoryCount(state, need.item), need.count);
              const enough = count >= need.count;
              return <button className="order-item" key={need.item} onClick={() => onItem(need.item)} aria-label={`${ITEMS[need.item].name}，已有${count}份，需要${need.count}份，查看来源`}>
                <ItemIcon item={need.item} size={38}/>
                <small className={enough ? 'enough' : ''}>{enough && <Check size={10}/>}<span>{count}/{need.count}</span></small>
              </button>;
            })}
          </div>
          <button className={`serve-button ${ready ? 'can-serve' : ''}`} data-deliver-order={order.id} disabled={!ready || processing} onClick={() => void deliver(order.id)} aria-label={`交付${customer?.name ?? '顾客'}的订单，获得${getOrderReward(state, order)}金币${ready ? '' : '，食物尚未备齐'}`}>
            <span className="order-reward"><Coins size={14}/><b>{getOrderReward(state, order)}</b></span>
            <span className="order-status">{processing ? <LoaderCircle className="spinning" size={15}/> : ready ? <><Check size={14}/>交付</> : partial ? '备料中' : '待备料'}</span>
          </button>
        </article>;
      })}
      {!orders.length && <div className="orders-finished"><Check size={23}/><span><b>{theme.allCompleted ? '所有心愿，都有了好滋味' : '今天的客人都吃饱啦'}</b><small>{theme.allCompleted ? '继续收集喜欢的风味，慢慢逛逛小馆。' : '去完成小店建设，迎接下一份心愿。'}</small></span></div>}
    </div>
  </section>;
}
export const CustomerStrip = memo(CustomerStripView);
