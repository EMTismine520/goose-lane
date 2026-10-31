import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'public/assets/mobile');
const digest = data => createHash('sha256').update(data).digest('hex');
const sourceRows = JSON.parse(await readFile(path.join(root, 'public/assets/v3-manifest.json'), 'utf8'));
const check = process.argv.includes('--check');
const listed = check ? JSON.parse(await readFile(path.join(root, 'public/assets/mobile-manifest.json'), 'utf8')) : [];
const mapping = {}, medium = {}, rows = [];
if (!check) await mkdir(directory, { recursive: true });
for (const source of sourceRows) {
  const original = await readFile(path.join(root, 'public', source.path));
  const selected = source.mode === 'plan4-selected-export';
  if (selected) {
    const metadata = await sharp(original).metadata();
    if (metadata.width !== 512 || metadata.height !== 512 || !metadata.hasAlpha || digest(original) !== source.selectedExports?.sha256?.image) throw new Error(`Selected mobile source differs: ${source.id}`);
  }
  // Derive from the approved transparent canvas, preserving its composition and source bytes.
  for (const width of [128, 256]) {
    let data;
    if (check) {
      const row = listed.find(row => row.id === source.id && row.width === width);
      if (!row || !/^assets\/mobile\/[a-z0-9-]+\.webp$/.test(row.path)) throw new Error(`Mobile manifest missing: ${source.id}/${width}`);
      data = await readFile(path.join(root, 'public', row.path));
      const metadata = await sharp(data).metadata();
      if (metadata.width !== width || metadata.height !== width || !metadata.hasAlpha) throw new Error(`Mobile dimensions differ: ${source.id}/${width}`);
      const expected = await sharp(original).resize(width, width, { kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer();
      const actual = await sharp(data).ensureAlpha().raw().toBuffer();
      // WebP may discard RGB under alpha zero. Every visible pixel and alpha must match.
      for (let i = 0; i < expected.length; i += 4) if (expected[i + 3] === 0) {
        expected[i] = expected[i + 1] = expected[i + 2] = 0;
        actual[i] = actual[i + 1] = actual[i + 2] = 0;
      }
      if (!actual.equals(expected)) throw new Error(`Mobile pixels differ: ${source.id}/${width}`);
    } else data = await sharp(original).resize(width, width, { kernel: 'lanczos3' }).webp({ lossless: true, effort: 6, quality: 100 }).toBuffer();
    const hash = digest(data), filename = `${source.id}-${width}-${hash.slice(0, 12)}.webp`;
    const relative = `assets/mobile/${filename}`;
    (width === 128 ? mapping : medium)[source.id] = relative;
    rows.push({ id: source.id, path: relative, stage: source.stage, bytes: data.length, sha256: hash, sourceSha256: digest(original), width, height: width, variant: width === 128 ? 'mobile' : 'medium' });
    if (check) {
      const actual = await readFile(path.join(directory, filename));
      if (!data.equals(actual)) throw new Error(`Mobile art differs: ${source.id}/${width}`);
    } else await writeFile(path.join(directory, filename), data);
  }
}
const files = [
  ['src/content/mobile-art.json', JSON.stringify(mapping, null, 2) + '\n'],
  ['src/content/medium-art.json', JSON.stringify(medium, null, 2) + '\n'],
  ['public/assets/mobile-manifest.json', JSON.stringify(rows, null, 2) + '\n'],
];
for (const [relative, content] of files) {
  const target = path.join(root, relative);
  if (check) {
    if ((await readFile(target, 'utf8')).replace(/\r\n/g, '\n') !== content) throw new Error(`Mobile manifest differs: ${relative}`);
  } else await writeFile(target, content);
}
// Delete only stale generated variants, after checking their absolute parent.
if (!check) {
  const expected = new Set(rows.map(row => path.basename(row.path)));
  for (const name of await readdir(directory)) {
    const target = path.resolve(directory, name);
    if (path.dirname(target) !== directory) throw new Error('Unexpected mobile asset path');
    if (/^[a-z0-9-]+-[a-f0-9]{12}\.webp$/.test(name) && !expected.has(name)) await unlink(target);
  }
}
const bytes = rows.reduce((sum, row) => sum + row.bytes, 0);
if (rows.length !== sourceRows.length * 2 || Object.keys(mapping).length !== sourceRows.length || Object.keys(medium).length !== sourceRows.length) throw new Error(`Mobile art inventory differs: ${rows.length} files`);
console.log(`Mobile art ${check ? 'verified' : 'built'}: ${sourceRows.length} approved sources, 128/256px lossless derivatives, ${(bytes / 1024 / 1024).toFixed(2)} MiB; 512px originals unchanged.`);
