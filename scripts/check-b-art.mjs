import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { catalog, measure, project, svgGeometry, MEASURE_SIZE } from './b-art-lib.mjs';

const config = JSON.parse(await readFile(path.join(project, 'src/content/b-art.json'), 'utf8'));
const manifest = JSON.parse(await readFile(path.join(project, 'public/assets/manifest.json'), 'utf8'));
const published = JSON.parse(await readFile(path.join(project, 'public/assets/b-art.json'), 'utf8'));
if (catalog.length !== 38 || Object.keys(config).length !== 38 || published.entries.length !== 38) throw new Error('B coverage is incomplete');
let bytes = 0;
const results = [];
for (const entry of catalog) {
  const presentation = config[entry.id];
  const source = (await readFile(path.join(project, 'artwork/b/masters', entry.id + '.svg'), 'utf8')).replace(/\r\n/g, '\n');
  svgGeometry(source);
  const svg = await readFile(path.join(project, 'public', presentation.path), 'utf8');
  svgGeometry(svg);
  if (svg.replace(/viewBox="[^"]+"/, '').trim() !== source.replace(/viewBox="[^"]+"/, '').trim()) throw new Error(`${entry.id}: paths changed during export`);
  const bounds = await measure(svg);
  const visibleSize = Math.max(bounds.width, bounds.height) / MEASURE_SIZE * presentation.displaySize;
  if (bounds.edgeAlpha || !bounds.softPixels || Math.abs(visibleSize - entry.visibleSize) > .7) throw new Error(`${entry.id}: visible size or transparency is wrong (${visibleSize})`);
  if (presentation.svgSize !== 96) throw new Error(`${entry.id}: incorrect SVG base resolution`);
  const records = manifest.filter(row => row.assetId === entry.id);
  if (records.length !== 1 || records[0].frame !== presentation.path) throw new Error(`${entry.id}: manifest does not match presentation`);
  const recorded = published.entries.find(row => row.id === entry.id);
  if (recorded?.sha256 !== createHash('sha256').update(svg).digest('hex')) throw new Error(`${entry.id}: published hash differs`);
  bytes += Buffer.byteLength(svg);
  results.push({ id: entry.id, visibleSize: Number(visibleSize.toFixed(3)), target: entry.visibleSize });
}
if (bytes > 256 * 1024) throw new Error(`SVG runtime budget exceeded: ${bytes}`);
console.log(JSON.stringify({ assets: results.length, runtimeBytes: bytes, maxSizeError: Math.max(...results.map(row => Math.abs(row.visibleSize - row.target))), dimensions: '96×96', results }, null, 2));
