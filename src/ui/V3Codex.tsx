import { activeWorkspace, allWorkspaces, bindWorkspaceViews, familyAccessible, hasChapters, itemAccessible } from '../domain/workspaces';
import { useLayoutEffect, useRef } from 'react';
import { Search, ArrowLeft, ArrowRight, LockKeyhole, BookOpen, MapPin, Check } from 'lucide-react';
import { CHAINS, ITEMS, MODERN_ITEMS, MODERN_RECIPES } from '../content/catalog';
import { DEVICE_FAMILIES, THEME_NAMES } from '../content/expansion';
import { getRecipeDurationAtLevel, inventoryCount, mergeTarget } from '../domain/engine';
import { themeStage } from '../domain/devices';
import type { GameState } from '../domain/types';
import { ItemIcon } from './parts';
import { DeviceIcon, EMPTY_CODEX, type CodexView } from './DeviceIcon';
export { DeviceIcon, EMPTY_CODEX, type CodexView } from './DeviceIcon';

export function V3Codex({state,onItem,onDevice,view=EMPTY_CODEX,onView=()=>{}}:{state:GameState;onItem:(id:string)=>void;onDevice:(id:string)=>void;view?:CodexView;onView?:(v:CodexView)=>void}) {
  const ref=useRef<HTMLElement>(null),stage=themeStage(state);
  const currentView=useRef(view),publishView=useRef(onView);
  currentView.current=view;publishView.current=onView;
  const remember=()=>{
    const scroll=ref.current?.closest('.modal')?.scrollTop??0;
    if(currentView.current.scroll===scroll)return;
    const next={...currentView.current,scroll};currentView.current=next;publishView.current(next);
  };
  // Modal owns restoration; this view remembers browsing even when closed directly.
  useLayoutEffect(()=>{
    const modal=ref.current?.closest('.modal');
    modal?.addEventListener('scroll',remember,{passive:true});
    return()=>modal?.removeEventListener('scroll',remember);
  },[]);
  const groups=[...['dish','drink','ingredient'].map(kind=>({id:kind,name:{dish:'料理',drink:'饮品',ingredient:'食材'}[kind]!,entries:MODERN_ITEMS.filter(i=>i.kind===kind).map(i=>({id:i.id,name:i.name,stage:i.stage??1,seen:state.discovered.includes(i.id),item:true,family:'',level:i.level}))})),...['generator','appliance'].map(kind=>({id:kind,name:kind==='generator'?'生产器':'厨具',entries:DEVICE_FAMILIES.filter(f=>f.kind===kind).flatMap(f=>[1,2,3].map(level=>({id:`${f.id}-l${level}`,name:`${f.name} ${level}级`,stage:level>1?Math.max(3,f.stage):f.stage,seen:state.deviceDiscovered.includes(`${f.id}-l${level}`),item:false,family:f.id,level})))}))];
  const visible=groups.filter(g=>view.filter==='all'||view.filter===g.id).map(g=>({...g,visible:g.entries.filter(e=>!view.query||e.name.includes(view.query)||e.item&&((ITEMS[e.id].source.includes(view.query))||(ITEMS[e.id].aliases??[]).some(a=>a.includes(view.query))))})).filter(g=>g.visible.length);
  const lockedEntry=(e:{item:boolean;id:string;family:string;stage:number})=>hasChapters(state)?e.item?!itemAccessible(state,e.id):!familyAccessible(state,e.family):e.stage>stage;
  const discovered=groups.flatMap(g=>g.entries).filter(e=>e.seen).length;
  return <section ref={ref} className="codex-page v3-codex"><div className="codex-intro"><span className="eyebrow">鹅巷风味全书 · {groups.reduce((sum,g)=>sum+g.entries.length,0)}个收藏</span><h1>一街烟火，一本好滋味。</h1><p><BookOpen size={14}/> 已发现 {discovered} / {groups.reduce((sum,g)=>sum+g.entries.length,0)} · 成品 {MODERN_ITEMS.filter(i=>i.kind!=='ingredient'&&state.discovered.includes(i.id)).length} / {MODERN_ITEMS.filter(i=>i.kind!=='ingredient').length}</p><label className="search"><Search size={17}/><input aria-label="搜索料理、材料或设备" placeholder="搜索料理、材料或设备" value={view.query} onChange={e=>onView({...view,query:e.target.value,scroll:0})}/></label></div><div className="filter-tabs" aria-label="图鉴分类">{[{id:'all',name:'全部'},...groups].map(g=><button key={g.id} className={g.id===view.filter?'active':''} aria-pressed={g.id===view.filter} onClick={()=>onView({...view,filter:g.id,scroll:0})}>{g.name}</button>)}</div>
    {visible.map(g=><section className="codex-category" key={g.id}><h3>{g.name}<small>({g.entries.filter(e=>e.seen).length}/{g.entries.length})</small></h3><div className="codex-grid">{g.visible.map(e=><button className={`codex-item ${e.seen?'discovered':''} ${lockedEntry(e)?'locked':''}`} key={e.id} onClick={()=>{remember();if(e.item)onItem(e.id);else onDevice(e.family);}} aria-label={`${e.name}，${lockedEntry(e)?'未开放':e.seen?'已发现':'查看来源'}`}><span className="item-level">{lockedEntry(e)?<LockKeyhole size={12}/>:e.item?g.id==='ingredient'?`${e.level}阶`:'成品':`${e.level}级`}</span>{e.seen?e.item?<ItemIcon item={e.id} size={64}/>:<DeviceIcon family={e.family} level={e.level}/>:<span className="codex-question">?</span>}<b>{e.name}</b><small>{lockedEntry(e)?THEME_NAMES[e.stage-1]:e.seen?'已发现':'查看来源'}</small></button>)}</div></section>)}{!visible.length&&<p className="empty-state">没有找到，试试食材名或设备名。</p>}</section>;
}
export function V3ItemDetails({state,item,onItem,onDevice,onBack,onLocate}:{state:GameState;item:string;onItem:(id:string)=>void;onDevice:(family:string)=>void;onBack:()=>void;onLocate?:(item:string)=>void}) {
  const def=ITEMS[item], recipe=MODERN_RECIPES.find(r=>r.output===item),chain=CHAINS.find(c=>c.items.includes(item)),uses=MODERN_RECIPES.filter(r=>r.inputs.some(n=>n.item===item));
  const family=DEVICE_FAMILIES.find(f=>recipe?f.id===recipe.deviceFamilyId:f.chains.includes(def.chain)),locked=hasChapters(state)?!itemAccessible(state,item):(def.stage??1)>themeStage(state);
  const level=recipe?Math.max(recipe.minDeviceLevel??1,...state.devices.filter(d=>d.familyId===recipe.deviceFamilyId).map(d=>d.level)):1;
  const seconds=recipe?Math.ceil(getRecipeDurationAtLevel(state,recipe,level)/1000):0;
  return <div className="item-details v3-details"><button className="subtle detail-back" onClick={onBack}><ArrowLeft size={15}/>返回</button><div className="item-feature"><ItemIcon item={item} size={100}/><div><span className="eyebrow">{def.kind==='ingredient'?`${def.level}阶食材`:def.kind==='drink'?'街巷饮品':'暖心料理'}</span><h2>{def.name}</h2><p>{def.description}</p><span className="pill">本章可用 {inventoryCount(state,item)} 份</span></div></div>{locked&&<p className="codex-unlock"><LockKeyhole size={15}/>{THEME_NAMES[(def.stage??1)-1]}主题开放</p>}{onLocate&&!locked&&<button className="outline item-location-button" onClick={()=>onLocate(item)}><MapPin size={17}/>定位物品与来源</button>}{state.workspaces&&allWorkspaces(state).filter(w=>w.id!==state.activeWorkspaceId).map(w=>{const n=inventoryCount(bindWorkspaceViews({...state,activeWorkspaceId:w.id}),item);return n>0?<p className='workspace-context' key={w.id}>{w.mode==='original'?'原厨房':THEME_NAMES[w.chapter-1]}另有{n}份，不计入本章配料。</p>:null})}<h3>获取方法</h3>{family&&<button className="source-card" onClick={()=>onDevice(family.id)}><DeviceIcon family={family.id} level={recipe?.minDeviceLevel??Math.min(3,Math.floor((def.level-1)/3)+1)} size={56}/><span><b>{family.name}{recipe?` · ${recipe.minDeviceLevel}级`:' · 生产与合成'}</b><small>{recipe?`约 ${seconds} 秒 · ${level}级厨具 · 手动领取`:'点击查看专用设备与本系列产出'}</small></span><ArrowRight size={16}/></button>}{recipe&&<><div className="v3-ingredients">{recipe.inputs.map(n=><button key={n.item} onClick={()=>onItem(n.item)}><ItemIcon item={n.item} size={44}/><b>{ITEMS[n.item].name}</b><small className={inventoryCount(state,n.item)>=n.count?'ingredient-available':'ingredient-needed'}>{inventoryCount(state,n.item)>=n.count&&<Check size={12}/>}现有 {inventoryCount(state,n.item)}/{n.count}</small><span className="ingredient-source-link">查看来源 <ArrowRight size={11}/></span></button>)}</div><p className="quiet-note">水、油盐等基础调味由厨具备好；列出的材料均需投入。</p></>}{chain&&<><h3>合成系列 · {chain.name}</h3><div className="chain-preview">{chain.items.map((id,i)=><button key={id} className={id===item?'current':''} onClick={()=>onItem(id)}><ItemIcon item={id} size={44}/><small>{i+1}阶</small></button>)}</div><p className="quiet-note">{mergeTarget(item)?`两份${def.name}可合成${ITEMS[mergeTarget(item)!].name}。`:'已是本系列最高阶。'}</p></>}{uses.length>0?<><h3>可以做成 · {uses.length} 道</h3><div className="item-uses">{uses.map(r=><button className="subtle" key={r.id} onClick={()=>onItem(r.output)}><ItemIcon item={r.output} size={36}/>{r.name}<ArrowRight size={13}/></button>)}</div></>:!recipe&&<p className="quiet-note">这是一份收藏节点，可继续点亮图鉴。</p>}</div>;
}
