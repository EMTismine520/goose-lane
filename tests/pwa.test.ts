import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash, webcrypto } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { registerPwa, type ActivateUpdate } from '../src/platform/pwa';

interface Asset { url: string; size: number; integrity: string; stage?: number; role?: string; variant?: string; }
const scriptUrl = pathToFileURL(path.resolve('scripts/build-sw.mjs')).href;
const builder = await import(scriptUrl) as {
  collectAssets: (directory: string) => Promise<Asset[]>;
  renderServiceWorker: (assets: Asset[], coreUrls?: string[]) => string;
  buildServiceWorker: (directory: string) => Promise<{ files: number; bytes: number }>;
};
const assetsFor = (files: Record<string, string>): Asset[] => Object.entries(files).map(([url, body]) => ({
  url, size: Buffer.byteLength(body), integrity: 'sha256-' + createHash('sha256').update(body).digest('base64'),
}));

describe('current chapter without a stage barrier',()=>{
  it('prepares the requested chapter and every other chapter together',async()=>{
    const files={'index.html':'game','assets/mobile/tea.webp':'tea','assets/mobile/bar.webp':'bar','assets/mobile/oven.webp':'oven'};
    const metadata=Object.fromEntries(Object.keys(files).filter(p=>p.endsWith('.webp')).map((p,i)=>[p,{role:'art',variant:'mobile',stage:i+3}]));
    const h=workerHarness(files,metadata,['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'chapter',urls:['assets/mobile/tea.webp','assets/mobile/bar.webp']});
    expect(h.fetcher.mock.calls.map(([r])=>r.url)).toEqual(Object.keys(metadata).map(url=>h.scope+url));
    expect(h.messages.at(-1)).toMatchObject({currentReady:true,fullReady:true});
    h.fetcher.mockClear();await h.lifecycle('message',{type:'PREPARE_GAME',urls:['https://other.test/data']});expect(h.fetcher).not.toHaveBeenCalled();
  });
});

const cleanups: (()=>void)[]=[];
function workerHarness(files: Record<string, string>, metadata: Record<string, Partial<Asset>> = {}, coreUrls?: string[]) {
  const scope = 'https://example.test/game/';
  const listeners = new Map<string, (event: any) => void>();
  const stores = new Map<string, Map<string, Response>>();
  const storedHeaders=new Map<string,Headers>();
  const timers=new Set<ReturnType<typeof setTimeout>>(), writes:string[]=[];
  const clock=(fn:()=>void,ms:number)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);return id;};
  const clearClock=(id:ReturnType<typeof setTimeout>)=>{timers.delete(id);clearTimeout(id);};
  const stop=()=>{for(const id of timers)clearTimeout(id);timers.clear();};cleanups.push(stop);
  const key = (value: any) => typeof value === 'string' ? value : value.url ?? String(value);
  const fetcher = vi.fn(async (request: any) => {
    const name = key(request).replace(scope, '');
    if (!(name in files)) return new Response('missing', { status: 404 });
    return new Response(files[name]);
  });
  const open = async (name: string) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name)!;
    return {
      match: async (request: any, options?:{ignoreVary?:boolean}) => {
        const response=store.get(key(request));if(!response)return;
        if(!options?.ignoreVary&&response.headers.get('Vary')?.toLowerCase()==='origin'){
          const saved=storedHeaders.get(name+'|'+key(request))?.get('Origin')??null;
          const current=typeof request==='string'?null:request.headers?.get('Origin')??null;
          if(saved!==current)return;
        }
        return response.clone();
      },
      put: async (request: any, response: Response) => { writes.push(key(request));store.set(key(request), response.clone());storedHeaders.set(name+'|'+key(request),new Headers(typeof request==='string'?undefined:request.headers)); },
      keys: async () => [...store.keys()].map(url => new Request(url)),
      addAll: async (requests: Request[]) => {
        const responses = await Promise.all(requests.map(async request => {
          const response = await fetcher(request);
          if (!response.ok) throw new Error('Precache fetch failed');
          return response;
        }));
        requests.forEach((request, index) => {store.set(key(request), responses[index]);storedHeaders.set(name+'|'+key(request),new Headers(request.headers));});
      },
    };
  };
  const cacheApi = { open, keys: vi.fn(async () => [...stores.keys()]), delete: vi.fn(async (name: string) => stores.delete(name)) };
  const skipWaiting = vi.fn(async () => {});
  const claim = vi.fn(async () => {});
  const messages:any[]=[];
  const matchAll=vi.fn(async()=>[{id:'window-1',visibilityState:'visible'}]);
  const boot = () => runInNewContext(builder.renderServiceWorker(assetsFor(files).map(asset => ({ ...asset, ...metadata[asset.url] })), coreUrls), {
    self: { registration: { scope }, location: { origin: 'https://example.test' }, clients: { claim,matchAll }, skipWaiting,
      addEventListener: (event: string, handler: (event: any) => void) => listeners.set(event, handler) },
    caches: cacheApi, fetch: (input:any,init?:RequestInit)=>fetcher(typeof input==='string'?new Request(input,init):input), Request, Response, Headers, URL, crypto: webcrypto, Uint8Array, btoa, AbortController, DOMException, Date, setTimeout:clock, clearTimeout:clearClock,
  });
  boot();
  return {
    scope, stores, fetcher, skipWaiting, claim, cacheApi,messages,writes,matchAll, restart:()=>{stop();boot();},
    lifecycle: async (name: string, data?: unknown, clientId='window-1') => {
      let pending: Promise<void> | undefined;
      listeners.get(name)!({ data,source:{id:clientId,postMessage:(value:any)=>messages.push(value)}, waitUntil: (value: Promise<void>) => { pending = value; } });
      await pending;
    },
    request: async (request: { url: string; method: string; mode: string } | Request) => {
      let response: Promise<Response> | undefined;
      listeners.get('fetch')!({ request, respondWith: (value: Promise<Response>) => { response = value; }, waitUntil: (value: Promise<void>) => { void value.catch(() => {}); } });
      return response ? await response : undefined;
    },
  };
}

