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
const META_CACHE = CACHE + '::downloads';
const INTENT_URL = new URL('__download_intent__', SCOPE).href;
let intent, intentRead, present, presentRead, gameError = '', lastProgress = 0;
const gameClients = new Map();
let intentSave = Promise.resolve(), hasClients = true, nextClientCheck = 0;
function saveIntent() {
  intentSave = intentSave.catch(() => {}).then(async () => {
    await (await caches.open(META_CACHE)).put(INTENT_URL, new Response(JSON.stringify(intent), { headers: { 'Content-Type': 'application/json' } }));
  });
  return intentSave;
}
async function checkClients() {
  if (!self.clients.matchAll || Date.now() < nextClientCheck) return;
  nextClientCheck = Date.now() + 1000;
  const clients = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).filter(client => client.url.startsWith(SCOPE));
  hasClients = clients.length > 0;
  const ids = new Set(clients.map(client => client.id));
  for (const id of activities.keys()) if (!ids.has(id)) activities.delete(id);
  for (const id of gameClients.keys()) if (!ids.has(id)) gameClients.delete(id);
  for (const client of clients) if (client.visibilityState === 'hidden') activities.set(client.id, { visible: false, until: Infinity });
}

async function readIntent() {
  if (!intentRead) intentRead = (async () => {
    const saved = await (await caches.open(META_CACHE)).match(INTENT_URL);
    intent = saved ? await saved.json() : { all: false, paused: false, current: [] };
  })().catch(error => { intentRead = undefined; throw error; });
  return intentRead;
}
async function cachedUrls() {
  if (!presentRead) presentRead = (async () => {
    const core = await (await caches.open(CACHE)).keys(), packs = await (await caches.open(PACK_CACHE)).keys();
    present = new Set([...core, ...packs].map(request => request.url));
  })().catch(error => { presentRead = undefined; throw error; });
  await presentRead; return present;
}
function gameAssets() {
  const all = [...ASSETS, ...PACKS.filter(asset => asset.role === 'code' || asset.role === 'art')];
  const runtime = all.filter(asset => ASSETS.includes(asset) || asset.role === 'code' || asset.variant !== 'large');
  const current = (intent?.current || []).map(url => resources.get(new URL(url, SCOPE).href)).filter(Boolean);
  return { all, runtime, current };
}
async function notifyGame(force = false) {
  if (!gameClients.size || !intent) return;
  if (!force && Date.now() - lastProgress < 1000) return;
  lastProgress = Date.now();
  const saved = await cachedUrls(), goals = gameAssets();
  const has = asset => saved.has(new URL(asset.url, SCOPE).href);
  const complete = goals.all.every(has), playable = goals.runtime.every(has);
  const message = { type: 'GAME_CACHE_STATE', release: VERSION, currentReady: goals.current.every(has), playableReady: playable, fullReady: complete,
    completedBytes: goals.all.filter(has).reduce((sum, asset) => sum + asset.size, 0), totalBytes: goals.all.reduce((sum, asset) => sum + asset.size, 0),
    completedFiles: goals.all.filter(has).length, totalFiles: goals.all.length,
    state: gameError || (complete ? 'complete' : intent.paused ? 'paused' : !idle() ? 'idle' : playable ? 'detail' : 'runtime') };
  for (const { source, requestId } of gameClients.values()) try { source?.postMessage({ ...message, requestId }); } catch {}
}
async function scheduleGame() {
  await readIntent();
  if (!intent.all || intent.paused || gameError || pendingPacks.has('game')) return;
  const saved = await cachedUrls(), goals = gameAssets();
  const assets = [...new Map([...goals.current, ...goals.runtime, ...goals.all].map(asset => [asset.url, asset])).values()];
  if (assets.every(asset => saved.has(new URL(asset.url, SCOPE).href))) return;
  pendingPacks.set('game', { game: true, assets });
}

async function valid(response, asset) {
  if (!response || !response.ok) return false;
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  return 'sha256-' + btoa(String.fromCharCode(...new Uint8Array(digest))) === asset.integrity;
}

