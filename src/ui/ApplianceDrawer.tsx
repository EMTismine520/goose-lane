import { useState } from 'react';
import { Archive, Check, ChefHat, Clock3, Flame, MapPin, Play, RotateCcw, Wrench } from 'lucide-react';
import { ITEMS } from '../content/catalog';
import { activeDevices } from '../content/board-layouts';
import { getApplianceStatus, getBoardEntity, getRecipeDuration, unlockedCells } from '../domain/engine';
import type { Command, GameState } from '../domain/types';
import { ItemIcon } from './parts';
import { DeviceIcon } from './V3Codex';

export function formatCookingTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

/** Presentation only: preserve the domain's candidate ordering and default recipe. */
export function getApplianceDrawerModel(state: GameState, applianceId: string, now: number) {
  const status = getApplianceStatus(state, applianceId, now);
  if (!status) return null;
  const freeCells = Array.from({ length: unlockedCells(state) }, (_, index) => index).filter(index => getBoardEntity(state, index).kind === 'empty').length;
  return { status, freeCells, ready: status.candidates.filter(candidate => candidate.missing.length === 0), later: status.candidates.filter(candidate => candidate.missing.length > 0) };
}

type Props = {
  state: GameState; applianceId: string; now: number; act: (command: Command) => Promise<boolean>;
  onItem: (item: string) => void; onDevices?: (family?: string) => void;
  onOrganize?: () => void; onStorage?: () => void;
};