afterEach(() => {cleanups.splice(0).forEach(stop=>stop());vi.unstubAllGlobals();vi.unstubAllEnvs();vi.useRealTimers();});

describe('production offline release', () => {
  it('hashes output contents, excludes sw/source maps, and writes a deterministic worker', async () => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'goose-pwa-'));
    try {
      await mkdir(path.join(temporary, 'assets'));
      await writeFile(path.join(temporary, 'index.html'), '<html>v1</html>');
      await writeFile(path.join(temporary, 'assets', 'app-abc.js'), 'export {}');
      await writeFile(path.join(temporary, 'assets', 'app-abc.js.map'), '{}');
      const first = await builder.buildServiceWorker(temporary);
      const source = await readFile(path.join(temporary, 'sw.js'), 'utf8');
      expect(first.files).toBe(2);
      await builder.buildServiceWorker(temporary);
      expect(await readFile(path.join(temporary, 'sw.js'), 'utf8')).toBe(source);
      await writeFile(path.join(temporary, 'assets', 'app-abc.js'), 'export const changed=true');
      await builder.buildServiceWorker(temporary);
      expect(await readFile(path.join(temporary, 'sw.js'), 'utf8')).not.toBe(source);
    } finally {
      if (path.dirname(path.resolve(temporary)) !== path.resolve(tmpdir()) || !path.basename(temporary).startsWith('goose-pwa-')) throw new Error('Unexpected PWA test cleanup path');
      await rm(temporary, { recursive: true, force: true });
    }
  });

  it('refuses incomplete or oversized release manifests', () => {
    expect(() => builder.renderServiceWorker([])).toThrow('index.html');
    expect(() => builder.renderServiceWorker([{ ...assetsFor({ 'index.html': 'ok' })[0], size: 5 * 1024 * 1024 + 1 }])).toThrow('5 MiB');
  });

  it('installs a complete release atomically and does not skip waiting automatically', async () => {
    const worker = workerHarness({ 'index.html': 'release one', 'assets/app-abcd.js': 'code' });
    await worker.lifecycle('install');
    expect([...worker.stores.values()][0].size).toBe(2);
    expect(worker.skipWaiting).not.toHaveBeenCalled();
    await worker.lifecycle('message', { type: 'UNRELATED' });
    expect(worker.skipWaiting).not.toHaveBeenCalled();
    await worker.lifecycle('message', { type: 'SKIP_WAITING' });
    expect(worker.skipWaiting).toHaveBeenCalledOnce();
  });
  it.each(['v3','v3-b'])('keeps %s theme assets out of install and makes a downloaded theme available offline',async directory=>{
    const drink=`assets/${directory}/dish-fresh-ico-0009.webp`,cart=`assets/${directory}/vegetable-cart-l1.webp`;
    const worker=workerHarness({'index.html':'game',[drink]:'milk tea',[cart]:'cart'},{[drink]:{role:'art',variant:'large',stage:3},[cart]:{role:'art',variant:'large',stage:1}});
    await worker.lifecycle('install');
    expect([...worker.stores.values()][0].size).toBe(2);
    expect([...worker.stores.values()][0].has(worker.scope+drink)).toBe(false);
    await worker.lifecycle('message',{type:'PREPARE_GAME',requestId:'all',urls:[cart]});
    expect(worker.messages.at(-1)).toMatchObject({fullReady:true});
    worker.fetcher.mockRejectedValue(new Error('offline'));
    const image=await worker.request(new Request(worker.scope+drink));
    expect(await image!.text()).toBe('milk tea');
  });

  it('removes an incomplete new cache without deleting the previous release', async () => {
    const worker = workerHarness({ 'index.html': 'release one', 'assets/app-abcd.js': 'code' });
    worker.stores.set('goose-lane::https://example.test/game/::old-version', new Map());
    worker.fetcher.mockRejectedValue(new Error('Disconnected'));
    await expect(worker.lifecycle('install')).rejects.toThrow('Disconnected');
    expect([...worker.stores.keys()]).toEqual(['goose-lane::https://example.test/game/::old-version']);
  });

  it('serves offline navigation/assets and pins HTML to the installed release', async () => {
    const worker = workerHarness({ 'index.html': '<html>release one</html>', 'assets/app-abcd.js': 'old code' });
    await worker.lifecycle('install');
    worker.fetcher.mockClear();
    const asset = await worker.request(new Request(worker.scope + 'assets/app-abcd.js'));
    expect(await asset!.text()).toBe('old code');
    expect(worker.fetcher).not.toHaveBeenCalled();
    worker.fetcher.mockResolvedValue(new Response('<html>release two</html>'));
    const newer = await worker.request({ url: worker.scope, method: 'GET', mode: 'navigate' });
    expect(await newer!.text()).toBe('<html>release one</html>');
    worker.fetcher.mockRejectedValue(new Error('offline'));
    const offline = await worker.request({ url: worker.scope, method: 'GET', mode: 'navigate' });
    expect(await offline!.text()).toBe('<html>release one</html>');
  });
  it('serves integrity-pinned modules offline when CORS adds an Origin header after precaching',async()=>{
    const worker=workerHarness({'index.html':'game','assets/app-cors.js':'verified module'});
    worker.fetcher.mockImplementation(async(request:any)=>new Response(String(request.url??request).endsWith('.js')?'verified module':'game',{headers:{Vary:'Origin'}}));
    await worker.lifecycle('install');
    worker.fetcher.mockRejectedValue(new Error('offline'));
    const module=await worker.request(new Request(worker.scope+'assets/app-cors.js',{headers:{Origin:'https://example.test'}}));
    expect(await module!.text()).toBe('verified module');
  });

  it('lets standalone comparison pages navigate without substituting the game shell', async () => {
    const worker = workerHarness({ 'index.html': 'game', 'food-styles.html': 'comparison', 'food-style-frame.html': 'samples' });
    await worker.lifecycle('install');
    for (const page of ['food-styles.html', 'food-style-frame.html?style=cartoon']) {
      expect(await worker.request({ url: worker.scope + page, method: 'GET', mode: 'navigate' })).toBeUndefined();
    }
    expect(await (await worker.request({ url: worker.scope + 'index.html?mode=normal', method: 'GET', mode: 'navigate' }))!.text()).toBe('game');
  });

  it('opens the healthy online release when an old worker has lost its cached HTML', async () => {
    const worker = workerHarness({ 'index.html': 'old release', 'assets/old.js': 'old chunk' });
    await worker.lifecycle('install');
    const cache = [...worker.stores.values()][0];
    cache.delete(worker.scope + 'index.html');
    worker.fetcher.mockResolvedValue(new Response('<html>new release</html>'));
    const response = await worker.request({ url: worker.scope, method: 'GET', mode: 'navigate' });
    expect(await response!.text()).toBe('<html>new release</html>');
    expect(cache.has(worker.scope + 'index.html')).toBe(false);
    expect(await cache.get(worker.scope + 'assets/old.js')!.clone().text()).toBe('old chunk');
    expect(worker.skipWaiting).not.toHaveBeenCalled();
  });

  it.each(['offline', 'HTTP failure'])('provides a readable recovery route when the shell is missing and the network has %s', async failure => {
    const worker = workerHarness({ 'index.html': 'old release' });
    await worker.lifecycle('install');
    [...worker.stores.values()][0].delete(worker.scope + 'index.html');
    if (failure === 'offline') worker.fetcher.mockRejectedValue(new Error('offline'));
    else worker.fetcher.mockResolvedValue(new Response('server error', { status: 502 }));
    const response = await worker.request({ url: worker.scope, method: 'GET', mode: 'navigate' });
    expect(response!.status).toBe(503);
    expect(response!.headers.get('Content-Type')).toContain('text/html');
    expect(response!.headers.get('Cache-Control')).toBe('no-store');
    const html = await response!.text();
    expect(html).toContain('name="viewport"');
    expect(html).toContain('重新加载');
    expect(html).toContain('https://emtismine520.github.io/goose-lane-art-preview/recover.html');
  });

  it('retains only the most recent previous release and ignores external/non-GET/API requests', async () => {
    const worker = workerHarness({ 'index.html': 'release one' });
    await worker.lifecycle('install');
    worker.stores.set('goose-lane::https://example.test/game/::obsolete', new Map());
    worker.stores.set('goose-lane::https://example.test/game/::old', new Map());
    worker.stores.set('goose-lane::https://example.test/other/::old', new Map());
    await worker.lifecycle('activate');
    expect(worker.claim).toHaveBeenCalledOnce();
    expect(worker.stores.has('goose-lane::https://example.test/game/::obsolete')).toBe(false);
    expect(worker.stores.has('goose-lane::https://example.test/game/::old')).toBe(true);
    expect(worker.stores.has('goose-lane::https://example.test/other/::old')).toBe(true);
    expect(await worker.request(new Request('https://elsewhere.test/index.html'))).toBeUndefined();
    expect(await worker.request(new Request(worker.scope + 'index.html', { method: 'POST', body: 'save' }))).toBeUndefined();
    expect(await worker.request(new Request(worker.scope + 'api/save'))).toBeUndefined();
  });
  it('serves the previous release lazy chunk offline after claiming an older open window', async () => {
    const worker = workerHarness({ 'index.html': 'new release', 'assets/app-new.js': 'new code' });
    const oldChunk = worker.scope + 'assets/Board-oldhash.js';
    worker.stores.set('goose-lane::https://example.test/game/::previous', new Map([[oldChunk, new Response('old board chunk')]]));
    await worker.lifecycle('install'); await worker.lifecycle('activate');
    worker.fetcher.mockRejectedValue(new Error('offline'));
    const response = await worker.request(new Request(oldChunk));
    expect(await response!.text()).toBe('old board chunk');
    expect([...worker.stores.keys()].filter((name) => name.startsWith('goose-lane::https://example.test/game/::'))).toHaveLength(2);
  });
});


