import { describe, expect, it, vi } from 'vitest';
import { CHAPTERS } from '../src/content/chapters';
import { createInitialState, execute, getBoardEntity, getRecipeLayoutPreview, stateInvariantErrors, unlockedCells } from '../src/domain/engine';
import { isRequiredBoardDevice } from '../src/domain/workspaces';
import { makeDevice } from '../src/domain/devices';
import { parseSave, serializeSave } from '../src/persistence/save';
import { auditChapter } from '../src/diagnostics/chapter-audit';
import { chapterPlayer } from '../src/diagnostics/chapter-simulation';
import { prepareChapter } from '../src/platform/chapter-resources';
import { deviceAssetPath, mobileAssetPath } from '../src/content/assets';
import { loadArtImage } from '../src/platform/asset-queue';
import type { Command, GameState } from '../src/domain/types';

vi.mock('../src/platform/asset-queue', () => ({ loadArtImage: vi.fn().mockResolvedValue({}) }));
const now = 1_800_000_000_000, counts = [4, 6, 14, 13, 11, 18, 9, 13];
function act(state: GameState, command: Command) {
  const result = execute(state, command, state.lastSeen);
  expect(result.ok, result.events.map(e => e.message).join('/')).toBe(true);
  expect(stateInvariantErrors(result.state)).toEqual([]);
  return result.state;
}
function enter(chapter: number) {
  let state = createInitialState(now);
  if (chapter !== 1) { state.coins = 60; state = act(state, { type: 'unlockAndEnterChapter', chapter }); expect(state.coins).toBe(0); }
  return state;
}
describe('complete chapter entry equipment', () => {
  it.each(CHAPTERS)('covers all orders and regular sources in $name with real on-board devices', c => {
    const state = enter(c.id), audit = auditChapter(state, c.id);
    expect(audit.hardBlockedOrders).toBe(0); expect(audit.targetBlockedOrders).toBe(0); expect(audit.hiddenOrderSources).toBe(0);
    expect(state.devices).toHaveLength(counts[c.id - 1]); expect(audit.onBoard).toBe(counts[c.id - 1]);
    expect(new Set(state.devices.map(d => d.familyId)).size).toBe(state.devices.length);
    expect(new Set(state.devices.map(d => d.index)).size).toBe(state.devices.length);
    for (const d of state.devices) {
      expect(d.index).not.toBeNull(); expect(d.index!).toBeLessThan(unlockedCells(state));
      expect(state.board[d.index!]).toBeNull(); expect(isRequiredBoardDevice(state, d.id)).toBe(true);
      const a = state.appliances.find(a => a.id === d.id); if (a) expect(a.index).toBe(d.index);
      expect(d.level).toBe(audit.equipment.find(e => e.family === d.familyId)!.level);
    }
    expect(parseSave(serializeSave(state))).toEqual(state);
  });
  it('detects the baseline 73 blocked orders and 19 cooking grade deficits independently', () => {
    let blocked = 0, appliances = 0;
    for (const c of CHAPTERS) {
      const state = enter(c.id);
      for (const d of state.devices) d.level = c.starter.families.includes(d.familyId) ? c.starter.levels[d.familyId] ?? 1 : 1;
      const report = auditChapter(state, c.id); blocked += report.hardBlockedOrders;
      appliances += report.equipment.filter(e => e.actualLevel < e.minimumLevel).length;
    }
    expect(blocked).toBe(73); expect(appliances).toBe(19);
  });
  it('preserves tutorial items, four positions, basic bands and construction', () => {
    const state = enter(1);
    expect([16, 17, 23, 24].map(i => state.board[i]?.uid)).toEqual(['g1', 'g2', 'g3', 'g4']);
    expect(state.devices.map(d => [d.familyId, d.index])).toEqual([['vegetable-cart', 35], ['fruit-cart', 36], ['chopping-board', 40], ['fruit-press', 41]]);
    expect(state.devices.filter(d => d.selectedChain).map(d => [d.level, d.band])).toEqual([[2, 0], [2, 0]]);
    expect(unlockedCells(state)).toBe(42); expect(state.construction.completed).toEqual([]);
    const produced = act(state, { type: 'generate', device: 'vegetable-cart', chain: 'fresh-veg' });
    expect(produced.stats.generated).toBe(1);
    expect(produced.board.filter(Boolean).every(i => ['fresh-veg-1', 'fresh-veg-2', 'fresh-veg-3', 'fresh-fruit-1'].includes(i!.item))).toBe(true);
  });
  it('rejects hiding the last capable representative but allows storing extra lower-level copies', () => {
    let state = enter(2);
    const representative = state.devices.find(d => d.familyId === 'beast-meat-cart')!;
    const failed = execute(state, { type: 'storeDevice', device: representative.id }, now);
    expect(failed.ok).toBe(false); expect(failed.state).toBe(state); expect(failed.events[0].message).toContain('本章必需');
    const extra = makeDevice(state, representative.familyId, `d${state.nextId++}`);
    state = act(state, { type: 'retrieveDevice', device: extra.id, index: 0 });
    expect(execute(state, { type: 'storeDevice', device: representative.id }, now).ok).toBe(false);
    state = act(state, { type: 'storeDevice', device: extra.id });
    expect(state.devices.find(d => d.id === extra.id)!.index).toBeNull();
  });
  it.each(['home-cooking-pot', 'beast-meat-cart'])('inherits the coordinate when the representative merges into a stored %s', family => {
    let state = enter(2); const source = state.devices.find(d => d.familyId === family)!;
    const target = makeDevice(state, family, `d${state.nextId++}`);
    if (source.level === 2) {
      const second = makeDevice(state, family, `d${state.nextId++}`);
      state = act(state, { type: 'mergeDevices', device: second.id, target: target.id });
    }
    state = act(state, { type: 'mergeDevices', device: source.id, target: target.id });
    expect(state.devices.find(d => d.id === source.id)).toBeUndefined();
    expect(state.devices.find(d => d.id === target.id)).toMatchObject({ level: source.level + 1, index: source.index });
    const a = state.appliances.find(a => a.id === target.id); if (a) expect(a.index).toBe(source.index);
    expect(isRequiredBoardDevice(state, target.id)).toBe(true); expect(parseSave(serializeSave(state))).toEqual(state);
  });
  it('prefers capable on-board equipment and never hides another required family during arrangement', () => {
    let state = enter(2);
    const recipe = CHAPTERS[1].dependencies.recipes.find(r => r.name === '葱香蛋饭')!;
    const spare = makeDevice(state, 'home-cooking-pot', `d${state.nextId++}`);
    spare.level = 3; state.deviceDiscovered.push('home-cooking-pot-l3');
    expect(getRecipeLayoutPreview(state, recipe.id)!.requiredSpaces).toBe(0);
    const before = state.devices.map(d => ({ ...d })); state = act(state, { type: 'arrangeRecipe', recipe: recipe.id });
    expect(state.devices).toEqual(before);
    // Exercise lack of room using an intentionally hidden source, not a legal store command.
    for (const d of state.devices) if (d.familyId === 'poultry-cart') d.index = null;
    for (let i = 0; i < 63; i++) if (getBoardEntity(state, i).kind === 'empty') state.board[i] = { uid: `g${state.nextId++}`, item: 'fresh-veg-1' };
    const serialized = serializeSave(state), result = execute(state, { type: 'arrangeRecipe', recipe: recipe.id }, now);
    expect(result.ok).toBe(false); expect(result.state).toBe(state); expect(serializeSave(result.state)).toBe(serialized);
  });
  it.each(CHAPTERS)('prepares the actual grades of all new $name equipment before entry', async c => {
    vi.mocked(loadArtImage).mockClear();
    await prepareChapter(createInitialState(now), c.id);
    const loaded = vi.mocked(loadArtImage).mock.calls.map(([url]) => url);
    for (const e of c.equipment) expect(loaded.some(url => url.endsWith(mobileAssetPath(deviceAssetPath(`${e.familyId}-l${e.level}`)!)))).toBe(true);
  });
  it('forbids equipment purchase and merge in strict command simulation', () => {
    const p = chapterPlayer(42, { strictEquipment: true });
    expect(() => p.act({ type: 'buyDevice', family: 'vegetable-cart' })).toThrow('forbids buyDevice');
    expect(() => p.act({ type: 'mergeDevices', device: 'a', target: 'b' })).toThrow('forbids mergeDevices');
    expect(p.report.equipmentPurchases).toBe(0); expect(p.report.equipmentMerges).toBe(0);
  });
  it('permits storing a capable extra while keeping one representative on board', () => {
    let state = enter(2);
    const source = state.devices.find(d => d.familyId === 'home-cooking-pot')!;
    const extra = makeDevice(state, source.familyId, `d${state.nextId++}`);
    state = act(state, { type: 'retrieveDevice', device: extra.id, index: 0 });
    expect(isRequiredBoardDevice(state, source.id)).toBe(false);
    state = act(state, { type: 'storeDevice', device: source.id });
    expect(isRequiredBoardDevice(state, extra.id)).toBe(true);
    expect(execute(state, { type: 'storeDevice', device: extra.id }, now).ok).toBe(false);
  });
  it('keeps all on-board devices, ingredients and each appliance phase through 56 directed switches and refresh', () => {
    let state = enter(1); state.coins = 10000;
    for (let chapter = 2; chapter <= 8; chapter++) state = act(state, { type: 'unlockAndEnterChapter', chapter });
    for (const w of Object.values(state.workspaces!)) {
      const a = w.appliances[0], device = w.devices.find(d => d.id === a.id)!;
      const recipe = CHAPTERS[w.chapter - 1].dependencies.recipes.find(r => r.deviceFamilyId === device.familyId && (r.minDeviceLevel ?? 1) <= device.level)!;
      w.board[0] = { uid: `g${state.nextId++}`, item: recipe.inputs[0].item };
      if (w.chapter % 3 === 0) a.inputSlots = recipe.inputs.flatMap(n => Array.from({ length: n.count }, () => ({ uid: `g${state.nextId++}`, item: n.item })));
      else {
        a.job = { id: `g${state.nextId++}`, recipe: recipe.id, output: recipe.output, startedAt: now - 10000, endsAt: w.chapter % 3 === 1 ? now + 10000 : now };
        if (w.chapter % 3 === 2) a.outputSlot = { uid: `g${state.nextId++}`, item: recipe.output };
      }
    }
    state = parseSave(serializeSave(state));
    const snapshots = Object.fromEntries(Object.entries(state.workspaces!).map(([id, w]) => [id, JSON.stringify(w)]));
    for (let a = 1; a <= 8; a++) for (let b = 1; b <= 8; b++) if (a !== b) {
      state = act(state, { type: 'enterChapter', chapter: a }); state = act(state, { type: 'enterChapter', chapter: b });
      expect(state.devices.every(d => d.index !== null)).toBe(true);
    }
    state = parseSave(serializeSave(state));
    for (const [id, w] of Object.entries(state.workspaces!)) expect(JSON.stringify(w)).toBe(snapshots[id]);
  });
});
