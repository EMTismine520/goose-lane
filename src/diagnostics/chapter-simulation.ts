import { CHAINS, ITEMS, MODERN_RECIPES } from '../content/catalog';
import { CHAPTERS } from '../content/chapters';
import { DEVICE_FAMILIES } from '../content/expansion';
import { availableOrders, createInitialState, execute, getBoardEntity, getEnergyStatus, inventoryCount, stateInvariantErrors } from '../domain/engine';
import { deviceIdle, productionFor } from '../domain/devices';
import { activeWorkspace, chapterPrice } from '../domain/workspaces';
import { parseSave, serializeSave } from '../persistence/save';
import type { Command } from '../domain/types';

/** Uses real production, merge, cook, collect, delivery and wallet commands. No target injection. */
export function chapterPlayer(seed:number) {
  let now=1_000_000,state=createInitialState(now);state.seed=seed;
  let commands=0,waitMs=0,peak=0,energySpent=0,regularOrders=0;const protectedItems=new Map<string,number>();
  const occupancy=()=>state.board.filter(Boolean).length+state.devices.filter(d=>d.index!==null).length;
  const act=(c:Command)=>{now+=1000;const beforeEnergy=getEnergyStatus(state,now).value;const r=execute(state,{...c,expectedWorkspaceId:state.activeWorkspaceId,commandId:`chapter-sim-${seed}-${++commands}`},now);if(!r.ok)throw new Error(`${JSON.stringify(c)}: ${r.events.map(e=>e.message).join('/')}`);state=r.state;if(c.type==='generate')energySpent+=beforeEnergy-getEnergyStatus(state,now).value;peak=Math.max(peak,occupancy());if(commands>100000)throw new Error('Chapter simulation did not converge');};
  const free=()=>{if(state.board.some((_,i)=>getBoardEntity(state,i).kind==='empty'))return;const i=state.board.findIndex(i=>i&&!protectedItems.has(i.item));if(i<0)throw new Error('No unreserved board cell');act({type:'sell',index:i});};
  const put=(id:string)=>{const d=state.devices.find(d=>d.id===id)!;if(d.index!==null)return;if(state.devices.filter(d=>d.index!==null).length>=8){const idle=state.devices.find(d=>d.index!==null&&deviceIdle(state,d.id)&&d.id!==id);if(idle)act({type:'storeDevice',device:idle.id});}free();act({type:'retrieveDevice',device:id});};
  const regular=()=>{const previous=activeWorkspace(state)!.orderTab;act({type:'orderTab',tab:'regular'});const order=availableOrders(state)[0];for(const n of order.needs)ensure(n.item,n.count);act({type:'deliver',order:order.id});regularOrders++;act({type:'orderTab',tab:previous});};
  const farm=(coins:number)=>{while(state.coins<coins)regular();};
  const buy=(family:string)=>{farm(DEVICE_FAMILIES.find(f=>f.id===family)!.price);const id=`d${state.nextId}`;act({type:'buyDevice',family});return id;};
  const equipment=(family:string,level:number)=>{let d=state.devices.filter(d=>d.familyId===family).sort((a,b)=>b.level-a.level)[0];if(!d)throw new Error('Missing chapter dependency '+family);while(d.level<level){const id=d.id,spare=buy(family);if(d.level===2){const second=buy(family);act({type:'mergeDevices',device:second,target:spare});}act({type:'mergeDevices',device:spare,target:id});d=state.devices.find(d=>d.id===id)!;}put(d.id);return state.devices.find(x=>x.id===d.id)!;};
  const ensure=(item:string,count=1):void=>{
    protectedItems.set(item,(protectedItems.get(item)??0)+1);
    try{while(inventoryCount(state,item)<count){
      const chain=CHAINS.find(c=>c.items.includes(item));
      if(chain){const level=ITEMS[item].level,band=Math.floor((level-1)/3),p=productionFor(chain.id,band)!,d=equipment(chain.producer!,p.minLevel);
        if(level===band*3+1){free();while(getEnergyStatus(state,now).value<p.energyCost){const delay=getEnergyStatus(state,now).nextRecoveryIn;waitMs+=delay;now+=delay;act({type:'recover'});}act({type:'generate',device:d.id,chain:chain.id,band});}
        else{ensure(chain.items[level-2],2);const positions=state.board.flatMap((v,i)=>v?.item===chain.items[level-2]?[i]:[]);act({type:'move',from:positions[0],to:positions[1]});}
      }else{const r=MODERN_RECIPES.find(r=>r.output===item)!;if(!r)throw new Error('No recipe '+item);const d=equipment(r.deviceFamilyId!,r.minDeviceLevel??1);
        for(const n of r.inputs){ensure(n.item,n.count);put(d.id);for(let i=0;i<n.count;i++){const from=state.board.findIndex(i=>i?.item===n.item);act({type:'stageInput',appliance:d.id,from});}}
        act({type:'startCooking',appliance:d.id,recipe:r.id});const end=state.appliances.find(a=>a.id===d.id)!.job!.endsAt;waitMs+=Math.max(0,end-now);now=Math.max(end,now);free();act({type:'collectAppliance',appliance:d.id});
      }
    }}finally{const remaining=protectedItems.get(item)!-1;if(remaining)protectedItems.set(item,remaining);else protectedItems.delete(item);}
  };
  return {get state(){return state;},get report(){return {seed,commands,generated:state.stats.generated,merges:state.stats.merges,coins:state.coins,energySpent,regularOrders,waitMs,peakOccupancy:peak,inventoryOrGoldInjected:false};},act,regular,farm,ensure,resetPeak(){peak=occupancy();},
    enter(chapter:number){if(!state.chapterAccess!.unlocked.includes(chapter))farm(chapterPrice(state));act({type:state.chapterAccess!.unlocked.includes(chapter)?'enterChapter':'unlockAndEnterChapter',chapter});},
    stories(){act({type:'orderTab',tab:'story'});while(availableOrders(state).length){const order=availableOrders(state)[0];for(const n of order.needs)ensure(n.item,n.count);act({type:'deliver',order:order.id});}const errors=stateInvariantErrors(state);if(errors.length)throw new Error(errors.join('/'));state=parseSave(serializeSave(state));},
  };
}
export function simulateChapters(seed=42,order=[1,6,2,8,4,7,3,5]) {
  const player=chapterPlayer(seed);
  for(const chapter of order){player.enter(chapter);player.stories();}
  return {state:player.state,report:{...player.report,storyOrders:player.state.completedOrders.length,chapters:player.state.chapterAccess!.unlocked,chapterOrder:order,allStoriesComplete:CHAPTERS.every(c=>c.orders.every(o=>player.state.completedOrders.includes(o.id)))}};
}
