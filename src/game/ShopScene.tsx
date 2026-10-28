import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Check, Gift, Hammer, Sparkles } from 'lucide-react';
import type { GameState } from '../domain/types';
import { getConstructionProgress } from '../domain/engine';
import { themeProgress } from '../domain/devices';
import { Goose } from '../ui/parts';
import { STREET_THEMES } from './street-presentation';
import { ThemeMotif } from './ThemeEmblem';

function Crate({x,y,scale=1}:{x:number;y:number;scale?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#9f7049" strokeWidth="1.5" strokeLinejoin="round">
    <path d="m0 12 28-16 33 18-29 17Z" fill="#edc591"/>
    <path d="m0 12 32 19v31L0 44Z" fill="#c79864"/>
    <path d="m32 31 29-17v31L32 62Z" fill="#dab17c"/>
    <path d="m8 7 32 19 11-6L19 1Z" fill="#f4dfb4" stroke="none"/>
    <path d="m7 28 18 10m-18 1 18 10m14-10 15-9m-15 20 15-9" opacity=".65"/>
    <path d="m11 31 10 6v10l-10-6Z" fill="#fff0cb" stroke="none"/>
  </g>;
}

function Plant({x,y,scale=1}:{x:number;y:number;scale?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#6d754a" strokeWidth="1.5" strokeLinejoin="round">
    <ellipse cy="6" rx="15" ry="6" fill="#805c3f" opacity=".15" stroke="none"/>
    <path d="m-12-12 3 21q9 7 18 0l3-21Z" fill="#c7885e" stroke="#96613f"/>
    <ellipse cy="-12" rx="12" ry="5" fill="#dca577" stroke="#96613f"/>
    <path d="M0-11v-26M0-20q-22-3-18-20 19 0 18 20m1-8q-5-26 9-30 11 19-9 30m0 8q20-19 25-4-5 15-25 4" fill="#789965"/>
    <path d="m-13-34 12 12m9-27-7 20m18 7-16 5" stroke="#a7ba80"/>
  </g>;
}

function Resident({x,y,color,accessory='',size=57,action='waiting'}:{x:number;y:number;color:string;accessory?:string;size?:number;action?:'waiting'|'arriving'|'dining'|'chef'}) {
  return <g transform={`translate(${x} ${y})`} className={`bistro-resident bistro-resident-${action}`}>
    <g className="bistro-resident-body"><svg width={size} height={size*1.1} viewBox="0 0 100 110"><Goose color={color} accessory={accessory} expression={action==='dining'?'happy':action==='chef'?'eager':'waiting'}/></svg></g>
    {action==='dining'&&<g className="bistro-reaction" transform={`translate(${size*.75} -3)`}><path d="M0 4C-9-3-13 6 0 13 13 6 9-3 0 4" fill="#c97e68"/><path d="m14 2 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" fill="#dfb66b"/></g>}
  </g>;
}

export default function ShopScene({state,onBuild}:{state:GameState;onBuild:()=>void}) {
  const construction=getConstructionProgress(state), built=construction.completed;
  const theme=themeProgress(state), stage=state.campaign==='fresh'?theme.stage:1;
  const presentation=STREET_THEMES[stage-1], night=stage===8;
  const id=useId().replace(/:/g,''), previous=useRef(built);
  const [building,setBuilding]=useState(false),[roomWidth,setRoomWidth]=useState(340);
  const stageRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=stageRef.current;if(!element)return;
    const measure=()=>{const {width,height}=element.getBoundingClientRect();if(width>0&&height>0)setRoomWidth(Math.min(width,height*400/430,400));};
    const observer=new ResizeObserver(measure);observer.observe(element);measure();
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(previous.current===built)return;
    const grew=built>previous.current;previous.current=built;
    if(!grew||state.settings.reducedMotion)return;
    setBuilding(true);const timer=setTimeout(()=>setBuilding(false),900);
    return()=>clearTimeout(timer);
  },[built,state.settings.reducedMotion]);
  const label=['门前纸箱等待整理','门前已清理，等待搭建蔬菜货架','蔬菜货架已就位，等待整理迎客柜台','货架和柜台齐备，小鹅们正在享受美食'][built];
  const hotspot=built===0?{left:'63%',top:'69%'}:built===1?{left:'29%',top:'50%'}:built===2?{left:'72%',top:'66%'}:{left:'78%',top:'78%'};
  return <section className={`shop-world bistro-world ${night?'bistro-evening':''} ${building?'bistro-building':''}`} data-reduced-motion={state.settings.reducedMotion} style={{'--theme-accent':presentation.accent} as CSSProperties} aria-label={`鹅鹅小馆，${label}，${state.campaign==='fresh'?theme.name:`营业第${state.day}天`}`}>
    <header className="bistro-title"><span className="bistro-kicker"><i/>{state.campaign==='fresh'?`第 ${stage} 味 · ${theme.name}`:`鹅巷 · 营业第 ${state.day} 天`}</span><h1>鹅鹅小馆</h1><p>{built<3?['先腾出一个角落，让好日子开张。','阳光照进来了，摆上新鲜的蔬菜吧。','新鲜已经就位，只差一个迎客的柜台。'][built]:presentation.description}</p></header>
    <div className="bistro-stage" ref={stageRef}><div className="bistro-diorama" style={{width:roomWidth,height:roomWidth*430/400}}>
      <svg className="bistro-scene" viewBox="0 0 400 430" role="img" aria-label={`${label}${built===3?`，已留下${stage}件主题纪念陈设`:''}`}>
        <defs>
          <linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff5d9"/><stop offset="1" stopColor="#edddbb"/></linearGradient>
          <linearGradient id={`${id}-right`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e6d9b9"/><stop offset="1" stopColor="#d7cfb3"/></linearGradient>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={night?'#4e5b75':'#a8cabc'}/><stop offset="1" stopColor={night?'#c1a18d':'#e6ebcf'}/></linearGradient>
          <linearGradient id={`${id}-floor`} x1="0" y1="0" x2=".6" y2="1"><stop stopColor="#eedbb9"/><stop offset="1" stopColor="#dcc098"/></linearGradient>
          <linearGradient id={`${id}-counter`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#6e9277"/><stop offset="1" stopColor="#527660"/></linearGradient>
          <radialGradient id={`${id}-light`}><stop stopColor="#ffe4a3" stopOpacity=".5"/><stop offset="1" stopColor="#ffe4a3" stopOpacity="0"/></radialGradient>
        </defs>
        <ellipse cx="203" cy="365" rx="171" ry="39" fill="#8f8664" opacity=".16"/>
        <g stroke="#9a7c58" strokeWidth="2" strokeLinejoin="round">
          <path d="m18 265 182-105 182 105v25L200 396 18 290Z" fill="#c6ac83"/>
          <path d="m18 265 182-105 182 105-182 106Z" fill={`url(#${id}-floor)`}/>
          <path d="m28 265 172-99 172 99-172 100Z" fill="#f1e1c4"/>
          <g stroke="#dfcba6" strokeWidth="1.2"><path d="m57 248 172 100m-114-134 171 101m-113-134 170 100M57 282l171-99M114 315l172-99m-115 132 172-99"/></g>
          <path d="M28 265V105L200 6v160Z" fill={`url(#${id}-left)`}/>
          <path d="M200 6 372 105v160L200 166Z" fill={`url(#${id}-right)`}/>
          <path d="m28 105 172-99 172 99v14L200 20 28 119Z" fill="#fff4d8"/>
          <path d="m28 234 172-99 172 99v31L200 166 28 265Z" fill="#9cab8c"/>
          <path d="m28 232 172-99 172 99" fill="none" stroke="#f6eacc" strokeWidth="4"/>
          <path d="m47 125 109-63v111L47 236Z" fill="#c9aa7d"/>
          <path d="m54 130 95-55v91l-95 55Z" fill={`url(#${id}-sky)`} stroke="#a69068"/>
          {night?<><path d="m124 97 4-2v4l-4 2m-43 60 3-2v3l-3 2" fill="#fff0c2" stroke="none"/><ellipse cx="127" cy="111" rx="8" ry="12" fill="#f1dfae" stroke="none"/></>:<><path d="m55 194 20-34 18 9 24-43 31 10v29l-94 55Z" fill="#85a48b" stroke="none"/><path d="m56 206 29-22 20 2 44-37v16l-93 54Z" fill="#b8c9a1" stroke="none"/></>}
          <path d="M101 103v92m-47-21 95-55" stroke="#fff4d6" strokeWidth="6"/>
          <path d="m50 129 11-7v88l-11 7Zm92-53 11-6v90l-11 7Z" fill="#f6e8c9" stroke="none"/>
          <path d="m45 236 113-65v8L45 244Z" fill="#e9cca0"/>
          {!night&&<path d="m61 217 86-50 113 102-84 49Z" fill="#fff4ca" opacity=".3" stroke="none"/>}
          <path d="m237 62 91 53v29l-91-53Z" fill="#bd8c60"/>
          <path d="m242 70 81 47v17l-81-47Z" fill="#557962"/>
          <path d="m254 82 54 31m-54-23 38 22" stroke="#f1e8c9" strokeWidth="3"/>
          <path d="M287 58v34" stroke="#96785b"/><path d="m270 89 17-8 17 27-34-19Z" fill="#d99c5d"/>
          <ellipse cx="287" cy="103" rx="9" ry="4" transform="rotate(29 287 103)" fill="#fff2b9" stroke="none"/>
          {stage>=5&&<ellipse cx="288" cy="163" rx="62" ry="74" fill={`url(#${id}-light)`} stroke="none"/>}
          {built>=3&&<g className="bistro-keepsakes" aria-label="主题纪念架">
            <path d="m215 146 135 78 10-6-135-78Z" fill="#f0d2a3"/>
            <path d="m215 146 135 78v7l-135-78Z" fill="#c39564"/>
            {Array.from({length:stage},(_,i)=><g key={i} transform={`translate(${213+i*17} ${117+i*9.8}) scale(.4)`}><title>{STREET_THEMES[i].keepsake}</title><ThemeMotif stage={i+1}/></g>)}
          </g>}
          {built<2?<g opacity=".75"><path d="m68 232 89-51 54 31-88 52Z" fill="#e2d3b7" strokeDasharray="4 4"/><path d="m68 232 55 32v15l-55-32m55 17 88-52v15l-88 52" fill="#d4c2a3" strokeDasharray="4 4"/></g>:<g className="bistro-built-part bistro-shelf">
            <path d="m62 228 89-51 63 37-89 52Z" fill="#edcb94"/>
            <path d="m62 228 63 38v51l-63-37Z" fill="#b88a58"/>
            <path d="m125 266 89-52v51l-89 52Z" fill="#d2a16a"/>
            <path d="m70 231 55 32 81-47m-81 54v40" fill="none"/>
            <path d="m73 226 77-44 50 29-77 45Z" fill="#7e7251"/>
            <path d="m97 213 50 29m-26-43 50 29" stroke="#edce9a" strokeWidth="3"/>
            <g fill="#7eaa69" stroke="#587a49"><circle cx="96" cy="218" r="10"/><circle cx="117" cy="206" r="10"/><circle cx="139" cy="194" r="9"/><path d="m88 218 8-3 5 8m9-16 8-4 3 9" fill="none" stroke="#a2c280"/></g>
            <g fill="#df805a" stroke="#af6045"><circle cx="122" cy="235" r="10"/><circle cx="145" cy="222" r="10"/><circle cx="169" cy="208" r="9"/></g>
            <path d="m117 222 5-3 4 3m15-15 5-3 4 3m15-14 5-3 4 3" stroke="#63834e" strokeWidth="3"/>
            <path d="m144 270 34-20v15l-34 20Z" fill="#fff0d0"/><path d="m152 273 18-10" stroke="#68865c" strokeWidth="3"/>
            <path d="m72 263 44 26m17-3 69-40" stroke="#a57a4f"/>
          </g>}
          {built>=3&&<g className="bistro-built-part bistro-counter">
            <path d="m231 278 74-43 56 33-74 44Z" fill="#f1d09a"/>
            <path d="m231 278 56 34v51l-56-33Z" fill="#88a184"/>
            <path d="m287 312 74-44v51l-74 44Z" fill={`url(#${id}-counter)`}/>
            <path d="m230 278 57 34 75-44v7l-75 44-57-34Z" fill="#e6bd83"/>
            <path d="m298 329 50-29v15l-50 29Z" fill="#eae2bb"/>
            <path d="m310 328 25-14" stroke="#6f8665" strokeWidth="3"/>
            <path d="m239 273 24-14 26 15-24 14Z" fill="#c4ad86"/><path d="m245 268 3-22 23 13v23Z" fill="#f0e4c4"/>
            <path d="m250 254 16 9v9l-16-9Z" fill="#567c69"/>
            <g transform="translate(288 216) scale(.72)" className="bistro-showcase" key={stage}><title>{presentation.keepsake}</title><ThemeMotif stage={stage}/></g>
          </g>}
          {built===0&&<g className="bistro-crates"><Crate x={202} y={282} scale={.95}/><Crate x={256} y={312} scale={.72}/><Crate x={202} y={244} scale={.68}/></g>}
          {built>=1&&<><path d="m172 337 39-23 35 20-40 23Z" fill="#c99667" stroke="none"/><path d="m179 337 31-18 28 16-32 18Z" fill="#ddbd87" stroke="none"/><path d="m189 337 14 8m-3-13 13 8" stroke="#b1885b"/></>}
          <Plant x={46} y={297} scale={.92}/><Plant x={354} y={332} scale={.63}/>
          <path d="m68 362 20 12m-10-23 15 9m187-3 19-11" fill="none" stroke="#c5af8b" strokeWidth="3"/>
        </g>
        {built>=3&&<Resident x={245} y={231} color="#c78f5b" accessory="chef" size={44} action="chef"/>}
        <Resident x={112} y={290} color="#bd7d76" accessory="ribbon" size={58} action={built>=3?'dining':'waiting'}/>
        {built>=1&&<Resident x={204} y={347} color="#668d82" accessory="glasses" size={47} action="arriving"/>}
        {built>=3&&<g transform="translate(145 340)" stroke="#92714f" strokeWidth="1.6"><path d="M0 0v33m26-34v32"/><ellipse cx="13" cy="0" rx="25" ry="11" fill="#edc998"/><ellipse cx="13" cy="-1" rx="15" ry="6" fill="#fff4d7"/><path d="M1-3q12-12 24 0" fill="#98b17c"/><circle cx="12" cy="-6" r="3" fill="#d97857"/></g>}
        {building&&<g className="bistro-confetti" fill="#d99c54"><path d="m92 172 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z"/><path d="m300 188 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z"/><circle cx="182" cy="214" r="4"/><circle cx="244" cy="167" r="3"/></g>}
      </svg>
      {(construction.next||construction.canClaimReward)&&<button className={`bistro-hotspot ${construction.next&&state.coins>=construction.next.cost?'affordable':''}`} style={hotspot} onClick={onBuild} aria-label={construction.next?`建设：${construction.next.name}`:'领取开张奖励'}><span>{construction.next?<Hammer size={20}/>:<Gift size={20}/>}</span><b>{construction.next?'建设':'开张礼'}</b></button>}
      {built===3&&!construction.canClaimReward&&<div className="bistro-open-sign"><Check size={13}/>小馆营业中</div>}
    </div></div>
    <div className="bistro-footnote"><Sparkles size={14}/><span>{built<3?`开张心愿 ${built}/3 · 每一步，都让小馆更像家`:`已留下 ${stage} 件风味纪念 · ${presentation.display}`}</span></div>
  </section>;
}
