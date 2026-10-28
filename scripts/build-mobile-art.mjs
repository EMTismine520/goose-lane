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
const mapping = {}, rows = [];
if (!check) await mkdir(directory, { recursive: true });
for (const source of sourceRows) {
  const original = await readFile(path.join(root, 'public', source.path));
  const data = await sharp(original).resize(128, 128, { kernel: 'lanczos3' }).webp({ lossless: true, effort: 4 }).toBuffer();
  const hash = digest(data), filename = `${source.id}-${hash.slice(0, 12)}.webp`;
  const relative = `assets/mobile/${filename}`;
  mapping[source.id] = relative;
  rows.push({ id: source.id, path: relative, stage: source.stage, bytes: data.length, sha256: hash, sourceSha256: digest(original) });
  if (check) {
    const actual = await readFile(path.join(directory, filename));
    if (!data.equals(actual)) throw new Error(`Mobile art differs: ${source.id}`);
  } else await writeFile(path.join(directory, filename), data);
}
const files = [
  ['src/content/mobile-art.json', JSON.stringify(mapping, null, 2) + '\n'],
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
if (rows.length !== 311 || bytes > 2.25 * 1024 * 1024) throw new Error(`Mobile art budget exceeded: ${rows.length} files, ${bytes} bytes`);
console.log(`Mobile art ${check ? 'verified' : 'built'}: ${rows.length} transparent 128×128 WebP, ${(bytes / 1024 / 1024).toFixed(2)} MiB.`);
