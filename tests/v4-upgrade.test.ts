import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CONTENT_VERSION, FRESH_ORDERS, HOME_ORDERS } from '../src/content/catalog';
import { BUILD_NODES } from '../src/content/board-layouts';
import { deviceAssetPath, devicePresentation } from '../src/content/assets';
import { DEVICE_FAMILIES, EXPANSION } from '../src/content/expansion';
import { execute, stateInvariantErrors } from '../src/domain/engine';
import { historicalState as createInitialState } from './chapter-fixtures';
import { reconcileDeviceGrants } from '../src/domain/devices';
import { parseImportSave, SaveRepository, serializeSave, validateSave } from '../src/persistence/save';
import { acquireSession } from '../src/platform/session';
import { DeviceShelf } from '../src/ui/DeviceShelf';

const now=1_800_000_000_000;
const dedicated=['seasonal-produce-rack','exotic-fruit-basket','coffee-grinder','tea-caddy'];
function morning(){
 const s=createInitialState(now);
 s.completedOrders=[...FRESH_ORDERS,...HOME_ORDERS].map(o=>o.id);
 s.construction.completed=BUILD_NODES.map(n=>n.id);
 reconcileDeviceGrants(s);return s;
}
afterEach(()=>{vi.unstubAllGlobals();});
describe('V4 dedicated production and isolated fresh campaign',()=>{
 it('gives every ingredient chain exactly one dedicated source',()=>{
  const producers=DEVICE_FAMILIES.filter(f=>f.kind==='generator');
  expect(producers).toHaveLength(14);
  expect(new Set(producers.flatMap(f=>f.chains))).toEqual(new Set(EXPANSION.chains.map(c=>c.id)));
  for(const family of producers){
   expect(family.chains).toHaveLength(1);
   expect(EXPANSION.chains.find(c=>c.id===family.chains[0])?.producer).toBe(family.id);
  }
  expect(DEVICE_FAMILIES.some(f=>f.id==='drink-fridge')).toBe(false);
  expect(DEVICE_FAMILIES.filter(f=>f.kind==='appliance')).toHaveLength(12);
 });
 it('resolves base family names and all tiers to the same V4 collection used on the board',()=>{
  for(const family of DEVICE_FAMILIES){
   expect(deviceAssetPath(family.id)).toBe(deviceAssetPath(family.id+'-l1'));
   expect(devicePresentation(family.id)).toEqual(devicePresentation(family.id+'-l1'));
   for(const level of [1,2,3])expect(deviceAssetPath(family.id+'-l'+level)).toBe('assets/v3-b/'+family.id+'-l'+level+'.webp');
  }
 });
 it('grants newly separated sources once on the shelf without occupying board cells',()=>{
  const s=morning(),before=s.board.slice();
  for(const id of dedicated)expect(s.devices.find(d=>d.familyId===id)).toMatchObject({level:1,index:null,band:0});
  expect(s.devices.some(d=>d.familyId==='mixer-base-cooler')).toBe(false);
  const copies=s.devices.map(d=>d.id);
  reconcileDeviceGrants(s);reconcileDeviceGrants(s);
  expect(s.devices.map(d=>d.id)).toEqual(copies);expect(s.board).toEqual(before);
  expect(stateInvariantErrors(s)).toEqual([]);
 });
 it('rejects cross-chain commands atomically even when both sources are available',()=>{
  let s=morning();
  for(const device of ['coffee-grinder','tea-caddy'])s=execute(s,{type:'retrieveDevice',device},now).state;
  for(const command of [
   {type:'generate',chain:'fresh-tea',device:'coffee-grinder',band:0},
   {type:'generate',chain:'fresh-coffee',device:'tea-caddy',band:0},
   {type:'configureDevice',device:'coffee-grinder',chain:'fresh-tea',band:0}
  ] as const){
   const before=serializeSave(s),result=execute(s,command,now);
   expect(result.ok).toBe(false);expect(result.state).toBe(s);expect(serializeSave(s)).toBe(before);
  }
  const existing=new Set(s.board.flatMap(i=>i?[i.uid]:[]));
  const result=execute(s,{type:'generate',device:'coffee-grinder',chain:'fresh-coffee'},now);
  expect(result.ok).toBe(true);
  const drops=result.state.board.filter(i=>i&&!existing.has(i.uid));
  expect(drops).toHaveLength(1);
  expect(drops[0]?.item.startsWith('fresh-coffee-')).toBe(true);
  expect(result.state.energy.value).toBe(s.energy.value-1);
 });
 it('retains level and energy requirements for directional output within the fixed chain',()=>{
  let s=morning();
  s=execute(s,{type:'retrieveDevice',device:'tea-caddy'},now).state;
  expect(execute(s,{type:'configureDevice',device:'tea-caddy',chain:'fresh-tea',band:1},now).ok).toBe(false);
  s.devices.find(d=>d.id==='tea-caddy')!.level=2;
  const configured=execute(s,{type:'configureDevice',device:'tea-caddy',chain:'fresh-tea',band:1},now);
  expect(configured.ok).toBe(true);
  const result=execute(configured.state,{type:'generate',device:'tea-caddy',chain:'fresh-tea'},now);
  expect(result.ok).toBe(true);expect(result.state.energy.value).toBe(s.energy.value-2);
  const item=result.state.board.find(Boolean)!.item;
  expect(['fresh-tea-4','fresh-tea-5','fresh-tea-6']).toContain(item);
 });
 it('shows a permanent source and previews instead of a chain selector',()=>{
  const html=renderToStaticMarkup(createElement(DeviceShelf,{state:morning(),act:async()=>true,onLocate:()=>{},onBack:()=>{},initialFamily:'coffee-grinder'}));
  expect(html).toContain('咖啡豆磨机');expect(html).toContain('仅产出');expect(html).toContain('咖啡系列');
  expect(html).not.toContain('aria-label="产出系列"');
  expect(html).toContain('aria-label="定向产出段"');
  const upgraded=morning();Object.assign(upgraded.devices.find(d=>d.familyId==='coffee-grinder')!,{level:2,band:1});
  const bandHtml=renderToStaticMarkup(createElement(DeviceShelf,{state:upgraded,act:async()=>true,onLocate:()=>{},onBack:()=>{},initialFamily:'coffee-grinder'}));
  expect(bandHtml).toContain('查看便携咖啡来源');expect(bandHtml).not.toContain('查看咖啡豆来源');
 });
 it('only imports V4 files and leaves legacy conversion outside the import entry',()=>{
  const current=createInitialState(now);
  expect(parseImportSave(serializeSave(current))).toEqual(validateSave(current));
  for(const [schemaVersion,contentVersion]of [[0,'0.0.0'],[1,'1.0.0'],[2,'2.1.0'],[3,'3.0.0'],[3,'5.0.0']]){
   expect(()=>parseImportSave(JSON.stringify({...current,schemaVersion,contentVersion}))).toThrow();
  }
  expect(()=>parseImportSave('{')).toThrow('有效的 JSON');
  expect(CONTENT_VERSION).toBe('5.0.0');
 });
 it('opens a fresh default V4 store without reading or changing the historical store',async()=>{
  const old=await new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open('goose-lane-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('snapshots');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  const marker={data:'historical-player-bytes',token:'v3-original'};
  await new Promise<void>((resolve,reject)=>{const tx=old.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(marker,'current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
  const repo=new SaveRepository();
  try{
   expect((await repo.open()).state).toBeNull();
   await repo.save(createInitialState(now));repo.close();
   expect((await repo.open()).state?.contentVersion).toBe('5.0.0');
   const untouched=await new Promise<unknown>((resolve,reject)=>{const req=old.transaction('snapshots').objectStore('snapshots').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
   expect(untouched).toEqual(marker);
  }finally{repo.close();old.close();}
 });
 it('can own the V4 writer lock while the old version owns its independent writer lock',async()=>{
  const held=new Set(['goose-lane-writer-v1']);
  vi.stubGlobal('BroadcastChannel',undefined);
  vi.stubGlobal('navigator',{locks:{async request(name:string,_options:unknown,callback:(lock:object|null)=>Promise<void>){
   if(held.has(name)){await callback(null);return;}
   held.add(name);try{await callback({});}finally{held.delete(name);}
  }}});
  const session=await acquireSession(()=>{});
  try{expect(session.readOnly).toBe(false);expect(held.has('goose-lane-writer-v4')).toBe(true);expect(held.has('goose-lane-writer-v1')).toBe(true);}finally{session.release();}
 });
});
