import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { catalog, project } from './b-art-lib.mjs';

const width = 960, tileWidth = 160, tileHeight = 184, header = 64;
const height = header + Math.ceil(catalog.length / 6) * tileHeight;
const composite = [];
let labels = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Microsoft YaHei,Arial,sans-serif;fill:#665b42}</style><text x="22" y="28" font-size="22">B 组暖色卡通 · 38 项 SVG</text><text x="22" y="50" font-size="12">文件声明 96×96 · 上方检查造型，下方按 50×50 棋盘设计格检查实际占比</text>`;
const config = JSON.parse(await readFile(path.join(project, 'src/content/b-art.json'), 'utf8'));
for (const [index, entry] of catalog.entries()) {
  const x = index % 6 * tileWidth, y = header + Math.floor(index / 6) * tileHeight;
  labels += `<rect x="${x+5}" y="${y+4}" width="150" height="176" rx="14" fill="${index%2 ? '#f1e7c8' : '#f6efd9'}"/><rect x="${x+55}" y="${y+117}" width="50" height="50" rx="5" fill="#fff5dc" stroke="#dcc29a"/><text x="${x+80}" y="${y+112}" text-anchor="middle" font-size="13">${entry.name}</text>`;
  const svg = await readFile(path.join(project, 'public', config[entry.id].path));
  composite.push({ input: await sharp(svg, {density:216}).resize(96,96).png().toBuffer(), left:x+32, top:y+8 });
  const size = Math.round(config[entry.id].displaySize);
  composite.push({ input: await sharp(svg, {density:216}).resize(size,size).png().toBuffer(), left:x+55+Math.round((50-size)/2), top:y+117+Math.round((50-size)/2) });
}
labels += '</svg>';
const base = await sharp({create:{width,height,channels:4,background:'#fff9e9'}}).composite([{input:Buffer.from(labels)}]).png().toBuffer();
await mkdir(path.join(project,'docs/images'),{recursive:true});
await sharp(base).composite(composite).png().toFile(path.join(project,'docs/images/b-overview.png'));
console.log('Artwork overview: docs/images/b-overview.png');
