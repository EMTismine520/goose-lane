import { useEffect, useState } from 'react';
import { watchPlayIdle } from '../platform/play-idle';
export function useThemeOffline(stage:number,enabled:boolean,ready=true,legacy=false) {
  const [cachedStage,setCachedStage]=useState(0),[failed,setFailed]=useState(false);
  const [fullCached,setFullCached]=useState(false);
  const supported=typeof navigator!=='undefined'&&'serviceWorker'in navigator;
  const request=(target:number,full=false)=>{if(!enabled||!ready||!import.meta.env.PROD||!supported)return;setFailed(false);void navigator.serviceWorker.ready.then(r=>(navigator.serviceWorker.controller??r.active)?.postMessage({type:'CACHE_THEMES',stage:target,variant:full?'full':'mobile',legacy}));};
  useEffect(()=>{
    if(!enabled||!ready||!import.meta.env.PROD||!supported)return;
    let disposed=false;
    const post=(data:unknown)=>{void navigator.serviceWorker.ready.then(r=>{if(!disposed)(navigator.serviceWorker.controller??r.active)?.postMessage(data)});};
    const message=(e:MessageEvent)=>{if(e.data?.type==='THEMES_CACHED'){setCachedStage(n=>Math.max(n,e.data.stage));if(e.data.variant==='full'&&e.data.stage===8)setFullCached(true);}if(e.data?.type==='THEMES_CACHE_FAILED')setFailed(true);};
    const pause=()=>post({type:'CACHE_PAUSE',visible:!document.hidden});
    const retry=()=>{post({type:'CACHE_RESUME'});post({type:'CACHE_THEMES',stage,variant:'mobile',legacy});};
    const changed=()=>window.dispatchEvent(new Event('goose:art-idle'));
    const stop=watchPlayIdle(retry,pause);
    navigator.serviceWorker.addEventListener('message',message);
    navigator.serviceWorker.addEventListener('controllerchange',changed);
    return()=>{disposed=true;stop();navigator.serviceWorker.removeEventListener('message',message);navigator.serviceWorker.removeEventListener('controllerchange',changed);};
  },[stage,enabled,ready,legacy,supported]);
  return {cachedStage,failed,supported,fullCached,downloadAll:()=>request(8,true)};
}
