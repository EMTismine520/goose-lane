import { ArrowRight, Check, ChevronRight, Gift, Hammer, LockKeyhole, Sparkles } from 'lucide-react';
import type { GameState } from '../domain/types';
import { getConstructionProgress } from '../domain/engine';
import { themeProgress } from '../domain/devices';
import { streetThemeCards } from '../game/street-presentation';
import { ThemeEmblem } from '../game/ThemeEmblem';
import { DeviceIcon } from './V3Codex';

export function StreetProgress({state,onBuild,onTheme}:{state:GameState;onBuild:()=>void;onTheme:()=>void}) {
  const construction=getConstructionProgress(state), theme=themeProgress(state);
  const building=!!construction.next, reward=construction.canClaimReward;
  return <div className="street-context"><div className="street-context-copy"><b>{construction.next?.name??(reward?'小馆开张礼':state.campaign==='fresh'?theme.name:'小馆成长记')}</b><small>{construction.next?state.coins>=construction.next.cost?'金币够啦，让小馆再变好一点':`还差 ${construction.next.cost-state.coins} 金币 · 去合成交订单`:reward?'开张心愿完成 · 体力 +50':state.campaign==='fresh'?`${theme.completed}/${theme.total} 份心愿 · 自由选择章节`:'三项建设完成，欢迎回来'}</small></div><button className={building||reward?'primary street-context-action':'street-context-action'} onClick={building||reward?onBuild:onTheme} aria-label={building?'查看下一项建设':reward?'查看开张奖励':'查看风味成长'}>{building?<Hammer size={16}/>:reward?<Gift size={16}/>:<Sparkles size={16}/>}<span>{building?'建设':reward?'领奖':'成长'}</span></button></div>;
}

export function ThemeProgressPanel({state,onDevices}:{state:GameState;onDevices?:(family?:string)=>void}) {
  const cards=streetThemeCards(state), theme=themeProgress(state);
  if(state.campaign!=='fresh')return <div className="theme-album"><div className="theme-album-intro"><ThemeEmblem stage={1}/><div><h3>熟悉的小馆，继续经营</h3><p>旧日食光与料理进度仍为你保留。回到合成页，继续款待来客。</p></div></div></div>;
  return <div className="theme-album"><div className="theme-album-intro"><ThemeEmblem stage={theme.stage} size={60}/><div><span className="eyebrow">小馆的风味纪念册</span><h3>八种滋味，一间小馆</h3><p>已完成 {theme.overall}/145 份心愿，留下 {theme.stage}/8 件纪念。</p></div></div>
    <ol className="theme-chapters">{cards.map(card=><li className={`theme-chapter ${card.unlocked?'unlocked':'locked'} ${card.current?'current':''}`} key={card.stage} aria-current={card.current?'step':undefined}><div className="theme-chapter-heading"><span className="theme-chapter-number">{String(card.stage).padStart(2,'0')}</span><ThemeEmblem stage={card.stage} size={46}/><div><h3>{card.name}</h3><p>{card.unlocked?card.keepsake:'下一份风味，等你来发现'}</p></div>{card.current?<span className="theme-status">正在经营</span>:card.unlocked?<Check size={18}/>:<LockKeyhole size={17}/>}</div>
      {card.unlocked?<><p className="theme-description">{card.description}</p><div className="theme-progress-line"><span>{card.completed}/{card.total} 份心愿</span><progress max={card.total} value={card.completed} aria-label={`${card.name}订单完成进度`}/></div><div className="theme-device-list">{card.families.map(family=><button key={family.id} onClick={()=>onDevices?.(family.id)} disabled={!onDevices} aria-label={`查看${family.name}`}><DeviceIcon family={family.id} size={34}/><span>{family.name}</span><ChevronRight size={13}/></button>)}</div>{card.current&&<p className="theme-next"><ArrowRight size={14}/>{card.nextCondition}</p>}</>:<p className="theme-lock-copy">{cards[card.stage-2]?.nextCondition}后开放。</p>}
    </li>)}</ol></div>;
}
