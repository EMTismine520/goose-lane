import { useEffect, useState } from 'react';
import { Heart, Soup } from 'lucide-react';
import { Goose } from '../ui/parts';
import { CUSTOMERS } from '../content/catalog';
import type { GameState } from '../domain/types';

// A small ambient loop: arriving, queueing, taking a seat, enjoying a meal.
// It reads game progress but never writes inventory or generates income.
export default function StreetLife({state}: {state:GameState}) {
  const [beat,setBeat]=useState(0);
  useEffect(()=>{if(state.settings.reducedMotion)return;const timer=setInterval(()=>setBeat(b=>b+1),1400);return()=>clearInterval(timer);},[state.settings.reducedMotion]);
  const open=Object.values(state.shops).filter(s=>s>=2).length;
  return <div className="street-life" aria-label={`${open}家店开张，鹅居民正在街边散步、等位和用餐`}>
    {Array.from({length:Math.min(4,open+1)},(_,i)=>{
      const phase=(beat+i*4)%18,person=CUSTOMERS[(state.day+i)%CUSTOMERS.length];
      const action=phase<7?'walking':phase<10?'waiting':phase<13?'seated':'eating';
      const x=phase<7?3+phase*4:31+i*13;
      return <div key={i} className={`street-visitor ${action}`} style={{left:`${x}%`,bottom:`${i%2*7}px`,zIndex:5-i}} title={`${person.name} · ${{walking:'慢慢散步',waiting:'耐心等位',seated:'靠窗坐下',eating:'享受热饭'}[action]}`}><Goose color={person.color} accessory={person.accessory}/>{action==='eating'&&<span className="visitor-reaction"><Heart size={10}/></span>}{action==='seated'&&<span className="visitor-table"><Soup size={13}/></span>}</div>;
    })}
  </div>;
}
