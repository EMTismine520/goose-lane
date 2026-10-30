import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'output/plan4-food-review');
const site = path.join(output, 'site');
const catalog = JSON.parse(await readFile(path.join(root, 'artwork/v3-b/catalog.json'), 'utf8'));
const byId = new Map(catalog.filter(row => row.kind !== 'device').map(row => [row.id, row]));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
const seenIds = new Set(), seenSources = new Set(), seenPixels = new Set();
const feedback = JSON.parse(await readFile(path.join(root, 'artwork/plan4-food/review-feedback.json'), 'utf8'));
async function checkpointAt(reviewId) {
  if (!/^[a-f0-9]{12}$/.test(reviewId)) throw new Error('Invalid feedback review id');
  const directory = path.join(output, 'checkpoints', reviewId, 'site');
  const manifest = JSON.parse(await readFile(path.join(directory, 'samples.json'), 'utf8'));
  if (manifest.reviewId !== reviewId || manifest.samples.length !== 24) throw new Error('Feedback does not match its archived review: ' + reviewId);
  return { directory, manifest, byId: new Map(manifest.samples.map(row => [row.id, row])) };
}
const first = await checkpointAt(feedback.sourceReviewId), second = await checkpointAt(feedback.revisionReviewId), outlineBase = await checkpointAt(feedback.outlineBaseReviewId), outlinePrevious = await checkpointAt(feedback.outlinePreviousReviewId);
const referenceIndices = new Set(feedback.referenceIndices), revisionIndices = new Set(feedback.revisionIndices);
if (referenceIndices.size !== 5 || revisionIndices.size !== 2 || [...referenceIndices].some(index => revisionIndices.has(index))) throw new Error('Feedback selections must contain five references and two separate revisions');
const originalIndices = new Set(feedback.originalIndices);
if (originalIndices.size !== 17 || first.manifest.samples.some(row => [referenceIndices, revisionIndices, originalIndices].filter(group => group.has(row.index)).length !== 1)) throw new Error('Each reviewed food must have exactly one selected version');
const selectionCounts = { original: 0, modified: 0, approvedSample: 0, approvedRevision: 0 };
const outlineIndices = new Set(feedback.outlineIndices);
if (outlineIndices.size !== 7 || [...referenceIndices, ...revisionIndices].some(index => !outlineIndices.has(index))) throw new Error('Only the seven selected modified foods may receive outlines');
const outlineDirectory = path.join(root, 'artwork/plan4-food/outlined');
const expectedOutlineFiles = first.manifest.samples.filter(row => outlineIndices.has(row.index)).map(row => row.id + '.svg').sort();
const actualOutlineFiles = (await readdir(outlineDirectory)).filter(name => name.endsWith('.svg')).sort();
if (expectedOutlineFiles.join('\n') !== actualOutlineFiles.join('\n')) throw new Error('Outline masters must contain exactly the seven requested food identities');
let outlinedCount = 0, originalByteIdenticalCount = 0;
for (const dir of ['assets/new', 'assets/before', 'assets/highres', 'assets/candidate', 'assets/outline-before', 'assets/prior-outline', 'sources', 'contacts']) await mkdir(path.join(site, dir), { recursive: true });

async function archivedFile(checkpoint, relative) {
  const target = path.resolve(checkpoint.directory, relative), within = path.relative(checkpoint.directory, target);
  if (within === '..' || within.startsWith('..' + path.sep) || path.isAbsolute(within)) throw new Error('Archived artwork path leaves its review');
  return readFile(target);
}

