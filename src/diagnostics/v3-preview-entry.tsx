import { createRoot } from 'react-dom/client';
import App from '../ui/App';
import { SaveRepository, resumeManualSlot, validateSave } from '../persistence/save';
import MILESTONES from './v3-milestones.json';
import COOKING_SAMPLE from './v3-cooking-sample.json';
import COMPLETE from './v3-played-state.json';
import '../ui/game.css';

const query=new URLSearchParams(location.search), requested=query.get('stage'),stage=requested==='cooking'||requested==='complete'?requested:String(Math.min(8,Math.max(1,Number(requested)||3)));
const scope=`goose-v3-b-qa-${stage}-${query.get('size')??'390'}`;
const repository=new SaveRepository(scope);
const loaded=await repository.open();
if(!loaded.state){const captured=validateSave(stage==='cooking'?COOKING_SAMPLE:stage==='complete'?COMPLETE:(MILESTONES as Record<string,unknown>)[stage]);await repository.save(resumeManualSlot({id:1,status:'ready',state:captured,capturedAt:captured.lastSeen,savedAt:captured.lastSeen},Date.now()));}
createRoot(document.getElementById('root')!).render(<App repository={repository} sessionScope={scope} offline={false}/>);
const reportLayout=()=>{
 const selectors=['.resource-bar','.customer-section','.board-frame','.game-footer','.page-switch','.modal','.appliance-controls','.input-items','.primary.compact'];
 const parts=selectors.flatMap(selector=>{const el=Array.from(document.querySelectorAll(selector)).find(el=>{const box=el.getBoundingClientRect();return box.width>0&&box.height>0;});if(!el)return [];const r=el.getBoundingClientRect();return [{selector,x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height),inside:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}];});
 parts.push(...Array.from(document.querySelectorAll('.customer-card')).map((el,i)=>{const r=el.getBoundingClientRect();return {selector:'.customer-card-'+i,x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height),inside:r.left>=-1&&r.right<=innerWidth+1};}));
 parent.postMessage({type:'v3-layout',width:innerWidth,height:innerHeight,board:document.querySelector('[data-board-status]')?.getAttribute('data-board-status'),overflow:document.documentElement.scrollWidth>innerWidth,parts},location.origin);
};
new ResizeObserver(reportLayout).observe(document.documentElement);
new MutationObserver(reportLayout).observe(document.getElementById('root')!,{subtree:true,childList:true,attributes:true,attributeFilter:['data-board-status']});
