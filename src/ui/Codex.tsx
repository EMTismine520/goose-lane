import { useMemo, useState } from 'react';
import { LockKeyhole, Search, Sparkles } from 'lucide-react';
import { CHAINS, CUSTOMERS, HOME_CHAINS, ITEMS, ORDERS } from '../content/catalog';
import { HOME_UNLOCK_HINT, homeCookingUnlocked } from '../content/board-layouts';
import type { GameState } from '../domain/types';
import { Avatar, ItemIcon } from './parts';

export function Codex({ state, onItem }: { state: GameState; onItem: (id: string) => void }) {
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('all');
  const groups = useMemo(() => {
    const chains = CHAINS.filter(chain => state.campaign === 'legacy' ? !HOME_CHAINS.includes(chain) : chain.id.startsWith('fresh-'));
    return [...chains.map(chain => ({ id: chain.id, name: chain.id === 'fresh-veg' ? '蔬菜' : chain.id === 'fresh-fruit' ? '鲜果' : chain.name, items: chain.items })),
      { id: 'opening-dishes', name: '果蔬小食', items: Object.values(ITEMS).filter(item => item.kind === 'dish' && item.assetId && item.chain !== 'fresh-home').map(item => item.id) },
      ...(state.campaign === 'fresh' ? [{ id: 'fresh-home', name: '家常菜', items: Object.values(ITEMS).filter(item => item.chain === 'fresh-home').map(item => item.id) }] : []),
      ...(state.campaign === 'legacy' ? [{ id: 'legacy-dishes', name: '旧日料理', items: Object.values(ITEMS).filter(item => item.kind === 'dish' && !item.assetId).map(item => item.id) }] : [])];
  }, [state.campaign]);
  const allIds = groups.flatMap(group => group.items);
  const visible = groups.filter(group => filter === 'all' || group.id === filter).map(group => ({ ...group, visibleItems: group.items.filter(id => !query || ITEMS[id].name.includes(query) || ITEMS[id].source.includes(query)) })).filter(group => group.visibleItems.length);
  return <section className="codex-page">
    <div className="codex-intro"><span className="eyebrow">小鹅的风味手记</span><h1>把日子，煮成喜欢的模样。</h1><p><Sparkles size={13}/> 已发现 {allIds.filter(id => state.discovered.includes(id)).length} / {allIds.length} 种滋味</p><label className="search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="找食材、菜品或来源" aria-label="搜索食材或料理"/></label></div>
    <div className="filter-tabs" aria-label="图鉴分类"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部</button>{groups.map(group => <button key={group.id} className={filter === group.id ? 'active' : ''} onClick={() => setFilter(group.id)}>{group.name}</button>)}</div>
    {!homeCookingUnlocked(state) && state.campaign === 'fresh' && <p className="codex-unlock"><LockKeyhole size={14}/>{HOME_UNLOCK_HINT} · 肉类、香料与家常菜</p>}
    {visible.map(group => <section className="codex-category" key={group.id}><h3><span>❧</span>{group.name} <small>({group.items.filter(id => state.discovered.includes(id)).length}/{group.items.length})</small><span>❧</span></h3><div className="codex-grid">{group.visibleItems.map(id => {
      const item = ITEMS[id], discovered = state.discovered.includes(id);
      return <button className={'codex-item ' + (discovered ? 'discovered' : '')} key={id} onClick={() => onItem(id)} aria-label={(discovered ? item.name : '未发现的' + group.name + '，查看' + item.name + '来源')}>
        {discovered ? <ItemIcon item={id} size={76}/> : <span className="codex-question" aria-hidden="true">?</span>}<span className="item-level">{item.kind === 'dish' ? '料理' : item.level + ' 阶'}</span><b>{discovered ? item.name : '待发现'}</b>
      </button>;
    })}</div></section>)}
    {!visible.length && <p className="empty-state">还没有找到这个名字，试试另一种食材。</p>}
    <div className="customers-book"><div className="section-heading"><h2>鹅巷的老朋友</h2><small>{state.campaign === 'fresh' ? '四位邻居，四种暖暖的心意' : '熟悉的邻里，熟悉的味道'}</small></div><div className="customer-grid">{CUSTOMERS.filter((_, i) => state.campaign === 'legacy' || i < 4).map(customer => {
      const count = ORDERS.filter(order => order.customer === customer.id && state.completedOrders.includes(order.id)).length;
      return <article key={customer.id}><Avatar id={customer.id} size={70}/><h3>{customer.name}<small>{customer.role}</small></h3><p>{customer.story[Math.min(customer.story.length - 1, Math.floor(count / 2))]}</p><small>已款待 {count} 次</small></article>;
    })}</div></div>
  </section>;
}
