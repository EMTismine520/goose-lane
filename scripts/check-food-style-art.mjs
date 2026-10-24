/** Measured alpha/scale checks and an actual-size proof sheet for the ten local preview assets. */
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = fileURLToPath(new URL('../art/food-styles/', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const sources = JSON.parse(await readFile(path.join(root, 'sources.json'), 'utf8'));
const names = ['香肠', '培根', '肉丸', '鸡蛋', '红椒'];
const checks = [], layers = [];

let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="940" height="570"><rect width="940" height="570" fill="#f5f0e2"/><g font-family="Microsoft YaHei, sans-serif" fill="#60684e"><text x="32" y="42" font-size="22">五种食材 · 双风格样板</text><text x="32" y="68" font-size="12" fill="#949980">大图检查轮廓；下方小格为 50 像素棋盘中的实际占比。</text>';
for (const [row, [style, items]] of Object.entries(manifest).entries()) {
  const top = 100 + row * 235;
  svg += `<text x="32" y="${top + 28}" font-size="20">${row ? 'B' : 'A'}</text><text x="32" y="${top + 50}" font-size="11">${row ? '暖色卡通' : '精细手绘'}</text>`;
  for (const [column, [id, entry]] of Object.entries(items).entries()) {
    const filename = path.join(root, entry.path.split('/food-styles/')[1]);
    const { data, info } = await sharp(filename).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = info.width, right = 0, upper = info.height, bottom = 0, softAlpha = 0, transparentEdges = true;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha > 0 && alpha < 255) softAlpha++;
      if ((x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) && alpha !== 0) transparentEdges = false;
      if (alpha <= 16) continue;
      left = Math.min(left, x); right = Math.max(right, x); upper = Math.min(upper, y); bottom = Math.max(bottom, y);
    }
    const visibleMax = Math.max(right - left + 1, bottom - upper + 1) / info.width * entry.displaySize;
    const target = sources.find(source => source.id === id).visibleSize;
    const pass = info.width === 256 && info.height === 256 && transparentEdges && softAlpha > 0 && Math.abs(visibleMax - target) < .7;
    checks.push({ style, id, dimensions: [info.width, info.height], visibleMax: Number(visibleMax.toFixed(3)), target, transparentEdges, softAlpha, pass });
    if (!pass) throw new Error(`${style}/${id}: alpha or visible-size check failed`);
    const x = 128 + column * 158;
    svg += `<rect x="${x}" y="${top}" width="140" height="140" rx="14" fill="#fff8e4"/><text x="${x + 70}" y="${top + 161}" font-size="13" text-anchor="middle">${names[column]}</text><rect x="${x + 45}" y="${top + 174}" width="50" height="50" rx="5" fill="#fff2d5" stroke="#dcc499"/>`;
    layers.push({ input: await sharp(filename).resize(128, 128).png().toBuffer(), left: x + 6, top: top + 6 });
    const display = Math.round(entry.displaySize);
    layers.push({ input: await sharp(filename).resize(display, display).png().toBuffer(), left: x + 45 + Math.floor((50 - display) / 2) - 1, top: top + 174 + Math.floor((50 - display) / 2) - 3 });
  }
}
svg += '</g></svg>';
await mkdir(path.join(root, 'qa'), { recursive: true });
await sharp(Buffer.from(svg)).composite(layers).png().toFile(path.join(root, 'qa/sprite-contact.png'));
await writeFile(path.join(root, 'qa/asset-report.json'), JSON.stringify(checks, null, 2) + '\n');
console.log(JSON.stringify({ assets: checks.length, allPassed: checks.every(check => check.pass), visibleSizes: checks.map(({ style, id, visibleMax }) => ({ style, id, visibleMax })) }));
