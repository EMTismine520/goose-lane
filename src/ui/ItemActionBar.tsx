import { Archive, Coins, Undo2, Play, Check, Clock3, ChevronUp, CookingPot } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Command, GameState, OrderDef } from '../domain/types';
import { CHAINS, ITEMS } from '../content/catalog';
import { getBoardEntity, mergeTarget } from '../domain/engine';
import { activeDevices } from '../content/board-layouts';
import { ItemIcon } from './parts';
import { BAND_COSTS, DEVICE_FAMILIES } from '../content/expansion';
import { DeviceIcon } from './DeviceIcon';
import { getApplianceDrawerModel, formatCookingTime } from './ApplianceDrawer';
import { getApplianceTarget, getOrderTarget, getOrderDevice } from './ui-guidance';
import type { ApplianceTargets } from './ui-guidance';

type Props = {
  state: GameState; selected: number | null; now: number; act: (c: Command) => Promise<boolean>;
  onBook: () => void; onItem: (id: string) => void;
  onDevices?: (family?: string) => void;
  onAppliance?: (id: string) => void;
  focusOrder?: OrderDef | null;
  applianceTargets?: ApplianceTargets;
};

type Ingredient = { item: string; amount: number; required: number; complete: boolean };

function RecipeIngredients({ ingredients, mode, onItem }: { ingredients: Ingredient[]; mode: 'stock' | 'loaded'; onItem: (id: string) => void }) {
  return <div className="recipe-ingredients" data-count={ingredients.length} role="group" aria-label={mode === 'loaded' ? '已投入食材' : '单份配方所需食材'}>
    {ingredients.map(need => {
      const status = mode === 'stock' ? '已有' : need.complete ? '已投入' : need.amount ? '部分投入' : '未投入';
      return <button key={need.item} className={'recipe-ingredient ' + (need.amount ? 'has-input' : 'is-missing')}
        onClick={() => onItem(need.item)} aria-label={ITEMS[need.item].name + '，' + status + ' ' + need.amount + '/' + need.required + '，查看介绍'}>
        <ItemIcon item={need.item} size={52} muted={!need.amount}/>
        <span className={'recipe-quantity ' + (need.complete ? 'is-complete' : '')} aria-hidden="true">
          {Math.min(need.amount, need.required)}/{need.required}{need.complete && <Check size={11} strokeWidth={3}/>}
        </span>
      </button>;
    })}
  </div>;
}

function RecipeIdentity({ item, name, muted = false, onItem, stock, timer }: {
  item?: string; name: string; muted?: boolean; onItem: () => void;
  stock?: { available: number; required: number; complete: boolean }; timer?: string;
}) {
  return <div className="recipe-identity">
    {item && <button className="recipe-food" onClick={onItem} aria-label={'查看' + name + '介绍'}>
      <ItemIcon item={item} size={64} muted={muted}/>
      {stock && <span className={'order-stock ' + (stock.complete ? 'is-complete' : '')} aria-label={'已有 ' + stock.available + '/' + stock.required}>
        {Math.min(stock.available, stock.required)}/{stock.required}{stock.complete && <Check size={11}/>}
      </span>}
      {timer && <span className="recipe-timer" aria-label={'制作剩余 ' + timer}>{timer}</span>}
    </button>}
  </div>;
}

function RecipeDevice({ family, level, name, available = true, id, onClick }: {
  family?: string; level: number; name: string; available?: boolean; id?: string; onClick: () => void;
}) {
  return <button className={'recipe-device ' + (available ? '' : 'is-unavailable')} data-device-id={id}
    onClick={onClick} aria-label={'打开' + name + '管理' + (available ? '' : '，本厨房暂无可用器具')}>
    {family ? <DeviceIcon family={family} level={level} size={40}/> : <CookingPot size={36}/>}
  </button>;
}

