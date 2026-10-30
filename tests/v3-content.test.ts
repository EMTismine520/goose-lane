import { describe,it,expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { readFile } from 'node:fs/promises';
import { CHAINS, CONTENT_VERSION, FRESH_ORDERS, HOME_ORDERS, ITEMS, MODERN_ITEMS, MODERN_ORDERS, MODERN_RECIPES } from '../src/content/catalog';
import { BAND_COSTS, DEVICE_FAMILIES, EXPANSION } from '../src/content/expansion';
import { activeDevices, BUILD_NODES } from '../src/content/board-layouts';
import { createInitialState, execute, getApplianceStatus, getBoardEntity, getRecipeDurationAtLevel, inventoryCount, mergeTarget, stateInvariantErrors } from '../src/domain/engine';
import { productionFor, reconcileDeviceGrants, themeStage } from '../src/domain/devices';
import { parseSave, serializeSave, resumeManualSlot } from '../src/persistence/save';
import type { Command,GameState } from '../src/domain/types';
import { simulateCompleteV3 } from '../src/diagnostics/complete-v3';
import { V3Codex, V3ItemDetails } from '../src/ui/V3Codex';
import { DeviceShelf } from '../src/ui/DeviceShelf';
const now=1_000_000;
function opened(stage=8){const s=createInitialState(now);s.completedOrders=[...FRESH_ORDERS,...HOME_ORDERS].map(o=>o.id);s.construction.completed=BUILD_NODES.map(n=>n.id);for(let n=3;n<stage;n++)s.completedOrders.push(...MODERN_ORDERS.filter(o=>o.stage===n).slice(0,3).map(o=>o.id));s.coins=10000;reconcileDeviceGrants(s);return s;}
function act(s:GameState,c:Command,time=s.lastSeen){const r=execute(s,c,time);expect(r.ok,r.events.map(e=>e.message).join('/')).toBe(true);expect(stateInvariantErrors(r.state)).toEqual([]);expect(parseSave(serializeSave(r.state))).toEqual(r.state);return r.state;}
function add(s:GameState,item:string){const n=s.board.findIndex((v,i)=>!v&&getBoardEntity(s,i).kind==='empty');s.board[n]={uid:`g${s.nextId++}`,item};return n;}
function upgrade(s:GameState,id:string){const family=s.devices.find(d=>d.id===id)!.familyId;const spare=`d${s.nextId}`;s=act(s,{type:'buyDevice',family});if(s.devices.find(d=>d.id===id)!.level===2){const second=`d${s.nextId}`;s=act(s,{type:'buyDevice',family});s=act(s,{type:'mergeDevices',device:second,target:spare});}return act(s,{type:'mergeDevices',device:spare,target:id});}

describe('complete v3 content and progression',()=>{
 it('displays current food identities and the approved replacement artwork',async()=>{
  const art=JSON.parse(await readFile('public/assets/v3-manifest.json','utf8'));
  const overrides=JSON.parse(await readFile('artwork/plan4-food/runtime-overrides.json','utf8'));
  for(const row of art.filter((r:any)=>r.kind!=='device'))expect(row.name,row.id).toBe(ITEMS[row.id].name);
  for(const row of overrides){const actual=art.find((r:any)=>r.id===row.id);expect(actual?.sourceSha256,row.id).toBe(row.sourceSha256);}
  expect(overrides.find((r:any)=>r.id==='dish-fresh-garden-bowl')?.sourceSha256).toBe('0533ae403572d1b905d0d15d091e73f48ac0341f3a378c151c3a26a1f384d175');
  expect(overrides.find((r:any)=>r.id==='dish-fresh-ico-0146')?.name).toBe('凉拌卤鹅肉');
 });
 it('keeps Plan4 approved ingredient identities and established sell prices at the actual merge slots',()=>{
  expect(CHAINS.find(c=>c.id==='fresh-poultry')!.items.map(id=>ITEMS[id].name)).toEqual(['鸡蛋','鸡胗','鸭掌','鸽肉串','鸡胸肉','鹅肝','火鸡腿','卤鹅肉']);
  for(const[id,name]of Object.entries({'fresh-sea-3':'扇贝','fresh-sea-4':'鲷鱼','fresh-sea-9':'青蟹','fresh-coffee-7':'拿铁咖啡','fresh-coffee-8':'气泡冷萃','fresh-mixer-5':'西柚气泡水','fresh-mixer-8':'蓝柑气泡饮','fresh-mixer-9':'橙子冰沙','fresh-mixer-10':'椰青水'}))expect(ITEMS[id].name).toBe(name);
  const retired=['鸡翅中','鸡全翅','整鸡','鸡腿','皮蛋','鳕鱼','鲶鱼','肥蟹','美式咖啡','大杯美式','汤力水','朗姆酒','威士忌','伏特加'];
  for(const item of MODERN_ITEMS)expect(retired,item.id).not.toContain(item.name);
  for(const[id,sell]of Object.entries({'fresh-poultry-8':8,'fresh-spice-8':8,'fresh-spice-9':16,'fresh-spice-10':8}))expect(ITEMS[id].sell,id).toBe(sell);
  const originalSeedLevels:Record<string,number>={'fresh-veg':7,'fresh-fruit':7,'fresh-beast':10,'fresh-poultry':7,'fresh-spice':7};
  for(const item of EXPANSION.items){
   const expected=item.level<=(originalSeedLevels[item.chain]??0)?2**(item.level-1):Math.max(1,Math.ceil(BAND_COSTS[Math.floor((item.level-1)/3)]*2**((item.level-1)%3)));
   expect(ITEMS[item.id].sell,item.id).toBe(expected);
  }
 });
 it('keeps Plan4 chicken-breast recipes on chicken breast after poultry reordering',()=>{
  for(const id of ['fresh-home-chicken-roll','fresh-ico-0042']){
   const recipe=MODERN_RECIPES.find(r=>r.id===id)!;
   expect(recipe.inputs.map(n=>n.item),recipe.name).toContain('fresh-poultry-5');
   expect(recipe.inputs.map(n=>n.item),recipe.name).not.toContain('fresh-poultry-4');
   expect(ITEMS[recipe.inputs[0].item].name).toBe('鸡胸肉');
  }
  const roll=MODERN_RECIPES.find(r=>r.id==='fresh-home-chicken-roll')!;
  expect(ITEMS[roll.output].sell).toBe(Math.max(1,Math.floor(roll.inputs.reduce((sum,n)=>sum+ITEMS[n.item].sell*n.count,0)*.8)));
 });
 it('cooks the Plan4 goose cold dish from the real replacement ingredient',()=>{
  let s=opened();s=upgrade(s,'chopping-board');s=upgrade(s,'chopping-board');
  for(const item of ['fresh-poultry-8','fresh-spice-3','fresh-spice-1'])s=act(s,{type:'stageInput',from:add(s,item),appliance:'chopping-board'});
  const status=getApplianceStatus(s,'chopping-board',s.lastSeen);
  expect(status?.canStart).toBe(true);expect(status?.recipe?.name).toBe('凉拌卤鹅肉');expect(ITEMS['fresh-poultry-8'].name).toBe('卤鹅肉');
  s=act(s,{type:'startCooking',appliance:'chopping-board'});const job=s.appliances.find(a=>a.id==='chopping-board')!.job!;
  s=act(s,{type:'recover'},job.endsAt);s=act(s,{type:'collectAppliance',appliance:'chopping-board'});
  expect(inventoryCount(s,'dish-fresh-ico-0146')).toBe(1);expect(ITEMS['dish-fresh-ico-0146'].name).toBe('凉拌卤鹅肉');
 });
 it('uses Plan4 current input names and finished names throughout descriptions and orders',()=>{
  for(const recipe of EXPANSION.recipes){
   expect(recipe.inputNames,recipe.id).toEqual(recipe.inputs.map(n=>ITEMS[n.item].name));
   const actual=MODERN_RECIPES.find(r=>r.id===recipe.id)!;
   expect(actual.description,recipe.id).toContain(recipe.inputNames.join('、'));
   expect(ITEMS[recipe.output].name).toBe(recipe.name);
  }
  for(const order of MODERN_ORDERS.filter(o=>o.id.startsWith('v3-order-'))){const name=ITEMS[order.needs[0].item].name;expect(order.title).toContain(name);expect(order.message).toContain(name);}
  const eggDrink=MODERN_RECIPES.find(r=>r.id==='fresh-ico-0090')!;
  expect(eggDrink.name).toBe('香甜蛋奶饮');expect(eggDrink.inputs.map(n=>n.item)).toEqual(['fresh-poultry-1','fresh-sweet-3','fresh-milk-1']);
  expect(MODERN_RECIPES.find(r=>r.id==='fresh-ico-0081')!.inputs.map(n=>n.item)).toEqual(['fresh-sea-6','fresh-fruit-2']);
 });
 it('uses the same level-adjusted cooking times for scheduling and recipe previews',()=>{const state=createInitialState(now),recipe=MODERN_RECIPES[0];for(const[level,multiplier]of [[1,1],[2,.85],[3,.7]])expect(getRecipeDurationAtLevel(state,recipe,level)).toBe(Math.round(recipe.duration*multiplier));});
 it('allows drink-chain merges without turning finished recipes into their ingredient chain',()=>{for(const recipe of MODERN_RECIPES)expect(mergeTarget(recipe.output),recipe.name).toBeNull();expect(mergeTarget('fresh-coffee-2')).toBe('fresh-coffee-3');expect(mergeTarget('fresh-tea-2')).toBe('fresh-tea-3');});
 it('closes every published denominator with unique identities',()=>{expect(CONTENT_VERSION).toBe('4.0.0');expect(EXPANSION.chains).toHaveLength(14);expect(EXPANSION.items).toHaveLength(122);expect(MODERN_ITEMS).toHaveLength(245);expect(new Set(MODERN_ITEMS.map(i=>i.id)).size).toBe(245);expect(MODERN_ITEMS.filter(i=>i.kind==='dish')).toHaveLength(98);expect(MODERN_ITEMS.filter(i=>i.kind==='drink')).toHaveLength(41);expect(MODERN_RECIPES).toHaveLength(123);expect(MODERN_ORDERS).toHaveLength(145);expect(DEVICE_FAMILIES.filter(f=>f.kind==='generator')).toHaveLength(14);expect(DEVICE_FAMILIES.filter(f=>f.kind==='appliance')).toHaveLength(12);expect(EXPANSION.references).toHaveLength(174);});
 it('has no missing inputs, cycles or ambiguous recipes, and no cooking depth above two',()=>{const keys=new Set<string>();const depth=(id:string,path:string[]=[]):number=>{expect(path).not.toContain(id);const recipe=MODERN_RECIPES.find(r=>r.output===id);return recipe?1+Math.max(...recipe.inputs.map(n=>depth(n.item,[...path,id]))):0;};for(const r of MODERN_RECIPES){expect(r.inputs.length).toBeLessThanOrEqual(3);r.inputs.forEach(n=>expect(ITEMS[n.item]).toBeDefined());const key=r.deviceFamilyId+':'+r.inputs.map(n=>`${n.item}:${n.count}`).sort().join(',');expect(keys.has(key)).toBe(false);keys.add(key);expect(depth(r.output)).toBeLessThanOrEqual(2);}});
 it.each(EXPANSION.chains)('merges $name through its real terminal node including drinks',c=>{let s=opened();for(let l=1;l<c.names.length;l++){const item=`${c.id}-${l}`,from=add(s,item),to=add(s,item);s=act(s,{type:'move',from,to});expect(s.board[to]?.item).toBe(`${c.id}-${l+1}`);s=act(s,{type:'sell',index:to});}expect(mergeTarget(`${c.id}-${c.names.length}`)).toBeNull();});
 it.each(DEVICE_FAMILIES)('upgrades both copies of $name atomically and records all three forms',f=>{let s=opened();const before=s.coins;s=upgrade(s,f.id);expect(s.devices.find(d=>d.id===f.id)?.level).toBe(2);s=upgrade(s,f.id);expect(s.devices.filter(d=>d.familyId===f.id)).toHaveLength(1);expect(s.deviceDiscovered).toEqual(expect.arrayContaining([1,2,3].map(l=>`${f.id}-l${l}`)));expect(s.coins).toBe(before-f.price*3);expect(execute(s,{type:'mergeDevices',device:f.id,target:f.id},now).state).toBe(s);});
 it('opens only from three accessible base orders and grants each first copy once',()=>{let s=opened(3);expect(themeStage(s)).toBe(3);const starters=MODERN_ORDERS.filter(o=>o.stage===3).slice(0,3);expect(starters.every(o=>ITEMS[o.needs[0].item].stage!<=3)).toBe(true);s.completedOrders.push(...starters.map(o=>o.id));s=act(s,{type:'recover'});expect(themeStage(s)).toBe(4);const ids=s.devices.map(d=>d.id);s=act(s,{type:'recover'});expect(s.devices.map(d=>d.id)).toEqual(ids);expect(s.devices.find(d=>d.familyId==='oven')).toBeDefined();});
 it('produces bounded directional drops with exact costs and merges overflow probability',()=>{let s=opened();s=upgrade(s,'mixer-base-cooler');s=upgrade(s,'mixer-base-cooler');s=act(s,{type:'retrieveDevice',device:'mixer-base-cooler'});for(let band=0;band<5;band++){s.energy.value=100;const before=s.energy.value;s=act(s,{type:'generate',device:'mixer-base-cooler',chain:'fresh-mixer',band});expect(s.energy.value).toBe(before-BAND_COSTS[band]);}expect(productionFor('fresh-mixer',4)!.drops).toEqual([{item:'fresh-mixer-13',weight:100}]);const original=s;expect(execute(s,{type:'generate',device:'mixer-base-cooler',chain:'fresh-tea',band:4},now).state).toBe(original);});
 it('keeps busy UID tasks intact while moving and refuses storage, merge and duplicate actions',()=>{let s=opened(),from=add(s,'fresh-fruit-2');s=act(s,{type:'stageInput',from,appliance:'fruit-press'});expect(execute(s,{type:'storeDevice',device:'fruit-press'},now).state).toBe(s);s=act(s,{type:'startCooking',appliance:'fruit-press',commandId:'cook-once'});const job=s.appliances.find(a=>a.id==='fruit-press')!.job!;expect(execute(s,{type:'startCooking',appliance:'fruit-press',commandId:'cook-once'},now).state).toBe(s);s=act(s,{type:'moveDevice',device:'fruit-press',to:0});expect(s.appliances.find(a=>a.id==='fruit-press')!.job).toEqual(job);expect(s.appliances.find(a=>a.id==='fruit-press')!.index).toBe(0);s=act(s,{type:'recover'},job.endsAt);const saved=resumeManualSlot({id:2,status:'ready',state:s,capturedAt:s.lastSeen,savedAt:s.lastSeen},s.lastSeen+100000);expect(saved.appliances.find(a=>a.id==='fruit-press')!.outputSlot?.item).toBe('dish-fresh-orange-juice');s=act(saved,{type:'collectAppliance',appliance:'fruit-press'});expect(inventoryCount(s,'dish-fresh-orange-juice')).toBe(1);expect(execute(s,{type:'collectAppliance',appliance:'fruit-press'},s.lastSeen).state).toBe(s);});
 it('supports exact prefix continuation before starting with current rice recipes',()=>{
  let s=opened();
  if(!activeDevices(s).some(device=>device.id==='home-cooking-pot'))s=act(s,{type:'retrieveDevice',device:'home-cooking-pot'});
  for(const item of ['fresh-grain-1','fresh-milk-2'])s=act(s,{type:'stageInput',from:add(s,item),appliance:'home-cooking-pot'});
  expect(getApplianceStatus(s,'home-cooking-pot',now)).toMatchObject({canStart:true,recipe:{name:'黄油拌饭'}});
  s=act(s,{type:'stageInput',from:add(s,'fresh-spice-3'),appliance:'home-cooking-pot'});
  expect(getApplianceStatus(s,'home-cooking-pot',now)).toMatchObject({canStart:true,recipe:{name:'焦香洋葱饭'}});
  const spare=add(s,'fresh-veg-1');
  expect(execute(s,{type:'stageInput',from:spare,appliance:'home-cooking-pot'},now).state).toBe(s);
  s=act(s,{type:'withdrawInput',appliance:'home-cooking-pot',uid:s.appliances.find(a=>a.id==='home-cooking-pot')!.inputSlots[0].uid});
 });
 it('renders truthful unique collection totals, device sources and shelf controls',()=>{const state=createInitialState(now);const html=renderToStaticMarkup(createElement(V3Codex,{state,onItem:()=>{},onDevice:()=>{}}));expect(html).toContain('323');expect(html).toContain('139');expect(html).toContain('未开放');const details=renderToStaticMarkup(createElement(V3ItemDetails,{state,item:'dish-fresh-orange-juice',onItem:()=>{},onDevice:()=>{},onBack:()=>{}}));expect(details).toContain('鲜果料理台');expect(details).toContain('甜橙');const shelf=renderToStaticMarkup(createElement(DeviceShelf,{state,act:async()=>true,onLocate:()=>{},onBack:()=>{}}));expect(shelf).toContain('小鹅设备架');expect(shelf).toContain('海鲜冰箱');});
 it.each([42,1868919585,123456789])('plays 145 orders and the full collection without target inventory or gold injection, seed %i',seed=>{const {report}=simulateCompleteV3(seed);expect(report).toMatchObject({orders:145,recipesCooked:123,finishedDiscovered:139,foodDiscovered:245,equipmentDiscovered:78,inventoryOrGoldInjected:false,goldFarmed:0});expect(report.peakOccupancy).toBeLessThanOrEqual(63);},30000);
});
