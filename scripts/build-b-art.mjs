import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { catalog, measure, project, svgGeometry, MEASURE_SIZE } from './b-art-lib.mjs';

const manifestPath = path.join(project, 'public/assets/manifest.json');
const previous = JSON.parse(await readFile(manifestPath, 'utf8'));
const ids = new Set(catalog.map(entry => entry.id));
if (catalog.length !== 38 || ids.size !== 38) throw new Error('B catalog must contain 38 unique assets');
const manifest = previous.filter(entry => !ids.has(entry.assetId));
const presentations = {}, entries = [];
for (const entry of catalog) {
  const source = `artwork/b/masters/${entry.id}.svg`;
  const svg = (await readFile(path.join(project, source), 'utf8')).replace(/\r\n/g, '\n');
  const [x, y, width] = svgGeometry(svg);
  const bounds = await measure(svg);
  if (bounds.edgeAlpha) throw new Error(`${entry.id}: master touches its boundary`);
  const side = Math.max(bounds.width, bounds.height) / MEASURE_SIZE * width / .75;
  const centerX = x + (bounds.left + bounds.width / 2) / MEASURE_SIZE * width;
  const centerY = y + (bounds.top + bounds.height / 2) / MEASURE_SIZE * width;
  const viewBox = entry.sampleViewBox ?? [centerX - side / 2, centerY - side / 2, side, side].map(value => value.toFixed(5)).join(' ');
  const runtime = svg.replace(/viewBox="[^"]+"/, `viewBox="${viewBox}"`).trim() + '\n';
  const assetPath = `assets/${entry.kind === 'device' ? 'entities' : 'items'}/${entry.id}.svg`;
  await mkdir(path.join(project, 'public', path.dirname(assetPath)), { recursive: true });
  await writeFile(path.join(project, 'public', assetPath), runtime);
  presentations[entry.id] = { path: assetPath, displaySize: entry.visibleSize / .75, offsetX: entry.sampleViewBox ? -1 : 0, offsetY: entry.sampleViewBox ? -3 : -2, svgSize: 96 };
  manifest.push({ assetId: entry.id, frame: assetPath, pivot: [.5, .5], scale: .82, source: 'Original editable SVG artwork · B warm cartoon · Goose Lane 2026', master: source });
  entries.push({ id: entry.id, name: entry.name, kind: entry.kind, visibleSize: entry.visibleSize, source, ...presentations[entry.id], sha256: createHash('sha256').update(runtime).digest('hex') });
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(project, 'src/content/b-art.json'), JSON.stringify(presentations, null, 2) + '\n');
await writeFile(path.join(project, 'public/assets/b-art.json'), JSON.stringify({ width: 96, height: 96, entries }, null, 2) + '\n');
console.log('B artwork: generated 38 editable 96×96 SVGs and shared presentation configuration.');
