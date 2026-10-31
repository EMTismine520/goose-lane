import { describe, expect, it } from 'vitest';
import { createInitialState, execute, stateInvariantErrors, getBoardEntity, availableOrders, availableApplianceRecipes } from '../src/domain/engine';
import { activeWorkspace, cloneGameState, deviceCount, reservedDevices } from '../src/domain/workspaces';
import { CHAPTERS, chapterOrders, resolveDependencies } from '../src/content/chapters';
import { MODERN_ORDERS, MODERN_RECIPES } from '../src/content/catalog';
import { parseSave, serializeSave, validateSave, resumeManualSlot } from '../src/persistence/save';
import type { Command, GameState } from '../src/domain/types';
import OLD from '../src/diagnostics/v3-cooking-sample.json';
import { historicalState } from './chapter-fixtures';
import { makeDevice } from '../src/domain/devices';

const now=1_800_000_000_000;
function act(s:GameState,c:Command,time=s.lastSeen){const r=execute(s,c,time);expect(r.ok,r.events.map(e=>e.message).join('/')).toBe(true);expect(stateInvariantErrors(r.state)).toEqual([]);return r.state;}
function opened(){const s=createInitialState(now);s.coins=10000;return s;}
describe('free chapter choice and isolated kitchens',()=>{
  it('reserves every starter even with 256 historical devices and checks the bounded full save',()=>{
    const old=historicalState(now,8);old.coins=100000;
    while(old.devices.length<256)makeDevice(old,'home-cooking-pot',`d${old.nextId++}`);
    let s=validateSave(old);
    while(deviceCount(s)+reservedDevices(s)<384)s=act(s,{type:'buyDevice',family:'home-cooking-pot'});
    expect(execute(s,{type:'buyDevice',family:'home-cooking-pot'},now).ok).toBe(false);
    for(const chapter of [6,2,8,4,7,3,5,1])s=act(s,{type:chapter===1?'enterChapter':'unlockAndEnterChapter',chapter});
    expect(reservedDevices(s)).toBe(0);expect(deviceCount(s)).toBe(384);
    for(const w of Object.values(s.workspaces!)){
      w.board.fill(null);
      // Cover bounded populated boards plus staged, cooking and ready appliances, not just empty shelves.
      const positions=new Set(w.devices.flatMap(d=>d.index===null?[]:[d.index]));
      for(const d of w.devices.filter(d=>d.index===null)){
        const free=Array.from({length:63},(_,i)=>i).find(i=>!positions.has(i));if(free===undefined)break;
        positions.add(free);d.index=free;const a=w.appliances.find(a=>a.id===d.id);if(a)a.index=free;
      }
      w.appliances.filter(a=>a.index>=0).forEach((a,i)=>{
        const d=w.devices.find(d=>d.id===a.id)!;const recipe=(w.mode==='chapter'?CHAPTERS[w.chapter-1].dependencies.recipes:MODERN_RECIPES).find(r=>r.deviceFamilyId===d.familyId&&(r.minDeviceLevel??1)<=d.level);if(!recipe)return;
        if(i%3===0)a.inputSlots=recipe.inputs.flatMap(n=>Array.from({length:n.count},()=>({uid:`g${s.nextId++}`,item:n.item})));
        else {a.job={id:`g${s.nextId++}`,recipe:recipe.id,startedAt:now-10000,endsAt:i%3===1?now+10000:now,output:recipe.output};if(i%3===2)a.outputSlot={uid:`g${s.nextId++}`,item:recipe.output};}
      });
      const item=CHAPTERS[w.chapter-1].dependencies.items[0];
      for(let i=0;i<63;i++)if(!w.devices.some(d=>d.index===i))w.board[i]={uid:`g${s.nextId++}`,item};
      while(w.storage.length<8)w.storage.push({uid:`g${s.nextId++}`,item});
    }
    const serialized=serializeSave(s);expect(Buffer.byteLength(serialized)).toBeLessThan(1000000);expect(parseSave(serialized)).toEqual(s);
  });
  it('resolves every order including nested dishes and directly produced drinks',()=>{
    expect(CHAPTERS.flatMap(c=>c.orders)).toHaveLength(145);expect(new Set(CHAPTERS.flatMap(c=>c.orders.map(o=>o.id))).size).toBe(145);
    expect(CHAPTERS.map(c=>c.dependencies.families.length)).toEqual([4,6,14,13,11,18,9,13]);
    expect(CHAPTERS.every(c=>c.starter.families.length<=8)).toBe(true);
    expect(resolveDependencies(['dish-fresh-tomato-salad']).recipes.length).toBeGreaterThan(0);
    expect(CHAPTERS[7].orders[0].needs[0].item).toBe(MODERN_RECIPES.find(r=>r.name==='香甜蛋奶饮')!.output);
  });
  it.each([2,3,4,5,6,7,8])('can buy chapter %i first for exact 60, with a usable startup and zero coins',chapter=>{
    let s=createInitialState(now);s.coins=60;s=act(s,{type:'unlockAndEnterChapter',chapter});
    expect(s.coins).toBe(0);expect(s.chapterAccess!.unlocked).toEqual([1,chapter]);expect(activeWorkspace(s)!.devices.filter(d=>d.index!==null).length).toBeLessThanOrEqual(8);
    expect(availableOrders(s).map(o=>o.id)).toEqual(chapterOrders(chapter).slice(0,3).map(o=>o.id));
    for(const f of CHAPTERS[chapter-1].starter.families)expect(s.devices.find(d=>d.familyId===f)!.level).toBeGreaterThanOrEqual(CHAPTERS[chapter-1].starter.levels[f]??1);
    expect(parseSave(serializeSave(s))).toEqual(s);
    s=act(s,{type:'orderTab',tab:'regular'});const order=availableOrders(s)[0];
    expect(order.id).toMatch(/^regular:/);expect(CHAPTERS[chapter-1].starter.families.some(f=>s.devices.some(d=>d.familyId===f&&d.index!==null))).toBe(true);
  });
  it('has no prefix entitlement and covers all 56 directed switches without losing locations',()=>{
    let s=opened();for(const chapter of [6,2,8,4,7,3,5])s=act(s,{type:'unlockAndEnterChapter',chapter});
    expect(s.coins).toBe(10000-780);
    const snapshots=Object.fromEntries(Object.entries(s.workspaces!).map(([id,w])=>[id,JSON.stringify({...w,session:{...w.session,page:'merge'}})]));
    for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)if(a!==b){s=act(s,{type:'enterChapter',chapter:a});s=act(s,{type:'enterChapter',chapter:b});}
    for(const [id,w] of Object.entries(s.workspaces!))expect(JSON.stringify(w)).toBe(snapshots[id]);
    expect(parseSave(serializeSave(s))).toEqual(s);
  });
  it('rejects shortages and stale workspace actions atomically, never charges twice',()=>{
    let s=createInitialState(now);s.coins=59;expect(execute(s,{type:'unlockAndEnterChapter',chapter:8},now).state).toBe(s);
    s.coins=60;const originalId=s.activeWorkspaceId;s=act(s,{type:'unlockAndEnterChapter',chapter:8,commandId:'buy-once'});const before=serializeSave(s);
    expect(execute(s,{type:'unlockAndEnterChapter',chapter:8,commandId:'buy-once'},now).ok).toBe(false);
    expect(execute(s,{type:'generate',chain:'fresh-coffee',expectedWorkspaceId:originalId},now).ok).toBe(false);expect(serializeSave(s)).toBe(before);
    s=act(s,{type:'unlockAndEnterChapter',chapter:8});expect(s.coins).toBe(0);
  });
  it('retains staged inputs, cooking and full boards while a background dish finishes exactly once',()=>{
    let s=opened();s=act(s,{type:'unlockAndEnterChapter',chapter:2});const wId=s.activeWorkspaceId!,pot=s.devices.find(d=>d.familyId==='home-cooking-pot')!;
    for(const item of ['fresh-poultry-1','fresh-spice-2']){const i=s.board.findIndex((_,i)=>getBoardEntity(s,i).kind==='empty');s.board[i]={uid:`g${s.nextId++}`,item};s=act(s,{type:'stageInput',from:i,appliance:pot.id});}
    s=act(s,{type:'enterChapter',chapter:1});expect(s.workspaces![wId].appliances[0].inputSlots).toHaveLength(2);
    s=act(s,{type:'enterChapter',chapter:2});s=act(s,{type:'startCooking',appliance:pot.id});const end=s.appliances[0].job!.endsAt;
    s=act(s,{type:'enterChapter',chapter:1});s=act(s,{type:'recover'},end+1);const uid=s.workspaces![wId].appliances[0].outputSlot!.uid;
    s=act(s,{type:'recover'},end+1000);expect(s.workspaces![wId].appliances[0].outputSlot!.uid).toBe(uid);expect(s.board.some(i=>i?.uid===uid)).toBe(false);
    s=act(s,{type:'enterChapter',chapter:2});expect(s.appliances[0].outputSlot!.uid).toBe(uid);expect(parseSave(serializeSave(s))).toEqual(s);
  });
  it('consumes only current inventory and replenishes a unique quoted regular order once',()=>{
    let s=opened();s=act(s,{type:'unlockAndEnterChapter',chapter:7});s=act(s,{type:'orderTab',tab:'regular'});
    const order=availableOrders(s)[0],item=order.needs[0].item;const i=s.board.findIndex((_,i)=>getBoardEntity(s,i).kind==='empty');s.board[i]={uid:`g${s.nextId++}`,item};
    const before=s.coins;s=act(s,{type:'deliver',order:order.id});expect(s.coins).toBe(before+order.coins);expect(s.completedOrders).not.toContain(order.id);expect(activeWorkspace(s)!.regularCompleted).toBe(1);
    expect(execute(s,{type:'deliver',order:order.id},now).ok).toBe(false);expect(availableOrders(s)[0].id).not.toBe(order.id);expect(parseSave(serializeSave(s))).toEqual(s);
  });
  it('arranges dependencies as one operation, preserving the entire full kitchen when the second placement cannot fit',()=>{
    let s=opened();s=act(s,{type:'unlockAndEnterChapter',chapter:2});
    for(const d of [...s.devices])if(d.index!==null)s=act(s,{type:'storeDevice',device:d.id});
    for(let i=1;i<63;i++)s.board[i]={uid:`g${s.nextId++}`,item:'fresh-poultry-1'};
    const before=serializeSave(s),recipe=CHAPTERS[1].dependencies.recipes.find(r=>r.name==='葱香蛋饭')!;
    const failed=execute(s,{type:'arrangeRecipe',recipe:recipe.id},now);expect(failed.ok).toBe(false);expect(failed.state).toBe(s);expect(serializeSave(failed.state)).toBe(before);
    s.board[1]=null;s.board[2]=null;s=act(s,{type:'arrangeRecipe',recipe:recipe.id});
    expect(resolveDependencies([recipe.output]).families.every(f=>s.devices.some(d=>d.familyId===f&&d.index!==null))).toBe(true);
  });
  it('preserves the mixed original kitchen and freezes its permissions during new chapter play',()=>{
    const s=validateSave(OLD);expect(s.activeWorkspaceId).toBe('original');const w=cloneGameState(s).workspaces!.original;
    s.coins=1000;const next=act(s,{type:'unlockAndEnterChapter',chapter:8});expect(next.workspaces!.original).toEqual(w);
    next.completedOrders.push(...MODERN_ORDERS.filter(o=>(o.stage??1)===8).map(o=>o.id));const back=act(next,{type:'enterChapter',chapter:'original'});
    expect(availableApplianceRecipes(back).every(r=>(r.stage??1)<=w.originalStage!)).toBe(true);
    expect(back.appliances).toEqual(OLD.appliances);expect(back.board).toEqual(OLD.board);expect(parseSave(serializeSave(back))).toEqual(back);
  });
  it('validates every kitchen and restores all saved clocks and the whole wallet rather than merging',()=>{
    let s=opened();s=act(s,{type:'unlockAndEnterChapter',chapter:6});s=act(s,{type:'unlockAndEnterChapter',chapter:2});
    const raw=JSON.parse(serializeSave(s));expect(raw.board).toBeUndefined();raw.workspaces['chapter-6'].board[0]=raw.workspaces['chapter-1'].board[16];expect(()=>validateSave(raw)).toThrow('重复');
    const resumed=resumeManualSlot({id:1,status:'ready',state:s,capturedAt:s.lastSeen,savedAt:s.lastSeen},now+86400000,{...s,coins:999999} as GameState);expect(resumed.coins).toBe(s.coins);expect(resumed.chapterAccess).toEqual(s.chapterAccess);
    expect(deviceCount(resumed)+reservedDevices(resumed)).toBeLessThanOrEqual(384);
  });
});
