import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const root = path.resolve(option('--directory', 'dist'));
const baseline = option('--baseline', '');
const switchFile = option('--switch-file', '');
const port = Number(option('--port', '5210'));
const rate = Number(option('--rate', '0'));
const latency = Number(option('--latency', '0'));
const probe = `<script>(()=>{performance.setResourceTimingBufferSize?.(3000);let done=false;const observer=new MutationObserver(check);function check(){if(done||!document.querySelector('.board-shell[data-board-status="ready"]'))return;done=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{const ready=performance.now();const report={readyMs:ready,url:location.href,viewport:{width:innerWidth,height:innerHeight,ratio:devicePixelRatio},resources:performance.getEntriesByType('resource').filter(r=>r.startTime<=ready).map(r=>({url:r.name,start:r.startTime,end:r.responseEnd,transferBytes:r.transferSize,encodedBytes:r.encodedBodySize,duration:r.duration})),note:'Desktop browser, server-shaped payload bandwidth/latency; not a physical iPhone test.'};const details=document.createElement('details');details.style='position:fixed;left:0;top:0;z-index:9999;max-width:300px;background:#fff9ec;font:10px monospace;max-height:50vh;overflow:auto';const summary=document.createElement('summary');summary.textContent='本地测量记录';const pre=document.createElement('pre');pre.dataset.labReport='';pre.textContent=JSON.stringify(report);details.append(summary,pre);document.body.append(details);observer.disconnect();}));}observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-board-status']});check();})();</script>`;
const encoded = new Map(), pending = [];
let ticker, cursor = 0;
function pump() {
  let budget = rate / 8 / 100;
  while (budget > 0 && pending.length) {
    cursor %= pending.length;
    const job = pending[cursor];
    if (job.response.destroyed) { pending.splice(cursor, 1); continue; }
    const end = Math.min(job.data.length, job.offset + Math.max(1, Math.floor(Math.min(budget, 16384))));
    job.response.write(job.data.subarray(job.offset, end)); budget -= end - job.offset; job.offset = end;
    if (end === job.data.length) { job.response.end(); pending.splice(cursor, 1); } else cursor++;
  }
  if (!pending.length) { clearInterval(ticker); ticker = undefined; }
}
const types = { html:'text/html; charset=utf-8', js:'text/javascript; charset=utf-8', css:'text/css; charset=utf-8', json:'application/json', svg:'image/svg+xml', webp:'image/webp', png:'image/png', webmanifest:'application/manifest+json' };
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    // A fresh prefix provides a cold HTTP-cache namespace without deleting browser data.
    let relative = decodeURIComponent(url.pathname).replace(/^\/r\/[a-zA-Z0-9_-]+(?=\/)/, '').replace(/^\//, '');
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    let selectedRoot = root;
    if (baseline && switchFile && (await readFile(switchFile, 'utf8')).trim() === 'baseline') selectedRoot = path.resolve(baseline);
    const target = path.resolve(selectedRoot, relative);
    if (!target.startsWith(selectedRoot + path.sep)) { response.writeHead(403).end(); return; }
    const extension = path.extname(target).slice(1);
    const compress = /^(html|js|css|json|svg|webmanifest)$/.test(extension) && /gzip/.test(request.headers['accept-encoding'] || '');
    const instrument = extension === 'html' && url.searchParams.get('lab') === '1';
    const key = target + ':' + (await stat(target)).mtimeMs + ':' + compress + ':' + instrument;
    if (!encoded.has(key)) { let data = await readFile(target); if (instrument) data = Buffer.from(data.toString().replace('</head>', probe + '</head>')); encoded.set(key, compress ? gzipSync(data) : data); }
    const data = encoded.get(key);
    setTimeout(() => {
      response.writeHead(200, { 'Content-Type':types[extension] || 'application/octet-stream', 'Content-Length':data.length,
        'Cache-Control': /(?:-[a-zA-Z0-9_-]{8}\.(?:js|css)|-[a-f0-9]{12}\.webp)$/.test(relative) ? 'public,max-age=31536000,immutable' : 'no-cache',
        'Vary':'Accept-Encoding', ...(compress ? {'Content-Encoding':'gzip'} : {}) });
      if (request.method === 'HEAD') { response.end(); return; }
      if (!rate) { response.end(data); return; }
      pending.push({ response, data, offset:0 }); if (!ticker) ticker = setInterval(pump, 10);
    }, latency);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(JSON.stringify({pid:process.pid,url:`http://127.0.0.1:${port}/`,root,aggregateBitsPerSecond:rate,serverLatencyMs:latency,note:'Local browser lab; excludes DNS/TLS and is not an iPhone hardware result.'})));
