import { Settings, Zap, Coins, Leaf } from 'lucide-react';
import type { GameState } from '../domain/types';
import { getEnergyStatus } from '../domain/engine';
import { themeProgress } from '../domain/devices';

interface ResourceBarProps {
  state: GameState;
  now: number;
  onSettings: () => void;
  onEnergy: () => void;
  onTheme?: () => void;
}

export function ResourceBar({ state, now, onSettings, onEnergy, onTheme }: ResourceBarProps) {
  const energy = getEnergyStatus(state, now);
  const theme = themeProgress(state);
  const coinLabel = state.coins >= 10_000 ? new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(state.coins) : state.coins.toLocaleString();
  const themeContent = <><span className="theme-emblem"><Leaf size={16}/></span><span className="theme-badge-copy"><small>风味 {theme.stage}/8</small><b>{theme.name}</b></span></>;
  return <header className="resource-bar guest-resources">
    {state.campaign === 'fresh'
      ? onTheme ? <button className="theme-badge" onClick={onTheme} aria-label={`${theme.name}，第${theme.stage}个主题，查看风味进度`}>{themeContent}</button> : <div className="theme-badge" aria-label={`${theme.name}，第${theme.stage}个主题`}>{themeContent}</div>
      : <div className="day-badge"><span>营业日</span><b>{state.day}</b></div>}
    <button className="resource-pill energy" onClick={onEnergy} aria-label={`体力 ${energy.value}，查看恢复规则`}><Zap size={19} fill="currentColor"/><b>{energy.value}</b><span>/100</span></button>
    <div className="resource-pill coins" data-resource-anchor="coins" aria-label={`金币 ${state.coins}`} title={`${state.coins.toLocaleString()} 金币`}><Coins size={20}/><b key={state.coins}>{coinLabel}</b></div>
    <button className="round-button settings-button" aria-label="设置与存档" onClick={onSettings}><Settings size={22}/></button>
  </header>;
}
