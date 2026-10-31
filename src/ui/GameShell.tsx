import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { DRAG_THRESHOLD } from '../game/board-input';
import { installGameViewport } from '../platform/viewport';
import { layoutDensity } from './ui-guidance';
type BackgroundPress = { pointerId: number; surface: HTMLElement; x: number; y: number; maxDistance: number };
// Mobile browsers may retarget a border touch to the nearby canvas. Use its actual position.
const backgroundSurface = (x:number,y:number) => {
 const surface=document.elementFromPoint(x,y);
 return surface instanceof HTMLElement&&surface.hasAttribute('data-selection-background')?surface:null;
};
export function GameShell({children,page,footerHeight,backgroundEnabled=false,onBackgroundTap}:{children:ReactNode;page:string;footerHeight?:number;backgroundEnabled?:boolean;onBackgroundTap?:()=>void}) {
 const press=useRef<BackgroundPress|null>(null);
 const shell=useRef<HTMLElement>(null);
 useLayoutEffect(() => installGameViewport(), []);
 useLayoutEffect(()=>{
  const element=shell.current;if(!element)return;
  const measure=()=>{element.dataset.density=layoutDensity(Math.round(element.getBoundingClientRect().height))};
  const observer=new ResizeObserver(measure);observer.observe(element);measure();
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{if(!backgroundEnabled)press.current=null},[backgroundEnabled]);
 useEffect(()=>{
  const cancel=()=>{press.current=null};
  window.addEventListener('blur',cancel);
  document.addEventListener('visibilitychange',cancel);
  return()=>{window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',cancel)};
 },[]);
 return <main ref={shell} className={`game-shell page-${page}`} aria-label="鹅巷食光" data-selection-background
  data-dock-size={footerHeight !== undefined && footerHeight >= 120 ? 'relaxed' : 'compact'}
  style={footerHeight === undefined ? undefined : { '--footer': `${footerHeight}px` } as CSSProperties}
  onPointerDown={event=>{
   if(!event.isPrimary)return;
   const surface=backgroundSurface(event.clientX,event.clientY);
   press.current=backgroundEnabled&&event.button===0&&surface
    ?{pointerId:event.pointerId,surface,x:event.clientX,y:event.clientY,maxDistance:0}:null;
  }}
  onPointerMove={event=>{const start=press.current;if(start&&event.pointerId===start.pointerId)start.maxDistance=Math.max(start.maxDistance,Math.hypot(event.clientX-start.x,event.clientY-start.y))}}
  onPointerUp={event=>{
   const start=press.current;
   if(!start||event.pointerId!==start.pointerId)return;
   press.current=null;
   if(backgroundEnabled&&event.isPrimary&&backgroundSurface(event.clientX,event.clientY)===start.surface&&Math.max(start.maxDistance,Math.hypot(event.clientX-start.x,event.clientY-start.y))<DRAG_THRESHOLD)onBackgroundTap?.();
  }}
  onPointerCancel={event=>{if(event.pointerId===press.current?.pointerId)press.current=null}}
  onPointerLeave={()=>{press.current=null}}
 >{children}</main>;
}
