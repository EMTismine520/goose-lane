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
  it('buys the home chapter without prior stories and keeps its gift instances stable on return',()=>{
    const now=100000,state=createUiPreviewState('theme-unlock',now);
    expect(themeStage(state)).toBe(1);expect(state.completedOrders).toHaveLength(0);
    const bought=execute(state,{type:'unlockAndEnterChapter',chapter:2},now);expect(bought.ok).toBe(true);
    expect(bought.state.coins).toBe(0);expect(themeStage(bought.state)).toBe(2);
    const ids=bought.state.devices.map(d=>d.id);
    const returned=execute(execute(bought.state,{type:'enterChapter',chapter:1},now).state,{type:'enterChapter',chapter:2},now);
    expect(returned.state.devices.map(d=>d.id)).toEqual(ids);
  });
  it.each(UI_SCENARIOS)('produces a valid isolated %s acceptance fixture',scenario=>{
    const state=createUiPreviewState(scenario,100000);
    expect(state.schemaVersion).toBe(4);
    expect(state.board).toHaveLength(63);
    if(scenario==='ready'||scenario==='full')expect(getApplianceStatus(state,'home-cooking-pot',100000)?.phase).toBe('ready');
    if(scenario==='cooking')expect(getApplianceStatus(state,'home-cooking-pot',100000)?.phase).toBe('cooking');
    if(scenario==='full')expect(state.board.some((_,index)=>getBoardEntity(state,index).kind==='empty')).toBe(false);
  });
});