/** Selection takes precedence; choosing an order clears board selection in App. */
export function ItemActionBar({ state, selected, now, act, onBook, onItem, onDevices, onAppliance, focusOrder, applianceTargets }: Props) {
  const item = selected !== null ? state.board[selected] : null;
  const device = activeDevices(state).find(e => e.index === selected);
  const appliance = state.appliances.find(a => a.id === device?.id);
  const instance = state.devices?.find(d => d.id === device?.id);
  const orderTarget = selected === null && focusOrder ? getOrderTarget(state, focusOrder) : null;
  const undo = state.undo ? <button className="dock-secondary" aria-label="撤销出售" onClick={() => act({ type: 'undo' })}><Undo2 size={17}/><span>撤销</span></button> : null;
  let summary: ReactNode;
  let action: ReactNode = null;
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
    const recipe = target?.recipe ?? (status.phase === 'idle' ? null : status.recipe);
    const canStart = target?.canStart ?? status.canStart;
    const open = () => onAppliance ? onAppliance(appliance.id) : onDevices ? onDevices(device?.familyId ?? device?.id) : onBook();
    const name = recipe?.name ?? device!.name;
    const ingredients = target?.ingredients.map(need => ({ ...need, amount: need.loaded })) ?? [];
    action = status.phase === 'ready' ? <button className={'dock-primary ' + (model.freeCells ? '' : 'dock-neutral')}
      aria-label={model.freeCells ? '领取' + name : '整理棋盘，成品为你保留'}
      onClick={model.freeCells ? () => act({ type: 'collectAppliance', appliance: appliance.id, expectedJobId: appliance.job?.id }) : open}>
      {model.freeCells ? <Check size={16}/> : <Archive size={16}/>}<span>{model.freeCells ? '领取' : '整理'}</span>
    </button> : canStart ? <button className="dock-primary" aria-label={'开火 · ' + recipe!.name}
      onClick={() => act({ type: 'startCooking', appliance: appliance.id, recipe: recipe!.id, expectedVersion: appliance.version })}><Play size={14}/><span>开火</span></button>
      : status.phase === 'cooking' ? <button className="dock-secondary" onClick={open}><Clock3 size={16}/><span>进度</span></button> : null;
    return <section className="action-dock recipe-dock appliance-dock" data-phase={status.phase} aria-label={device!.name + (recipe ? '，目标' + name : '，选择料理')}>
      <div className="recipe-left">
        <RecipeIdentity item={recipe?.output} name={name} onItem={() => recipe && onItem(recipe.output)}
          timer={status.phase === 'cooking' ? formatCookingTime(status.remaining) : undefined}/>
        <div className="recipe-status">
          <RecipeDevice family={instance?.familyId ?? device?.familyId} level={instance?.level ?? 1} name={device!.name} id={appliance.id} onClick={open}/>
          <div className="recipe-action">{action}</div>
        </div>
      </div>
      {ingredients.length ? <RecipeIngredients ingredients={ingredients} mode="loaded" onItem={onItem}/>
        : <div className="recipe-empty" aria-label="尚未选择料理"/>}
    </section>;
  } else if (instance && device?.kind === 'generator') {
    const chain = CHAINS.find(c => c.id === instance.selectedChain);
    const start = instance.band * 3 + 1;
    const end = Math.min(start + 2, chain?.items.length ?? start + 2);
    description = '仅产' + chain?.name + ' · ' + start + '–' + end + '阶 · ' + BAND_COSTS[instance.band] + '体力';
    summary = <button className="context-summary" onClick={() => onDevices?.(instance.familyId)}><DeviceIcon family={instance.familyId} level={instance.level} size={36}/><span><b>{device.name}</b></span></button>;
    action = <button className="dock-secondary" onClick={() => onDevices?.(instance.familyId)}>调整产出</button>;
  } else if (orderTarget) {
    const target = orderTarget;
    const name = ITEMS[target.item].name;
    const source = getOrderDevice(state, target);
    const sourceName = DEVICE_FAMILIES.find(family => family.id === source?.family)?.name ?? '器具';
    const openDevice = () => {
      if (source?.applianceId && onAppliance) onAppliance(source.applianceId);
      else if (source && onDevices) onDevices(source.family);
      else onItem(target.item);
    };
    return <section className="action-dock recipe-dock order-dock" aria-label={'订单配料 · ' + name} data-order-id={focusOrder!.id}>
      <div className="recipe-left">
        <RecipeIdentity item={target.item} name={name} muted={!target.available} onItem={() => onItem(target.item)} stock={target}/>
        <div className="recipe-status">
          {source ? <RecipeDevice family={source.family} level={source.level} name={sourceName} id={source.applianceId}
            available={source.available} onClick={openDevice}/> : <div/>}
          <div className="recipe-action">{undo}</div>
        </div>
      </div>
      {target.ingredients.length ? <RecipeIngredients ingredients={target.ingredients.map(need => ({ ...need, amount: need.available }))} mode="stock" onItem={onItem}/>
        : <div className="recipe-empty" aria-label="直接生产与合成，点击目标或生产器查看来源"/>}
    </section>;
  } else {
    const title = selected !== null ? getBoardEntity(state, selected).name : '今天想做点什么？';
    description = '轻点查看，拖动合成或投料';
    summary = <div className="context-summary idle-summary"><span><b>{title}</b></span></div>;
    action = undo;
  }

  return <section className="action-dock selection-dock" aria-label="棋盘操作"><div className="selection-primary">{summary}</div><div className="selection-secondary"><p className="selection-description" title={typeof description === 'string' ? description : undefined}>{description}</p>{action}</div></section>;
}
