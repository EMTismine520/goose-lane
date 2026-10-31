import { useEffect, useRef, useState } from 'react';
import { Archive, Check, ChefHat, Clock3, Info, LoaderCircle, MapPin } from 'lucide-react';
import { APPLIANCES, ITEMS, RECIPES } from '../content/catalog';
import { activeDevices } from '../content/board-layouts';
import { SPEED_UP_CONFIG } from '../content/production';
import { effectiveNow, getBoardEntity, unlockedCells } from '../domain/engine';
import type { Command, CommandMetadata, GameState, SpeedUpTarget } from '../domain/types';
import type { SpeedUpResult } from '../platform/game-controller';
import { formatCookingTime } from './ApplianceDrawer';
import { DeviceIcon } from './DeviceIcon';
import { ItemIcon } from './parts';
import { SpeedTicket } from './SpeedTicket';
import './speed-up.css';

export type SpeedUpSelection = SpeedUpTarget & Pick<CommandMetadata, 'expectedWorkspaceId'>;

export function getSpeedUpModel(state: GameState, target: SpeedUpSelection, now: number) {
  if (target.expectedWorkspaceId !== state.activeWorkspaceId) return null;
  const appliance = 'appliance' in target ? state.appliances.find(a => a.id === target.appliance) : null;
  const job = appliance?.job ?? ('slot' in target ? state.jobs[target.slot] : null);
  if (!job || job.id !== target.expectedJobId) return null;
  const recipe = RECIPES.find(recipe => recipe.id === job.recipe);
  const output = job.output ?? recipe?.output;
  if (!output || !ITEMS[output]) return null;
  const device = appliance ? activeDevices(state).find(d => d.id === appliance.id) : null;
  const time = effectiveNow(state, now), remaining = Math.max(0, job.endsAt - time);
  const freeCells = Array.from({ length: unlockedCells(state) }, (_, index) => index).filter(index => getBoardEntity(state, index).kind === 'empty').length;
  const canCollect = freeCells > 0 || ('slot' in target && state.storage.length < state.storageCapacity);
  return { job, output, device, name: device?.name ?? ('slot' in target ? APPLIANCES[target.slot]?.name : undefined) ?? '厨具', remaining, ready: remaining === 0, freeCells, canCollect,
    progress: Math.max(0, Math.min(100, (time - job.startedAt) / Math.max(1, job.endsAt - job.startedAt) * 100)) };
}

export function SpeedUpBalance({ tickets, onClose }: { tickets: number; onClose: () => void }) {
  return <section className="ticket-balance">
    <div className="ticket-balance-art"><SpeedTicket size={116}/><span>把等待，变成一口热气</span></div>
    <h3><strong>{tickets.toLocaleString()}</strong> 张加速券</h3>
    <p>点击正在制作的厨具，确认消耗 1 张，即可立即完成。</p>
    <div className="ticket-rules"><div><span>每次使用</span><b>1 张 · 完成一份</b></div><div><span>料理做好后</span><b>亲手领取成品</b></div><div><span>棋盘满了</span><b>成品留在厨具中</b></div><div><span>所有章节</span><b>共享当前余额</b></div></div>
    <p className="quiet-note">初始赠送 100 张，使用后不自动恢复。没有加速券，也可以等料理自然完成。</p>
    <button className="primary" onClick={onClose}>回厨房看看</button>
  </section>;
}

interface Props {
  state: GameState; target: SpeedUpSelection; now: number; busy: boolean; readOnly: boolean;
  speedUpCooking: (target: SpeedUpSelection) => Promise<SpeedUpResult>;
  act: (command: Command) => Promise<boolean>;
  onPendingChange: (pending: boolean) => void;
  onClose: () => void; onStorage: () => void;
}

