import http from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'output/plan4-food-review/site'), game = path.join(root, 'dist');
const args = process.argv.slice(2), port = Number(args.includes('--port') ? args[args.indexOf('--port') + 1] : 5284);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Expected --port in 1..65535');
const manifest = JSON.parse(await readFile(path.join(site, 'samples.json'), 'utf8'));
const gamePreview = '/game/ui-preview.html?scenario=late&run=plan4-food-' + manifest.reviewId;
const siteRoot = await realpath(site), gameRoot = await realpath(game);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
};
const within = (base, target) => { const relative = path.relative(base, target); return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative); };
const server = http.createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const url = new URL(request.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').includes('..')) { response.writeHead(403).end('Forbidden'); return; }
    if (['/game', '/game/', '/game/index.html'].includes(pathname)) { response.writeHead(302, { Location: gamePreview, 'Cache-Control': 'no-store' }).end(); return; }
    const isGame = pathname.startsWith('/game/'), selectedRoot = isGame ? gameRoot : siteRoot;
    let relative = isGame ? pathname.slice('/game/'.length) : pathname.replace(/^\//, '');
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    const target = path.resolve(selectedRoot, relative);
    if (!within(selectedRoot, target)) { response.writeHead(403).end('Forbidden'); return; }
    const resolved = await realpath(target);
    if (!within(selectedRoot, resolved)) { response.writeHead(403).end('Forbidden'); return; }
    const file = await stat(resolved);
    if (!file.isFile()) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(resolved).toLowerCase()] ?? 'application/octet-stream', 'Content-Length': file.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(resolved);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch (error) {
    if (!response.headersSent) response.writeHead(error instanceof URIError ? 400 : 404).end('Not found');
    else response.destroy();
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ pid: process.pid, url: 'http://127.0.0.1:' + port + '/', game: 'http://127.0.0.1:' + port + gamePreview, reviewId: manifest.reviewId, root: siteRoot, note: '24-item local art review; game link uses isolated ui-preview storage and does not enable the production service worker.' })));