function validateSvg(svg, id) {
  const tag = svg.match(/<svg\b[^>]*>/)?.[0];
  const box = tag?.match(/\bviewBox\s*=\s*["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if (!box || box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0) throw new Error(id + ': invalid SVG viewBox');
  if (/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svg)) throw new Error(id + ': source must be self-contained editable SVG');
  const ids = [...svg.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(id + ': duplicate SVG definition id');
  for (const match of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g)) if (!ids.includes(match[1])) throw new Error(id + ': missing SVG definition ' + match[1]);
  return box;
}

function alphaBounds(data, info, threshold = 16) {
  let left = info.width, top = info.height, right = -1, bottom = -1, edgeAlpha = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const alpha = data[(y * info.width + x) * info.channels + info.channels - 1];
    if (x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) edgeAlpha = Math.max(edgeAlpha, alpha);
    if (alpha <= threshold) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error('Image has no visible food');
  return { left, top, width: right - left + 1, height: bottom - top + 1, edgeAlpha };
}

async function fitArtwork(svg, id) {
  const box = validateSvg(svg, id);
  const first = await sharp(Buffer.from(svg)).resize(1024, 1024).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const before = alphaBounds(first.data, first.info);
  if (before.edgeAlpha > 0) throw new Error(id + ': artwork touches its source edge; repair the master rather than cropping it');
  const longest = Math.max(before.width / 1024 * box[2], before.height / 1024 * box[3]);
  const side = longest / .8;
  const centerX = box[0] + (before.left + before.width / 2) / 1024 * box[2];
  const centerY = box[1] + (before.top + before.height / 2) / 1024 * box[3];
  const fitted = svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/, '$1"' + [centerX - side / 2, centerY - side / 2, side, side].map(value => value.toFixed(6)).join(' ') + '"');
  const png1024 = await sharp(Buffer.from(fitted)).resize(1024, 1024).png().toBuffer();
  const png512 = await sharp(png1024).resize(512, 512).png().toBuffer();
  const webp512 = await sharp(png512).webp({ lossless: true, effort: 6 }).toBuffer();
  const final = await sharp(png1024).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bounds = alphaBounds(final.data, final.info);
  const occupancy = Math.max(bounds.width, bounds.height) / 1024;
  if (bounds.edgeAlpha > 0 || Math.abs(occupancy - .8) > .003) throw new Error(id + ': normalized clear space check failed');
  return { png1024, png512, webp512, fitted, sourceBounds: before, normalizedBounds: bounds, occupancy };
}

async function checkExport(bytes, size, id) {
  const image = await sharp(bytes).metadata();
  if (image.width !== size || image.height !== size || !image.hasAlpha) throw new Error(id + ': archived export dimensions or transparency differ');
  const pixels = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bounds = alphaBounds(pixels.data, pixels.info), occupancy = Math.max(bounds.width, bounds.height) / size;
  if (bounds.edgeAlpha > 0 || Math.abs(occupancy - .8) > .006) throw new Error(id + ': archived clear space differs');
  return occupancy;
}

async function approvedArtwork(checkpoint, archived) {
  const [source, png512, png1024, webp512] = await Promise.all([archived.source, archived.png, archived.highres, archived.after].map(relative => archivedFile(checkpoint, relative)));
  validateSvg(source.toString('utf8'), archived.id);
  if (hash(source) !== archived.sha256.source || hash(png512) !== archived.sha256.png512 || hash(webp512) !== archived.sha256.webp512) throw new Error(archived.id + ': approved artwork differs from its recorded hash');
  const occupancy = await checkExport(webp512, 512, archived.id);
  await checkExport(png512, 512, archived.id);
  await checkExport(png1024, 1024, archived.id);
  return { source, png512, png1024, webp512, occupancy };
}