describe('mobile resource scheduling and fast navigation', () => {
  it('returns the cached shell without awaiting a stalled network', async () => {
    const worker = workerHarness({ 'index.html': 'installed shell' });
    await worker.lifecycle('install'); worker.fetcher.mockClear();
    worker.fetcher.mockImplementation(() => new Promise(() => {}));
    const response = await worker.request({url:worker.scope,method:'GET',mode:'navigate'});
    expect(await response!.text()).toBe('installed shell');
    expect(worker.fetcher).not.toHaveBeenCalled();
  });
  it('automatically downloads every art variant and excludes review pages', async () => {
    const files={'index.html':'shell','assets/mobile/a-hash.webp':'small','assets/v3-b/a.webp':'large','ui-preview.html':'preview'};
    const metadata:Record<string,Partial<Asset>>={
      'assets/mobile/a-hash.webp':{role:'art',variant:'mobile',stage:1},
      'assets/v3-b/a.webp':{role:'art',variant:'large',stage:1},
    };
    const worker=workerHarness(files,metadata,['index.html']);await worker.lifecycle('install');
    expect([...worker.stores.values()][0].size).toBe(1);
    await worker.lifecycle('message',{type:'PREPARE_GAME',requestId:'all',urls:[]});
    const requested=worker.fetcher.mock.calls.map(([request])=>String(request.url??request));
    expect(requested.some(url=>url.endsWith('assets/mobile/a-hash.webp'))).toBe(true);
    expect(requested.some(url=>url.endsWith('assets/v3-b/a.webp'))).toBe(true);
    expect(requested.some(url=>url.endsWith('ui-preview.html'))).toBe(false);
  });
  it('shares simultaneous foreground image misses', async () => {
    const image='assets/mobile/image.webp';
    const worker=workerHarness({'index.html':'shell',[image]:'image'}, {[image]:{role:'art',variant:'mobile',stage:1}},['index.html']);
    await worker.lifecycle('install');worker.fetcher.mockClear();
    let release!:(response:Response)=>void;
    worker.fetcher.mockImplementation(()=>new Promise<Response>(resolve=>{release=resolve;}));
    const first=worker.request(new Request(worker.scope+image)),second=worker.request(new Request(worker.scope+image));
    await vi.waitFor(()=>expect(worker.fetcher).toHaveBeenCalledOnce());release(new Response('image'));
    expect(await (await first)!.text()).toBe('image');expect(await (await second)!.text()).toBe('image');
  });
  it('does not let input or hidden-page pause messages block the complete download', async () => {
    const a='assets/mobile/a.webp',b='assets/mobile/b.webp';
    const worker=workerHarness({'index.html':'shell',[a]:'a',[b]:'b'},{[a]:{role:'art',variant:'mobile',stage:1},[b]:{role:'art',variant:'mobile',stage:1}},['index.html']);
    await worker.lifecycle('install');worker.fetcher.mockClear();
    await worker.lifecycle('message',{type:'CACHE_PAUSE',visible:false});
    await worker.lifecycle('message',{type:'PREPARE_GAME',requestId:'all',urls:[a]});
    expect(worker.fetcher).toHaveBeenCalledTimes(2);
    await worker.lifecycle('message',{type:'CACHE_RESUME'});
    expect(worker.fetcher).toHaveBeenCalledTimes(2);
    await worker.lifecycle('message',{type:'PREPARE_GAME',requestId:'all',urls:[a]});
    expect(worker.fetcher).toHaveBeenCalledTimes(2);
  });
  it('continues serving online resources when browser cache storage is unavailable', async () => {
    const worker=workerHarness({'index.html':'shell','assets/app.js':'code'});await worker.lifecycle('install');
    worker.cacheApi.open=async()=>{throw new Error('quota exceeded');};
    expect(await (await worker.request(new Request(worker.scope+'assets/app.js')))!.text()).toBe('code');
  });
  it('reuses a previous cached resource only when its new integrity still matches', async () => {
    const worker=workerHarness({'index.html':'new shell','assets/app.js':'new code'});
    worker.stores.set('goose-lane::'+worker.scope+'::previous',new Map([[worker.scope+'assets/app.js',new Response('different old code')]]));
    await worker.lifecycle('install');
    expect(await (await worker.request(new Request(worker.scope+'assets/app.js')))!.text()).toBe('new code');
  });
});

