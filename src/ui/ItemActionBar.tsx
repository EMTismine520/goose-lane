import { BookOpen, PackageOpen, Info, Coins, Undo2, Play, Check, Clock3, ChevronUp } from 'lucide-react';
import type { Command, GameState } from '../domain/types';
import { ITEMS } from '../content/catalog';
import { getApplianceStatus, getBoardEntity } from '../domain/engine';
import { activeDevices } from '../content/board-layouts';
import { ItemIcon } from './parts';

type Props = { state: GameState; selected: number | null; now: number; act: (c: Command) => Promise<boolean>; onStorage: () => void; onBook: () => void; onItem: (id: string) => void };
export function ItemActionBar({ state, selected, now, act, onStorage, onBook, onItem }: Props) {
  const item = selected !== null ? state.board[selected] : null;
  const device = activeDevices(state).find(e => e.index === selected);
  const appliance = state.appliances.find(a => a.id === device?.id);
  if (item) {
    const def = ITEMS[item.item];
    return <section className="item-action-bar"><button className="selected-item" onClick={() => onItem(item.item)}><ItemIcon item={item.item} size={42}/><span><b>{def.name} <Info size={12}/></b><small>{def.kind === 'dish' ? '新鲜料理 · 可以交付' : def.level + ' 级 · 拖动相同食材合成'}</small></span></button><div className="item-tools"><button aria-label="放入仓库" onClick={() => act({ type: 'store', index: selected!, expectedUid: item.uid })}><PackageOpen size={19}/></button><button aria-label={'出售' + def.name + '，获得' + def.sell + '金币，可撤销'} onClick={() => act({ type: 'sell', index: selected!, expectedUid: item.uid })}><Coins size={17}/><small>+{def.sell}</small></button></div></section>;
  }
  if (appliance) {
    const status = getApplianceStatus(state, appliance.id, now)!;
    const { recipe, candidates } = status;
    const job = appliance.job, ready = status.phase === 'ready';
    const seconds = Math.ceil(status.remaining / 1000);
    const missing = candidates[0]?.missing.map(need => ITEMS[need.item].name + (need.count > 1 ? '×' + need.count : '')).join('、');
    const continuation = status.canStart && candidates.some(candidate => candidate.missing.length > 0);
    return <section className="item-action-bar appliance-bar">
      <div className="appliance-summary">
        <b>{ready ? recipe?.name + '做好啦' : job ? '正在制作' + recipe?.name : appliance.inputSlots.length ? recipe?.name ?? device?.name : device?.name}</b>
        <div className="input-items">{appliance.inputSlots.map(input => <button key={input.uid} aria-label={'取回' + ITEMS[input.item].name} onClick={() => act({ type: 'withdrawInput', appliance: appliance.id, uid: input.uid, expectedVersion: appliance.version })}><ItemIcon item={input.item} size={25}/></button>)}{recipe && (job || appliance.inputSlots.length > 0) && <><span>→</span><button onClick={() => onItem(recipe.output)} aria-label={'查看' + recipe.name + '配方'}><ItemIcon item={recipe.output} size={28}/></button></>}{job && <small>{ready ? '腾出一格，领回棋盘' : String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0')}</small>}{!job && !appliance.inputSlots.length && <small>拖入食材，手动开火</small>}</div>
        {!job && appliance.inputSlots.length > 0 && <small className="appliance-hint">{status.canStart ? continuation ? '可开火 · 也可继续补料' : '材料齐了 · 点食材可取回' : '还缺：' + missing}</small>}
        {job && !ready && <div className="cooking-track"><i style={{ width: Math.max(0, Math.min(100, (now - job.startedAt) / (job.endsAt - job.startedAt) * 100)) + '%' }}/></div>}
      </div>
      <div className="appliance-controls">
        {!job && <details className="appliance-recipes" key={appliance.id}><summary aria-label={'查看' + device?.name + '食谱'}><BookOpen size={17}/><ChevronUp size={11}/></summary><div className="recipe-popover"><header><b>{device?.name}食谱</b><small>配齐后手动开火 · 点菜品查看</small></header>{candidates.map(candidate => <button key={candidate.recipe.id} onClick={() => onItem(candidate.recipe.output)}><ItemIcon item={candidate.recipe.output} size={38}/><span><b>{candidate.recipe.name}</b><small>{candidate.missing.length ? '还缺 ' + candidate.missing.map(need => ITEMS[need.item].name).join('、') : '材料齐了，可以开火'}</small></span><Clock3 size={12}/><small>{candidate.recipe.duration / 1000}s</small></button>)}</div></details>}
        {ready ? <button className="primary compact" onClick={() => act({ type: 'collectAppliance', appliance: appliance.id, expectedJobId: job?.id })}><Check size={15}/>领取</button> : job ? <Clock3 className="cooking-clock" size={22}/> : appliance.inputSlots.length > 0 ? <button className="primary compact" disabled={!status.canStart} onClick={() => act({ type: 'startCooking', appliance: appliance.id, recipe: recipe?.id, expectedVersion: appliance.version })}><Play size={13} fill="currentColor"/>开火</button> : null}
      </div>
    </section>;
  }
  return <section className="item-action-bar"><div className="idle-copy"><b>{selected !== null ? getBoardEntity(state, selected).name : '好滋味，合出来'}</b><small>{device?.kind === 'generator' ? '轻点产出 · 每次消耗 1 体力' : '轻点推车补充食材，拖动食材二合'}</small></div><div className="item-tools">{state.undo && <button aria-label="撤销出售" onClick={() => act({ type: 'undo' })}><Undo2 size={18}/></button>}<button onClick={onStorage} aria-label="打开仓库"><PackageOpen size={21}/><small>{state.storage.length}/{state.storageCapacity}</small></button><button onClick={onBook} aria-label="打开图鉴"><BookOpen size={21}/></button></div></section>;
}