async function network(asset) {
  const url = new URL(asset.url, SCOPE).href;
  if (!inflight.has(url)) inflight.set(url, (async () => {
    let response;
    for (const cache of ['default', 'reload']) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      try { response = await fetch(new Request(url, { integrity: asset.integrity, cache, signal: controller.signal })); if (await valid(response, asset)) return response; }
      catch (error) { if (cache === 'reload') throw error; }
      finally { clearTimeout(timer); }
    }
    throw new Error('Resource integrity check failed: ' + asset.url);
  })().finally(() => inflight.delete(url)));
  return (await inflight.get(url)).clone();
}

async function file(asset, target, strict = false) {
  const url = new URL(asset.url, SCOPE).href;
  let cache;
  try {
    cache = await caches.open(target);
    const saved = await cache.match(url, { ignoreVary: true });
    if (saved) { present?.add(url); return saved; }
    // Reuse only bytes verified against the new release's integrity, including stable old art URLs.
    for (const name of (await caches.keys()).filter(name => name.startsWith(PREFIX) && name !== target)) {
      const candidate = await (await caches.open(name)).match(url, { ignoreVary: true });
      if (candidate && await valid(candidate, asset)) { await cache.put(url, candidate.clone()); present?.add(url); return candidate; }
    }
  } catch (error) { if (strict) throw error; }
  const response = await network(asset);
  if (cache) try { await cache.put(url, response.clone()); present?.add(url); } catch (error) { if (strict) throw error; }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try { for (const asset of ASSETS) await file(asset, CACHE, true); }
    catch (error) { await caches.delete(CACHE); throw error; }
  })());
});

