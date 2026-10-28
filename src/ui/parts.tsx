import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { ITEMS, CUSTOMERS } from '../content/catalog';
import { B_ART, itemPresentation } from '../content/assets';
import { ArtImage } from './ArtImage';

export function Goose({color='#5e8066',accessory='',className='',expression='waiting'}: {color?:string;accessory?:string;className?:string;expression?:'waiting'|'expectant'|'eager'|'happy'}) {
  const variant = /chef|格子围裙|工装背带|hat/.test(accessory) ? 'chef' : /glasses|翡翠披肩/.test(accessory) ? 'shawl' : /邮帽|贝雷帽|水手领|头巾|草帽|旅行箱/.test(accessory) ? 'post' : 'flower';
  const cheerful = expression === 'happy';
  return <svg className={`goose-character ${className}`} data-expression={expression} data-goose-variant={variant} viewBox="0 0 100 110" fill="none" aria-hidden="true">
    <ellipse cx="48" cy="102" rx="29" ry="4.5" fill="#493729" opacity=".12"/>
    <g className="goose-body">
      <path d="m36 93-6 10h19l-4-10m13-1 2 11h17l-10-11" fill="#E8A452" stroke="#BD793B" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M22 78c-5-17 4-29 20-30-10-8-10-28 0-36 12-10 32-4 34 11 2 11-4 20-14 25 26 10 23 41-1 49-21 6-34-2-39-19Z" fill="#FFFBED" stroke="#CABB9D" strokeWidth="2"/>
      <path d="M25 79q15 18 37 7" stroke="#EAE0C8" strokeWidth="5" strokeLinecap="round"/>
      <path d={cheerful ? 'm74 28 17 6-15 12-8-10Z' : 'm74 28 16 7-17 6-5-6Z'} fill="#EFAC53" stroke="#C3833C" strokeWidth="1.4" strokeLinejoin="round"/>
      {cheerful && <path d="m77 36 8-1-7 6Z" fill="#A4653B"/>}
      <g className="goose-face">
        {cheerful ? <path d="m56 28q5-7 10-1" stroke="#493729" strokeWidth="3" strokeLinecap="round"/> : <>
          <ellipse cx={expression === 'expectant' ? 63 : 62} cy={expression === 'expectant' ? 25 : 27} rx={expression === 'eager' ? 4 : 3} ry={expression === 'waiting' ? 3.3 : 4.3} fill="#493729"/>
          {expression !== 'waiting' && <circle cx="63" cy="24.5" r="1.25" fill="#FFFEF6"/>}
          {expression === 'expectant' && <path d="m57 19 7-2" stroke="#72523A" strokeWidth="1.8" strokeLinecap="round"/>}
          {expression === 'eager' && <path d="m56 19q5-4 10 0" stroke="#72523A" strokeWidth="1.8" strokeLinecap="round"/>}
        </>}
        <ellipse cx="65" cy="39" rx={cheerful || expression === 'eager' ? 5.5 : 4} ry="2.7" fill="#EFAE93" opacity={expression === 'waiting' ? .55 : .9}/>
      </g>
      <path d="M29 59q17 10 35-5l12 28q-21 18-48 2Z" fill={color} stroke="#80664C" strokeWidth="1.2"/>
      {variant === 'chef' && <g stroke="#FFF7DB" strokeWidth="2" opacity=".85"><path d="M35 62v24m11-21v24m12-28v27m8-24v20M30 70h39M30 78h42"/></g>}
      {variant === 'post' && <><path d="m32 59 36 29" stroke="#6B523E" strokeWidth="6"/><path d="m29 75 17-3 3 17-17 3Z" fill="#BE8D58" stroke="#80613E" strokeWidth="1.5"/><path d="m31 78 9 5 7-8" stroke="#F3D5A0" strokeWidth="1.5"/></>}
      {variant === 'shawl' && <><path d="m29 60 16 20 20-25 10 20-29 11Z" fill={color} stroke="#708768" strokeWidth="2"/><path d="m37 69 6 7m8-5 8-9m-29 18 8 5m19-4 9-4" stroke="#EEE6C3" strokeWidth="2"/><circle cx="48" cy="79" r="3" fill="#DFBB61"/></>}
      {variant === 'flower' && <><path d="M29 56q17 13 37-3l3 10q-19 15-39 3Z" fill={color} stroke="#9B7380" strokeWidth="1.2"/><path d="m41 66-4 20 12-2 1-18" fill={color} stroke="#9B7380" strokeWidth="1.2"/><g fill="#FFF1DA"><circle cx="47" cy="59" r="3.3"/><circle cx="52" cy="63" r="3.3"/><circle cx="48" cy="68" r="3.3"/><circle cx="43" cy="64" r="3.3"/></g><circle cx="48" cy="64" r="2.7" fill="#D5A34D"/></>}
      <path d={cheerful ? 'M34 65q-15-14-20-3-1 12 24 17' : 'M34 64q-14 1-7 13 10 4 16-2'} fill="#FFFBED" stroke="#CABB9D" strokeWidth="1.6" strokeLinecap="round"/>
      {variant === 'chef' ? <><path d="M37 17c-9-10-1-17 6-13 4-7 12-5 15 0 10-6 19 1 15 9 8 7-4 12-7 10H40Z" fill="#FFFEF5" stroke="#CABB9D" strokeWidth="1.7"/><path d="M39 15h31v8H39Z" fill={color}/></> : variant === 'post' ? <><path d="M36 17q2-17 24-13 14 2 14 16Z" fill={color} stroke="#64788B" strokeWidth="1.7"/><path d="m35 17 42 1q12 8-3 9l-24-5Z" fill={color} stroke="#64788B" strokeWidth="1.7"/><path d="m51 10 5-3 5 3-5 3Z" fill="#F3D990"/></> : variant === 'shawl' ? <><path d="M37 15q15-11 30 1" stroke="#F1E7D5" strokeWidth="8" strokeLinecap="round"/><g stroke="#756D54" strokeWidth="1.8"><circle cx="61" cy="28" r="7"/><path d="m54 28-14-3m28 4 6 1"/></g></> : <><path d="M38 16q14-12 31 1" stroke={color} strokeWidth="6" strokeLinecap="round"/><g fill="#F4C5CE"><circle cx="40" cy="12" r="4"/><circle cx="45" cy="17" r="4"/><circle cx="39" cy="20" r="4"/><circle cx="35" cy="16" r="4"/></g><circle cx="40" cy="16" r="3" fill="#D9AA50"/></>}
    </g>
    {expression === 'eager' && <g fill="#D5A243"><path d="m86 49 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z"/><circle cx="88" cy="68" r="2"/></g>}
    {cheerful && <path d="M84 51c-8-8-13 3 0 11 13-8 8-19 0-11Z" fill="#DC8B72"/>}
  </svg>;
}

