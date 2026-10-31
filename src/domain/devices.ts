import { activeWorkspace, currentChapter, hasChapters } from './workspaces';
import { FRESH_ORDERS, HOME_ORDERS, ITEMS, MODERN_ORDERS } from '../content/catalog';
import { BAND_COSTS, BAND_LEVELS, DEVICE_FAMILIES, EXPANSION, THEME_NAMES } from '../content/expansion';
import type { ApplianceState, DeviceInstance, GameState, RecipeDef } from './types';

export function themeStage(state: Pick<GameState,'campaign'|'completedOrders'|'construction'> & Partial<Pick<GameState,'workspaces'|'activeWorkspaceId'>>): number {
  if(state.campaign!=='fresh')return 1;
  const workspace=state.workspaces?.[state.activeWorkspaceId!];
  if(workspace)return workspace.mode==='original'?workspace.originalStage!:workspace.chapter;
  if(!FRESH_ORDERS.every(o=>state.completedOrders.includes(o.id))||state.construction.completed.length<3)return 1;
  if(!HOME_ORDERS.every(o=>state.completedOrders.includes(o.id)))return 2;
  let stage=3;
  while(stage<8&&MODERN_ORDERS.filter(o=>o.stage===stage).slice(0,3).every(o=>state.completedOrders.includes(o.id)))stage++;
  return stage;
}
export function themeProgress(state: GameState) {
  const stage=themeStage(state), orders=MODERN_ORDERS.filter(o=>stage===1?o.id.startsWith('opening-'):stage===2?o.id.startsWith('home-'):o.stage===stage);
  const completed=orders.filter(o=>state.completedOrders.includes(o.id)).length;
  return {stage,name:activeWorkspace(state)?.mode==='original'?'原厨房':THEME_NAMES[stage-1],completed,total:orders.length,toNext:stage<3?orders.length:Math.min(3,orders.length),allCompleted:MODERN_ORDERS.every(o=>state.completedOrders.includes(o.id)),overall:MODERN_ORDERS.filter(o=>state.completedOrders.includes(o.id)).length};
}
export const deviceFamily = (device: DeviceInstance) => DEVICE_FAMILIES.find(f=>f.id===device.familyId)!;
export const deviceArtId = (device: DeviceInstance) => `${device.familyId}-l${device.level}`;
export const deviceIdle = (state: GameState,id: string) => { const a=state.appliances.find(a=>a.id===id);return !a||!a.job&&!a.outputSlot&&!a.inputSlots.length; };
export function recipeMatchesDevice(state: GameState,appliance: ApplianceState,recipe: RecipeDef) {
  const device=state.devices?.find(d=>d.id===appliance.id);
  return state.campaign==='fresh'&&state.schemaVersion>=3 ? !!device&&device.index!==null&&recipe.deviceFamilyId===device.familyId&&(recipe.minDeviceLevel??1)<=device.level : recipe.appliance===appliance.slot;
}
export function productionFor(chainId: string,band: number) {
  const chain=EXPANSION.chains.find(c=>c.id===chainId);
  if(!chain||!Number.isInteger(band)||band<0||band>4||band*3>=chain.names.length)return null;
  const drops=new Map<string,number>();
  [72,20,8].forEach((weight,i)=>{const item=`${chainId}-${Math.min(chain.names.length,band*3+i+1)}`;drops.set(item,(drops.get(item)??0)+weight);});
  return {energyCost:BAND_COSTS[band],minLevel:BAND_LEVELS[band],drops:[...drops].map(([item,weight])=>({item,weight}))};
}
const initialPositions:Record<string,number>={'vegetable-cart':35,'fruit-cart':36,'chopping-board':40,'fruit-press':41,'beast-meat-cart':37,'poultry-cart':38,'spice-box':39,'home-cooking-pot':47};
export function makeDevice(state: GameState,familyId:string,id=familyId,index:number|null=null): DeviceInstance {
  const family=DEVICE_FAMILIES.find(f=>f.id===familyId)!;
  const device:DeviceInstance={id,familyId,level:1,index,selectedChain:family.chains[0]??null,band:0,version:0};
  state.devices.push(device);
  if(family.kind==='appliance') state.appliances.push({id,slot:family.slot!,index:index??-1,inputSlots:[],job:null,outputSlot:null,version:0});
  if(!state.deviceDiscovered.includes(deviceArtId(device)))state.deviceDiscovered.push(deviceArtId(device));
  return device;
}
/** Free first copies are granted once. Later themes put them safely on the device shelf. */
export function reconcileDeviceGrants(state: GameState): boolean {
  if(hasChapters(state)||state.schemaVersion<3||state.campaign!=='fresh')return false;
  let added=false;
  const pending=DEVICE_FAMILIES.filter(f=>f.stage<=themeStage(state)&&!state.deviceGrants.includes(f.id));
  const limit=42+state.construction.completed.length*7;
  const occupied=new Set([...state.devices.flatMap(d=>d.index===null?[]:[d.index]),...pending.flatMap(f=>initialPositions[f.id]===undefined?[]:[initialPositions[f.id]])]);
  const displaced=pending.flatMap(f=>{const index=initialPositions[f.id];if(index===undefined||!state.board[index])return [];const item=state.board[index]!;state.board[index]=null;state.cellVersions[index]++;return [item];});
  if(state.undo&&occupied.has(state.undo.index)) {
    let free=state.board.findIndex((i,n)=>!i&&!occupied.has(n)&&n<limit);
    if(free<0){free=state.board.findIndex((i,n)=>!!i&&!occupied.has(n)&&n<limit);if(free>=0){state.migrationInbox.push(state.board[free]!);state.board[free]=null;state.cellVersions[free]++;}}
    if(free>=0)state.undo.index=free;
  }
  for(const item of displaced){const free=state.board.findIndex((i,n)=>!i&&!occupied.has(n)&&n<limit&&state.undo?.index!==n);if(free<0)state.migrationInbox.push(item);else{state.board[free]=item;state.cellVersions[free]++;}}
  for(const family of pending) {
    state.deviceGrants.push(family.id);
    const index=initialPositions[family.id]??null;
    makeDevice(state,family.id,family.id,index);added=true;
  }
  return added;
}
export function itemStage(item: string) {return ITEMS[item]?.stage??1;}
