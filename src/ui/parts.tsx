import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { ITEMS, CUSTOMERS } from '../content/catalog';
import { itemAssetPath } from '../content/assets';

export function Goose({color='#5e8066',accessory='',className='',expression='waiting'}: {color?:string;accessory?:string;className?:string;expression?:'waiting'|'eager'|'happy'}) {
  return <svg className={className} viewBox="0 0 100 110" fill="none" aria-hidden="true"><ellipse cx="49" cy="101" rx="29" ry="5" fill="#3e523c" opacity=".12"/><path d="m37 94-6 9h18l-3-10m13-1 1 10h16l-10-9" fill="#dd9b4d"/><path d="M23 78c-6-16 2-29 19-30-9-8-9-29 1-36 13-9 31-2 32 12 1 10-5 19-13 22 27 12 21 44-3 50-21 4-31-1-36-18Z" fill="#fffdf4" stroke="#d8d7c5" strokeWidth="2"/><path d="m74 28 16 7-17 6-6-6Z" fill="#e8ad5c"/>{expression==='happy'?<path d="m58 27 4-3 4 3" stroke="#554b39" strokeWidth="2.8"/>:<circle cx="62" cy="26" r={expression==='eager'?3.5:2.8} fill="#554b39"/>}<ellipse cx="65" cy="37" rx="4" ry="2.2" fill="#e6b0a0"/><path d="M28 61q16 8 35-7l12 26q-17 19-48 2Z" fill={color}/><path d="M35 60v29m25-33 4 32" stroke="#fffaf0" strokeWidth="3" opacity=".65"/><path d="M34 65q-14 2-6 13 10 4 14-3" fill="#fffdf4" stroke="#dbd8c6" strokeWidth="1.5"/>{accessory==='hat'||accessory==='chef'||accessory==='格子围裙'?<><path d="M37 17q-7-11 3-12 4-9 13-1 12-8 16 2 12 5 0 13" fill="#fffaf0" stroke="#c4cbb9" strokeWidth="2"/><path d="M39 15h31v7H39Z" fill={color}/></>:<><path d="M39 14q15-13 31 2" stroke={color} strokeWidth="8" strokeLinecap="round"/><path d="m66 17 12 3" stroke={color} strokeWidth="5" strokeLinecap="round"/></>}{(accessory==='glasses'||accessory==='翡翠披肩')&&<g stroke="#4e5e4a" strokeWidth="1.5"><circle cx="57" cy="27" r="6"/><path d="m63 27 7 1"/></g>}</svg>;
}

export function ItemIcon({item,size=48,muted=false}: {item:string;size?:number;muted?:boolean}) {
  const def=ITEMS[item]; if(!def) return null;
  if(def.assetId) return <img className={`item-icon vector-item ${muted?'muted':''}`} src={`${import.meta.env.BASE_URL}${itemAssetPath(item)}`} alt={def.name} width={size} height={size} draggable={false}/>;
  const col=def.icon%8,row=Math.floor(def.icon/8);
  return <span className={`item-icon ${muted?'muted':''}`} role="img" aria-label={def.name} style={{width:size,height:size,backgroundPosition:`${col/7*100}% ${row/7*100}%`}} />;
}

export function Avatar({id,size=54}: {id:string;size?:number}) {
  const c=CUSTOMERS.find(x=>x.id===id);
  return <span className="avatar" style={{'--avatar':c?.color??'#71927a',width:size,height:size} as CSSProperties}><Goose color={c?.color} accessory={c?.accessory}/></span>;
}

export function Modal({title,eyebrow,children,onClose,wide=false,busy=false}: {title:string;eyebrow?:string;children:ReactNode;onClose:()=>void;wide?:boolean;busy?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  const busyRef=useRef(busy);busyRef.current=busy;
  useEffect(()=>{
    const before=document.activeElement as HTMLElement|null;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    ref.current?.focus();
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'&&!busyRef.current)onClose();
      if(e.key==='Tab'){
        const list=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,a[href],[tabindex="0"]')??[]).filter(el=>el.offsetParent!==null);
        const first=list[0],last=list.at(-1);
        if(e.shiftKey&&(!ref.current?.contains(document.activeElement)||document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&(!ref.current?.contains(document.activeElement)||document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first?.focus();}
      }
    };document.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key);before?.focus();};
  },[onClose,title]);
  return <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><div className={`modal ${wide?'wide':''}`} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div><button className="icon-button" disabled={busy} onClick={onClose} aria-label="关闭"><X size={21}/></button></header>{children}</div></div>;
}
