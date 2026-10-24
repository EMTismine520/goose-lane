import { activeDevices, HOME_DEVICES, homeCookingUnlocked } from '../content/board-layouts';
import type { GameState } from './types';

/** Called on a detached state inside the command/save transaction. Preserves every UID. */
export function reconcileHomeDevices(state: GameState): boolean {
  if (!homeCookingUnlocked(state)) return false;
  const occupied = new Set(activeDevices(state).map(device => device.index));
  const displaced = HOME_DEVICES.flatMap(device => {
    const item = state.board[device.index];
    if (!item) return [];
    state.board[device.index] = null;
    state.cellVersions[device.index]++;
    return [item];
  });
  // An old undo record reserves its landing before ordinary displaced items.
  if (state.undo && occupied.has(state.undo.index)) {
    let free = state.board.findIndex((item, index) => !item && !occupied.has(index));
    if (free < 0) {
      free = state.board.findIndex((item, index) => !!item && !occupied.has(index));
      if (free >= 0) { state.migrationInbox.push(state.board[free]!); state.board[free] = null; state.cellVersions[free]++; }
    }
    state.undo.index = free;
  }
  for (const item of displaced) {
    const free = state.board.findIndex((value, index) => !value && !occupied.has(index) && state.undo?.index !== index);
    if (free < 0) state.migrationInbox.push(item);
    else { state.board[free] = item; state.cellVersions[free]++; }
  }
  let added = false;
  for (const device of activeDevices(state)) if (device.kind === 'appliance' && !state.appliances.some(appliance => appliance.id === device.id)) {
    state.appliances.push({ id: device.id, index: device.index, slot: device.slot!, inputSlots: [], job: null, outputSlot: null, version: 0 });
    added = true;
  }
  return added;
}
