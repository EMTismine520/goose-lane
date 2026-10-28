import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Coins, FolderOpen, LoaderCircle, LockKeyhole, RotateCcw, Save, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import type { GameState } from '../domain/types';
import { unlockedCells } from '../domain/engine';
import { activeDevices } from '../content/board-layouts';
import { deviceAssetPath, mobileAssetPath } from '../content/assets';
import type { ManualSlot, SaveSlotId } from '../persistence/save';
import { ItemIcon } from './parts';

const date = (time: number) => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(time);
const errorText = (error: unknown) => error instanceof Error ? error.message : '操作未完成，请重试。';

function BoardPreview({ state }: { state: GameState }) {
  const limit = unlockedCells(state);
  return <div className="slot-mini-board" aria-hidden="true">{state.board.map((item, index) => {
    const device = activeDevices(state).find(entry => entry.index === index);
    return <span key={index} className={index >= limit ? 'locked' : ''}>{item ? <ItemIcon item={item.item} size={12}/> : device ? <img src={`${import.meta.env.BASE_URL}${mobileAssetPath(deviceAssetPath(device.artId ?? device.id))}`} alt=""/> : null}</span>;
  })}</div>;
}

interface Props {
  mode: 'save' | 'load';
  busy: boolean;
  readOnly: boolean;
  listSlots: () => Promise<ManualSlot[]>;
  saveSlot: (id: SaveSlotId) => Promise<void>;
  loadSlot: (id: SaveSlotId) => Promise<void>;
  onBack: () => void;
}