async function outlinedArtwork(id, baseArtwork, previousArtwork) {
  const source = await readFile(path.join(outlineDirectory, id + '.svg'));
  const svg = source.toString('utf8'), baseSvg = baseArtwork.source.toString('utf8');
  const start = '<!-- plan4:outline:start -->', end = '<!-- plan4:outline:end -->';
  if (svg.split(start).length !== 2 || svg.split(end).length !== 2) throw new Error(id + ': expected exactly one marked outline layer');
  const layer = svg.match(/<!-- plan4:outline:start -->[\s\S]*?<!-- plan4:outline:end -->/)?.[0];
  if (!layer || svg.replace(layer, '') !== baseSvg) throw new Error(id + ': removing the outline must restore the approved master byte-for-byte');
  const previousSvg = previousArtwork.source.toString('utf8');
  const previousLayer = previousSvg.match(/<!-- plan4:outline:start -->[\s\S]*?<!-- plan4:outline:end -->/)?.[0];
  if (!previousLayer || previousSvg.replace(previousLayer, '') !== baseSvg) throw new Error(id + ': the previous outline must share the approved unoutlined master');
  const normalizeVisibleWidths = value => value.replace(/<mask\b[\s\S]*?<\/mask>|\bstroke-width="([^"]+)"/g, (match, width) => width === undefined ? match : 'stroke-width="VISIBLE_WIDTH"');
  if (normalizeVisibleWidths(layer) !== normalizeVisibleWidths(previousLayer)) throw new Error(id + ': only visible outline stroke-width values may change; masks, shapes and colors must remain identical');
  const visibleWidths = value => [...value.replace(/<mask\b[\s\S]*?<\/mask>/g, '').matchAll(/\bstroke-width="([^"]+)"/g)].map(match => Number(match[1]));
  const widths = visibleWidths(layer), previousWidths = visibleWidths(previousLayer);
  if (!widths.length || widths.some((width, index) => !Number.isFinite(width) || width <= 0 || width > previousWidths[index]) || !widths.some((width, index) => width < previousWidths[index])) throw new Error(id + ': visible outline widths must become thinner without any width increase');
  const colors = [...new Set([...layer.matchAll(/\bstroke="(#[a-fA-F0-9]{6})"/g)].map(match => match[1].toLowerCase()))];
  if (!colors.includes('#2b211c')) throw new Error(id + ': clear near-black vector outlines are required');
  const strokeWidths = [...new Set(widths)].sort((a, b) => a - b);
  const fitted = await fitArtwork(svg, id + '-outlined');
  if (hash(source) === hash(baseArtwork.source) || hash(fitted.png512) === hash(baseArtwork.png512)) throw new Error(id + ': the outline request needs a visible artwork update');
  return { ...fitted, source, parameters: { colors, strokeWidths, previousStrokeWidths: [...new Set(previousWidths)].sort((a, b) => a - b), units: 'SVG viewBox units', method: '参考原版收细可见描边；保留原造型、内部材质、描边颜色与遮罩' } };
}

