import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash, webcrypto } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { registerPwa, type ActivateUpdate } from '../src/platform/pwa';

interface Asset { url: string; size: number; integrity: string; }
const scriptUrl = pathToFileURL(path.resolve('scripts/build-sw.mjs')).href;
const builder = await import(scriptUrl) as {
  collectAssets: (directory: string) => Promise<Asset[]>;
  renderServiceWorker: (assets: Asset[]) => string;
  buildServiceWorker: (directory: string) => Promise<{ files: number; bytes: number }>;
};
const assetsFor = (files: Record<string, string>): Asset[] => Object.entries(files).map(([url, body]) => ({
  url, size: Buffer.byteLength(body), integrity: 'sha256-' + createHash('sha256').update(body).digest('base64'),
}));

function workerHarness(files: Record<string, string>) {
  const scope = 'https://example.test/game/';
  const listeners = new Map<string, (event: any) => void>();
  const stores = new Map<string, Map<string, Response>>();
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
      match: async (request: any) => store.get(key(request))?.clone(),
      put: async (request: any, response: Response) => { store.set(key(request), response.clone()); },
      addAll: async (requests: Request[]) => {
        const responses = await Promise.all(requests.map(async request => {
          const response = await fetcher(request);
          if (!response.ok) throw new Error('Precache fetch failed');
          return response;
        }));
        requests.forEach((request, index) => store.set(key(request), responses[index]));
      },
    };
  };
  const cacheApi = { open, keys: async () => [...stores.keys()], delete: vi.fn(async (name: string) => stores.delete(name)) };
  const skipWaiting = vi.fn(async () => {});
  const claim = vi.fn(async () => {});
  runInNewContext(builder.renderServiceWorker(assetsFor(files)), {
    self: { registration: { scope }, location: { origin: 'https://example.test' }, clients: { claim }, skipWaiting,
      addEventListener: (event: string, handler: (event: any) => void) => listeners.set(event, handler) },
    caches: cacheApi, fetch: fetcher, Request, Response, URL, crypto: webcrypto, Uint8Array, btoa,
  });
  return {
    scope, stores, fetcher, skipWaiting, claim, cacheApi,
    lifecycle: async (name: string, data?: unknown) => {
      let pending: Promise<void> | undefined;
      listeners.get(name)!({ data, waitUntil: (value: Promise<void>) => { pending = value; } });
      await pending;
    },
    request: async (request: { url: string; method: string; mode: string } | Request) => {
      let response: Promise<Response> | undefined;
      listeners.get('fetch')!({ request, respondWith: (value: Promise<Response>) => { response = value; } });
      return response ? await response : undefined;
    },
  };
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

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

  it('only removes obsolete caches in its scope, and ignores external/non-GET/API requests', async () => {
    const worker = workerHarness({ 'index.html': 'release one' });
    await worker.lifecycle('install');
    worker.stores.set('goose-lane::https://example.test/game/::old', new Map());
    worker.stores.set('goose-lane::https://example.test/other/::old', new Map());
    await worker.lifecycle('activate');
    expect(worker.claim).toHaveBeenCalledOnce();
    expect(worker.stores.has('goose-lane::https://example.test/game/::old')).toBe(false);
    expect(worker.stores.has('goose-lane::https://example.test/other/::old')).toBe(true);
    expect(await worker.request(new Request('https://elsewhere.test/index.html'))).toBeUndefined();
    expect(await worker.request(new Request(worker.scope + 'index.html', { method: 'POST', body: 'save' }))).toBeUndefined();
    expect(await worker.request(new Request(worker.scope + 'api/save'))).toBeUndefined();
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
