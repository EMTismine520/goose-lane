import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { createInitialState, createLegacyInitialState } from '../src/domain/engine';
import { createUiPreviewState } from '../src/diagnostics/ui-preview-state';
import { planBoardAssets } from '../src/game/board-assets';
import { AssetQueue } from '../src/platform/asset-queue';
import { DecorationBudget } from '../src/platform/performance';
import { deviceAssetPath, itemAssetPath, mobileAssetPath, sizedArtPath } from '../src/content/assets';

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
  it('resolves the same selected picture through compact and detail entrypoints', () => {
    const original = 'assets/v3-b/fresh-veg-1.webp';
    expect(mobileAssetPath(original)).toMatch(/^assets\/mobile\/fresh-veg-1-128-[a-f0-9]{12}\.webp$/);
    expect(sizedArtPath(original, 40, 3)).toBe(mobileAssetPath(original));
    expect(sizedArtPath(original, 88, 3)).toBe(original);
    expect(mobileAssetPath('assets/items/tomato.svg')).toBe('assets/items/tomato.svg');
  });
  it('preserves all selected 512 exports and derives both runtime sizes from their approved canvases', async () => {
    const mobile = JSON.parse(await readFile('public/assets/mobile-manifest.json', 'utf8'));
    const original = JSON.parse(await readFile('public/assets/v3-manifest.json', 'utf8'));
    const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
    expect(original).toHaveLength(323);
    expect(mobile).toHaveLength(646);
    expect(mobile.filter((row: any) => row.width === 128).map((row: any) => row.id).sort()).toEqual(original.map((row: any) => row.id).sort());
    expect(mobile.every((row: any) => row.sourceSha256 === original.find((source: any) => source.id === row.id)?.sha256)).toBe(true);
    for (const source of original) {
      expect(source.mode, source.id).toBe('plan4-selected-export');
      const alias = mobile.find((row: any) => row.id === source.id && row.width === 128)!;
      const [formalBytes, mobileBytes, selectedBytes] = await Promise.all([
        readFile('public/' + source.path), readFile('public/' + alias.path), readFile(source.selectedExports.image),
      ]);
      expect(formalBytes.equals(selectedBytes), source.id + ' selected image').toBe(true);
      expect(digest(formalBytes), source.id).toBe(source.selectedExports.sha256.image);
      expect(digest(mobileBytes), source.id).toBe(alias.sha256);
      const metadata = await sharp(formalBytes).metadata();
      expect([metadata.width, metadata.height, metadata.hasAlpha], source.id).toEqual([512, 512, true]);
      expect(source.kind === 'device' ? deviceAssetPath(source.id) : itemAssetPath(source.id), source.id).toBe(source.path);
      expect(mobileAssetPath(source.path), source.id).toBe(alias.path);
      expect(sizedArtPath(source.path, 40, 3), source.id).toBe(alias.path);
      expect(sizedArtPath(source.path, 100, 3), source.id).toBe(source.path);
      const mid = mobile.find((row: any) => row.id === source.id && row.width === 256)!;
      expect(sizedArtPath(source.path, 100, 2), source.id).toBe(mid.path);
      for (const row of [alias, mid]) {
        const bytes = await readFile('public/' + row.path), meta = await sharp(bytes).metadata();
        expect([meta.width, meta.height, meta.hasAlpha], source.id).toEqual([row.width,row.width,true]);
        expect(digest(bytes), source.id).toBe(row.sha256);
        // Dimensions and padding are derived from the entire approved canvas, with no trim or redraw.
        const expected = await sharp(formalBytes).resize(row.width,row.width,{kernel:'lanczos3'}).raw().toBuffer();
        const actual = await sharp(bytes).raw().toBuffer();
        // RGB beneath fully transparent pixels is intentionally discarded by lossless WebP.
        for (let i=0;i<expected.length;i+=4) if(expected[i+3]===0) { expected[i]=expected[i+1]=expected[i+2]=0; actual[i]=actual[i+1]=actual[i+2]=0; }
        expect(actual.equals(expected), source.id + '/' + row.width).toBe(true);
      }
    }
  }, 30000);
});

describe('bounded foreground scheduling', () => {
  it('releases an abandoned consumer without cancelling a shared visible task', async () => {
    const queue = new AssetQueue<number>(1); let finish!: (value:number)=>void;
    const run = vi.fn((_signal:AbortSignal)=>new Promise<number>(resolve=>{finish=resolve;}));
    const first = queue.acquire('same',0,run), second = queue.acquire('same',1,run);
    await Promise.resolve();first.release();expect(run.mock.calls[0][0].aborted).toBe(false);
    finish(7);expect(await second.promise).toBe(7);second.release();
  });
  it('removes queued work once its last consumer is gone', async () => {
    const queue = new AssetQueue<number>(1); let finish!: (value:number)=>void;
    const active=queue.request('active',0,()=>new Promise<number>(resolve=>{finish=resolve;}));
    const run=vi.fn(async()=>2), lease=queue.acquire('offscreen',2,run);
    const rejected=expect(lease.promise).rejects.toMatchObject({name:'AbortError'});
    lease.release();await rejected;await Promise.resolve();finish(1);await active;expect(run).not.toHaveBeenCalled();
  });
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