const rows = [];
for (const sample of first.manifest.samples) {
  const original = byId.get(sample.id);
  if (!original || original.name !== sample.name || !/^[a-z0-9-]+$/.test(original.id)) throw new Error('Sample is not a current food identity: ' + sample.name);
  if (seenIds.has(original.id)) throw new Error('Duplicate sample identity: ' + original.id);
  seenIds.add(original.id);
  const later = second.byId.get(original.id);
  if (!later || later.index !== sample.index) throw new Error(original.id + ': sample numbering changed between reviews');
  const oldSource = await archivedFile(first, sample.beforeSource), oldSvg = oldSource.toString('utf8');
  if (hash(oldSource) !== sample.sha256.beforeSource) throw new Error(original.id + ': original source differs from its archived hash');
  const before = await fitArtwork(oldSvg, original.id + '-before');
  before.webp512 = await archivedFile(first, sample.before);
  await checkExport(before.webp512, 512, original.id + '-before');
  let selection, status, statusLabel, selected, design, selectionReviewId;
  if (referenceIndices.has(sample.index)) {
    selection = 'approved-sample'; status = 'APPROVED_SAMPLE'; statusLabel = '采用第一轮修改版';
    selected = await approvedArtwork(first, sample); design = sample.design; selectionReviewId = feedback.sourceReviewId;
    selectionCounts.approvedSample++; selectionCounts.modified++;
  } else if (revisionIndices.has(sample.index)) {
    selection = 'approved-revision'; status = 'APPROVED_REVISION'; statusLabel = '采用第二轮修改版';
    selected = await approvedArtwork(second, later); design = later.design; selectionReviewId = feedback.revisionReviewId;
    selectionCounts.approvedRevision++; selectionCounts.modified++;
  } else {
    selection = 'original'; status = 'KEEP_ORIGINAL'; statusLabel = '保留原版';
    selected = { ...before, source: oldSource }; selectionReviewId = 'original-v4';
    design = { silhouette: '保留原版造型与清晰黑色外轮廓', angle: '沿用原版观察角度', material: '沿用原版色块与材质表现', identity: '原物品身份与已认可的原版辨识特征', container: '沿用原版盛器与主体构图' };
    selectionCounts.original++;
    if (!selected.webp512.equals(before.webp512)) throw new Error(original.id + ': original selection must be byte-identical to the original comparison');
  }
  const archivedSelection = outlineBase.byId.get(original.id);
  if (!archivedSelection || archivedSelection.index !== sample.index || archivedSelection.sha256.source !== hash(selected.source)) throw new Error(original.id + ': selected shape differs from the confirmed outline baseline');
  const confirmedBase = await approvedArtwork(outlineBase, archivedSelection);
  let outlineBefore = null, priorOutline = null;
  if (outlineIndices.has(sample.index)) {
    outlineBefore = confirmedBase;
    const prior = outlinePrevious.byId.get(original.id);
    if (!prior || prior.index !== sample.index || !prior.outlineApplied || prior.baseSourceHash !== hash(confirmedBase.source)) throw new Error(original.id + ': previous outlined review must preserve the same approved base');
    priorOutline = await approvedArtwork(outlinePrevious, prior);
    selected = await outlinedArtwork(original.id, confirmedBase, priorOutline);
    statusLabel += '·描边已收细';
    outlinedCount++;
  } else {
    if (!selected.source.equals(confirmedBase.source) || !selected.png512.equals(confirmedBase.png512) || !selected.webp512.equals(confirmedBase.webp512)) throw new Error(original.id + ': an unrequested original artwork changed');
    originalByteIdenticalCount++;
  }
  const sourceHash = hash(selected.source);
  if (seenSources.has(sourceHash)) throw new Error(original.id + ': duplicate source artwork');
  seenSources.add(sourceHash);
  const pixelHash = hash(selected.png512);
  if (seenPixels.has(pixelHash)) throw new Error(original.id + ': duplicate rendered artwork');
  seenPixels.add(pixelHash);
  const row = {
    index: sample.index, id: original.id, name: sample.name, group: sample.group, kind: original.kind,
    selection, selectionReviewId, status, statusLabel,
    design, source: 'sources/' + original.id + '.svg', beforeSource: 'sources/' + original.id + '-before.svg',
    after: 'assets/new/' + original.id + '.webp', before: 'assets/before/' + original.id + '.webp',
    png: 'assets/new/' + original.id + '.png', highres: 'assets/highres/' + original.id + '.png',
    selectionBasis: selection === 'original' ? '用户明确选择未经修改的原版' : '保留用户确认的' + (selection === 'approved-sample' ? '第一轮' : '第二轮') + '造型与内部材质，参考原有美术将黑色描边收细',
    styleRule: feedback.styleRule,
    sha256: { source: sourceHash, png512: pixelHash, webp512: hash(selected.webp512), highres: hash(selected.png1024), beforeSource: hash(oldSource), beforeWebp512: hash(before.webp512) },
    bytes: { source: selected.source.length, png1024: selected.png1024.length, png512: selected.png512.length, webp512: selected.webp512.length },
    normalizedOccupancy: { after: selected.occupancy, before: before.occupancy },
  };
  if (outlineBefore) {
    row.outlineApplied = true;
    row.outlineBefore = 'assets/outline-before/' + original.id + '.webp';
    row.outlineBeforeHighres = 'assets/outline-before/' + original.id + '-1024.png';
    row.outlineBeforeSource = 'sources/' + original.id + '-outline-before.svg';
    row.outlineBaseReviewId = feedback.outlineBaseReviewId;
    row.baseSourceHash = hash(outlineBefore.source);
    row.priorOutline = 'assets/prior-outline/' + original.id + '.webp';
    row.priorOutlineHighres = 'assets/prior-outline/' + original.id + '-1024.png';
    row.priorOutlineSource = 'sources/' + original.id + '-prior-outline.svg';
    row.outlinePreviousReviewId = feedback.outlinePreviousReviewId;
    row.priorOutlineSha256 = { source: hash(priorOutline.source), highres: hash(priorOutline.png1024), webp512: hash(priorOutline.webp512) };
    row.outlineParameters = selected.parameters;
    row.outlineStatus = 'PENDING_USER_REVIEW';
    await Promise.all([
      writeFile(path.join(site, row.outlineBefore), outlineBefore.webp512),
      writeFile(path.join(site, row.outlineBeforeHighres), outlineBefore.png1024),
      writeFile(path.join(site, row.outlineBeforeSource), outlineBefore.source),
      writeFile(path.join(site, row.priorOutline), priorOutline.webp512),
      writeFile(path.join(site, row.priorOutlineHighres), priorOutline.png1024),
      writeFile(path.join(site, row.priorOutlineSource), priorOutline.source),
    ]);
  }
  if (selection !== 'approved-sample') {
    row.candidate = 'assets/candidate/' + original.id + '.webp';
    row.candidateHighres = 'assets/candidate/' + original.id + '-1024.png';
    row.candidateSource = 'sources/' + original.id + '-candidate.svg';
    row.candidateReviewId = feedback.sourceReviewId;
    row.candidateSha256 = sample.sha256;
    row.candidateLabel = selection === 'original' ? '未选用的第一轮样板' : '上一轮样板';
    await Promise.all([
      [sample.after, row.candidate], [sample.highres, row.candidateHighres], [sample.source, row.candidateSource],
    ].map(async ([from, to]) => writeFile(path.join(site, to), await archivedFile(first, from))));
  }
  await Promise.all([
    writeFile(path.join(site, row.source), selected.source),
    writeFile(path.join(site, row.beforeSource), oldSource),
    writeFile(path.join(site, row.after), selected.webp512),
    writeFile(path.join(site, row.before), before.webp512),
    writeFile(path.join(site, row.png), selected.png512),
    writeFile(path.join(site, row.highres), selected.png1024),
  ]);
  rows.push(row);
}

