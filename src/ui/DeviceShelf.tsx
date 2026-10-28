import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp, Coins, Archive, MapPin, LockKeyhole, BookOpen, Check, Flame, PackageOpen } from 'lucide-react';
import { CHAINS, MODERN_RECIPES } from '../content/catalog';
import { BAND_COSTS, BAND_LEVELS, DEVICE_FAMILIES, THEME_NAMES } from '../content/expansion';
import { deviceIdle, productionFor, themeStage } from '../domain/devices';
import { getApplianceStatus, getBoardEntity, getRecipeDurationAtLevel, unlockedCells } from '../domain/engine';
import type { Command, GameState } from '../domain/types';
import { DeviceIcon } from './DeviceIcon';
import { ItemIcon } from './parts';

export function getDeviceShelfFamilies(state: GameState, filter = 'all') {
  const priority = (id: string) => state.devices.some(d => d.familyId === id && d.index === null) ? 0 : state.devices.some(d => d.familyId === id) ? 1 : 2;
  return DEVICE_FAMILIES.filter(f => filter === 'all' || f.kind === filter).sort((a, b) => priority(a.id) - priority(b.id) || a.stage - b.stage);
}

type Props = { state: GameState; act: (c: Command) => Promise<boolean>; initialFamily?: string; onFamilyChange?: (family: string) => void; onLocate: (index: number) => void; onBack: () => void; onItem?: (id: string) => void };

