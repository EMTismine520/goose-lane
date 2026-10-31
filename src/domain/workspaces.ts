import { CHAINS } from '../content/catalog';
import { CHAPTERS, CHAPTER_PRICE, chapterDefinition, regularTemplates } from '../content/chapters';
import { DEVICE_FAMILIES } from '../content/expansion';
import type { GameState, Workspace } from './types';

export const WORKSPACE_FIELDS = ['board', 'storage', 'storageCapacity', 'generators', 'jobs', 'appliances', 'devices', 'deviceGrants', 'session', 'cellVersions', 'migrationInbox'] as const;
export const hasChapters = (state: Partial<GameState>) => state.campaign === 'fresh' && !!state.workspaces;
export const activeWorkspace = (state: GameState): Workspace | undefined => state.workspaces?.[state.activeWorkspaceId!];
export const allWorkspaces = (state: GameState) => state.workspaces ? Object.values(state.workspaces) : [state as unknown as Workspace];

/** Non-enumerable lenses preserve existing consumers, with no second mutable/persisted board.
 * Structured-clone/save boundaries rebind these lenses using cloneGameState/validateSave. */
export function bindWorkspaceViews(state: GameState): GameState {
  if (!hasChapters(state)) return state;
  for (const key of WORKSPACE_FIELDS) Object.defineProperty(state, key, {
    configurable: true, enumerable: false,
    get() { return state.workspaces![state.activeWorkspaceId!][key]; },
    set(value) { (state.workspaces![state.activeWorkspaceId!] as unknown as Record<string, unknown>)[key] = value; },
  });
  return state;
}
export const cloneGameState = (state: GameState) => bindWorkspaceViews(structuredClone(state));
export const currentChapter = (state: Partial<GameState>) => state.workspaces?.[state.activeWorkspaceId!]?.chapter;
export const chapterPrice = (state: GameState) => state.chapterAccess?.paidUnlocks ? CHAPTER_PRICE.later : CHAPTER_PRICE.first;
export const deviceGrowthAvailable = (state: GameState) => activeWorkspace(state)?.mode === 'chapter' || (activeWorkspace(state)?.originalStage ?? 0) >= 3;
export function familyAllowed(state: GameState, family: string) {
  const w = activeWorkspace(state);
  if (!w) return false;
  return w.mode === 'original' ? DEVICE_FAMILIES.some(f => f.id === family && f.stage <= w.originalStage!) : chapterDefinition(w.chapter)!.dependencies.families.includes(family);
}
export function recipeAllowed(state: GameState, recipe: string) {
  const w = activeWorkspace(state);
  return w?.mode === 'chapter' ? chapterDefinition(w.chapter)!.dependencies.recipes.some(r => r.id === recipe) : false;
}
export function workspaceFromFlat(state: GameState, id: string, chapter: number, mode: Workspace['mode']): Workspace {
  const fields = Object.fromEntries(WORKSPACE_FIELDS.map(k => [k, state[k]]));
  return { ...fields, id, chapter, mode, ...(mode === 'original' ? { originalStage: chapter } : {}), regularOrders: [], regularCompleted: 0, orderTab: 'story', starterGranted: true } as unknown as Workspace;
}
export function initializeChapters(state: GameState, originalStage?: number): GameState {
  const id = originalStage ? 'original' : 'chapter-1';
  state.workspaces = { [id]: workspaceFromFlat(state, id, originalStage ?? 1, originalStage ? 'original' : 'chapter') };
  state.activeWorkspaceId = id;
  state.chapterAccess = { unlocked: Array.from({ length: originalStage ?? 1 }, (_, i) => i + 1), paidUnlocks: 0 };
  if (state.undo) state.undo.workspaceId = id;
  bindWorkspaceViews(state); fillRegularOrders(state); return state;
}
export function fillRegularOrders(state: GameState) {
  const w = activeWorkspace(state); if (!w) return;
  const templates = regularTemplates(w.chapter);
  while (w.regularOrders.length < 3) {
    const template = templates[w.regularOrders.length % templates.length];
    w.regularOrders.push({ ...structuredClone(template), id: `regular:g${state.nextId++}` });
  }
}
export function createWorkspace(state: GameState, chapter: number) {
  const definition = chapterDefinition(chapter)!;
  const w: Workspace = { id: `chapter-${chapter}`, chapter, mode: 'chapter', board: Array(63).fill(null), storage: [], storageCapacity: 8,
    generators: Object.fromEntries(CHAINS.map(c => [c.id, { remaining: 12, readyAt: 0 }])), jobs: [null,null,null,null], devices: [], appliances: [], deviceGrants: [],
    session: { page: 'merge', selectedUid: null, orderScroll: 0 }, cellVersions: Array(63).fill(0), migrationInbox: [], regularOrders: [], regularCompleted: 0, orderTab: 'story', starterGranted: true };
  for (const familyId of definition.dependencies.families) {
    const f = DEVICE_FAMILIES.find(f => f.id === familyId)!;
    const starter = definition.starter.families.includes(f.id), level = starter ? definition.starter.levels[f.id] ?? 1 : 1;
    const band = starter && f.kind === 'generator' ? definition.starter.bands[f.id] ?? 0 : 0;
    const id = `d${state.nextId++}`, index = starter ? 49 + definition.starter.families.indexOf(f.id) : null;
    w.devices.push({ id, familyId, level, band, index, selectedChain: f.chains[0] ?? null, version: 0 });
    w.deviceGrants.push(f.id);
    if (f.kind === 'appliance') w.appliances.push({ id, slot: f.slot!, index: index ?? -1, inputSlots: [], job: null, outputSlot: null, version: 0 });
    const art = `${familyId}-l${level}`; if (!state.deviceDiscovered.includes(art)) state.deviceDiscovered.push(art);
  }
  state.workspaces![w.id] = w;
  return w;
}
export const deviceCount = (state: GameState) => allWorkspaces(state).reduce((n, w) => n + w.devices.length, 0);
export const reservedDevices = (state: GameState) => CHAPTERS.filter(c => !state.workspaces?.[`chapter-${c.id}`]).reduce((n, c) => n + c.dependencies.families.length, 0);

export function itemAccessible(state: GameState, item: string): boolean {
  if(!hasChapters(state))return true;
  return state.chapterAccess!.unlocked.some(c=>chapterDefinition(c)!.dependencies.items.includes(item)) || !!state.workspaces?.original && (chapterDefinition(state.workspaces.original.originalStage!)!.dependencies.items.includes(item));
}
export function familyAccessible(state: GameState, family: string): boolean {
  return state.chapterAccess?.unlocked.some(c=>chapterDefinition(c)!.dependencies.families.includes(family))??false;
}