async function contactSheet(size, comparison = false, outlinesOnly = false, includeOriginal = false) {
  const cols = includeOriginal ? 3 : comparison ? 4 : 6, cellWidth = includeOriginal ? size * 3 + 74 : comparison ? size * 2 + 56 : size + 44, cellHeight = size + 48;
  const layers = [];
  const subset = outlinesOnly ? rows.filter(row => row.outlineApplied) : rows;
  for (const [index, row] of subset.entries()) {
    const x = index % cols * cellWidth, y = Math.floor(index / cols) * cellHeight;
    const variants = includeOriginal ? [['before', 12], ['priorOutline', size + 30], ['after', size * 2 + 48]] : comparison ? [[outlinesOnly ? 'priorOutline' : 'before', 12], ['after', size + 30]] : [['after', 22]];
    for (const [variant, offset] of variants) layers.push({ input: await sharp(path.join(site, row[variant])).resize(size, size).png().toBuffer(), left: x + offset, top: y + 6 });
    const captions = { before: '原版V4', priorOutline: '上轮粗描边', after: outlinesOnly ? '本轮细描边' : '选用结果' };
    const labels = comparison ? variants.map(([variant, offset]) => '<text x="' + (offset + size / 2) + '" y="29" text-anchor="middle" font-size="8" fill="' + (variant === 'after' ? '#527a56' : '#887760') + '">' + captions[variant] + '</text>').join('') : '<text x="' + cellWidth / 2 + '" y="29" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="8" fill="#527a56">' + escapeXml(row.statusLabel) + '</text>';
    const label = '<svg xmlns="http://www.w3.org/2000/svg" width="' + cellWidth + '" height="36"><text x="' + cellWidth / 2 + '" y="14" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="10" fill="#4f3d2d">' + row.index + ' · ' + escapeXml(row.name) + '</text>' + labels + '</svg>';
    layers.push({ input: Buffer.from(label), left: x, top: y + size + 7 });
  }
  const filename = 'contacts/' + (includeOriginal ? 'outline-original-reference-' : outlinesOnly ? 'outline-comparison-' : comparison ? 'comparison-' : 'contact-') + size + '.png';
  await sharp({ create: { width: cellWidth * cols, height: cellHeight * Math.ceil(subset.length / cols), channels: 4, background: '#fff4df' } }).composite(layers).png().toFile(path.join(site, filename));
  return filename;
}
const contacts = [];
for (const size of [96, 40, 32]) contacts.push({ size, after: await contactSheet(size), comparison: await contactSheet(size, true) });
const outlineContacts = [];
for (const size of [96, 40]) outlineContacts.push({ size, comparison: await contactSheet(size, true, true), originalReference: await contactSheet(size, true, true, true) });

