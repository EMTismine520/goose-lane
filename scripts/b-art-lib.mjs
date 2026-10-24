import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const project = fileURLToPath(new URL('../', import.meta.url));
export const catalog = JSON.parse(await readFile(new URL('../artwork/b/catalog.json', import.meta.url), 'utf8'));
export const MEASURE_SIZE = 768;

export function svgGeometry(svg) {
  const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
  const viewBox = root.match(/\bviewBox="([^"]+)"/)?.[1].trim().split(/\s+/).map(Number);
  if (!/\bwidth="96"/.test(root) || !/\bheight="96"/.test(root)) throw new Error('SVG must declare width="96" height="96"');
  if (!viewBox || viewBox.length !== 4 || !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[2] !== viewBox[3]) throw new Error('SVG needs a positive square viewBox');
  if (/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svg)) throw new Error('SVG must contain editable, self-contained paths');
  return viewBox;
}

export async function measure(svg) {
  const { data, info } = await sharp(Buffer.from(svg), { density: 576 }).resize(MEASURE_SIZE, MEASURE_SIZE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1, edgeAlpha = 0, softPixels = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const alpha = data[(y * info.width + x) * info.channels + info.channels - 1];
    if (x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) edgeAlpha = Math.max(edgeAlpha, alpha);
    if (alpha > 0 && alpha < 255) softPixels++;
    if (alpha <= 16) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error('SVG has no visible subject');
  return { left, top, width: right - left + 1, height: bottom - top + 1, edgeAlpha, softPixels };
}
