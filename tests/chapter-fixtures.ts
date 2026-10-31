import { createInitialState } from '../src/domain/engine';
import { FRESH_ORDERS, HOME_ORDERS, MODERN_ORDERS } from '../src/content/catalog';
import { BUILD_NODES } from '../src/content/board-layouts';
import { reconcileDeviceGrants } from '../src/domain/devices';
import { WORKSPACE_FIELDS } from '../src/domain/workspaces';
import { validateSave } from '../src/persistence/save';
import type { GameState } from '../src/domain/types';

/** An actual schema-three source, for migration and original-kitchen regressions. */
export function historicalState(now: number, stage=1): GameState {
  const current=createInitialState(now);
  const s={...current,...Object.fromEntries(WORKSPACE_FIELDS.map(k=>[k,current[k]])),schemaVersion:3,contentVersion:'4.0.0'} as GameState;
  delete s.workspaces;delete s.chapterAccess;delete s.activeWorkspaceId;
  if(stage>=2){s.completedOrders=FRESH_ORDERS.map(o=>o.id);s.construction.completed=BUILD_NODES.map(n=>n.id);}
  if(stage>=3)s.completedOrders.push(...HOME_ORDERS.map(o=>o.id));
  for(let n=3;n<stage;n++)s.completedOrders.push(...MODERN_ORDERS.filter(o=>o.stage===n).slice(0,3).map(o=>o.id));
  reconcileDeviceGrants(s);return s;
}
export const originalKitchen=(now:number,stage=2)=>validateSave(historicalState(now,stage));
export function flatSource(state:GameState):GameState {
  const s={...state,...Object.fromEntries(WORKSPACE_FIELDS.map(k=>[k,structuredClone(state[k])]))} as GameState;
  delete s.workspaces;delete s.chapterAccess;delete s.activeWorkspaceId;
  if(s.undo)delete s.undo.workspaceId;
  return s;
}
