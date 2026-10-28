import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createInitialState, createLegacyInitialState } from '../src/domain/engine';
import { createUiPreviewState } from '../src/diagnostics/ui-preview-state';
import { planBoardAssets } from '../src/game/board-assets';
import { AssetQueue } from '../src/platform/asset-queue';
import { DecorationBudget } from '../src/platform/performance';
import { mobileAssetPath, sizedArtPath } from '../src/content/assets';

describe('state-scoped board assets', () => {
  it('loads opening ownership, not the unlocked/discovered catalogue', () => {
    const state = createInitialState(1000), plan = planBoardAssets(state);
    expect(plan.critical).toHaveLength(7);
    expect(plan.critical.some(asset => asset.key === 'legacy-foods')).toBe(false);
    expect(plan.critical.filter(asset => asset.key !== 'entity:crate').every(asset => asset.path.startsWith('assets/mobile/'))).toBe(true);
    expect(plan.soon.some(asset => asset.key === 'item:fresh-veg-2')).toBe(true);
    state.discovered.push('fresh-sweet-9');
    expect(planBoardAssets(state).critical).toEqual(plan.critical);
  });
  it.each(['late', 'full', 'complete'] as const)('bounds %s startup by visible ownership and keeps texture identities unique', scenario => {
    const plan = planBoardAssets(createUiPreviewState(scenario, 1800000000000));
    expect(plan.critical.length).toBeLessThanOrEqual(64);
    expect(new Set(plan.critical.map(asset => asset.key)).size).toBe(plan.critical.length);
    expect(plan.soon.every(asset => !plan.critical.some(critical => critical.key === asset.key))).toBe(true);
  });
  it('preserves historical sheets and adds them only when required', () => {
    const plan = planBoardAssets(createLegacyInitialState(1000));
    expect(plan.critical.find(asset => asset.key === 'legacy-foods')?.path).toBe('assets/foods.webp');
  });
  it('uses mobile textures within 128 physical pixels and original artwork for details', () => {
    const original = 'assets/v3-b/fresh-veg-1.webp';
    expect(mobileAssetPath(original)).toMatch(/^assets\/mobile\/fresh-veg-1-[a-f0-9]{12}\.webp$/);
    expect(sizedArtPath(original, 40, 3)).toBe(mobileAssetPath(original));
    expect(sizedArtPath(original, 88, 3)).toBe(original);
    expect(mobileAssetPath('assets/items/tomato.svg')).toBe('assets/items/tomato.svg');
  });
  it('keeps derived images inside the agreed budget and preserves all original IDs', async () => {
    const mobile = JSON.parse(await readFile('public/assets/mobile-manifest.json', 'utf8'));
    const original = JSON.parse(await readFile('public/assets/v3-manifest.json', 'utf8'));
    expect(mobile.map((row: any) => row.id).sort()).toEqual(original.map((row: any) => row.id).sort());
    expect(mobile.reduce((sum: number, row: any) => sum + row.bytes, 0)).toBeLessThanOrEqual(2.25 * 1024 * 1024);
  });
});

describe('bounded foreground scheduling', () => {
  it('shares requests, promotes queued visible work and keeps exactly four active slots', async () => {
    const queue = new AssetQueue<number>(4), started: number[] = [], release: (() => void)[] = [];
    const run = (id: number) => () => new Promise<number>(resolve => { started.push(id); release[id] = () => resolve(id); });
    const tasks = Array.from({ length: 8 }, (_, id) => queue.request(String(id), 2, run(id)));
    const promoted = queue.request('7', 0, vi.fn());
    expect(promoted).toBe(tasks[7]);
    await Promise.resolve(); expect(started).toEqual([0, 1, 2, 3]);
    release[0](); await vi.waitFor(() => expect(started).toEqual([0, 1, 2, 3, 7]));
    for (const id of [1, 2, 3, 7]) release[id]();
    await vi.waitFor(() => expect(started).toHaveLength(8));
    for (const id of [4, 5, 6]) release[id]();
    expect(await Promise.all(tasks)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('releases failed slots and allows an explicit retry', async () => {
    const queue = new AssetQueue<number>(1);
    await expect(queue.request('image', 0, async () => { throw new Error('offline'); })).rejects.toThrow('offline');
    await vi.waitFor(async () => { await expect(queue.request('image', 0, async () => 3)).resolves.toBe(3); });
  });
});

describe('decoration load budget', () => {
  it('reduces decorations after sustained slow frames, recovers gradually and ignores a background gap', () => {
    const budget = new DecorationBudget(); let now = 0;
    for (let index = 0; index < 240; index++) budget.sample(now += 34);
    expect(budget.reduced).toBe(true);
    budget.sample(now += 60000); expect(budget.reduced).toBe(true);
    for (let index = 0; index < 700; index++) budget.sample(now += 16);
    expect(budget.reduced).toBe(false);
  });
});