describe('explicit update activation', () => {
  it('announces a waiting release but reloads only after the player accepts and the controller changes', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('BASE_URL', './');
    const serviceWorker = Object.assign(new EventTarget(), { controller: {}, register: vi.fn() });
    const waiting = { postMessage: vi.fn() };
    const registration = Object.assign(new EventTarget(), { waiting, installing: null, update: vi.fn(async () => {}) });
    serviceWorker.register.mockResolvedValue(registration);
    const documentMock = Object.assign(new EventTarget(), { baseURI: 'https://example.test/game/', visibilityState: 'visible' });
    const reload = vi.fn();
    vi.stubGlobal('navigator', { serviceWorker });
    vi.stubGlobal('document', documentMock);
    vi.stubGlobal('window', Object.assign(new EventTarget(), { location: { reload } }));
    let activate: ActivateUpdate | undefined;
    const cleanup = registerPwa(callback => { activate = callback; });
    await Promise.resolve();
    expect(serviceWorker.register).toHaveBeenCalledWith('https://example.test/game/sw.js', { scope: '/game/', updateViaCache: 'none' });
    expect(activate).toBeTypeOf('function');
    expect(waiting.postMessage).not.toHaveBeenCalled();
    documentMock.dispatchEvent(new Event('visibilitychange'));
    expect(registration.update).toHaveBeenCalledOnce();
    serviceWorker.dispatchEvent(new Event('controllerchange'));
    expect(reload).not.toHaveBeenCalled();
    const completed = activate!();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(reload).not.toHaveBeenCalled();
    serviceWorker.dispatchEvent(new Event('controllerchange'));
    await completed;
    expect(reload).toHaveBeenCalledOnce();
    cleanup();
    serviceWorker.dispatchEvent(new Event('controllerchange'));
    expect(reload).toHaveBeenCalledOnce();
  });

  it('does not register a worker during development', () => {
    vi.stubEnv('PROD', false);
    const register = vi.fn();
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    registerPwa(() => {} )();
    expect(register).not.toHaveBeenCalled();
  });
});


