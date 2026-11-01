const SCOPE = self.registration.scope;
const PREFIX = 'goose-lane::' + SCOPE + '::';
const CACHE = PREFIX + VERSION;
const PACK_CACHE = CACHE + '::themes';
const META_CACHE = CACHE + '::downloads';
const INDEX = new URL('index.html', SCOPE).href;
const INTENT_URL = new URL('__download_intent__', SCOPE).href;
const ASSET_ROOT = new URL('assets/', SCOPE).href;
const resources = new Map([...ASSETS, ...PACKS].map(asset => [new URL(asset.url, SCOPE).href, asset]));
const urls = new Map([...resources].map(([url, asset]) => [asset, url]));
const core = new Set(ASSETS);
const game = [...ASSETS, ...PACKS.filter(asset => asset.role === 'code' || asset.role === 'art')];
const runtime = game.filter(asset => core.has(asset) || asset.role === 'code' || asset.variant !== 'large');
const totalBytes = game.reduce((sum, asset) => sum + asset.size, 0);
const inflight = new Map(), opened = new Map(), locations = new Map(), present = new Set(), mutations = new Map();
const clients = new Map(), handoffs = new Map(), handoffVersions = new Map(), failures = new Map(), timings = new Map();
const reception = new Map();
const retryDelays = [1000, 3000, 10000];
let indexRead, intentRead, intent, intentSave = Promise.resolve(), revision = 0, progressTimer;
let acceptedAt, dispatchedAt, firstResponseAt, completedAt, bodyBytes = 0, retries = 0, cacheHits = 0;
let lastProgressAt = Date.now(), receivedAt, streamProgress = false, handoffTimer, stallTimer;
const absolute = asset => urls.get(asset);
const target = asset => core.has(asset) ? CACHE : PACK_CACHE;
const now = () => typeof performance === 'undefined' ? Date.now() : performance.now();
const aborted = () => new DOMException('Download paused', 'AbortError');
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  promise.catch(() => {});
  return { promise, resolve, reject };
}
function open(name) {
  if (!opened.has(name)) {
    const pending = caches.open(name).catch(error => { opened.delete(name); throw error; });
    pending.catch(() => {}); // Network may finish after this eager cache-open attempt rejects.
    opened.set(name, pending);
  }
  return opened.get(name);
}
function mark(url, exists) {
  mutations.set(url, ++revision);
  if (exists) present.add(url); else present.delete(url);
}
async function readIndex(refresh = false) {
  if (refresh) { if (indexRead) await indexRead; indexRead = undefined; opened.clear(); }
  if (!indexRead) indexRead = (async () => {
    const stamp = revision, found = new Set(), next = new Map();
    const names = (await caches.keys()).filter(name => name.startsWith(PREFIX) && !name.endsWith('::downloads'));
    await Promise.all(names.map(async name => {
      for (const request of await (await open(name)).keys()) {
        if (!next.has(request.url)) next.set(request.url, []);
        next.get(request.url).push(name);
        if (name === CACHE || name === PACK_CACHE) found.add(request.url);
      }
    }));
    locations.clear(); for (const [url, names] of next) locations.set(url, names);
    for (const url of resources.keys()) if ((mutations.get(url) || 0) <= stamp) {
      if (found.has(url)) present.add(url); else present.delete(url);
    }
  })().catch(error => { indexRead = undefined; throw error; });
  return indexRead;
}
async function readIntent() {
  if (!intentRead) intentRead = (async () => {
    const saved = await (await open(META_CACHE)).match(INTENT_URL);
    intent = saved ? await saved.json() : { all: false, paused: false, current: [] };
  })().catch(error => { intentRead = undefined; throw error; });
  return intentRead;
}
function saveIntent() {
  const body = JSON.stringify(intent);
  intentSave = intentSave.catch(() => {}).then(async () => {
    await (await open(META_CACHE)).put(INTENT_URL, new Response(body, { headers: { 'Content-Type': 'application/json' } }));
  });
  return intentSave;
}
function notify(force = false) {
  if (force) { clearTimeout(progressTimer); progressTimer = undefined; broadcast(); }
  else if (!progressTimer) progressTimer = setTimeout(() => { progressTimer = undefined; broadcast(); }, 100);
}
function broadcast() {
  if (!intent || !clients.size) return;
  const has = asset => present.has(absolute(asset));
  const fullReady = game.every(has), playableReady = runtime.every(has);
  const active = [...inflight.values()].filter(task => task.background && !task.cancelled);
  const failed = [...failures.values()], seconds = Math.floor(Date.now() / 1000);
  for (const key of reception.keys()) if (key < seconds - 2) reception.delete(key);
  const speed = [...reception.values()].reduce((sum, value) => sum + value, 0) / Math.min(3, Math.max(1, (Date.now() - (receivedAt || Date.now())) / 1000));
  if (fullReady && !completedAt) completedAt = Date.now();
  const message = { type: 'GAME_CACHE_STATE', release: VERSION,
    currentReady: (intent.current || []).every(url => present.has(new URL(url, SCOPE).href)), playableReady, fullReady,
    completedFiles: game.filter(has).length, totalFiles: game.length,
    completedBytes: game.filter(has).reduce((sum, asset) => sum + asset.size, 0), totalBytes,
    receivingBytes: active.reduce((sum, task) => sum + task.received, 0), bytesPerSecond: streamProgress ? speed : null,
    activeFiles: active.length, retryingFiles: active.filter(task => task.waitingRetry).length, failedFiles: failed.length,
    state: fullReady ? 'complete' : intent.paused ? 'paused' : failed.some(error => error.kind === 'storage') ? 'storage' :
      active.some(task => task.waitingRetry) ? 'retrying' : !active.length && failed.length ? 'network' : playableReady ? 'detail' : 'runtime',
  };
  const diagnostics = { acceptedAt, dispatchedAt, firstResponseAt, completedAt, bodyBytes, retries, cacheHits,
    files: fullReady || !active.length ? [...timings.values()] : undefined };
  for (const { source, requestId, diagnostic } of clients.values()) try {
    source.postMessage({ ...message, requestId, ...(diagnostic ? { diagnostics } : {}) });
  } catch { /* A closed window is removed on the next handoff/reconcile. */ }
}
function noteBytes(task, length) {
  task.received += length; bodyBytes += length; lastProgressAt = Date.now();
  receivedAt ??= Date.now();
  const second = Math.floor(Date.now() / 1000);
  reception.set(second, (reception.get(second) || 0) + length);
  notify();
}
async function valid(bytes, asset) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return 'sha256-' + btoa(String.fromCharCode(...new Uint8Array(digest))) === asset.integrity;
}
function errorOf(message, kind, extra = {}) { return Object.assign(new Error(message), { kind, ...extra }); }
function responseFactory(bytes, response) {
  const headers = new Headers(response.headers);
  headers.delete('Content-Encoding'); headers.delete('Transfer-Encoding');
  headers.set('Content-Length', String(bytes.byteLength));
  return () => new Response(bytes, { status: response.status, statusText: response.statusText, headers });
}
async function network(task, attempt) {
  task.received = 0;
  if (attempt) task.controller = new AbortController();
  const fetching = fetch(task.url, { cache: attempt ? 'reload' : 'default', signal: task.controller.signal });
  task.submitted.resolve();
  const response = await fetching;
  lastProgressAt = Date.now(); firstResponseAt ??= Date.now();
  task.headersAt = now(); task.phase = 'receiving';
  if (!response.ok) {
    const retry = response.headers.get('Retry-After');
    const parsedRetry = retry ? (/^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - Date.now()) : 0;
    const retryAfter = Number.isFinite(parsedRetry) ? Math.max(0, parsedRetry) : 0;
    void response.body?.cancel().catch(() => {});
    throw errorOf('HTTP ' + response.status, 'network', { retryAfter });
  }
  let bytes;
  if (response.body?.getReader) {
    streamProgress = true;
    const reader = response.body.getReader(), chunks = [];
    let timer;
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => task.controller.abort(), 30000); };
    try {
      arm();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); noteBytes(task, value.byteLength); arm();
      }
      bytes = new Uint8Array(task.received);
      let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    } finally { clearTimeout(timer); reader.releaseLock(); }
  } else { bytes = new Uint8Array(await response.arrayBuffer()); noteBytes(task, bytes.byteLength); }
  if (task.cancelled) throw aborted();
  task.bodyAt = now(); task.phase = 'verifying';
  if (!await valid(bytes, task.asset)) throw errorOf('Resource integrity check failed: ' + task.asset.url, 'integrity');
  task.verifiedAt = now();
  return responseFactory(bytes, response);
}
function externallyLoading(url) { return [...handoffs.values()].some(state => state.urls.has(url)); }
function wakeHandoffs() { for (const task of inflight.values()) if (task.releaseHandoff && !externallyLoading(task.url)) task.releaseHandoff(); }
async function pruneHandoffs() {
  if (!self.clients.matchAll) return;
  const live = new Set((await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).map(client => client.id));
  for (const id of clients.keys()) if (!live.has(id)) clients.delete(id);
  for (const id of handoffs.keys()) if (!live.has(id)) { handoffs.delete(id); handoffVersions.delete(id); clients.delete(id); }
  wakeHandoffs();
}
async function waitForHandoff(task) {
  if (task.cancelled) throw aborted();
  if (!externallyLoading(task.url)) return;
  task.submitted.resolve(); // The page has already submitted this URL to the browser.
  await new Promise((resolve, reject) => {
    const signal = task.controller.signal;
    const cancel = () => { task.releaseHandoff = undefined; reject(aborted()); };
    task.releaseHandoff = () => { signal.removeEventListener('abort', cancel); task.releaseHandoff = undefined; resolve(); };
    signal.addEventListener('abort', cancel, { once: true });
  });
}
function maintainTimers() {
  if (!handoffTimer && handoffs.size) handoffTimer = setTimeout(() => {
    handoffTimer = undefined; void pruneHandoffs().finally(maintainTimers);
  }, 1000);
  if (!stallTimer && inflight.size) stallTimer = setTimeout(() => {
    stallTimer = undefined;
    if (Date.now() - lastProgressAt >= 30000) for (const task of inflight.values()) {
      if (task.background && !task.foreground && task.phase === 'waiting') task.controller.abort();
    }
    maintainTimers();
  }, 30000);
  if (!inflight.size) { clearTimeout(stallTimer); stallTimer = undefined; }
}
async function load(task) {
  let cacheRead;
  try {
    await readIndex();
    cacheRead = open(target(task.asset));
    if (present.has(task.url)) {
      const saved = await (await cacheRead)?.match(task.url, { ignoreVary: true });
      if (saved) { cacheHits++; task.submitted.resolve(); task.ready.resolve(() => saved.clone()); return; }
      mark(task.url, false);
    }
    for (const name of locations.get(task.url) || []) {
      if (name === target(task.asset)) continue;
      const saved = await (await open(name)).match(task.url, { ignoreVary: true });
      if (saved && saved.ok) {
        const bytes = new Uint8Array(await saved.arrayBuffer());
        if (await valid(bytes, task.asset)) { task.factory = responseFactory(bytes, saved); cacheHits++; break; }
      }
    }
  } catch {
    // Storage being unavailable must not stop a verified online response.
  }
  cacheRead ??= open(target(task.asset));
  if (!task.factory) {
    await waitForHandoff(task);
    for (let attempt = 0; ; attempt++) {
      if (task.cancelled) throw aborted();
      task.phase = 'waiting'; task.startedAt = now(); maintainTimers();
      try { task.factory = await network(task, attempt); break; }
      catch (error) {
        if (task.cancelled) throw aborted();
        if (error.kind === 'integrity' && attempt === 0) continue;
        if (!task.background || attempt >= retryDelays.length) throw error;
        retries++; task.waitingRetry = true; task.phase = 'retrying'; notify();
        await new Promise(resolve => { const timer = setTimeout(resolve, Math.max(retryDelays[attempt], error.retryAfter || 0)); task.wakeRetry = () => { clearTimeout(timer); resolve(); }; });
        task.wakeRetry = undefined; task.waitingRetry = false;
      }
    }
  }
  if (task.cancelled) throw aborted();
  task.submitted.resolve();
  task.ready.resolve(task.factory);
  task.phase = 'writing';
  try { const cache = await cacheRead; await cache.put(task.url, task.factory()); }
  catch (error) { throw errorOf(error.message, 'storage'); }
  mark(task.url, true);
  const resource = typeof performance !== 'undefined' ? performance.getEntriesByName?.(task.url, 'resource').at(-1) : undefined;
  if (acceptedAt) timings.set(task.url, { url: task.asset.url, receivedBytes: task.received,
    headersMs: task.headersAt === undefined ? null : task.headersAt - task.startedAt,
    bodyMs: task.bodyAt === undefined ? null : task.bodyAt - task.headersAt,
    verifyMs: task.verifiedAt === undefined ? null : task.verifiedAt - task.bodyAt,
    writeMs: task.verifiedAt === undefined ? null : now() - task.verifiedAt,
    transferBytes: resource?.transferSize ?? null, encodedBytes: resource?.encodedBodySize ?? null, protocol: resource?.nextHopProtocol || null });
}
function file(asset, background = false) {
  const url = absolute(asset);
  let task = inflight.get(url);
  if (task?.cancelled) { inflight.delete(url); task = undefined; }
  if (task) { task.background ||= background; return task; }
  task = { asset, url, background, foreground: 0, ready: deferred(), submitted: deferred(), controller: new AbortController(), received: 0, phase: 'lookup' };
  inflight.set(url, task);
  task.committed = load(task).then(() => { failures.delete(url); }, error => {
    task.ready.reject(error);
    if (!task.cancelled) failures.set(url, { kind: error.kind || 'network', message: error.message });
    throw error;
  }).finally(() => {
    task.submitted.resolve();
    task.factory = undefined;
    if (inflight.get(url) === task) inflight.delete(url);
    notify(); maintainTimers();
  });
  task.committed.catch(() => {});
  return task;
}
async function prepare(refresh = false, retry = false) {
  await readIntent();
  await readIndex(refresh);
  if (!intent.all || intent.paused) { notify(true); return; }
  acceptedAt ??= Date.now(); completedAt = undefined;
  if (retry) { failures.clear(); for (const task of inflight.values()) task.wakeRetry?.(); }
  const current = (intent.current || []).map(url => resources.get(new URL(url, SCOPE).href)).filter(Boolean);
  const assets = [...new Set([...current, ...game])];
  // No application concurrency ceiling or stage barrier: submit the entire finite set.
  // Keep completion promises, not response-bearing task records, for the lifetime of a batch.
  const tasks = assets.filter(asset => !present.has(absolute(asset)) && !failures.has(absolute(asset))).map(asset => {
    const task = file(asset, true);
    return { submitted: task.submitted.promise, committed: task.committed };
  });
  await Promise.all(tasks.map(task => task.submitted));
  dispatchedAt ??= Date.now(); notify(true); maintainTimers();
  await Promise.allSettled(tasks.map(task => task.committed)); notify(true);
}
function updateHandoff(source, data) {
  const state = data.handoff;
  if (!state || !Number.isSafeInteger(state.sequence) || state.sequence < 0 || typeof state.session !== 'string' || state.session.length > 100 ||
    !Array.isArray(state.urls) || state.urls.length > resources.size) return;
  const urls = new Set();
  for (const url of state.urls) {
    if (typeof url !== 'string' || resources.get(new URL(url, SCOPE).href)?.role !== 'art') return;
    urls.add(new URL(url, SCOPE).href);
  }
  const id = source.id || data.requestId, previous = handoffVersions.get(id);
  if (previous?.session === state.session && previous.sequence > state.sequence) return;
  handoffVersions.set(id, { session: state.session, sequence: state.sequence });
  if (urls.size) handoffs.set(id, { session: state.session, sequence: state.sequence, urls });
  else handoffs.delete(id);
  wakeHandoffs(); maintainTimers();
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const results = await Promise.allSettled(ASSETS.map(asset => file(asset).committed));
    const failed = results.find(result => result.status === 'rejected');
    if (failed) { await caches.delete(CACHE); opened.delete(CACHE); for (const asset of ASSETS) mark(absolute(asset), false); throw failed.reason; }
  })());
});
self.addEventListener('message', event => {
  const data = event.data, source = event.source;
  if (data?.type === 'SKIP_WAITING') { event.waitUntil(self.skipWaiting()); return; }
  if (!['PREPARE_GAME', 'GAME_CACHE_STATUS', 'GAME_DOWNLOAD_PAUSE', 'ART_HANDOFF'].includes(data?.type)) return;
  event.waitUntil((async () => {
    const requestId = String(data.requestId || '');
    if (!source || requestId.length > 100) return;
    try {
      if (data.type === 'PREPARE_GAME' && (!Array.isArray(data.urls) || data.urls.length > resources.size ||
        data.urls.some(url => typeof url !== 'string' || resources.get(new URL(url, SCOPE).href)?.role !== 'art'))) return;
      const id = source.id || requestId;
      clients.set(id, { source, requestId, diagnostic: data.diagnostic === true || clients.get(id)?.diagnostic === true });
      if (data.type === 'ART_HANDOFF') { updateHandoff(source, data); return; }
      await readIntent();
      if (data.type === 'PREPARE_GAME') {
        if (!acceptedAt) {
          acceptedAt = Date.now(); firstResponseAt = undefined; bodyBytes = 0; cacheHits = 0;
          receivedAt = undefined; streamProgress = false; reception.clear();
        }
        updateHandoff(source, data);
        intent = { ...intent, all: true, current: [...new Set(data.urls)], ...(typeof data.paused === 'boolean' ? { paused: data.paused } : {}) };
      }
      if (data.type === 'GAME_DOWNLOAD_PAUSE') intent.paused = data.paused === true;
      if (intent.paused) for (const task of inflight.values()) if (task.background && !task.foreground) {
        task.cancelled = true; task.controller.abort(); task.wakeRetry?.();
      }
      // Persist intent and prune closed clients alongside downloads, not before their dispatch.
      const results = await Promise.allSettled([
        data.type === 'GAME_CACHE_STATUS' ? Promise.resolve() : saveIntent(),
        prepare(data.reconcile === true || data.type === 'GAME_CACHE_STATUS', data.type === 'PREPARE_GAME' || data.type === 'GAME_DOWNLOAD_PAUSE' && !intent.paused),
        pruneHandoffs().catch(() => {}),
      ]);
      const failed = results.find(result => result.status === 'rejected');
      if (failed) throw failed.reason;
    } catch {
      if (game.every(asset => present.has(absolute(asset)))) notify(true);
      else source.postMessage({ type: 'GAME_CACHE_STATE', requestId, release: VERSION, fullReady: false, state: 'storage' });
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const previous = keys.filter(key => key.startsWith(PREFIX) && key !== CACHE && !key.endsWith('::themes') && !key.endsWith('::downloads')).slice(-1);
    const removed = new Set(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE && key !== PACK_CACHE && key !== META_CACHE && !previous.includes(key) && !previous.some(name => key === name + '::themes' || key === name + '::downloads')));
    await Promise.all([...removed].map(key => caches.delete(key)));
    for (const name of removed) opened.delete(name);
    // Installation already indexed and verified this worker's core. Only prune deleted locations.
    for (const [url, names] of locations) {
      const retained = names.filter(name => !removed.has(name));
      if (retained.length) locations.set(url, retained); else locations.delete(url);
    }
    await self.clients.claim();
  })());
});
async function navigation(request) {
  try { const saved = await (await open(CACHE)).match(INDEX, { ignoreVary: true }); if (saved) return saved; } catch {}
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
    const task = file(asset); task.foreground++;
    event.respondWith(task.ready.promise.then(factory => factory()).finally(() => { task.foreground--; }));
    event.waitUntil(task.committed.catch(() => {})); return;
  }
  if (!url.href.startsWith(ASSET_ROOT) || !/\.(?:js|css)$/.test(url.pathname)) return;
  event.respondWith((async () => {
    await readIndex().catch(() => {});
    for (const name of locations.get(url.href) || []) {
      const cached = await (await open(name)).match(request, { ignoreVary: true }); if (cached) return cached;
    }
    return fetch(request);
  })());
});