export function SaveSlotsPanel(props: Props) {
  const services = useRef(props); services.current = props;
  const alive = useRef(false), running = useRef(false);
  const confirmElement = useRef<HTMLDivElement>(null);
  const slotElements = useRef(new Map<SaveSlotId, HTMLButtonElement>()), returnToSlot = useRef<SaveSlotId | null>(null);
  const [slots, setSlots] = useState<ManualSlot[] | null>(null), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(0), [pending, setPending] = useState<SaveSlotId | null>(null), [confirm, setConfirm] = useState<ManualSlot | null>(null);
  useEffect(() => {
    if (confirm) confirmElement.current?.focus();
    else if (pending === null && returnToSlot.current !== null) { slotElements.current.get(returnToSlot.current)?.focus(); returnToSlot.current = null; }
  }, [confirm, pending]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let current = true;
    setSlots(null); setError('');
    void services.current.listSlots().then(result => { if (current) setSlots(result); }, cause => { if (current) setError(errorText(cause)); });
    return () => { current = false; };
  }, [refresh]);

  const execute = async (id: SaveSlotId) => {
    if (running.current || props.busy || props.readOnly) return;
    running.current = true; setPending(id); setError(''); setMessage('');
    try {
      if (props.mode === 'save') {
        await services.current.saveSlot(id);
        if (!alive.current) return;
        setConfirm(null); setMessage(`已保存至存档 ${id}`);
        setSlots(await services.current.listSlots());
      } else await services.current.loadSlot(id);
    } catch (cause) { if (alive.current) setError(errorText(cause)); }
    finally { running.current = false; if (alive.current) setPending(null); }
  };
  const locked = props.busy || pending !== null;

  if (confirm) return <div className="save-confirm" ref={confirmElement} tabIndex={-1}>
    <div className="save-emblem"><Save size={29}/></div><h3>覆盖存档 {confirm.id}？</h3>
    <p>{confirm.status === 'ready' ? `${date(confirm.savedAt)} 保存的第 ${confirm.state.day} 天进度将被替换。` : '这个位置的原始存档将被替换。'}</p>
    <p>覆盖后无法找回此格的原存档。其他两个存档不受影响。</p>
    {error && <p className="save-error" role="alert">{error}</p>}
    <div className="save-confirm-actions"><button className="outline" disabled={locked} onClick={() => { setConfirm(null); setError(''); }}>取消</button><button className="primary" disabled={locked || props.readOnly} onClick={() => void execute(confirm.id)}>{locked ? <LoaderCircle size={17} className="spinning"/> : <Save size={17}/>}确认覆盖</button></div>
  </div>;

  return <section className="save-slot-panel" aria-busy={locked}>
    <div className="save-slots-intro"><span className="save-emblem">{props.mode === 'save' ? <Save size={25}/> : <FolderOpen size={25}/>}</span><div><b>{props.mode === 'save' ? '留住这一刻的新鲜' : '回到熟悉的那一刻'}</b><p>{props.mode === 'save' ? '选择一个位置，保存现在的游玩状态。' : '选择已保存的位置，继续当时的进度。'}</p></div></div>
    <div className="slot-count"><span>我的存档</span><span>{slots ? `已用 ${slots.filter(slot => slot.status !== 'empty').length}/3` : '正在读取…'}</span></div>
    {!slots && !error && <div className="slots-loading" role="status"><LoaderCircle size={24} className="spinning"/>正在打开存档格…</div>}
    <div className="save-slot-list">{slots?.map(slot => <button type="button" className={`save-slot ${slot.status}`} key={slot.id}
      ref={element => { if (element) slotElements.current.set(slot.id, element); else slotElements.current.delete(slot.id); }}
      disabled={locked || props.readOnly || (props.mode === 'load' && slot.status !== 'ready')}
      aria-label={`${props.mode === 'save' ? '保存到' : '读取'}存档 ${slot.id}${slot.status === 'empty' ? '，空位置' : slot.status === 'ready' ? `，第 ${slot.state.day} 天，金币 ${slot.state.coins}` : '，无法读取'}`}
      onClick={() => { setMessage(''); setError(''); if (props.mode === 'save' && slot.status !== 'empty') { returnToSlot.current = slot.id; setConfirm(slot); } else void execute(slot.id); }}>
      {slot.status === 'ready' ? <BoardPreview state={slot.state}/> : <span className="slot-placeholder">{slot.status === 'empty' ? <Sparkles size={27}/> : <LockKeyhole size={27}/>}</span>}
      <span className="slot-copy"><span className="slot-heading"><b>存档 {slot.id}</b><small>{slot.status === 'empty' ? '空位置' : slot.status === 'ready' ? `第 ${slot.state.day} 天` : slot.status === 'incompatible' ? '需要新版' : '存档损坏'}</small></span>
        {slot.status === 'ready' ? <><time dateTime={new Date(slot.savedAt).toISOString()}>{date(slot.savedAt)}</time><span className="slot-resources"><span><Coins size={12}/>{slot.state.coins}</span><span><Zap size={12}/>{slot.state.energy.value}</span></span><span className="slot-progress">订单 {slot.state.completedOrders.length} · 建设 {slot.state.construction.completed.length}/3</span></> : <span className="slot-description">{slot.status === 'empty' ? '把值得记住的时光放在这里' : slot.message}</span>}
        <span className="slot-action">{pending === slot.id ? <><LoaderCircle size={13} className="spinning"/>{props.mode === 'save' ? '保存中…' : '读取中…'}</> : props.mode === 'save' ? slot.status === 'empty' ? '保存到此处' : '覆盖此存档' : slot.status === 'ready' ? '读取此存档' : '暂无可读取存档'}</span>
      </span>
    </button>)}</div>
    {message && <p className="save-success" role="status"><Check size={16}/>{message}</p>}
    {error && <p className="save-error" role="alert">{error}{!slots && <button className="outline small" onClick={() => setRefresh(value => value + 1)}>重试</button>}</p>}
    {props.readOnly && <p className="quiet-note">当前窗口没有写入权限，请先取得经营权限再操作。</p>}
    <p className="save-local-note"><ShieldCheck size={14}/>{props.mode === 'save' ? '自动保存不会覆盖这三个位置' : '体力与料理计时从保存时刻继续'}</p>
    <button className="outline save-back" disabled={locked} onClick={props.onBack}><ArrowLeft size={15}/>返回</button>
  </section>;
}

export function RestartPanel({ busy, readOnly, onRestart, onBack }: { busy: boolean; readOnly: boolean; onRestart: () => Promise<void>; onBack: () => void }) {
  const [error, setError] = useState(''), [pending, setPending] = useState(false);
  const running = useRef(false);
  const restart = async () => {
    if (running.current) return;
    running.current = true; setPending(true); setError('');
    try { await onRestart(); } catch (cause) { setError(errorText(cause)); }
    finally { running.current = false; setPending(false); }
  };
  return <section className="save-confirm restart-confirm"><div className="save-emblem"><RotateCcw size={30}/></div><h3>再开一段新时光</h3>
    <p>重新开始会重置当前游戏进度。需要保留这次游玩时，请先保存存档。</p>
    <div className="restart-keeps"><ShieldCheck size={22}/><span><b>三个手动存档会保留</b><small>声音、音量和动画偏好也不会改变</small></span></div>
    <p className="quiet-note">从第 1 天、60 点体力、初始食材和新手引导重新开始。</p>
    {error && <p className="save-error" role="alert">{error}</p>}
    <div className="save-confirm-actions"><button className="outline" disabled={busy || pending} onClick={onBack}>取消</button><button className="outline danger-button" disabled={busy || pending || readOnly} onClick={() => void restart()}>{busy || pending ? <LoaderCircle size={17} className="spinning"/> : <RotateCcw size={17}/>}重新开始</button></div>
  </section>;
}