describe('automatic complete game preparation', () => {
  const a='assets/mobile/a.webp', b='assets/mobile/b.webp', mid='assets/mobile/a-256.webp', hd='assets/v3-b/a.webp', code='assets/panel.js';
  const files={'index.html':'shell',[a]:'a',[b]:'b',[mid]:'medium',[hd]:'original',[code]:'code','art-review.html':'review'};
  const meta={ [a]:{role:'art',variant:'mobile',stage:1}, [b]:{role:'art',variant:'mobile',stage:8}, [mid]:{role:'art',variant:'medium',stage:1}, [hd]:{role:'art',variant:'large',stage:1}, [code]:{role:'code'} };
  it('submits current resources, all chapters, code and high resolution without a stage barrier', async () => {
    const h=workerHarness(files,meta,['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    await h.lifecycle('message',{type:'CACHE_PAUSE',visible:false});
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'one',urls:[b]});
    await h.lifecycle('message',{type:'CACHE_RESUME'});
    const downloaded=h.fetcher.mock.calls.map(([r])=>r.url.replace(h.scope,''));
    expect(downloaded[0]).toBe(b);expect(downloaded).toContain(hd);
    expect(downloaded).not.toContain('art-review.html');expect(new Set(downloaded).size).toBe(downloaded.length);
    expect(h.messages.at(-1)).toMatchObject({type:'GAME_CACHE_STATE',requestId:'one',currentReady:true,playableReady:true,fullReady:true,state:'complete',totalFiles:6});
  });
  it('restores intent after worker termination and only fetches missing files', async () => {
    const h=workerHarness(files,meta,['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    await h.request(new Request(h.scope+a));
    await vi.waitFor(()=>expect([...h.stores.values()].some(store=>store.has(h.scope+a))).toBe(true));
    expect(h.fetcher.mock.calls.map(([r])=>r.url)).toEqual([h.scope+a]);
    h.restart();h.fetcher.mockClear();
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'second',urls:[a]});
    expect(h.fetcher.mock.calls.some(([r])=>r.url===h.scope+a)).toBe(false);
    expect(h.messages.at(-1)).toMatchObject({requestId:'second',fullReady:true});
  });
  it('persists player pause across reopens, while foreground resources remain usable', async () => {
    const h=workerHarness(files,meta,['index.html']);await h.lifecycle('install');
    await h.lifecycle('message',{type:'GAME_DOWNLOAD_PAUSE',requestId:'first',paused:true});
    h.restart();h.fetcher.mockClear();
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'second',urls:[a]});await h.lifecycle('message',{type:'CACHE_RESUME'});
    expect(h.fetcher).not.toHaveBeenCalled();expect(h.messages.at(-1)).toMatchObject({state:'paused',fullReady:false});
    expect(await(await h.request(new Request(h.scope+a)))!.text()).toBe('a');
    await h.lifecycle('message',{type:'GAME_DOWNLOAD_PAUSE',requestId:'second',paused:false});expect(h.messages.at(-1)).toMatchObject({fullReady:true});
  });
  it('reports storage failure without marking the complete package ready and still serves online assets', async () => {
    const h=workerHarness(files,meta,['index.html']);await h.lifecycle('install');
    const open=h.cacheApi.open;
    h.cacheApi.open=async name=>{const cache=await open(name);if(name.endsWith('::themes'))return {...cache,put:async()=>{throw new DOMException('Full','QuotaExceededError')}};return cache;};
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'one',urls:[a]});
    expect(h.messages.at(-1)).toMatchObject({state:'storage',fullReady:false});
    expect(await(await h.request(new Request(h.scope+a)))!.text()).toBe('a');
  });
  it('rejects foreign and unclassified URLs before starting preparation', async () => {
    const h=workerHarness(files,meta,['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    for(const urls of [['https://foreign.test/a.webp'],['art-review.html']])await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'one',urls});
    expect(h.fetcher).not.toHaveBeenCalled();
  });
  it('can retry when resource metadata storage becomes available again', async () => {
    const h=workerHarness(files,meta,['index.html']);await h.lifecycle('install');const open=h.cacheApi.open;
    h.cacheApi.open=async()=>{throw new DOMException('Unavailable','QuotaExceededError');};
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'one',urls:[a]});expect(h.messages.at(-1)).toMatchObject({state:'storage'});
    h.cacheApi.open=open;
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'two',urls:[a]});expect(h.messages.at(-1)).toMatchObject({fullReady:true});
  });
});

