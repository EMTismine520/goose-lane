import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Archive, BookOpen, Check, ChefHat, Coins, Hammer, LoaderCircle, Sparkles, Wrench, Zap } from 'lucide-react';
import { useGame } from './useGame';
import type { SaveRepository } from '../persistence/save';
import { GameShell } from './GameShell';
import { ResourceBar } from './ResourceBar';
import { CustomerStrip } from './CustomerStrip';
import { ItemActionBar } from './ItemActionBar';
import { PageSwitch } from './PageSwitch';
import { Goose, ItemIcon, Modal } from './parts';
import { Codex, ItemDetails, Kitchen, RecipePicker, SettingsPanel, Storage, Street } from './panels';
import { activeDevices, BUILD_NODES, } from '../content/board-layouts';
import { ITEMS, CHAINS } from '../content/catalog';
import { effectiveNow, getConstructionProgress, getDayProgress, getEnergyStatus, getTutorialStep, mergeTarget } from '../domain/engine';
import type { Command } from '../domain/types';
import { registerPwa, type ActivateUpdate } from '../platform/pwa';
import ShopScene from '../game/ShopScene';
import { RewardFlight } from './RewardFlight';
import { SaveSlotsPanel, RestartPanel } from './SaveSlotsPanel';
import { V3Codex, V3ItemDetails, DeviceIcon, EMPTY_CODEX } from './V3Codex';
import { DeviceShelf } from './DeviceShelf';
import { themeProgress } from '../domain/devices';
import { useThemeOffline } from './useThemeOffline';
import { ApplianceDrawer } from './ApplianceDrawer';
import { OrderFocus } from './OrderFocus';
import { StreetProgress, ThemeProgressPanel } from './StreetProgress';
import { focusedOrder, locateItem, orderSummary } from './ui-guidance';
import { THEME_NAMES, DEVICE_FAMILIES } from '../content/expansion';
const Board=lazy(()=>import('../game/Board'));
type Dialog = {type:'settings'|'save'|'load'|'restart'|'storage'|'book'|'build'|'energy'|'help'|'legacy'|'order'|'theme'}|{type:'item';id:string}|{type:'devices';family?:string;back?:string}|{type:'recipes';slot:number}|{type:'appliance';id:string}|null;
export default function App({repository,sessionScope,offline=true}:{repository?:SaveRepository;sessionScope?:string;offline?:boolean}={}){
 const game=useGame(repository,sessionScope),state=game.state;
 const [page,setPage]=useState<'merge'|'street'>('merge'),[dialog,setDialog]=useState<Dialog>(null),[selected,setSelected]=useState<number|null>(null),[now,setNow]=useState(Date.now()),[hint,setHint]=useState<[number,number]|null>(null),[cell,setCell]=useState(46);
 const [selectionCancelSequence,setSelectionCancelSequence]=useState(0);
 const [update,setUpdate]=useState<ActivateUpdate|null>(null),[cacheError,setCacheError]=useState(''),[bootMessage,setBootMessage]=useState('');
 const [codexView,setCodexView]=useState(EMPTY_CODEX),[detailHistory,setDetailHistory]=useState<Dialog[]>([]);
 const [codexSeen,setCodexSeen]=useState(0);
 const [focusedOrderId,setFocusedOrderId]=useState<string|null>(null),[guidance,setGuidance]=useState<string[]>([]);
 const [newTheme,setNewTheme]=useState<number|null>(null),[discovery,setDiscovery]=useState<string|null>(null);
 const observedProgress=useRef<{epoch:number;stage:number;items:string[];devices:string[]}|null>(null);
 const themeOffline=useThemeOffline(state?themeProgress(state).stage:1,offline);
 const dialogRef=useRef<Dialog>(null);dialogRef.current=dialog;
 const area=useRef<HTMLDivElement>(null),hydrated=useRef(-1),selectedUid=useRef<string|null>(null),stateRef=useRef(state),gameRef=useRef(game),scrollTimer=useRef<ReturnType<typeof setTimeout>|null>(null),input=useRef<HTMLInputElement>(null);
 stateRef.current=state; gameRef.current=game;
 const orderPosition=useRef(0);
 const act=useCallback((command:Command)=>gameRef.current.dispatch(command),[]);
 const close=useCallback(()=>{setDialog(null);setDetailHistory([])},[]);
 const showItem=useCallback((id:string)=>{const previous=dialogRef.current;if(previous?.type==='item'&&previous.id===id)return;setDetailHistory(h=>previous?[...h,previous]:[null]);setDialog({type:'item',id});},[]);
 const showDevices=useCallback((family?:string)=>{const previous=dialogRef.current;setDetailHistory(h=>previous?[...h,previous]:[null]);setDialog({type:'devices',family});},[]);
 const backItem=()=>{const prior=detailHistory.at(-1);setDetailHistory(h=>h.slice(0,-1));setDialog(prior===undefined?{type:'book'}:prior);};
 useEffect(()=>offline?registerPwa(activate=>setUpdate(()=>activate),setCacheError):undefined,[offline]);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(timer)},[]);
 useEffect(()=>{document.documentElement.dataset.motion=state?.settings.reducedMotion?'reduced':'full'},[state?.settings.reducedMotion]);
 useEffect(()=>{if(!state||hydrated.current===game.sessionEpoch)return;orderPosition.current=state.session.orderScroll;hydrated.current=game.sessionEpoch;if(scrollTimer.current)clearTimeout(scrollTimer.current);setDialog(null);setHint(null);setFocusedOrderId(null);setGuidance([]);setNewTheme(null);setDiscovery(null);setDetailHistory([]);setCodexView(EMPTY_CODEX);setCodexSeen(state.discovered.length+state.deviceDiscovered.length);setPage(state.session.page);selectedUid.current=state.session.selectedUid;const index=state.board.findIndex(i=>i?.uid===state.session.selectedUid);setSelected(index>=0?index:activeDevices(state).find(e=>e.id===state.session.selectedUid)?.index??null)},[state,game.sessionEpoch]);
 useEffect(()=>{if(!state||!selectedUid.current)return;const index=state.board.findIndex(i=>i?.uid===selectedUid.current);const device=activeDevices(state).find(e=>e.id===selectedUid.current);if(index>=0)setSelected(index);else if(device)setSelected(device.index);else{setSelected(null);selectedUid.current=null}},[state?.revision]);
 useEffect(()=>{if(!area.current)return;const el=area.current;const resize=()=>{const rect=el.getBoundingClientRect();if(rect.width&&rect.height)setCell(Math.max(Math.min(40,Math.floor((rect.width-28-12)/7)),Math.floor(Math.min((rect.width-28-12)/7,(rect.height-12)/9,50))))};const observer=new ResizeObserver(resize);observer.observe(el);resize();return()=>observer.disconnect()},[!!state,page]);
 useEffect(()=>{if(!state||game.readOnly||game.busy)return;const t=effectiveNow(state,now);if(state.appliances.some(a=>a.job&&a.job.endsAt<=t&&!a.outputSlot)||getEnergyStatus(state,t).value!==state.energy.value)void act({type:'recover'})},[now]);
 useEffect(()=>{if(!hint)return;const timer=setTimeout(()=>setHint(null),4000);return()=>clearTimeout(timer)},[hint]);
 useEffect(()=>()=>{if(scrollTimer.current)clearTimeout(scrollTimer.current)},[]);
 useEffect(()=>{if(state&&focusedOrderId&&!focusedOrder(state,focusedOrderId))setFocusedOrderId(null)},[state,focusedOrderId]);
 useEffect(()=>{if(!guidance.length)return;const timer=setTimeout(()=>setGuidance([]),3200);return()=>clearTimeout(timer)},[guidance]);
 useEffect(()=>{if(!discovery)return;const timer=setTimeout(()=>setDiscovery(null),2400);return()=>clearTimeout(timer)},[discovery]);
 useEffect(()=>{
  if(!state)return;
  const stage=themeProgress(state).stage,previous=observedProgress.current;
  if(previous&&previous.epoch===game.sessionEpoch){
   if(stage>previous.stage)setNewTheme(stage);
   const item=state.discovered.find(id=>!previous.items.includes(id));
   const device=state.deviceDiscovered.find(id=>!previous.devices.includes(id));
   if(item)setDiscovery(ITEMS[item]?.name??'新滋味');
   else if(device)setDiscovery('新设备');
  }
  observedProgress.current={epoch:game.sessionEpoch,stage,items:state.discovered,devices:state.deviceDiscovered};
 },[state,game.sessionEpoch]);
 const select=useCallback((index:number|null)=>{
  const s=stateRef.current;if(!s)return;
  const priorUid=selectedUid.current;
  const uid=index!==null?s.board[index]?.uid??activeDevices(s).find(e=>e.index===index)?.id??null:null;
  if(index===null){setHint(null);setSelectionCancelSequence(sequence=>sequence+1)}
  setSelected(index);selectedUid.current=uid;
  // Queue the latest intent even if an earlier session write has not published yet.
  if(uid!==priorUid||uid!==s.session.selectedUid)void act({type:'session',session:{selectedUid:uid}});
 },[act]);
 const locate=(id:string)=>{
  const current=stateRef.current;if(!current)return;
  const target=locateItem(current,id);
  if(target.kind==='board'){
   setPage('merge');void act({type:'session',session:{page:'merge'}});close();
   const index=current.board.findIndex(item=>item&&target.uids.includes(item.uid));
   select(index>=0?index:activeDevices(current).find(device=>target.uids.includes(device.id))?.index??null);
   setGuidance(target.uids);
  }else if(target.kind==='storage')setDialog({type:'storage'});
  else if(target.kind==='shelf')showDevices(target.family);
  gameRef.current.setNotice({type:'hint',message:target.message});
 };
 const openBook=()=>{if(state)setCodexSeen(state.discovered.length+state.deviceDiscovered.length);setDialog({type:'book'});};
 const switchPage=()=>{const next=page==='merge'?'street':'merge';setPage(next);void act({type:'session',session:{page:next}})};
 const saveScroll=(x:number)=>{orderPosition.current=x;if(scrollTimer.current)clearTimeout(scrollTimer.current);scrollTimer.current=setTimeout(()=>{if(stateRef.current?.session.orderScroll!==x)void act({type:'session',session:{orderScroll:x}})},220)};
 const openSettings=()=>{if(scrollTimer.current)clearTimeout(scrollTimer.current);const current=stateRef.current;if(current&&!game.readOnly&&!game.busy)void act({type:'session',session:{page,selectedUid:selectedUid.current,orderScroll:orderPosition.current}});setDialog({type:'settings'})};
 const findPair=()=>{if(!state)return;const seen=new Map<string,number>();for(let i=0;i<state.board.length;i++){const item=state.board[i];if(!item||!mergeTarget(item.item))continue;const other=seen.get(item.item);if(other!==undefined){setSelectionCancelSequence(sequence=>sequence+1);setHint([other,i]);select(other);return}seen.set(item.item,i)}game.setNotice({type:'hint',message:'还没有相同的一对，轻点推车补充食材吧。'})};
 if(!state)return <div className="boot-screen"><Goose accessory="chef"/><h1>鹅巷食光</h1>{!game.bootError?<><LoaderCircle className="spinning"/><p>正在摆好今天的料理台…</p></>:<><p role="alert">{game.bootError}</p><button className="primary" onClick={()=>setDialog({type:'load'})}>读取存档</button><button onClick={()=>game.recoverPrevious().catch(e=>setBootMessage(String(e)))}>恢复上一份快照</button><button onClick={()=>input.current?.click()}>导入备份</button><button onClick={()=>game.exportRaw()}>导出原始存档</button><button onClick={game.retry}>重试</button><input hidden ref={input} type="file" accept=".json" onChange={async e=>{try{const file=e.target.files?.[0];if(file&&file.size<2_000_000)await game.importSave(await file.text())}catch(error){setBootMessage(String(error))}}}/><p>{bootMessage}</p>{dialog?.type==='load'&&<Modal title="读取存档" onClose={close} busy={game.busy}><SaveSlotsPanel mode="load" busy={game.busy} readOnly={!game.canWriteSaves()} listSlots={game.listSlots} saveSlot={game.saveSlot} loadSlot={game.loadSlot} onBack={close}/></Modal>}</>}</div>;
 const focus=focusedOrder(state,focusedOrderId);
 const time=effectiveNow(state,now),tutorial=getTutorialStep(state),construction=getConstructionProgress(state),energy=getEnergyStatus(state,time),theme=themeProgress(state);
 const tutorialIndex=tutorial?activeDevices(state).find(e=>e.id===tutorial.target)?.index??state.board.findIndex(i=>i?.uid===tutorial.target):-1;
 const title=dialog?.type==='order'?'这份心愿':dialog?.type==='theme'?'小馆风味记':dialog?.type==='appliance'?activeDevices(state).find(device=>device.id===dialog.id)?.name??'我的厨具':dialog?.type==='save'?'保存存档':dialog?.type==='load'?'读取存档':dialog?.type==='restart'?'重新开始':dialog?.type==='item'?ITEMS[dialog.id].name:dialog?.type==='build'?'今日鲜果蔬店':dialog?.type==='devices'?'小鹅设备架':dialog?.type==='book'?'完整风味图鉴':dialog?.type==='storage'?'小鹅仓库':dialog?.type==='energy'?'满满活力':dialog?.type==='recipes'?'料理配方':dialog?.type==='legacy'?'旧日食光':'设置与存档';
 return <GameShell page={page} backgroundEnabled={page==='merge'&&!dialog&&!game.readOnly&&!game.busy} onBackgroundTap={()=>select(null)}><ResourceBar state={state} now={time} onSettings={openSettings} onEnergy={()=>setDialog({type:'energy'})} onTheme={()=>setDialog({type:'theme'})}/>
 <div className="merge-page" data-selection-background hidden={page!=='merge'}>
  <CustomerStrip key={game.sessionEpoch} active={page==='merge'} state={state} act={act} onItem={showItem} onScroll={saveScroll} focusedOrderId={focusedOrderId} onFocus={setFocusedOrderId}/>
  <div className={`guide-bar ${focus?'is-focused':''}`}><Sparkles size={14}/><span>{tutorial?.text??(focus?orderSummary(state,focus):state.campaign!=='fresh'?`第${state.day}天 · ${getDayProgress(state).completed}/${getDayProgress(state).total}份款待`:theme.allCompleted?'每一份滋味，都成为小馆的回忆。':`${theme.name} · ${theme.completed}/${theme.total}份心愿`)}</span></div>
  <div className="board-area" data-selection-background ref={area}><div className="board-frame" data-selection-background style={{width:cell*7+12,height:cell*9+12}}><Suspense fallback={<div className="board-loading"><LoaderCircle className="spinning"/></div>}><Board selectionCancelSequence={selectionCancelSequence} sessionEpoch={game.sessionEpoch} state={state} selected={selected} onSelect={select} act={act} active={page==='merge'} inputEnabled={!dialog&&!game.readOnly&&!game.busy} hint={hint} tutorialTarget={tutorialIndex>=0?tutorialIndex:null} guidanceUids={guidance}/></Suspense></div></div>
  <footer className="game-footer"><ItemActionBar state={state} selected={selected} now={time} act={act} onStorage={()=>setDialog({type:'storage'})} newDiscoveries={Math.max(0,state.discovered.length+state.deviceDiscovered.length-codexSeen)} onBook={openBook} onItem={showItem} onDevices={state.campaign==='fresh'?showDevices:undefined} onAppliance={id=>setDialog({type:'appliance',id})} onFindPair={findPair} focusSummary={focus?orderSummary(state,focus):undefined} onOrder={focus?()=>setDialog({type:'order'}):undefined}/></footer>
 </div>
 <div className="street-page-new" hidden={page!=='street'}><ShopScene state={state} onBuild={()=>setDialog({type:'build'})}/><footer className="game-footer"><div className="action-dock"><div className="context-rail"><StreetProgress state={state} onBuild={()=>setDialog({type:'build'})} onTheme={()=>setDialog({type:'theme'})}/></div><div className="tool-rail">{state.campaign==='fresh'&&<button onClick={()=>showDevices()} aria-label="打开设备架"><Wrench size={19}/>设备</button>}<button onClick={()=>setDialog({type:'storage'})} aria-label="打开仓库"><Archive size={19}/>仓库</button><button onClick={openBook} aria-label="打开图鉴"><BookOpen size={19}/>图鉴</button></div></div></footer></div>
 <RewardFlight key={'reward:'+game.sessionEpoch} event={game.notice} reducedMotion={state.settings.reducedMotion}/><PageSwitch page={page} onClick={switchPage} highlight={tutorial?.target==='page-switch'}/>
 
 {game.notice?.message&&!discovery&&<div key={'toast:'+state.revision} className={`game-toast ${game.notice.type==='error'?'error':''}`} role="status">{game.notice.type==='deliver'?<Coins size={17}/>:game.notice.type==='error'?null:<Check size={17}/>}<span>{game.notice.message}</span></div>}
 {(game.error||game.readOnly||update||cacheError)&&<div className="connection-banner" role="alert">{game.error|| (game.readOnly?'另一窗口正在经营，当前只读':update?'新版本已准备好':cacheError)}{game.readOnly?<button onClick={game.retry}>接管</button>:update?<button disabled={game.busy} onClick={()=>game.applyUpdate(update).catch(e=>setCacheError(String(e)))}>更新</button>:<button onClick={()=>setDialog({type:'settings'})}>查看</button>}</div>}
 {newTheme!==null&&<aside className="theme-unlock-card" aria-label="新主题开放"><Sparkles size={25}/><div><b>{THEME_NAMES[newTheme-1]}，开张啦</b><small>{DEVICE_FAMILIES.filter(f=>f.stage===newTheme).length} 类新设备已备好</small><div className="theme-gifts">{DEVICE_FAMILIES.filter(f=>f.stage===newTheme).slice(0,3).map(f=><DeviceIcon key={f.id} family={f.id} size={32}/>)}</div></div><button className="primary" onClick={()=>{setNewTheme(null);showDevices()}}>去看看</button><button className="dismiss" aria-label="关闭主题提示" onClick={()=>setNewTheme(null)}>收起</button></aside>}
 {discovery&&!newTheme&&<div className="discovery-stamp" role="status"><BookOpen size={17}/><span>风味收录 · <b>{discovery}</b></span></div>}
 {dialog&&<Modal key={'modal:'+game.sessionEpoch} title={title} initialScrollTop={dialog.type==='book'?codexView.scroll:0} onClose={close} busy={game.busy} variant={['settings','save','load','restart'].includes(dialog.type)?'dialog':'sheet'} scrollKey={dialog.type+('id' in dialog?':'+dialog.id:dialog.type==='devices'?':'+dialog.family:'')}>
 {dialog.type==='order'&&focus&&<OrderFocus state={state} order={focus} onItem={showItem} onLocate={locate} onClear={()=>{setFocusedOrderId(null);close()}} onBack={close}/>}
 {dialog.type==='theme'&&<ThemeProgressPanel state={state} onDevices={showDevices}/>}
 {dialog.type==='appliance'&&<ApplianceDrawer state={state} applianceId={dialog.id} now={time} act={act} onItem={showItem} onDevices={showDevices} onOrganize={close} onStorage={()=>setDialog({type:'storage'})}/>}

 {dialog.type==='settings'&&<>{offline&&import.meta.env.PROD&&<div className='offline-packs'><b>离线风味包</b><p>{themeOffline.cachedStage===8?'全部主题已下载，可离线收集全图鉴。':themeOffline.failed?'主题图片下载暂未完成，联网后可重试。':themeOffline.cachedStage?'已备好前 '+themeOffline.cachedStage+' 个主题。':'正在准备当前主题的离线图片。'}</p><button className='outline' disabled={themeOffline.cachedStage===8} onClick={themeOffline.downloadAll}>下载全部主题图片</button></div>}<SettingsPanel state={state} dispatch={act} onSave={()=>setDialog({type:'save'})} onLoad={()=>setDialog({type:'load'})} onRestart={()=>setDialog({type:'restart'})}/>{state.campaign==='legacy'&&<button className="outline" onClick={()=>setDialog({type:'legacy'})}>查看保留的旧日店铺与料理</button>}</>}
 {(dialog.type==='save'||dialog.type==='load')&&<SaveSlotsPanel key={dialog.type} mode={dialog.type} busy={game.busy} readOnly={!game.canWriteSaves()} listSlots={game.listSlots} saveSlot={game.saveSlot} loadSlot={game.loadSlot} onBack={()=>setDialog({type:'settings'})}/>}
 {dialog.type==='restart'&&<RestartPanel busy={game.busy} readOnly={game.readOnly} onRestart={game.restartGame} onBack={()=>setDialog({type:'settings'})}/>}
 {dialog.type==='storage'&&<><Storage state={state} dispatch={act}/>{state.migrationInbox.length>0&&<section><h3>迁移待领取 · {state.migrationInbox.length} 件</h3><p>旧存档的每件食材都在这里，棋盘有空位时可领取。</p><div className="storage-grid">{state.migrationInbox.map(i=><button key={i.uid} onClick={()=>act({type:'claimMigration',uid:i.uid})}><ItemIcon item={i.item}/><small>{ITEMS[i.item].name}</small></button>)}</div></section>}</>}
 {dialog.type==='book'&&(state.campaign==='fresh'?<V3Codex state={state} onItem={showItem} onDevice={showDevices} view={codexView} onView={setCodexView}/>:<Codex state={state} onItem={showItem}/>)}
 {dialog.type==='devices'&&<DeviceShelf state={state} act={act} onItem={showItem} initialFamily={dialog.family} onBack={backItem} onFamilyChange={family=>setDialog(current=>current?.type==='devices'?{...current,family:family||undefined}:current)} onLocate={index=>{setPage('merge');void act({type:'session',session:{page:'merge'}});select(index);close();}}/>}
 {dialog.type==='item'&&state.campaign==='fresh'&&<V3ItemDetails state={state} item={dialog.id} onItem={showItem} onDevice={showDevices} onBack={backItem} onLocate={locate}/>}
 {dialog.type==='item'&&state.campaign==='legacy'&&<ItemDetails state={state} item={dialog.id} onItem={showItem} onCook={slot=>{const device=activeDevices(state).find(e=>e.slot===slot);if(device){setPage('merge');void act({type:'session',session:{page:'merge'}});select(device.index);close()}else setDialog({type:'recipes',slot})}}/>}
 {dialog.type==='recipes'&&<RecipePicker state={state} slot={dialog.slot} dispatch={act} onClose={close} onItem={showItem}/>}
 {dialog.type==='legacy'&&<><h3>熟悉的食材补给</h3><div className="legacy-generators">{CHAINS.filter(c=>!c.id.startsWith('fresh-')&&c.unlockDay<=state.day).map(c=><button className="outline" key={c.id} onClick={()=>act({type:'generate',chain:c.id})}><ItemIcon item={c.items[0]} size={32}/>{c.name}</button>)}</div><Kitchen state={state} now={time} dispatch={act} onRecipe={slot=>setDialog({type:'recipes',slot})}/><Street state={state} dispatch={act} onKitchen={close}/></>}
 {dialog.type==='energy'&&<div className="energy-dialog"><Zap size={45} fill="currentColor"/><h3>{energy.value} 点体力</h3><p>基础产出消耗 1 点体力；定向高阶产出消耗 2、4、8 或 16 点。移动与合成免费。</p><div className="rule-row"><span>自然恢复上限</span><b>100 点</b></div><div className="rule-row"><span>恢复速度</span><b>每 2 分钟 +1</b></div><div className="rule-row"><span>下一点恢复</span><b>{energy.nextRecoveryIn?Math.ceil(energy.nextRecoveryIn/1000)+' 秒':'体力充足'}</b></div><p>建设小店可获得体力奖励，奖励超过 100 点也会完整保留。</p><button className="primary" onClick={()=>{close();setPage('street');void act({type:'session',session:{page:'street'}})}}>去看看建设奖励 <Hammer size={16}/></button></div>}
 {dialog.type==='build'&&<div className="construction-card"><div className="build-hero"><Hammer size={35}/><div><b>{construction.next?.name??'小店正式开张'}</b><span>{construction.next?.description??'每一份新鲜，都是你亲手准备的心意。'}</span></div></div><div className="construction-steps">{BUILD_NODES.map((node,i)=><div key={node.id} className={i<construction.completed?'done':i===construction.completed?'current':''}><span>{i<construction.completed?<Check size={14}/>:i+1}</span><small>{node.name}</small></div>)}</div>{construction.next?<><div className="build-rewards"><span><Zap size={20}/> 体力 +{construction.next.energy}</span><span><ChefHat size={20}/> 厨师帽 +{construction.next.hats}</span></div><button className="primary build-button" disabled={state.coins<construction.next.cost} onClick={async()=>{if(construction.next&&await act({type:'build',node:construction.next.id})){close()}}}>{state.coins>=construction.next.cost?<><Hammer size={17}/>开始建设 <Coins size={17}/>{construction.next.cost}</>:<>还差 {construction.next.cost-state.coins} 金币</>}</button>{state.coins<construction.next.cost&&<button className="outline" onClick={()=>{close();setPage('merge');void act({type:'session',session:{page:'merge'}})}}>回合成交订单</button>}</>:<button className="primary build-button" disabled={!construction.canClaimReward} onClick={()=>act({type:'claimConstructionReward'})}>{state.construction.rewardClaimed?<><Check size={18}/>开张奖励已领取</>:<><Zap size={18}/>领取开张奖励 · 体力 +50</>}</button>}<div className="stage-reward"><ChefHat size={24}/><div><b>开张心愿 {construction.completed}/3</b><small>完成全部建设，额外获得 50 点体力</small></div></div></div>}
 </Modal>}
 </GameShell>;
}
