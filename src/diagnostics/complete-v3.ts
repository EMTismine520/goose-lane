import { WORKSPACE_FIELDS } from '../domain/workspaces';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { CHAINS, ITEMS, MODERN_ITEMS, MODERN_ORDERS, MODERN_RECIPES } from '../content/catalog';
import { activeDevices, BUILD_NODES } from '../content/board-layouts';
import { DEVICE_FAMILIES } from '../content/expansion';
import { availableOrders, createInitialState, execute, getBoardEntity, getEnergyStatus, inventoryCount, stateInvariantErrors, unlockedCells } from '../domain/engine';
import { deviceIdle, productionFor, themeStage } from '../domain/devices';
import { parseSave, serializeSave } from '../persistence/save';
import type { Command, DeviceInstance, GameState } from '../domain/types';

/** Plays production, upgrades, cooking and orders through the same commands as the UI. */
export function simulateCompleteV3(seed=42) {
  let now=1_000_000;const base=createInitialState(now);let state={...base,...Object.fromEntries(WORKSPACE_FIELDS.map(k=>[k,base[k]])),schemaVersion:3,contentVersion:'4.0.0'} as GameState;delete state.workspaces;delete state.activeWorkspaceId;delete state.chapterAccess;state.seed=seed;
  const started=now,cooked=new Set<string>(),protectedItems=new Map<string,number>();
  let commands=0,recoveryWaitMs=0,cookingWaitMs=0,peakOccupancy=0,deviceSwitches=0,goldFarmed=0;
  const milestones:Record<string,GameState>={'1':structuredClone(state)};
  let cookingSample:GameState|undefined;
  const act=(command:Command)=>{
    now+=2500;
    const result=execute(state,{...command,commandId:`v3-sim-${seed}-${commands++}`},now);
    if(!result.ok)throw new Error(`${JSON.stringify(command)}: ${result.events.map(e=>e.message).join('/')} (stage ${themeStage(state)})`);
    state=result.state;
    const errors=stateInvariantErrors(state);if(errors.length)throw new Error(errors.join('/'));
    peakOccupancy=Math.max(peakOccupancy,state.board.filter(Boolean).length+activeDevices(state).length);
    if(commands>60_000)throw new Error('Complete campaign did not converge');
  };
  const free=()=>{if(state.board.some((i,n)=>!i&&n<unlockedCells(state)&&getBoardEntity(state,n).kind==='empty'))return;
    const index=state.board.findIndex(i=>i&&!protectedItems.has(i.item));
    if(index<0)throw new Error('No disposable cell');act({type:'sell',index});
  };
  const waitEnergy=(cost:number)=>{while(getEnergyStatus(state,now).value<cost){const delay=getEnergyStatus(state,now).nextRecoveryIn;now+=delay;recoveryWaitMs+=delay;act({type:'recover'});}};
  const farm=(coins:number)=>{
    while(state.coins<coins){const extra=state.board.findIndex(i=>i&&!protectedItems.has(i.item));if(extra>=0){const value=ITEMS[state.board[extra]!.item].sell;act({type:'sell',index:extra});goldFarmed+=value;continue;}
      const d=state.devices.find(d=>d.familyId==='vegetable-cart'&&d.index!==null)??state.devices.find(d=>d.familyId==='vegetable-cart')!;put(d.id);free();waitEnergy(1);const before=state.nextId;act({type:'generate',chain:'fresh-veg',device:d.id,band:0});const index=state.board.findIndex(i=>i?.uid===`g${before}`);const value=ITEMS[state.board[index]!.item].sell;act({type:'sell',index});goldFarmed+=value;}
  };
  const put=(id:string)=>{const d=state.devices.find(d=>d.id===id)!;if(d.index!==null)return;
    // Rotate idle devices to the shelf, keeping the board usable throughout a full collection.
    if(activeDevices(state).length>=8){const idle=state.devices.find(d=>d.index!==null&&d.id!==id&&deviceIdle(state,d.id));if(idle){act({type:'storeDevice',device:idle.id});deviceSwitches++;}}
    free();act({type:'retrieveDevice',device:id});deviceSwitches++;
  };
  const buy=(family:string)=>{farm(DEVICE_FAMILIES.find(f=>f.id===family)!.price);const id=`d${state.nextId}`;act({type:'buyDevice',family});return id;};
  const equipment=(family:string,level:number):DeviceInstance=>{
    let d=state.devices.filter(d=>d.familyId===family).sort((a,b)=>b.level-a.level)[0];if(!d)throw new Error('No unlocked '+family);
    while(d.level<level){const target=d.id,other=buy(family);if(d.level===2){const second=buy(family);act({type:'mergeDevices',device:second,target:other});}act({type:'mergeDevices',device:other,target});d=state.devices.find(d=>d.id===target)!;}
    put(d.id);return state.devices.find(x=>x.id===d.id)!;
  };
  const ensure=(item:string,count=1):void=>{
    protectedItems.set(item,(protectedItems.get(item)??0)+1);
    try{while(inventoryCount(state,item)<count){const def=ITEMS[item],recipe=MODERN_RECIPES.find(r=>r.output===item);
      if(recipe){const d=equipment(recipe.deviceFamilyId!,recipe.minDeviceLevel??1);
        for(const need of recipe.inputs){ensure(need.item,need.count);for(let i=0;i<need.count;i++){put(d.id);const from=state.board.findIndex(v=>v?.item===need.item);act({type:'stageInput',from,appliance:d.id});}}
        if(recipe.inputs.length===3&&!cookingSample){cookingSample=structuredClone(state);cookingSample.session.selectedUid=d.id;}
        act({type:'startCooking',appliance:d.id,recipe:recipe.id});cooked.add(recipe.id);
        const until=state.appliances.find(a=>a.id===d.id)!.job!.endsAt,delay=Math.max(0,until-now);now+=delay;cookingWaitMs+=delay;free();act({type:'collectAppliance',appliance:d.id});
      }else{
        const chain=CHAINS.find(c=>c.id===def.chain)!;const band=themeStage(state)>=3?Math.floor((def.level-1)/3):0;
        const producer=equipment(chain.producer!,themeStage(state)>=3?productionFor(chain.id,band)!.minLevel:1);
        if(def.level===band*3+1){free();waitEnergy(productionFor(chain.id,band)!.energyCost);act({type:'generate',chain:chain.id,device:producer.id,band});}
        else{const lower=chain.items[def.level-2];ensure(lower,2);const indices=state.board.flatMap((v,i)=>v?.item===lower?[i]:[]);act({type:'move',from:indices[0],to:indices[1]});}
      }
    }}finally{const remaining=protectedItems.get(item)!-1;if(remaining)protectedItems.set(item,remaining);else protectedItems.delete(item);}
  };
  while(state.completedOrders.length<145) {
    const order=availableOrders(state)[0];if(!order)throw new Error('No available order');
    for(const need of order.needs)ensure(need.item,need.count);
    act({type:'deliver',order:order.id});
    let next=BUILD_NODES[state.construction.completed.length];
    while(next&&state.coins>=next.cost){act({type:'build',node:next.id});next=BUILD_NODES[state.construction.completed.length];}
    if(state.construction.completed.length===3&&!state.construction.rewardClaimed)act({type:'claimConstructionReward'});
    milestones[String(themeStage(state))]??=structuredClone(state);
  }
  for(const recipe of MODERN_RECIPES)if(!cooked.has(recipe.id)){ensure(recipe.output,inventoryCount(state,recipe.output)+1);}
  for(const item of MODERN_ITEMS)if(!state.discovered.includes(item.id))ensure(item.id);
  for(const family of DEVICE_FAMILIES)equipment(family.id,3);
  state=parseSave(serializeSave(state));
  const report={seed,orders:state.completedOrders.filter(id=>MODERN_ORDERS.some(o=>o.id===id)).length,recipesCooked:cooked.size,finishedDiscovered:MODERN_ITEMS.filter(i=>i.kind!=='ingredient'&&state.discovered.includes(i.id)).length,foodDiscovered:MODERN_ITEMS.filter(i=>state.discovered.includes(i.id)).length,equipmentDiscovered:state.deviceDiscovered.length,commands,generated:state.stats.generated,merges:state.stats.merges,peakOccupancy,deviceSwitches,goldFarmed,coins:state.coins,recoveryWaitMs,cookingWaitMs,virtualElapsedMs:now-started,inventoryOrGoldInjected:false,humanPlaytest:false};
  return {state,report,milestones,cookingSample};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const runs=[42,1868919585,123456789].map(seed=>simulateCompleteV3(seed));writeFileSync('src/diagnostics/v3-results.json',JSON.stringify(runs.map(r=>r.report),null,2));writeFileSync('src/diagnostics/v3-played-state.json',JSON.stringify(runs[0].state,null,2));writeFileSync('src/diagnostics/v3-milestones.json',JSON.stringify(runs[0].milestones,null,2));writeFileSync('src/diagnostics/v3-cooking-sample.json',JSON.stringify(runs[0].cookingSample,null,2));console.log(runs.map(r=>r.report));}
