import { Settings, Zap, Coins } from 'lucide-react';
import type { GameState } from '../domain/types';
import { getEnergyStatus } from '../domain/engine';
export function ResourceBar({state,now,onSettings,onEnergy}:{state:GameState;now:number;onSettings:()=>void;onEnergy:()=>void}) {
 const energy=getEnergyStatus(state,now);
 return <header className="resource-bar"><div className="day-badge"><span>营业日</span><b>{state.day}</b></div><button className="resource-pill energy" onClick={onEnergy} aria-label={`体力 ${energy.value}，查看恢复规则`}><Zap size={23} fill="currentColor"/><b>{energy.value}</b><span>/100</span></button><div className="resource-pill coins" aria-label={`金币 ${state.coins}`}><Coins size={23}/><b key={state.coins}>{state.coins.toLocaleString()}</b></div><button className="round-button settings-button" aria-label="设置与存档" onClick={onSettings}><Settings size={21}/></button></header>;
}