export function ApplianceDrawer({ state, applianceId, now, act, onItem, onDevices, onOrganize, onStorage }: Props) {
  const [pending, setPending] = useState(false);
  const model = getApplianceDrawerModel(state, applianceId, now);
  const device = activeDevices(state).find(d => d.id === applianceId);
  if (!model || !device) return <div className="empty-state">这台厨具已收纳，可以去设备架查看。</div>;
  const { status, freeCells, ready, later } = model;
  const { appliance, recipe, phase } = status;
  const job = appliance.job;
  const busy = phase === 'cooking' || phase === 'ready';
  const submit = async (command: Command) => { if (pending) return; setPending(true); try { await act(command); } finally { setPending(false); } };
  const groups = [{ title: '现在可做', subtitle: later.length ? '可开火 · 也可继续补料' : '材料已齐，准备开火', entries: ready, complete: true }, { title: '继续补料可做', subtitle: appliance.inputSlots.length ? '继续拖入所需食材，再回来开火' : '点食材查看来源，拖入棋盘上的厨具', entries: later, complete: false }];

  return <section className="appliance-drawer" aria-label={`${device.name}料理详情`}>
    <header className="appliance-drawer-heading">{device.familyId ? <DeviceIcon family={device.familyId} level={device.level} size={66}/> : <ChefHat size={48}/>}<div><span className="drawer-eyebrow">小馆后厨 · {device.level ?? 1}级</span><h2>{device.name}</h2><p>{phase === 'ready' ? '料理做好啦，等你端上桌。' : phase === 'cooking' ? '好滋味正在锅里慢慢发生。' : '配好食材，亲手开火。'}</p></div>{onDevices && <button className="drawer-icon-button" aria-label="管理此厨具" onClick={() => onDevices(device.familyId ?? device.id)}><Wrench size={19}/></button>}</header>
    {busy && recipe ? <div className={`cooking-feature ${phase === 'ready' ? 'is-ready' : ''}`}><ItemIcon item={recipe.output} size={88}/><span className="cooking-state-label">{phase === 'ready' ? <Check size={15}/> : <Flame size={15}/>} {phase === 'ready' ? '完成待取' : '正在制作'}</span><h3>{recipe.name}</h3>{phase === 'cooking' ? <><strong className="cooking-countdown">{formatCookingTime(status.remaining)}</strong><div className="drawer-progress" role="progressbar" aria-label="料理进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={job ? Math.round(Math.max(0, Math.min(100, (now - job.startedAt) / (job.endsAt - job.startedAt) * 100))) : 100}><i style={{ width: `${job ? Math.max(0, Math.min(100, (now - job.startedAt) / (job.endsAt - job.startedAt) * 100)) : 100}%` }}/></div><p>等待时，可以继续产出和合成。</p></> : <><p>{freeCells ? '成品 ×1 · 领取到棋盘' : '棋盘已满，成品会一直为你保温。'}</p>{freeCells ? <button className="primary drawer-main-action" disabled={pending} onClick={() => submit({ type: 'collectAppliance', appliance: applianceId, expectedJobId: job?.id })}><Check size={18}/>领取 · {recipe.name}</button> : <div className="full-board-actions">{onOrganize && <button className="primary" onClick={onOrganize}><MapPin size={17}/>返回棋盘整理</button>}{onStorage ? <button className="outline" onClick={onStorage}><Archive size={17}/>打开仓库</button> : onDevices && <button className={onOrganize ? 'outline' : 'primary'} onClick={() => onDevices()}><Wrench size={17}/>整理设备</button>}</div>}</>}</div> : <>
      <section className="staged-ingredients"><div className="drawer-section-heading"><h3>已投入 <small>{appliance.inputSlots.length}份</small></h3><span>{appliance.inputSlots.length ? freeCells ? '点击可取回' : '棋盘满了，暂不能取回' : '材料从棋盘拖入'}</span></div>{appliance.inputSlots.length ? <div className="staged-list">{appliance.inputSlots.map(input => <button key={input.uid} disabled={pending || !freeCells} aria-label={`取回${ITEMS[input.item].name}`} onClick={() => submit({ type: 'withdrawInput', appliance: applianceId, uid: input.uid, expectedVersion: appliance.version })}><ItemIcon item={input.item} size={40}/><span>{ITEMS[input.item].name}</span><RotateCcw size={14}/></button>)}</div> : <p className="drawer-empty-tray">把想做的菜所需食材拖到厨具，就会在这里备好。</p>}</section>
      {groups.filter(group => group.entries.length).map(group => <section className="recipe-group" key={group.title}><div className="drawer-section-heading"><h3>{group.title}<small>{group.entries.length}道</small></h3></div><p className="drawer-section-note">{group.subtitle}</p>{group.entries.map(candidate => <article className={`appliance-recipe-card ${group.complete ? 'can-cook' : ''}`} key={candidate.recipe.id}><div className="drawer-recipe-heading"><button onClick={() => onItem(candidate.recipe.output)}><ItemIcon item={candidate.recipe.output} size={50}/><span><b>{candidate.recipe.name}</b><small><Clock3 size={12}/>{Math.ceil(getRecipeDuration(state, candidate.recipe, applianceId) / 1000)}秒 · 成品 ×1</small></span></button>{group.complete && <span className="recipe-ready-badge"><Check size={13}/>齐了</span>}</div><div className="drawer-recipe-inputs">{candidate.recipe.inputs.map(need => { const loaded = appliance.inputSlots.filter(input => input.item === need.item).length; const complete = loaded >= need.count; return <button key={need.item} className={complete ? 'is-loaded' : ''} onClick={() => onItem(need.item)} aria-label={`${ITEMS[need.item].name}，已投${loaded}/${need.count}，查看来源`}><ItemIcon item={need.item} size={38}/><b>{ITEMS[need.item].name}</b><small>{complete ? <Check size={11}/> : null}{complete ? '已投' : '还缺'} {complete ? `${loaded}/${need.count}` : need.count - loaded}</small></button>; })}</div>{group.complete ? <button className="primary drawer-main-action" disabled={pending} onClick={() => submit({ type: 'startCooking', appliance: applianceId, recipe: candidate.recipe.id, expectedVersion: appliance.version })}><Play size={15}/>制作这道 · {candidate.recipe.name}</button> : <p className="recipe-missing-line">还缺 {candidate.missing.map(need => `${ITEMS[need.item].name}×${need.count}`).join('、')}</p>}</article>)}</section>)}
    </>}
  </section>;
}
