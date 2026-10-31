import { Settings, Zap, Coins, Gift, Leaf, BookOpen } from 'lucide-react';
import type { GameState } from '../domain/types';
import { getEnergyStatus } from '../domain/engine';
import { themeProgress } from '../domain/devices';
import { OfflineStatus } from './OfflineResources';
import { SpeedTicket } from './SpeedTicket';

interface ResourceBarProps {
  state: GameState;
  now: number;
  onSettings: () => void;
  onRedeem: () => void;
  onEnergy: () => void;
  onTheme?: () => void;
  onBook: () => void;
  onSpeedUp?: () => void;
  newDiscoveries?: number;
}

const compactNumber = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumSignificantDigits: 3 });
const resourceLabel = (value: number) => value >= 10_000 ? compactNumber.format(value) : value.toLocaleString();

export function ResourceBar({ state, now, onSettings, onEnergy, onRedeem, onTheme, onBook, onSpeedUp, newDiscoveries = 0 }: ResourceBarProps) {
  const energy = getEnergyStatus(state, now);
  const theme = themeProgress(state);
  const coinLabel = resourceLabel(state.coins);
  const themeContent = <><span className="theme-emblem"><Leaf size={16}/></span><span className="theme-badge-copy"><small>{state.workspaces?'切换章节':`风味 ${theme.stage}/8`}</small><b>{theme.name}</b></span><span className="theme-compact" aria-hidden="true"><Leaf size={15}/><b>{theme.stage}</b></span></>;
  return <header className="resource-bar guest-resources">
    {state.campaign === 'fresh'
      ? onTheme ? <button className="theme-badge" onClick={onTheme} aria-label={`${theme.name}，第${theme.stage}个主题，查看风味进度`}>{themeContent}</button> : <div className="theme-badge" aria-label={`${theme.name}，第${theme.stage}个主题`}>{themeContent}</div>
      : <div className="day-badge"><span>营业日</span><b>{state.day}</b></div>}
    <button className="resource-pill energy" onClick={onEnergy} title={`${energy.value.toLocaleString()} 点体力`} aria-label={`体力 ${energy.value}，查看恢复规则`}><Zap size={19} fill="currentColor"/><b>{resourceLabel(energy.value)}</b>{energy.value <= energy.naturalCap && <span>/100</span>}</button>
    <button className="round-button codex-button" aria-label="打开图鉴" title="图鉴" onClick={onBook}><BookOpen size={22}/>{newDiscoveries > 0 && <span className="codex-discovery" aria-label={`${newDiscoveries}个新发现`}>{newDiscoveries > 9 ? '9+' : newDiscoveries}</span>}</button>
    <div className="resource-pill coins" data-resource-anchor="coins" aria-label={`金币 ${state.coins}`} title={`${state.coins.toLocaleString()} 金币`}><Coins size={20}/><b key={state.coins}>{coinLabel}</b></div>
    <button className="resource-pill speed-tickets" onClick={onSpeedUp} aria-label={`加速券 ${state.speedUpTickets} 张，查看使用说明`} title={`${state.speedUpTickets.toLocaleString()} 张加速券`}><SpeedTicket size={24}/><b key={state.speedUpTickets}>{resourceLabel(state.speedUpTickets)}</b></button>
    <button className="round-button gift-button" aria-label="兑换礼包" title="兑换礼包" onClick={onRedeem}><Gift size={22}/></button>
    <button className="round-button settings-button" aria-label="设置与存档" onClick={onSettings}><Settings size={22}/><OfflineStatus/></button>
  </header>;
}