export function SpeedUpPanel({ state, target, now, busy, readOnly, speedUpCooking, act, onPendingChange, onClose, onStorage }: Props) {
  const [pending, setPending] = useState<'speed' | 'collect' | null>(null);
  const [result, setResult] = useState<SpeedUpResult | null>(null);
  const [error, setError] = useState(''), [collected, setCollected] = useState(false);
  const running = useRef(false), alive = useRef(false);
  const model = getSpeedUpModel(state, target, now);
  const original = useRef(model);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const display = model ?? original.current;
  const locked = busy || pending !== null;
  const received = result?.ok ? result : null;
  const ready = (pending !== 'speed' && !!model?.ready) || !!received || collected;
  const enough = state.speedUpTickets >= SPEED_UP_CONFIG.cost;
  const submit = async (action: 'speed' | 'collect') => {
    if (running.current || busy || readOnly || !model || (action === 'speed' && !enough && !model.ready)) return;
    running.current = true; setPending(action); onPendingChange(true); setError('');
    try {
      if (action === 'speed') {
        const next = await speedUpCooking(target);
        if (alive.current) { setResult(next); if (!next.ok) setError(next.message); }
      } else {
        const success = await act({ ...target, type: 'appliance' in target ? 'collectAppliance' : 'collect' } as Command);
        if (alive.current) {
          if (success) setCollected(true);
          else setError('领取未完成，成品仍为你保留。请确认棋盘空间与保存状态后重试。');
        }
      }
    } catch (cause) {
      if (alive.current) setError(cause instanceof Error ? cause.message : '本次操作未保存，请重试。');
    } finally {
      running.current = false;
      if (alive.current) { setPending(null); onPendingChange(false); }
    }
  };

  return <section className={`speed-up-panel ${received?.status === 'accelerated' ? 'is-accelerated' : ''} ${ready ? 'is-ready' : ''}`} aria-busy={pending !== null}>
    {display && <>
      <div className="speed-appliance">{display.device?.familyId ? <DeviceIcon family={display.device.familyId} level={display.device.level} size={44}/> : <ChefHat size={32}/>}<div><span>小馆后厨</span><b>{display.name}</b></div><span className="speed-phase">{collected ? '已领取' : ready ? '完成待领取' : '正在制作'}</span></div>
      <div className="speed-dish"><div className="speed-dish-art"><ItemIcon item={display.output} size={104}/>{received?.status === 'accelerated' && <SpeedTicket size={42} className="ticket-used"/>}{ready && <span className="speed-dish-check"><Check size={18}/></span>}</div><h3>{ITEMS[display.output].name}</h3><p>{collected ? '已端出，好味道不必再等。' : ready ? '热气刚好，等你亲手端出。' : '给这份好滋味，按下快进。'}</p><div className="speed-countdown"><Clock3 size={15}/>{ready ? '制作完成' : `剩余 ${formatCookingTime(model?.remaining ?? 0)}`}</div><div className="speed-progress" role="progressbar" aria-label="制作进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ready ? 100 : model?.progress ?? 0)}><i style={{ width: `${ready ? 100 : model?.progress ?? 0}%` }}/></div></div>
    </>}
    {!model && !collected ? <p className="speed-message" role="alert"><Info size={18}/>这份料理已领取或任务已经改变，请重新选择。</p>
      : ready ? <div className="speed-receipt" role="status"><Check size={20}/><div><b>{collected ? '领取成功' : received?.status === 'accelerated' ? '已立即完成' : '料理已经完成，本次未消耗加速券'}</b><span>{received?.status === 'accelerated' ? `消耗 ${received.ticketsSpent} 张，剩余 ${received.ticketsRemaining.toLocaleString()} 张` : `当前持有 ${state.speedUpTickets.toLocaleString()} 张加速券`}</span></div></div>
      : <div className="speed-cost"><SpeedTicket size={44}/><div><b>消耗加速券 1 张</b><span>当前持有 {state.speedUpTickets.toLocaleString()} 张{enough && <>，使用后剩余 <strong>{(state.speedUpTickets - 1).toLocaleString()}</strong> 张</>}</span></div></div>}
    {!enough && !ready && model && <p className="speed-message" role="status">加速券不足，可以等待自然完成。</p>}
    {readOnly && <p className="speed-message" role="status">当前窗口只读。关闭提示，通过顶部“接管”取得经营权限后再操作。</p>}
    {error && <p className="speed-message is-error" role="alert"><Info size={17}/>{error}</p>}
    {pending && <p className="speed-saving" role="status">正在保存，请稍候…</p>}
    {ready && model && !collected && !model.canCollect && <p className="speed-full">成品已做好，为你保留。棋盘已满，先腾出一格再领取。</p>}
    <div className="speed-actions">
      {collected || !model ? <button className="primary" disabled={locked} onClick={onClose}>回到棋盘</button>
        : ready ? model.canCollect ? <button className="primary" disabled={locked || readOnly} onClick={() => void submit('collect')}>{pending === 'collect' ? <LoaderCircle size={18} className="spinning"/> : <Check size={18}/>} {pending === 'collect' ? '正在领取…' : '领取成品'}</button>
          : <><button className="primary" disabled={locked} onClick={onClose}><MapPin size={17}/>整理棋盘</button><button className="outline" disabled={locked} onClick={onStorage}><Archive size={17}/>打开仓库</button></>
          : <><button className="outline" disabled={locked} onClick={onClose}>取消</button><button className="primary" disabled={locked || readOnly || !enough} onClick={() => void submit('speed')}>{pending === 'speed' ? <LoaderCircle size={18} className="spinning"/> : <SpeedTicket size={24}/>} {pending === 'speed' ? '正在加速…' : '使用 1 张，立即完成'}</button></>}
    </div>
    {!ready && <p className="speed-footnote">只完成这份料理，成品仍需亲手领取。</p>}
  </section>;
}