if (selectionCounts.original !== 17 || selectionCounts.approvedSample !== 5 || selectionCounts.approvedRevision !== 2 || outlinedCount !== 7 || originalByteIdenticalCount !== 17) throw new Error('Only seven selected artworks may be outlined while seventeen originals remain identical');
const reviewId = hash(rows.map(row => [row.index, row.selection, row.selectionReviewId, row.sha256.source].join(':')).join('\n')).slice(0, 12);
const manifest = {
  title: '鹅巷食光 · 七项描边收细', reviewId, status: 'OUTLINE_UPDATE_READY',
  scope: '本轮参考原有美术，仅收细8、9、12、13、17、2、11号的可见黑色描边；保留其造型、内部材质、描边颜色与遮罩，其余17项原版保持不变。完整245项尚未完成，选用结果尚未接入正式游戏。',
  feedback: { ...feedback, referenceCount: referenceIndices.size, revisionCount: revisionIndices.size, selectionCounts },
  selectionCounts,
  normalization: '原版与样板均按透明边界归一到画布最长边80%，比较不依赖放大新版。',
  artworkAcceptance: '七项仅收细新增描边层的可见线宽；工程检查证明底稿、遮罩、造型、内部材质与颜色保留，描边效果由用户验收。',
  checks: { samples: rows.length, uniqueIdentities: seenIds.size, uniqueSources: seenSources.size, uniqueRenderedImages: seenPixels.size, transparentPadding: true, normalizedSubjectRatio: .8, originalSelectionsByteIdentical: originalByteIdenticalCount, approvedBaseArtworkPreserved: outlinedCount, outlinedSamples: outlinedCount, outlineBaseReviewId: feedback.outlineBaseReviewId, outlinePreviousReviewId: feedback.outlinePreviousReviewId, visibleStrokeWidthOnlyChanges: outlinedCount, approvedSourceReviews: [feedback.sourceReviewId, feedback.revisionReviewId] },
  contacts, outlineContacts, samples: rows,
};
const json = JSON.stringify(manifest, null, 2) + '\n';
await Promise.all([writeFile(path.join(output, 'samples.json'), json), writeFile(path.join(site, 'samples.json'), json)]);
const template = await readFile(path.join(root, 'scripts/build-plan4-food-review.html'), 'utf8');
const inline = JSON.stringify(manifest).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
await writeFile(path.join(site, 'index.html'), template.replace('__PLAN4_REVIEW__', inline));
console.log(JSON.stringify({ status: manifest.status, reviewId, samples: rows.length, output, site, integrity: manifest.checks, totalWebpBytes: rows.reduce((sum, row) => sum + row.bytes.webp512, 0), note: manifest.artworkAcceptance }, null, 2));
