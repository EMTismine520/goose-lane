const SCOPE = self.registration.scope;
const PREFIX = 'goose-lane::' + SCOPE + '::';
const CACHE = PREFIX + VERSION;
const PACK_CACHE = CACHE + '::themes';
const INDEX = new URL('index.html', SCOPE).href;
const ASSET_ROOT = new URL('assets/', SCOPE).href;
const resources = new Map([...ASSETS, ...PACKS].map(asset => [new URL(asset.url, SCOPE).href, asset]));
const inflight = new Map();
const activities = new Map();
const pendingPacks = new Map();
let packWork;
let foreground = 0;

async function valid(response, asset) {
  if (!response || !response.ok) return false;
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  return 'sha256-' + btoa(String.fromCharCode(...new Uint8Array(digest))) === asset.integrity;
}

async function network(asset) {
  const url = new URL(asset.url, SCOPE).href;
  if (!inflight.has(url)) inflight.set(url, (async () => {
    let response;
    try { response = await fetch(new Request(url, { integrity: asset.integrity, cache: 'default' })); }
    catch { response = await fetch(new Request(url, { integrity: asset.integrity, cache: 'reload' })); }
    if (!await valid(response, asset)) throw new Error('Resource integrity check failed: ' + asset.url);
    return response;
  })().finally(() => inflight.delete(url)));
  return (await inflight.get(url)).clone();
}

async function file(asset, target, strict = false) {
  const url = new URL(asset.url, SCOPE).href;
  let cache;
  try {
    cache = await caches.open(target);
    const saved = await cache.match(url, { ignoreVary: true });
    if (saved) return saved;
    // Reuse only bytes verified against the new release's integrity, including stable old art URLs.
    for (const name of (await caches.keys()).filter(name => name.startsWith(PREFIX) && name !== target)) {
      const candidate = await (await caches.open(name)).match(url, { ignoreVary: true });
      if (candidate && await valid(candidate, asset)) { await cache.put(url, candidate.clone()); return candidate; }
    }
  } catch (error) { if (strict) throw error; }
  const response = await network(asset);
  if (cache) try { await cache.put(url, response.clone()); } catch (error) { if (strict) throw error; }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try { for (const asset of ASSETS) await file(asset, CACHE, true); }
    catch (error) { await caches.delete(CACHE); throw error; }
  })());
});

function idle() {
  if (foreground) return false;
  const visible = [...activities.values()].filter(activity => activity.visible);
  return !activities.size || visible.length > 0 && visible.every(activity => activity.until <= Date.now());
}
function artFor(job) {
  return PACKS.filter(asset => {
    if (job.legacy) return asset.role === 'legacy';
    if (asset.role && asset.role !== 'art') return false;
    if ((asset.stage || 3) > job.stage) return false;
    if (job.variant === 'mobile') return asset.variant === 'mobile';
    return job.variant === 'full' || asset.variant !== 'mobile';
  });
}
async function notify(job, failed = false) {
  if (failed) { for (const source of job.sources) source?.postMessage({ type: 'THEMES_CACHE_FAILED' }); return; }
  const cache = await caches.open(PACK_CACHE);
  const present = new Set((await cache.keys()).map(request => request.url));
  let stage = 0;
  for (let next = 1; next <= 8; next++) {
    if (!artFor({ ...job, stage: next }).every(asset => present.has(new URL(asset.url, SCOPE).href))) break;
    stage = next;
  }
  for (const source of job.sources) source?.postMessage({ type: 'THEMES_CACHED', stage, ...(job.variant === 'large' ? {} : { variant: job.variant }) });
}
function pumpPacks() {
  if (packWork) return packWork;
  packWork = (async () => {
    for (const [key, job] of pendingPacks) {
      if (!idle()) return;
      try {
        // Re-evaluate the target after every file so an expanded request is not lost.
        let index = 0;
        while (index < artFor(job).length) {
          if (!idle()) return;
          await file(artFor(job)[index++], PACK_CACHE, true);
        }
        await notify(job); pendingPacks.delete(key);
      } catch { await notify(job, true); pendingPacks.delete(key); }
    }
  })().finally(() => { packWork = undefined; });
  return packWork;
}
self.addEventListener('message', event => {
  const data = event.data;
  if (data?.type === 'SKIP_WAITING') { event.waitUntil(self.skipWaiting()); return; }
  if (data?.type === 'CACHE_PAUSE') {
    activities.set(event.source?.id || 'current', { visible: data.visible !== false, until: Date.now() + 2000 }); return;
  }
  if (data?.type === 'CACHE_RESUME') {
    activities.set(event.source?.id || 'current', { visible: true, until: 0 }); event.waitUntil(pumpPacks()); return;
  }
  if (data?.type !== 'CACHE_THEMES') return;
  const stage = Number(data.stage);
  if (!Number.isInteger(stage) || stage < 1 || stage > 8) return;
  const variant = data.variant === 'mobile' ? 'mobile' : data.variant === 'full' ? 'full' : 'large';
  const key = variant + ':' + !!data.legacy;
  const job = pendingPacks.get(key) || { stage, variant, legacy: !!data.legacy, sources: new Set() };
  job.stage = Math.max(job.stage, stage); job.sources.add(event.source); pendingPacks.set(key, job);
  event.waitUntil(pumpPacks());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const previous = keys.filter(key => key.startsWith(PREFIX) && key !== CACHE && !key.endsWith('::themes')).slice(-1);
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE && key !== PACK_CACHE && !previous.includes(key) && !previous.some(name => key === name + '::themes')).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function navigation(request) {
  let saved;
  try { saved = await (await caches.open(CACHE)).match(INDEX, { ignoreVary: true }); } catch {}
  // This installed release owns both HTML and its modules. Navigation never waits for a network probe.
  if (saved) return saved;
  try { const response = await fetch(request, { cache: 'no-cache' }); if (response.ok) return response; } catch {}
  return new Response(RECOVERY_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    if (url.pathname !== new URL(SCOPE).pathname && url.pathname !== new URL(INDEX).pathname) return;
    event.respondWith(navigation(request)); return;
  }
  const asset = resources.get(url.href);
  if (asset) {
    foreground++;
    event.respondWith(file(asset, ASSETS.includes(asset) ? CACHE : PACK_CACHE).finally(() => { foreground--; })); return;
  }
  if (!url.href.startsWith(ASSET_ROOT) || !/\.(?:js|css)$/.test(url.pathname)) return;
  event.respondWith((async () => {
    for (const name of (await caches.keys()).filter(name => name.startsWith(PREFIX) && name !== CACHE).reverse()) {
      const cached = await (await caches.open(name)).match(request, { ignoreVary: true }); if (cached) return cached;
    }
    return fetch(request);
  })());
});
