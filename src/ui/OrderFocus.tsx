import { ArrowLeft, Check, MapPin, PinOff } from 'lucide-react';
import { CUSTOMERS, ITEMS } from '../content/catalog';
import { inventoryCount } from '../domain/engine';
import type { GameState, OrderDef } from '../domain/types';
import { Goose, ItemIcon } from './parts';

export function OrderFocus({ state, order, onItem, onLocate, onClear, onBack }: {
  state: GameState; order: OrderDef; onItem: (id: string) => void;
  onLocate: (id: string) => void; onClear: () => void; onBack: () => void;
}) {
  const customer = CUSTOMERS.find(value => value.id === order.customer);
  return <section className="order-focus-panel">
    <div className="focus-customer"><Goose color={customer?.color} accessory={customer?.accessory} expression="expectant"/><div><span className="section-kicker">正在关注</span><h3>{customer?.name}的这份心愿</h3><p>{order.message}</p></div></div>
    <div className="focus-needs">{order.needs.map(need => {
      const count = inventoryCount(state, need.item), ready = count >= need.count;
      return <article key={need.item} className={ready ? 'satisfied' : ''}>
        <button className="focus-food" onClick={() => onItem(need.item)}><ItemIcon item={need.item} size={56}/><span><b>{ITEMS[need.item].name}</b><small>{ready ? <><Check size={13}/> 已备齐</> : `还需要 ${need.count - count} 份`} · {Math.min(count, need.count)}/{need.count}</small></span></button>
        <div className="focus-need-actions"><button className="outline" onClick={() => onItem(need.item)}>查看配方与来源</button><button className="outline" onClick={() => onLocate(need.item)}><MapPin size={15}/>定位</button></div>
      </article>;
    })}</div>
    <p className="quiet-note">棋盘与仓库里的食物都计入心愿。投入厨具的材料会留在料理中。</p>
    <div className="focus-actions"><button className="primary" onClick={onBack}><ArrowLeft size={16}/>回到料理台</button><button className="subtle" onClick={onClear}><PinOff size={16}/>取消关注</button></div>
  </section>;
}
