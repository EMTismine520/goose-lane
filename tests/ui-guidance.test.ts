import { describe, expect, it } from 'vitest';
import { createInitialState, execute, availableOrders, getBoardEntity, getApplianceStatus, canAffordRequirements } from '../src/domain/engine';
import { themeStage } from '../src/domain/devices';
import { FRESH_ORDERS } from '../src/content/catalog';
import { DEVICE_FAMILIES } from '../src/content/expansion';
import { focusedOrder, layoutDensity, locateItem } from '../src/ui/ui-guidance';
import { createUiPreviewState, UI_SCENARIOS } from '../src/diagnostics/ui-preview-state';

describe('order guidance stays read-only and follows authoritative inventory',()=>{
  it('stops tracking an order after delivery instead of choosing a new one',()=>{
    const state=createUiPreviewState('orders',100000);
    const order=availableOrders(state)[0];
    expect(focusedOrder(state,order.id)?.id).toBe(order.id);
    const delivered=execute(state,{type:'deliver',order:order.id},100000);
    expect(delivered.ok).toBe(true);
    expect(focusedOrder(delivered.state,order.id)).toBeNull();
  });
  it('finds a moved UID, then its storage location without mutating the save',()=>{
    const state=createInitialState(100000);
    const source=state.board.findIndex(item=>item?.item==='fresh-veg-1');
    const uid=state.board[source]!.uid;
    const target=state.board.findIndex((_,index)=>getBoardEntity(state,index).kind==='empty');
    const moved=execute(state,{type:'move',from:source,to:target},100000).state;
    const before=JSON.stringify(moved);
    expect(locateItem(moved,'fresh-veg-1')).toMatchObject({kind:'board',uids:expect.arrayContaining([uid])});
    expect(JSON.stringify(moved)).toBe(before);
    moved.board.forEach((item,index)=>{if(item?.item==='fresh-veg-1'&&item.uid!==uid)moved.board[index]=null});
    const stored=execute(moved,{type:'store',index:target},100000).state;
    expect(locateItem(stored,'fresh-veg-1').kind).toBe('storage');
  });
  it('locates a producer without changing its chain or spending energy',()=>{
    const state=createInitialState(100000),before=JSON.stringify(state);
    expect(locateItem(state,'fresh-veg-3')).toMatchObject({kind:'board',uids:['vegetable-cart']});
    expect(JSON.stringify(state)).toBe(before);
  });
  it('uses the actual available height at density boundaries',()=>{
    expect([844,740,739,640,639,606,605].map(layoutDensity)).toEqual(['regular','regular','compact','compact','short','short','tiny']);
  });
  it('opens the home theme from one real delivery and grants retrievable devices only once',()=>{
    const now=100000,state=createUiPreviewState('theme-unlock',now);
    const order=FRESH_ORDERS.at(-1)!;
    const gifts=DEVICE_FAMILIES.filter(family=>family.stage===2).map(family=>family.id);
    expect(themeStage(state)).toBe(1);
    expect(state.construction.completed).toHaveLength(3);
    expect(availableOrders(state).map(value=>value.id)).toEqual([order.id]);
    expect(canAffordRequirements(state,order.needs)).toBe(true);
    expect(state.deviceGrants.some(id=>gifts.includes(id))).toBe(false);
    const delivered=execute(state,{type:'deliver',order:order.id},now);
    expect(delivered.ok).toBe(true);
    expect(themeStage(delivered.state)).toBe(2);
    expect(delivered.events.some(event=>event.type==='home-unlocked')).toBe(true);
    expect(delivered.state.devices.filter(device=>gifts.includes(device.familyId))).toHaveLength(4);
    expect(delivered.state.devices.filter(device=>gifts.includes(device.familyId)).every(device=>device.index!==null)).toBe(true);
    const stored=execute(delivered.state,{type:'storeDevice',device:'home-cooking-pot'},now);
    expect(stored.ok).toBe(true);
    expect(stored.state.devices.find(device=>device.id==='home-cooking-pot')?.index).toBeNull();
    const retrieved=execute(stored.state,{type:'retrieveDevice',device:'home-cooking-pot'},now);
    expect(retrieved.ok).toBe(true);
    expect(retrieved.state.devices.find(device=>device.id==='home-cooking-pot')?.index).not.toBeNull();
    const repeated=execute(retrieved.state,{type:'deliver',order:order.id},now);
    expect(repeated.ok).toBe(false);
    expect(execute(repeated.state,{type:'recover'},now).state.devices.filter(device=>gifts.includes(device.familyId))).toHaveLength(4);
    expect(themeStage(createUiPreviewState('theme-unlock',now))).toBe(1);
  });
  it.each(UI_SCENARIOS)('produces a valid isolated %s acceptance fixture',scenario=>{
    const state=createUiPreviewState(scenario,100000);
    expect(state.schemaVersion).toBe(3);
    expect(state.board).toHaveLength(63);
    if(scenario==='ready'||scenario==='full')expect(getApplianceStatus(state,'home-cooking-pot',100000)?.phase).toBe('ready');
    if(scenario==='cooking')expect(getApplianceStatus(state,'home-cooking-pot',100000)?.phase).toBe('cooking');
    if(scenario==='full')expect(state.board.some((_,index)=>getBoardEntity(state,index).kind==='empty')).toBe(false);
  });
});
