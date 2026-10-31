import { BookOpen, Archive, Coins, Undo2, Play, Check, Clock3, ChevronUp, Lightbulb, CookingPot } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Command, GameState } from '../domain/types';
import { CHAINS, ITEMS } from '../content/catalog';
import { getBoardEntity, mergeTarget } from '../domain/engine';
import { activeDevices } from '../content/board-layouts';
import { ItemIcon } from './parts';
import { BAND_COSTS } from '../content/expansion';
import { DeviceIcon } from './DeviceIcon';
import { getApplianceDrawerModel, formatCookingTime } from './ApplianceDrawer';
import { getApplianceTarget } from './ui-guidance';
import type { ApplianceTargets } from './ui-guidance';

type Props = {
  state: GameState; selected: number | null; now: number; act: (c: Command) => Promise<boolean>;
  onBook: () => void; onItem: (id: string) => void;
  onDevices?: (family?: string) => void;
  onAppliance?: (id: string) => void; onFindPair?: () => void;
  focusSummary?: string; onOrder?: () => void;
  applianceTargets?: ApplianceTargets;
};

/** The tools never move when the selected board object changes. */
export function ItemActionBar({ state, selected, now, act, onBook, onItem, onDevices, onAppliance, onFindPair, focusSummary, onOrder, applianceTargets }: Props) {
  const item = selected !== null ? state.board[selected] : null;
  const device = activeDevices(state).find(e => e.index === selected);
  const appliance = state.appliances.find(a => a.id === device?.id);
  const instance = state.devices?.find(d => d.id === device?.id);
  let summary: ReactNode;
  let action: ReactNode;
  let description: ReactNode;

  if (item) {
    const def = ITEMS[item.item];
    const next = mergeTarget(item.item);
    description = next ? def.level + '阶 · 两份合成' + ITEMS[next].name : def.kind === 'ingredient' ? '最高阶食材 · 查看用途' : '新鲜成品 · 查看来源';
    summary = <button className="context-summary" onClick={() => onItem(item.item)} aria-label={'查看' + def.name}><ItemIcon item={item.item} size={44}/><span><b>{def.name}</b></span></button>;
    action = <details className="object-menu" key={item.uid}><summary aria-label={'整理' + def.name}>整理<ChevronUp size={14}/></summary><div className="object-menu-actions"><b>{def.name}</b><button onClick={() => act({ type: 'store', index: selected!, expectedUid: item.uid })}><Archive size={17}/>放入仓库</button><button onClick={() => act({ type: 'sell', index: selected!, expectedUid: item.uid })}><Coins size={17}/>出售 · +{def.sell}金币</button>{state.undo && <button onClick={() => act({ type: 'undo' })}><Undo2 size={17}/>撤销上次出售</button>}<small>出售后可在底栏撤销</small></div></details>;
  } else if (appliance) {
    const model = getApplianceDrawerModel(state, appliance.id, now)!;
    const { status } = model;
    const target = applianceTargets?.[appliance.id] ?? getApplianceTarget(state, appliance.id, null);
    const recipe = target?.recipe ?? status.recipe;
    const canStart = target?.canStart ?? status.canStart;
    const open = () => onAppliance ? onAppliance(appliance.id) : onDevices ? onDevices(device?.familyId ?? device?.id) : onBook();
    const title = status.phase === 'cooking' || status.phase === 'ready' ? recipe?.name ?? device!.name : device!.name;
    description = status.phase === 'ready' ? model.freeCells ? '做好啦 · 趁热领取' : '棋盘已满 · 成品为你保留' : status.phase === 'cooking' ? '制作中 · ' + formatCookingTime(status.remaining) : status.phase === 'loaded' ? recipe?.name : '拖入食材 · 查看食谱';
    summary = status.phase === 'loaded' && target ? (
      <div className="context-summary appliance-inline" role="group" aria-label={`${device!.name}，目标${target.recipe.name}`}>
        <button className="appliance-identity" onClick={open} aria-label={`查看${device!.name}食谱与进度`}>{instance ? <DeviceIcon family={instance.familyId} level={instance.level} size={36}/> : <CookingPot size={36}/>}<b className="appliance-name">{device!.name}</b></button>
        <div className="appliance-ingredients">{target.ingredients.map(need => (
          <button key={need.item} className={`appliance-ingredient ${need.loaded ? 'has-input' : 'is-missing'}`} onClick={() => onItem(need.item)} aria-label={`${ITEMS[need.item].name}，${need.complete ? '已投入' : need.loaded ? '部分投入' : '未投入'} ${need.loaded}/${need.required}，查看介绍`} title={`${ITEMS[need.item].name}，${need.loaded}/${need.required}`}>
            <span className="appliance-ingredient-art" aria-hidden="true"><ItemIcon item={need.item} size={44} muted={!need.loaded}/>
              {need.required > 1 ? <span className={`appliance-ingredient-count ${need.complete ? 'is-complete' : ''}`}>{need.loaded}/{need.required}</span> : need.complete ? <span className="appliance-ingredient-check"><Check size={10} strokeWidth={3}/></span> : null}
            </span>
          </button>
        ))}</div>
      </div>
    ) : <button className="context-summary" onClick={open} aria-label={'查看' + device!.name + '食谱与进度'}>{recipe && appliance.job ? <ItemIcon item={recipe.output} size={44}/> : instance ? <DeviceIcon family={instance.familyId} level={instance.level} size={36}/> : <CookingPot size={36}/>}<span><b>{title}</b></span></button>;
    action = status.phase === 'ready' ? <button className={'dock-primary ' + (model.freeCells ? '' : 'dock-neutral')} onClick={model.freeCells ? () => act({ type: 'collectAppliance', appliance: appliance.id, expectedJobId: appliance.job?.id }) : open}>{model.freeCells ? <Check size={16}/> : <Archive size={16}/>}<span>{model.freeCells ? '领取' : '整理'}</span></button> : canStart ? <button className="dock-primary" aria-label={'开火 · ' + recipe!.name} onClick={() => act({ type: 'startCooking', appliance: appliance.id, recipe: recipe!.id, expectedVersion: appliance.version })}><Play size={14}/><span>开火</span></button> : <button className="dock-secondary" onClick={open}>{status.phase === 'cooking' ? <Clock3 size={16}/> : <BookOpen size={16}/>}<span>{status.phase === 'cooking' ? '进度' : '食谱'}</span></button>;
  } else if (instance && device?.kind === 'generator') {
    const chain = CHAINS.find(c => c.id === instance.selectedChain);
    const start = instance.band * 3 + 1;
    const end = Math.min(start + 2, chain?.items.length ?? start + 2);
    description = `仅产${chain?.name} · ${start}–${end}阶 · ${BAND_COSTS[instance.band]}体力`;
    summary = <button className="context-summary" onClick={() => onDevices?.(instance.familyId)}><DeviceIcon family={instance.familyId} level={instance.level} size={36}/><span><b>{device.name}</b></span></button>;
    action = <button className="dock-secondary" onClick={() => onDevices?.(instance.familyId)}>调整产出</button>;
  } else {
    const title = selected !== null ? getBoardEntity(state, selected).name : focusSummary ?? '今天想做点什么？';
    description = focusSummary && selected === null ? '查看缺料，继续这份心意' : '轻点查看，拖动合成或投料';
    summary = focusSummary && selected === null && onOrder ? <button className="context-summary idle-summary" onClick={onOrder}><span><b>{title}</b></span></button> : <div className="context-summary idle-summary"><span><b>{title}</b></span></div>;
    action = state.undo ? <button className="dock-secondary" aria-label="撤销出售" onClick={() => act({ type: 'undo' })}><Undo2 size={17}/>撤销</button> : onFindPair ? <button className="dock-secondary" onClick={onFindPair}><Lightbulb size={16}/><span>找一对</span></button> : <button className="dock-secondary" onClick={onBook}><BookOpen size={16}/>看食谱</button>;
  }

  return <section className="action-dock selection-dock" aria-label="棋盘操作"><div className="selection-primary">{summary}</div><div className="selection-secondary"><p className="selection-description" title={typeof description === 'string' ? description : undefined}>{description}</p>{action}</div></section>;
}