export function DeviceShelf({ state, act, initialFamily, onFamilyChange, onLocate, onBack, onItem }: Props) {
  const [familyId, setFamily] = useState(initialFamily ?? '');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(() => { setFamily(initialFamily ?? ''); setError(''); }, [initialFamily]);
  const stage = themeStage(state);
  const family = DEVICE_FAMILIES.find(f => f.id === familyId);
  const instances = state.devices.filter(d => d.familyId === familyId).sort((a, b) => Number(a.index !== null) - Number(b.index !== null) || b.level - a.level);
  const supported = MODERN_RECIPES.filter(r => r.deviceFamilyId === familyId);
  const stored = state.devices.filter(d => d.index === null);
  const run = async (command: Command) => {
    if (pending) return false;
    setError(''); setPending(true);
    try { return await act(command); } finally { setPending(false); }
  };
  const openFamily = (id: string) => { setFamily(id); onFamilyChange?.(id); setError(''); };
  const put = async (id: string) => {
    const device = state.devices.find(d => d.id === id)!;
    if (device.index !== null) { onLocate(device.index); return; }
    const index = Array.from({ length: unlockedCells(state) }, (_, i) => i).find(i => getBoardEntity(state, i).kind === 'empty');
    if (index === undefined) { setError('棋盘满了，先收纳一台空闲设备或整理食材。'); return; }
    if (await run({ type: 'retrieveDevice', device: id, index })) onLocate(index);
  };

  return <div className="device-shelf experience-shelf" role="region" aria-label="小鹅设备架">
    <button className="subtle detail-back" onClick={() => family ? openFamily('') : onBack()}><ArrowLeft size={17}/>{family ? '全部设备' : '返回上一层'}</button>
    {family ? <>
      <div className="device-family-heading"><DeviceIcon family={family.id} size={76}/><div><span className="drawer-eyebrow">{family.kind === 'generator' ? '食材从这里出发' : '每一餐的好帮手'}</span><h2>{family.name}</h2><p>{THEME_NAMES[family.stage - 1]}开放 · 已拥有 {instances.length} 台</p></div></div>
      {family.stage > stage ? <p className="codex-unlock"><LockKeyhole size={17}/>开放{THEME_NAMES[family.stage - 1]}，首台设备会自动送到设备架。</p> : <>
        <div className="device-instances">{instances.map(d => {
          const partner = instances.find(p => p.id !== d.id && p.level === d.level && deviceIdle(state, p.id));
          const idle = deviceIdle(state, d.id);
          const status = getApplianceStatus(state, d.id);
          const activity = status?.phase === 'ready' ? '料理待领取' : status?.phase === 'cooking' ? '正在制作' : status?.phase === 'loaded' ? '已投入食材' : '空闲';
          const canUpgrade = !!partner && idle && stage >= 3 && d.level < 3;
          return <article key={d.id} className={d.index === null ? 'device-on-shelf' : ''}>
            <div className="device-instance-title"><DeviceIcon family={family.id} level={d.level} size={48}/><span><b>{family.name} · {d.level}级</b><small>{d.index === null ? '架上 · 可放入棋盘' : '盘上 · ' + (Math.floor(d.index / 7) + 1) + '行' + (d.index % 7 + 1) + '列'}</small></span><button className={d.index === null ? 'primary' : 'outline'} disabled={pending} onClick={() => put(d.id)}>{d.index === null ? <PackageOpen size={15}/> : <MapPin size={15}/>}{d.index === null ? '取出' : '定位'}</button></div>
            <div className="device-status-line"><span className={idle ? 'status-idle' : 'status-working'}>{idle ? <Check size={12}/> : <Flame size={12}/>} {activity}</span>{canUpgrade && <span><ArrowUp size={12}/>已有同级副本，可升级</span>}</div>
            {family.kind === 'generator' && <div className="production-controls"><label>产出系列<select aria-label="产出系列" disabled={pending} value={d.selectedChain ?? ''} onChange={e => { void run({ type: 'configureDevice', device: d.id, chain: e.target.value, band: 0 }); }}>{family.chains.filter(c => (CHAINS.find(x => x.id === c)?.stage ?? 1) <= stage).map(c => <option key={c} value={c}>{CHAINS.find(x => x.id === c)?.name}</option>)}</select></label><label>每次产出范围<select aria-label="定向产出段" disabled={pending} value={d.band} onChange={e => { void run({ type: 'configureDevice', device: d.id, chain: d.selectedChain!, band: Number(e.target.value) }); }}>{BAND_COSTS.map((cost, band) => productionFor(d.selectedChain!, band) ? <option key={band} disabled={BAND_LEVELS[band] > d.level || band > 0 && stage < 3} value={band}>{band * 3 + 1}–{Math.min(band * 3 + 3, CHAINS.find(c => c.id === d.selectedChain)!.items.length)}阶 · {cost}体力{BAND_LEVELS[band] > d.level ? ' · 需' + BAND_LEVELS[band] + '级' : band > 0 && stage < 3 ? ' · 晨间茶饮开放' : ''}</option> : null)}</select></label><p className="production-cost"><span>轻点盘上生产器</span><b>每次消耗 {BAND_COSTS[d.band]} 体力</b></p></div>}
            <div className="device-row-actions">{d.index !== null && <button className="subtle" disabled={pending || !idle} onClick={() => run({ type: 'storeDevice', device: d.id })}><Archive size={15}/>收纳</button>}{d.level < 3 && <button className={canUpgrade ? 'primary' : 'outline'} disabled={pending || !canUpgrade} onClick={() => partner && run({ type: 'mergeDevices', device: partner.id, target: d.id })}><ArrowUp size={15}/>{canUpgrade ? '两台合成' + (d.level + 1) + '级' : !idle ? '忙碌时不能升级' : stage < 3 ? '晨间茶饮开放升级' : '需要同级副本'}</button>}</div>{!idle && <p className="device-busy-note">取回材料或领取成品后，才能收纳与升级。</p>}
          </article>;
        })}</div>
        <button className="primary buy-device" disabled={pending || stage < 3 || state.coins < family.price} onClick={() => run({ type: 'buyDevice', family: family.id })}><Coins size={17}/>购买一级副本 · {family.price}金币</button>
        {stage < 3 ? <p className="quiet-note">完成十道家常菜后开放购买与设备升级。</p> : state.coins < family.price && <p className="quiet-note">还差 {family.price - state.coins} 金币，完成顾客订单就能攒到。</p>}
      </>}
      <details className="device-growth"><summary><ArrowUp size={17}/>三级成长 · 两台同级合成</summary><div className="device-evolution">{[1, 2, 3].map(level => <div key={level}><DeviceIcon family={family.id} level={level}/><b>{level}级</b><small>{level === 1 ? '主题赠送首台' : level === 2 ? '两台一级合成' : '两台二级合成'}</small></div>)}</div></details>
      {family.kind === 'generator' ? <p className="quiet-note">可生产系列：{family.chains.map(c => CHAINS.find(x => x.id === c)?.name).join('、')}</p> : <details className="device-recipe-list"><summary><BookIcon/>查看全部 {supported.length} 道菜谱</summary><div>{supported.map(recipe => <button key={recipe.id} className="subtle" onClick={() => onItem?.(recipe.output)}><ItemIcon item={recipe.output} size={38}/><span>{recipe.name}<small>需要{recipe.minDeviceLevel}级 · {Math.ceil(getRecipeDurationAtLevel(state, recipe, Math.max(recipe.minDeviceLevel ?? 1, ...instances.map(d => d.level))) / 1000)}秒</small></span></button>)}</div></details>}
      <p className="quiet-note">设备可永久复用。料理中也能移动，任务会跟随设备。</p>
    </> : <>
      <div className="shelf-intro"><span className="drawer-eyebrow">小馆工具间</span><h2>每一台，都有拿手好菜。</h2><p>设备架不占食物仓库。先把需要的设备放上棋盘。</p></div>
      {stored.length > 0 && <section className="shelf-ready-section"><div className="drawer-section-heading"><h3>等你上盘 <small>{stored.length}台</small></h3><PackageOpen size={18}/></div><div className="shelf-ready-list">{stored.map(d => <button key={d.id} onClick={() => openFamily(d.familyId)}><DeviceIcon family={d.familyId} level={d.level} size={42}/><span><b>{DEVICE_FAMILIES.find(f => f.id === d.familyId)!.name}</b><small>{d.level}级 · 查看并取出</small></span><MapPin size={15}/></button>)}</div></section>}
      <div className="filter-tabs" aria-label="设备分类">{[['all', '全部'], ['generator', '生产器'], ['appliance', '厨具']].map(([id, name]) => <button key={id} className={filter === id ? 'active' : ''} aria-pressed={filter === id} onClick={() => setFilter(id)}>{name}</button>)}</div>
      <div className="shelf-grid">{getDeviceShelfFamilies(state, filter).map(f => { const owned = state.devices.filter(d => d.familyId === f.id); const onShelf = owned.filter(d => d.index === null).length; return <button key={f.id} className={f.stage > stage ? 'shelf-family-locked' : onShelf ? 'shelf-family-ready' : ''} onClick={() => openFamily(f.id)}><DeviceIcon family={f.id}/><b>{f.name}</b><small>{f.stage > stage ? THEME_NAMES[f.stage - 1] + '开放' : onShelf ? '架上 ' + onShelf + ' · 盘上 ' + (owned.length - onShelf) : '盘上 ' + owned.length + '台'}</small>{onShelf > 0 && <span className="shelf-available-dot" aria-label="有设备可取出"/>}</button>; })}</div>
    </>}
    {error && <p role="status" className="shelf-error"><Archive size={17}/>{error}</p>}
  </div>;
}

function BookIcon() { return <BookOpen size={17}/>; }