describe('V12 unrestricted resource preparation', () => {
  const art = (urls: string[]) => Object.fromEntries(urls.map((url,i)=>[url,{role:'art',variant:i%3===0?'large':i%3===1?'medium':'mobile',stage:i%8+1}]));
  it('starts all 64 files before any response, sharing foreground, background and window consumers', async()=>{
    const images=Array.from({length:64},(_,i)=>`assets/mobile/file-${i}.webp`);
    const files={'index.html':'shell',...Object.fromEntries(images.map(url=>[url,url]))};
    const h=workerHarness(files,art(images),['index.html']); await h.lifecycle('install'); h.fetcher.mockClear();
    h.matchAll.mockResolvedValue([{id:'window-1',visibilityState:'visible'},{id:'window-2',visibilityState:'hidden'}]);
    const releases=new Map<string,(response:Response)=>void>();
    h.fetcher.mockImplementation(request=>new Promise<Response>(resolve=>{releases.set(request.url,resolve);}));
    const first=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'one',urls:[images[63]],diagnostic:true});
    await vi.waitFor(()=>expect(h.fetcher).toHaveBeenCalledTimes(64));
    const second=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'two',urls:[images[4]]},'window-2');
    const visible=[h.request(new Request(h.scope+images[0])),h.request(new Request(h.scope+images[0]))];
    expect(releases.size).toBe(64); expect(h.writes.filter(url=>url.endsWith('.webp'))).toHaveLength(0);
    for(const [url,release] of releases)release(new Response(url.replace(h.scope,'')));
    await Promise.all([first,second,...visible]);
    expect(h.fetcher).toHaveBeenCalledTimes(64);
    expect(h.writes.filter(url=>url===h.scope+images[0])).toHaveLength(1);
    expect(h.messages.at(-1)).toMatchObject({fullReady:true,totalFiles:65,completedFiles:65,totalBytes:Object.values(files).reduce((sum,v)=>sum+Buffer.byteLength(v),0)});
    const recorded=[...h.messages].reverse().find(message=>message.requestId==='one'&&message.diagnostics?.files);
    expect(recorded.diagnostics.files).toHaveLength(64);
    expect(h.cacheApi.keys.mock.calls.length).toBeLessThan(5);
  });
  it('lets healthy and high-resolution files finish while a failed file independently retries',async()=>{
    vi.useFakeTimers();
    const a='assets/mobile/a.webp',b='assets/v3-b/b.webp',files={'index.html':'shell',[a]:'a',[b]:'b'};
    const h=workerHarness(files,art([a,b]),['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    const normal=h.fetcher.getMockImplementation()!;let attempts=0;
    h.fetcher.mockImplementation(async request=>{if(request.url.endsWith('/a.webp')&&++attempts===1)throw new Error('temporary');return normal(request);});
    const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'retry',urls:[a]});
    await vi.waitFor(()=>expect(h.writes).toContain(h.scope+b));
    expect(h.fetcher.mock.calls.filter(([r])=>r.url===h.scope+b)).toHaveLength(1);
    expect(attempts).toBe(1);
    await vi.advanceTimersByTimeAsync(1100);await preparing;
    expect(attempts).toBe(2);expect(h.messages.at(-1)).toMatchObject({fullReady:true,failedFiles:0});
  });
  it('exhausts only the broken file and a manual retry keeps every completed file',async()=>{
    vi.useFakeTimers();
    const a='assets/mobile/a.webp',b='assets/mobile/b.webp',files={'index.html':'shell',[a]:'a',[b]:'b'};
    const h=workerHarness(files,art([a,b]),['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    const normal=h.fetcher.getMockImplementation()!;
    h.fetcher.mockImplementation(async request=>request.url===h.scope+a?new Response('missing',{status:404}):normal(request));
    const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'broken',urls:[a]});
    for(const [index,delay] of [1000,3000,10000].entries()){
      await vi.waitFor(()=>expect(h.fetcher.mock.calls.filter(([r])=>r.url===h.scope+a)).toHaveLength(index+1));
      await vi.advanceTimersByTimeAsync(delay+100);
    }
    await preparing;
    expect(h.messages.at(-1)).toMatchObject({fullReady:false,state:'network',failedFiles:1,completedFiles:2});
    h.fetcher.mockImplementation(normal);h.fetcher.mockClear();
    await h.lifecycle('message',{type:'GAME_DOWNLOAD_PAUSE',requestId:'fixed',paused:false});
    expect(h.fetcher.mock.calls.map(([r])=>r.url)).toEqual([h.scope+a]);
    expect(h.messages.at(-1)).toMatchObject({fullReady:true});
  });
  it('waits for every concurrent core write before removing an incomplete installation',async()=>{
    const h=workerHarness({'index.html':'shell','assets/app.js':'code'});
    let release!:(response:Response)=>void;
    h.fetcher.mockImplementation(request=>request.url.endsWith('.js')?new Promise<Response>(resolve=>{release=resolve;}):Promise.reject(new Error('failed core')));
    const installing=h.lifecycle('install'); const rejected=expect(installing).rejects.toThrow('failed core');
    await vi.waitFor(()=>expect(h.fetcher).toHaveBeenCalledTimes(2));
    expect(h.cacheApi.delete).not.toHaveBeenCalled();
    release(new Response('code'));await rejected;
    expect(h.stores.size).toBe(0);
  });
  it('does not abort a response that keeps making progress for longer than 30 seconds',async()=>{
    vi.useFakeTimers();const a='assets/mobile/slow.webp';
    const h=workerHarness({'index.html':'shell',[a]:'ab'},art([a]),['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    let sink!:ReadableStreamDefaultController<Uint8Array>,signal!:AbortSignal;
    h.fetcher.mockImplementation(async request=>{signal=request.signal;return new Response(new ReadableStream<Uint8Array>({start(controller){sink=controller;}}));});
    const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'slow',urls:[a]});
    await vi.waitFor(()=>expect(sink).toBeDefined());
    await vi.advanceTimersByTimeAsync(20000);sink.enqueue(new TextEncoder().encode('a'));
    await vi.advanceTimersByTimeAsync(20000);sink.enqueue(new TextEncoder().encode('b'));sink.close();
    await preparing;expect(signal.aborted).toBe(false);expect(h.fetcher).toHaveBeenCalledOnce();
    expect(h.messages.at(-1)).toMatchObject({fullReady:true});
  });
  it('joins only the uncontrolled URL at handoff while other files download immediately',async()=>{
    const a='assets/mobile/slow.webp',b='assets/mobile/fast.webp';
    const h=workerHarness({'index.html':'shell',[a]:'a',[b]:'b'},art([a,b]),['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
    const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'handoff',urls:[a],handoff:{session:'page',sequence:1,urls:[a]}});
    await vi.waitFor(()=>expect(h.writes).toContain(h.scope+b));
    expect(h.fetcher.mock.calls.map(([r])=>r.url)).toEqual([h.scope+b]);
    await h.lifecycle('message',{type:'ART_HANDOFF',requestId:'handoff',handoff:{session:'page',sequence:2,urls:[]}});
    await preparing;expect(h.fetcher.mock.calls.filter(([r])=>r.url===h.scope+a)).toHaveLength(1);
    expect(h.messages.at(-1)).toMatchObject({fullReady:true});
  });
  it('releases a handoff owned by a closed client, without pausing the other window',async()=>{
    vi.useFakeTimers();const a='assets/mobile/closed.webp';
    const h=workerHarness({'index.html':'shell',[a]:'a'},art([a]),['index.html']);await h.lifecycle('install');
    const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'gone',urls:[],handoff:{session:'page',sequence:1,urls:[a]}});
    await vi.waitFor(()=>expect(h.matchAll).toHaveBeenCalled());
    h.matchAll.mockResolvedValue([{id:'window-2',visibilityState:'visible'}]);
    await vi.advanceTimersByTimeAsync(1100);await preparing;
    expect([...h.stores.values()].some(store=>store.has(h.scope+a))).toBe(true);
  });
  it('only counts a shared file after its cache write completes and serves verified bytes sooner',async()=>{
    const a='assets/mobile/a.webp',files={'index.html':'shell',[a]:'a'};
    const h=workerHarness(files,art([a]),['index.html']);await h.lifecycle('install');
    const open=h.cacheApi.open;let release!:()=>void;
    h.cacheApi.open=async name=>{const cache=await open(name);return name.endsWith('::themes')?{...cache,put:async(r:any,response:Response)=>{await new Promise<void>(resolve=>{release=resolve;});await cache.put(r,response);}}:cache;};
    const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'writing',urls:[a]});
    const response=await h.request(new Request(h.scope+a));expect(await response!.text()).toBe('a');
    await vi.waitFor(()=>expect(release).toBeTypeOf('function'));
    expect(h.messages.at(-1).fullReady).toBe(false);
    release();await preparing;expect(h.messages.at(-1)).toMatchObject({fullReady:true,completedFiles:2});
  });
  it('reconciles deleted disk entries without a worker restart',async()=>{
    const a='assets/mobile/a.webp';const h=workerHarness({'index.html':'shell',[a]:'a'},art([a]),['index.html']);
    await h.lifecycle('install');await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'before',urls:[a]});
    for(const store of h.stores.values())store.delete(h.scope+a);
    h.fetcher.mockClear();
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'after',urls:[a],reconcile:true});
    expect(h.fetcher.mock.calls.map(([r])=>r.url)).toEqual([h.scope+a]);expect(h.messages.at(-1)).toMatchObject({fullReady:true});
  });
  it('normalizes compressed response headers and supports browsers without body streams',async()=>{
    const a='assets/mobile/a.webp';const h=workerHarness({'index.html':'shell',[a]:'a'},art([a]),['index.html']);await h.lifecycle('install');
    h.fetcher.mockImplementation(async()=>{
      const response=new Response('a',{headers:{'Content-Type':'image/webp','Content-Encoding':'gzip','Content-Length':'123'}});
      Object.defineProperty(response,'body',{value:null});return response;
    });
    await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'fallback',urls:[a]});
    const response=await h.request(new Request(h.scope+a));
    expect(await response!.text()).toBe('a');expect(response!.headers.get('Content-Encoding')).toBeNull();
    expect(response!.headers.get('Content-Length')).toBe('1');expect(response!.headers.get('Content-Type')).toBe('image/webp');
    expect(h.messages.at(-1)).toMatchObject({fullReady:true,bytesPerSecond:null});
  });
});