export function ItemIcon({item,size=48,muted=false}: {item:string;size?:number;muted?:boolean}) {
  const def=ITEMS[item]; if(!def) return null;
  if(def.assetId) {
    const custom=item in B_ART,presentation=itemPresentation(item);
    return <ArtImage className={`item-icon vector-item ${muted?'muted':''}`} path={presentation.path!} size={size} alt={def.name} draggable={false}
      style={custom?{objectFit:'contain',transform:`translate(${presentation.offsetX*2}%,${(presentation.offsetY+2)*2}%) scale(${presentation.displaySize/50})`}:undefined}/>;
  }
  const col=def.icon%8,row=Math.floor(def.icon/8);
  return <span className={`item-icon ${muted?'muted':''}`} role="img" aria-label={def.name} style={{width:size,height:size,backgroundPosition:`${col/7*100}% ${row/7*100}%`}} />;
}

export function Avatar({id,size=54}: {id:string;size?:number}) {
  const c=CUSTOMERS.find(x=>x.id===id);
  return <span className="avatar" style={{'--avatar':c?.color??'#71927a',width:size,height:size} as CSSProperties}><Goose color={c?.color} accessory={c?.accessory}/></span>;
}

export function Modal({title,eyebrow,children,onClose,wide=false,busy=false,variant='dialog',scrollKey,initialScrollTop=0}: {title:string;eyebrow?:string;children:ReactNode;onClose:()=>void;wide?:boolean;busy?:boolean;variant?:'dialog'|'sheet';scrollKey?:string;initialScrollTop?:number}) {
  const ref=useRef<HTMLDivElement>(null);
  const busyRef=useRef(busy);busyRef.current=busy;
  const closeRef=useRef(onClose);closeRef.current=onClose;
  const scrollPositions=useRef(new Map<string,number>());
  const currentPosition=useRef(0);
  const previousFocus=useRef<HTMLElement|null>(null);
  const initialPosition=useRef(initialScrollTop);initialPosition.current=initialScrollTop;
  const positionKey=scrollKey??title;
  useLayoutEffect(()=>{previousFocus.current=document.activeElement as HTMLElement|null},[]);
  useLayoutEffect(()=>{
    const element=ref.current;
    if(!element)return;
    element.scrollTop=scrollPositions.current.get(positionKey)??initialPosition.current;
    currentPosition.current=element.scrollTop;
    element.focus({preventScroll:true});
    return()=>{scrollPositions.current.set(positionKey,currentPosition.current)};
  },[positionKey]);
  useEffect(()=>{
    const before=previousFocus.current;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'&&!busyRef.current){e.preventDefault();closeRef.current();}
      if(e.key==='Tab'){
        const list=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')??[]).filter(el=>el.offsetParent!==null);
        const first=list[0],last=list.at(-1);
        if(e.shiftKey&&(!ref.current?.contains(document.activeElement)||document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&(!ref.current?.contains(document.activeElement)||document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first?.focus();}
      }
    };document.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key);before?.focus();};
  },[]);
  return <div className={`modal-backdrop modal-backdrop--${variant}`} onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><div className={`modal modal--${variant} ${wide?'wide':''}`} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} data-scroll-key={positionKey} onScroll={event=>{currentPosition.current=event.currentTarget.scrollTop;scrollPositions.current.set(positionKey,currentPosition.current)}}><header className="modal-header"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div><button className="icon-button" disabled={busy} onClick={onClose} aria-label="关闭"><X size={21}/></button></header>{children}</div></div>;
}
