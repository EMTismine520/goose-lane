import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const project = fileURLToPath(new URL('../', import.meta.url));
export const catalog = JSON.parse(await readFile(new URL('../artwork/b/catalog.json', import.meta.url), 'utf8'));
export const MEASURE_SIZE = 768;

export function svgGeometry(svg) {
  const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
  const viewBox = root.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  const widthAttribute = root.match(/\bwidth\s*=\s*["']([^"']+)["']/);
  const heightAttribute = root.match(/\bheight\s*=\s*["']([^"']+)["']/);
  const width = Number(widthAttribute?.[1]), height = Number(heightAttribute?.[1]);
  if ((widthAttribute || heightAttribute) && (!Number.isFinite(width) || width <= 0 || width !== height)) throw new Error('SVG dimensions must form a positive square when specified');
  if (!viewBox || viewBox.length !== 4 || !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[2] !== viewBox[3]) throw new Error('SVG needs a positive square viewBox');
  if (/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svg)) throw new Error('SVG must contain editable, self-contained paths');
  const ids = [...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error('SVG contains duplicate definition IDs');
  for (const match of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g)) if (!ids.includes(match[1])) throw new Error('SVG references a missing definition: ' + match[1]);
  return viewBox;
}

/** Fit only the viewport; the approved native geometry and colours stay byte-identical. */
export function fitSvgViewport(svg, bounds, occupancy) {
  const box = svgGeometry(svg);
  if (!Number.isFinite(occupancy) || occupancy <= 0 || occupancy >= 1) throw new Error('SVG occupancy must be between zero and one');
  const side = Math.max(bounds.width, bounds.height) / MEASURE_SIZE * box[2] / occupancy;
  const cx = box[0] + (bounds.left + bounds.width / 2) / MEASURE_SIZE * box[2];
  const cy = box[1] + (bounds.top + bounds.height / 2) / MEASURE_SIZE * box[3];
  const viewBox = [cx - side / 2, cy - side / 2, side, side].map(value => value.toFixed(6)).join(' ');
  return svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/, '$1"' + viewBox + '"');
}

/** Each embedded ingredient owns its definitions, including when it appears twice. */
export function embedSvgGeometry(svg, bounds, prefix) {
  let embedded = fitSvgViewport(svg, bounds, 80 / 96);
  embedded = embedded.replace(/\bid=(["'])([^"']+)\1/g, (_, quote, id) => 'id=' + quote + prefix + id + quote)
    .replace(/url\((["']?)#([^)'"\s]+)\1\)/g, (_, quote, id) => 'url(' + quote + '#' + prefix + id + quote + ')');
  embedded = embedded.replace(/<\?xml[^>]*\?>/g, '');
  const root = embedded.match(/<svg\b[^>]*>/)[0];
  const nestedRoot = root.replace(/\s+(?:width|height)\s*=\s*["'][^"']+["']/g, '').replace('<svg', '<svg width="96" height="96"');
  return embedded.replace(root, nestedRoot);
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
