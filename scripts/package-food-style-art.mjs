/** Export only: preserve original drawings; normalize alpha bounds and encode preview assets. */
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = fileURLToPath(new URL('../art/food-styles/', import.meta.url));
const entries = JSON.parse(await readFile(path.join(root, 'sources.json'), 'utf8'));
const manifest = { painted: {}, cartoon: {} };

function alphaBounds(data, info) {
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 16) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error('An icon has no visible pixels');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

for (const entry of entries) {
  const id = entry.id;
  for (const style of ['painted', 'cartoon']) {
    const folder = path.join(root, style, 'items');
    await mkdir(folder, { recursive: true });
    const source = path.join(root, style, 'masters', `${id}.${style === 'painted' ? 'png' : 'svg'}`);
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const bounds = alphaBounds(data, info);
    if (style === 'painted') {
      const factor = 192 / Math.max(bounds.width, bounds.height);
      const width = Math.round(bounds.width * factor), height = Math.round(bounds.height * factor);
      const left = Math.floor((256 - width) / 2), top = Math.floor((256 - height) / 2);
      await sharp(source).extract(bounds).resize(width, height, { kernel: 'lanczos3' })
        .extend({ left, top, right: 256 - width - left, bottom: 256 - height - top, background: '#00000000' })
        .webp({ lossless: true, alphaQuality: 100, effort: 6 }).toFile(path.join(folder, `${id}.webp`));
    } else {
      const factor = 96 / info.width;
      const side = Math.max(bounds.width, bounds.height) * factor / .75;
      const centerX = (bounds.left + bounds.width / 2) * factor;
      const centerY = (bounds.top + bounds.height / 2) * factor;
      const viewBox = [centerX - side / 2, centerY - side / 2, side, side].map(value => value.toFixed(5)).join(' ');
      const svg = (await readFile(source, 'utf8')).replace(/viewBox="[^"]+"/, `viewBox="${viewBox}"`);
      await writeFile(path.join(folder, `${id}.svg`), svg);
    }
    manifest[style][id] = {
      path: `/art/food-styles/${style}/items/${id}.${style === 'painted' ? 'webp' : 'svg'}`,
      displaySize: entry.visibleSize / .75, offsetX: -1, offsetY: -3, svgSize: 256,
    };
  }
}
await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Exported ${entries.length * 2} preview icons; public assets and original masters unchanged.`);