describe('pause and handoff races',()=>{
 it('keeps a foreground consumer alive through a manual pause and replaces cancelled optional work',async()=>{
  const a='assets/mobile/a.webp',b='assets/mobile/b.webp';
  const h=workerHarness({'index.html':'shell',[a]:'a',[b]:'b'},{[a]:{role:'art'},[b]:{role:'art'}},['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
  const pending:{request:Request;resolve:(r:Response)=>void}[]=[];
  h.fetcher.mockImplementation(request=>new Promise<Response>((resolve,reject)=>{pending.push({request,resolve});request.signal.addEventListener('abort',()=>reject(new DOMException('paused','AbortError')),{once:true});}));
  const initial=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'initial',urls:[]});
  await vi.waitFor(()=>expect(pending).toHaveLength(2));
  const visible=h.request(new Request(h.scope+a));
  await h.lifecycle('message',{type:'GAME_DOWNLOAD_PAUSE',requestId:'pause',paused:true});
  expect(pending[0].request.signal.aborted).toBe(false);expect(pending[1].request.signal.aborted).toBe(true);
  const resumed=h.lifecycle('message',{type:'GAME_DOWNLOAD_PAUSE',requestId:'resume',paused:false});
  await vi.waitFor(()=>expect(pending).toHaveLength(3));
  pending[0].resolve(new Response('a'));pending[2].resolve(new Response('b'));
  expect(await(await visible)!.text()).toBe('a');await Promise.all([initial,resumed]);
  expect(h.messages.at(-1)).toMatchObject({fullReady:true,failedFiles:0});
 });
 it('does not restore a stale pending handoff after a newer completion snapshot',async()=>{
  const a='assets/mobile/a.webp';const h=workerHarness({'index.html':'shell',[a]:'a'},{[a]:{role:'art'}},['index.html']);await h.lifecycle('install');
  await h.lifecycle('message',{type:'ART_HANDOFF',requestId:'new',handoff:{session:'page',sequence:10,urls:[]}});
  await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'old',urls:[],handoff:{session:'page',sequence:9,urls:[a]}});
  expect(h.messages.at(-1)).toMatchObject({fullReady:true});
 });
});