function idle() {
  if (foreground || !hasClients) return false;
  const visible = [...activities.values()].filter(activity => activity.visible);
  return !activities.size || visible.length > 0 && visible.every(activity => activity.until <= Date.now());
}
function artFor(job) {
  if (job.assets) return job.assets;
  if(job.urls)return [...resources.values()].filter(asset=>job.urls.has(asset.url));
  return PACKS.filter(asset => {
    if (job.legacy) return asset.role === 'legacy';
    if (asset.role !== 'art') return false;
    if ((asset.stage || 3) > job.stage) return false;
    if (job.variant === 'mobile') return asset.variant === 'mobile';
    return job.variant === 'full' || asset.variant !== 'mobile';
  });
}
async function notify(job, failed = false) {
  if (failed) { for (const source of job.sources) source?.postMessage({ type: job.chapter?'CHAPTER_CACHE_FAILED':'THEMES_CACHE_FAILED', chapter:job.chapter }); return; }
  if(job.chapter){for(const source of job.sources)source?.postMessage({type:'CHAPTER_CACHED',chapter:job.chapter,variant:job.variant});return;}
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
    await checkClients();
    for (const [key, job] of pendingPacks) {
      if (!idle()) return;
      try {
        // Re-evaluate the target after every file so an expanded request is not lost.
        job.remaining ??= new Set(artFor(job));
        while (job.remaining.size) {
          await checkClients();
          if (!idle()) return;
          if (job.game && (intent.paused || pendingPacks.get(key) !== job)) break;
          const asset = job.remaining.values().next().value;
          await file(asset, ASSETS.includes(asset) ? CACHE : PACK_CACHE, true);
          job.remaining.delete(asset);
          if (job.game) await notifyGame();
        }
        if (job.game) await notifyGame(true); else await notify(job);
        if (pendingPacks.get(key) === job) pendingPacks.delete(key);
      } catch (error) {
        pendingPacks.delete(key);
        if (job.game) { gameError = error?.name === 'QuotaExceededError' ? 'storage' : 'network'; await notifyGame(true); }
        else await notify(job, true);
      }
    }
  })().finally(() => { packWork = undefined; });
  return packWork;
}
self.addEventListener('message', event => {
  const data = event.data;
  if (data?.type === 'PREPARE_GAME' || data?.type === 'GAME_CACHE_STATUS' || data?.type === 'GAME_DOWNLOAD_PAUSE') {
    event.waitUntil((async () => {
      const source = event.source, requestId = String(data.requestId || '');
      if (!source || requestId.length > 100) return;
      gameClients.set(source.id || requestId, { source, requestId });
      try {
        await readIntent();
        if (data.type === 'PREPARE_GAME') {
          const urls = data.urls;
          if (!Array.isArray(urls) || urls.length > 1000 || urls.some(url => typeof url !== 'string' || resources.get(new URL(url, SCOPE).href)?.role !== 'art')) return;
          intent = { ...intent, all: true, current: [...new Set(urls)] }; gameError = '';
          presentRead = undefined;
          pendingPacks.delete('game');
        }
        if (data.type === 'GAME_DOWNLOAD_PAUSE') { intent.paused = data.paused === true; if (intent.paused) pendingPacks.delete('game'); else gameError = ''; }
        if (data.type !== 'GAME_CACHE_STATUS') await saveIntent();
        await scheduleGame(); await notifyGame(true); await pumpPacks();
      } catch { source.postMessage({ type: 'GAME_CACHE_STATE', requestId, release: VERSION, state: 'storage' }); }
    })()); return;
  }
  if (data?.type === 'SKIP_WAITING') { event.waitUntil(self.skipWaiting()); return; }
  if (data?.type === 'CACHE_PAUSE') {
    activities.set(event.source?.id || 'current', { visible: data.visible !== false, until: Infinity });
    event.waitUntil(notifyGame(true)); return;
  }
  if (data?.type === 'CACHE_RESUME') {
    activities.set(event.source?.id || 'current', { visible: true, until: 0 });
    event.waitUntil((async () => { await scheduleGame().catch(() => {}); await pumpPacks(); await notifyGame(true); })()); return;
  }
  if(data?.type==='CACHE_CHAPTER'){
    if(!Number.isInteger(data.chapter)||data.chapter<1||data.chapter>8||!Array.isArray(data.urls)||data.urls.length>1000)return;
    const urls=new Set(data.urls.filter(url=>typeof url==='string'&&resources.has(new URL(url,SCOPE).href)&&resources.get(new URL(url,SCOPE).href).role==='art'));
    if(urls.size!==data.urls.length||!urls.size)return;
    const key='chapter:'+data.chapter+':mobile';
    const previous=pendingPacks.get(key);
    if(previous){for(const url of urls)previous.urls.add(url);previous.sources.add(event.source);delete previous.remaining;}
    else pendingPacks.set(key,{chapter:data.chapter,urls,variant:'mobile',sources:new Set([event.source])});event.waitUntil(pumpPacks());return;
  }
  if (data?.type !== 'CACHE_THEMES') return;
  const stage = Number(data.stage);
  if (!Number.isInteger(stage) || stage < 1 || stage > 8) return;
  const variant = data.variant === 'mobile' ? 'mobile' : data.variant === 'full' ? 'full' : 'large';
  const key = variant + ':' + !!data.legacy;
  const job = pendingPacks.get(key) || { stage, variant, legacy: !!data.legacy, sources: new Set() };
  if(stage>job.stage)delete job.remaining;
  job.stage = Math.max(job.stage, stage); job.sources.add(event.source); pendingPacks.set(key, job);
  event.waitUntil(pumpPacks());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const previous = keys.filter(key => key.startsWith(PREFIX) && key !== CACHE && !key.endsWith('::themes') && !key.endsWith('::downloads')).slice(-1);
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE && key !== PACK_CACHE && key !== META_CACHE && !previous.includes(key) && !previous.some(name => key === name + '::themes' || key === name + '::downloads')).map(key => caches.delete(key)));
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
    const response = file(asset, ASSETS.includes(asset) ? CACHE : PACK_CACHE).finally(() => { foreground--; });
    event.respondWith(response);
    event.waitUntil(response.then(() => pumpPacks(), () => {})); return;
  }
  if (!url.href.startsWith(ASSET_ROOT) || !/\.(?:js|css)$/.test(url.pathname)) return;
  event.respondWith((async () => {
    for (const name of (await caches.keys()).filter(name => name.startsWith(PREFIX) && name !== CACHE).reverse()) {
      const cached = await (await caches.open(name)).match(request, { ignoreVary: true }); if (cached) return cached;
    }
    return fetch(request);
  })());
});
