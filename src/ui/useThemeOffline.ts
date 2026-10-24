import { useEffect, useState } from 'react';
export function useThemeOffline(stage:number,enabled:boolean) {
  const [cachedStage,setCachedStage]=useState(0),[failed,setFailed]=useState(false);
  const request=(target:number)=>{if(!enabled||!import.meta.env.PROD||!('serviceWorker'in navigator))return;setFailed(false);void navigator.serviceWorker.ready.then(r=>(navigator.serviceWorker.controller??r.active)?.postMessage({type:'CACHE_THEMES',stage:target}));};
  useEffect(()=>{if(!enabled||!import.meta.env.PROD||!('serviceWorker'in navigator))return;const message=(e:MessageEvent)=>{if(e.data?.type==='THEMES_CACHED')setCachedStage(n=>Math.max(n,e.data.stage));if(e.data?.type==='THEMES_CACHE_FAILED')setFailed(true);};const retry=()=>request(stage);navigator.serviceWorker.addEventListener('message',message);navigator.serviceWorker.addEventListener('controllerchange',retry);window.addEventListener('online',retry);request(stage);return()=>{navigator.serviceWorker.removeEventListener('message',message);navigator.serviceWorker.removeEventListener('controllerchange',retry);window.removeEventListener('online',retry);};},[stage,enabled]);
  return {cachedStage,failed,downloadAll:()=>request(8)};
}