describe('integrity and browser queue time',()=>{
 it('never hands unverified code to a foreground consumer or the offline cache',async()=>{
  const a='assets/panel.js';const h=workerHarness({'index.html':'shell',[a]:'trusted code'},{[a]:{role:'code'}},['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
  h.fetcher.mockResolvedValue(new Response('untrusted bytes'));
  await expect(h.request(new Request(h.scope+a))).rejects.toThrow('Resource integrity check failed');
  expect(h.fetcher).toHaveBeenCalledTimes(2);
  expect(h.fetcher.mock.calls.map(([r])=>r.cache)).toEqual(['default','reload']);
  expect(h.writes).not.toContain(h.scope+a);
 });
 it('does not give queued requests a 30-second total deadline while the batch makes progress',async()=>{
  vi.useFakeTimers();const a='assets/mobile/queued.webp',b='assets/mobile/receiving.webp';
  const h=workerHarness({'index.html':'shell',[a]:'a',[b]:'ab'},{[a]:{role:'art'},[b]:{role:'art'}},['index.html']);await h.lifecycle('install');
  let release!:(r:Response)=>void,signal!:AbortSignal,sink!:ReadableStreamDefaultController<Uint8Array>;
  h.fetcher.mockImplementation(request=>request.url===h.scope+a?new Promise<Response>(resolve=>{signal=request.signal;release=resolve;}):Promise.resolve(new Response(new ReadableStream<Uint8Array>({start(c){sink=c;}}))));
  const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'queue',urls:[]});
  await vi.waitFor(()=>expect(sink).toBeDefined());
  await vi.advanceTimersByTimeAsync(20000);sink.enqueue(new TextEncoder().encode('a'));
  await vi.advanceTimersByTimeAsync(16000);expect(signal.aborted).toBe(false);
  release(new Response('a'));sink.enqueue(new TextEncoder().encode('b'));sink.close();await preparing;
  expect(h.messages.at(-1)).toMatchObject({fullReady:true});
 });
 it('retries a body that really stops delivering bytes without blocking the healthy file',async()=>{
  vi.useFakeTimers();const a='assets/mobile/stalled.webp',b='assets/mobile/healthy.webp';
  const h=workerHarness({'index.html':'shell',[a]:'a',[b]:'b'},{[a]:{role:'art'},[b]:{role:'art'}},['index.html']);await h.lifecycle('install');
  const normal=h.fetcher.getMockImplementation()!;let attempts=0;
  h.fetcher.mockImplementation(async request=>{
   if(request.url===h.scope+a&&++attempts===1)return new Response(new ReadableStream<Uint8Array>({start(c){request.signal.addEventListener('abort',()=>c.error(new DOMException('stalled','AbortError')),{once:true});}}));
   return normal(request);
  });
  const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'stall',urls:[]});
  await vi.waitFor(()=>expect(h.writes).toContain(h.scope+b));
  await vi.advanceTimersByTimeAsync(31200);await preparing;
  expect(attempts).toBe(2);expect(h.messages.at(-1)).toMatchObject({fullReady:true});
 });
});

describe('cache opening does not delay network submission',()=>{
 it('starts all missing fetches and serves verified responses before the new cache opens',async()=>{
  const a='assets/mobile/a.webp',b='assets/mobile/b.webp';const h=workerHarness({'index.html':'shell',[a]:'a',[b]:'b'},{[a]:{role:'art'},[b]:{role:'art'}},['index.html']);
  await h.lifecycle('install');h.fetcher.mockClear();const original=h.cacheApi.open;let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  h.cacheApi.open=async name=>{if(name.endsWith('::themes'))await gate;return original(name);};
  const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'cache-open',urls:[]});
  await vi.waitFor(()=>expect(h.fetcher).toHaveBeenCalledTimes(2));
  expect(await(await h.request(new Request(h.scope+a)))!.text()).toBe('a');
  expect(h.writes).not.toContain(h.scope+a);release();await preparing;
  expect(h.messages.at(-1)).toMatchObject({fullReady:true});
 });
});

describe('intent persistence alongside dispatch',()=>{
 it('downloads without waiting for metadata to finish saving',async()=>{
  const a='assets/mobile/a.webp';const h=workerHarness({'index.html':'shell',[a]:'a'},{[a]:{role:'art'}},['index.html']);await h.lifecycle('install');h.fetcher.mockClear();
  const original=h.cacheApi.open;let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
  h.cacheApi.open=async name=>{const cache=await original(name);return name.endsWith('::downloads')?{...cache,put:async(request:any,response:Response)=>{await gate;await cache.put(request,response);}}:cache;};
  const preparing=h.lifecycle('message',{type:'PREPARE_GAME',requestId:'parallel-meta',urls:[]});
  await vi.waitFor(()=>expect(h.writes).toContain(h.scope+a));
  expect(h.fetcher).toHaveBeenCalledOnce();release();await preparing;
  expect(h.messages.at(-1)).toMatchObject({fullReady:true});
 });
});

describe('cache inventory across activation',()=>{
 it('reuses the verified install inventory rather than blocking first preparation on a second scan',async()=>{
  const a='assets/mobile/a.webp';const h=workerHarness({'index.html':'shell',[a]:'a'},{[a]:{role:'art'}},['index.html']);
  await h.lifecycle('install');await h.lifecycle('activate');const enumerations=h.cacheApi.keys.mock.calls.length;
  await h.lifecycle('message',{type:'PREPARE_GAME',requestId:'installed-index',urls:[]});
  expect(h.cacheApi.keys).toHaveBeenCalledTimes(enumerations);expect(h.messages.at(-1)).toMatchObject({fullReady:true});
 });
});
