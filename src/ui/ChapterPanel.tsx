import { STREET_THEMES } from '../game/street-presentation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Coins, CookingPot, LoaderCircle, LockKeyhole } from 'lucide-react';
import { CHAPTERS } from '../content/chapters';
import { activeWorkspace, chapterPrice } from '../domain/workspaces';
import { ThemeEmblem } from '../game/ThemeEmblem';
import { ItemIcon } from './parts';
import { DeviceIcon } from './DeviceIcon';
import type { GameState } from '../domain/types';

export function ChapterPanel({state,onEnter}:{state:GameState;onEnter:(chapter:number|'original',stillOpen:()=>boolean)=>Promise<boolean>}) {
  const [preview,setPreview]=useState<number|null>(null),[pending,setPending]=useState(false),[error,setError]=useState('');
  const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
  const price=chapterPrice(state),selected=CHAPTERS.find(c=>c.id===preview),current=activeWorkspace(state);
  const completed=CHAPTERS.filter(c=>c.orders.every(o=>state.completedOrders.includes(o.id))).length;
  const enter=async(chapter:number|'original')=>{if(pending)return;setPending(true);setError('');try{if(!await onEnter(chapter,()=>alive.current)&&alive.current)setError('未完成切换，金币与原厨房仍保留。请查看提示后重试。');}catch{if(alive.current)setError('首屏资源还未准备好，请联网后重试。尚未扣除金币，原厨房仍可继续经营。');}finally{if(alive.current)setPending(false)}};
  return <section className="chapter-book" aria-label="章节手册" aria-busy={pending}>
    <div className="chapter-intro"><span className="eyebrow">自己的小馆，自己选风味</span><h2>今天，想去哪间厨房？</h2><p>每章独立保存，随时免费回来。金币、体力与收藏共用。</p><div className="chapter-totals"><span>已开放 <b>{state.chapterAccess?.unlocked.length??1}/8</b></span><span>故事完成 <b>{completed}/8</b></span><span><Coins size={16}/>{state.coins.toLocaleString()}</span></div></div>
    {state.workspaces?.original&&<button className="original-kitchen" disabled={pending} onClick={()=>void enter('original')}><CookingPot size={24}/><span><b>原厨房</b><small>旧棋盘、全部物品与料理完整保留</small></span><span>{current?.mode==='original'?'正在经营':'返回'}<ArrowRight size={16}/></span></button>}
    {selected ? <article className="chapter-purchase"><button className="subtle detail-back" disabled={pending} onClick={()=>setPreview(null)}>返回全部章节</button><ThemeEmblem stage={selected.id} size={74}/><h3>{selected.name}</h3><div className="chapter-foods">{selected.orders.slice(0,3).flatMap(o=>o.needs).map(n=><ItemIcon key={n.item} item={n.item} size={56}/>)}</div><p>独立63格厨房，配齐起步设备。其他章节不需要先通关。</p><div className="chapter-starters">{selected.starter.families.map(f=><DeviceIcon key={f} family={f} level={selected.starter.levels[f]??1} size={36}/>)}</div><p className="workspace-context">起步设备{selected.starter.families.length}台 · 最高{Math.max(...Object.values(selected.starter.levels))}级已配备</p><p className="chapter-price">解锁 <b>{price}金币</b> · 购买后剩余 <b>{Math.max(0,state.coins-price)}金币</b></p><button className="primary" disabled={pending||state.coins<price} onClick={()=>void enter(selected.id)}>{pending?<><LoaderCircle className="spinning" size={18}/>正在准备厨房…</>:state.coins<price?`还差${price-state.coins}金币`:`花${price}金币，解锁并进入`}</button>{state.coins<price&&<p>回当前厨房做常客订单，就能继续攒金币。</p>}</article>
    : <><p className="chapter-offer">{state.chapterAccess?.paidUnlocks?'新章节120金币':'首个自选章节60金币'} · 已开放章节随时免费进入</p><div className="chapter-cards">{CHAPTERS.map(c=>{
      const unlocked=state.chapterAccess?.unlocked.includes(c.id),workspace=state.workspaces?.[`chapter-${c.id}`],isCurrent=workspace?.id===state.activeWorkspaceId;
      const done=c.orders.filter(o=>state.completedOrders.includes(o.id)).length,ready=workspace?.appliances.filter(a=>a.outputSlot||a.job&&a.job.endsAt<=Math.max(state.lastSeen,Date.now())).length??0;
      return <article className={`chapter-choice ${isCurrent?'current':''}`} key={c.id} data-chapter={c.id}><div className="chapter-choice-heading"><ThemeEmblem stage={c.id} size={48}/><div><h3>{c.name}</h3><small>{isCurrent?'正在经营':unlocked?'已开放 · 免费进入':'任意选择，无需前章通关'}</small></div>{done===c.orders.length?<Check size={18}/>:!unlocked?<LockKeyhole size={17}/>:null}</div><div className="chapter-choice-body"><div className="chapter-foods">{c.orders.slice(0,3).flatMap(o=>o.needs).map(n=><ItemIcon key={n.item} item={n.item} size={36}/>)}</div><span>{done}/{c.orders.length} 份心愿{done===c.orders.length&&<b className='chapter-ready'>纪念 · {STREET_THEMES[c.id-1].keepsake}</b>}{ready>0&&<b className="chapter-ready"> · {ready}份待领取</b>}</span></div><button className={unlocked?'outline':'primary'} disabled={pending} onClick={()=>unlocked?void enter(c.id):setPreview(c.id)}>{unlocked?'继续经营':`了解并解锁 · ${price}金币`}<ArrowRight size={16}/></button></article>;
    })}</div></>}{error&&<p className="form-message" role="alert">{error}</p>}
  </section>;
}
