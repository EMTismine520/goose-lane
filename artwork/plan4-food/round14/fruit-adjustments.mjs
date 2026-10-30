// Review-only arrangement and colour adjustments; source artwork remains intact.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { exoticTailCandidates } from '../round13/exotic-tail.mjs';

const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const blueberryOriginal = readFileSync(new URL('../../v3-b/masters/fresh-exotic-1.svg', import.meta.url), 'utf8');
const placements = [
  { part: 'berry-1', originalTransform: 'translate(33 34) rotate(0) scale(1.15)', translate: [13, 5] },
  { part: 'berry-2', originalTransform: 'translate(66 43) rotate(0) scale(1.1)', translate: [-4, 16] },
  { part: 'berry-3', originalTransform: 'translate(43 69) rotate(0) scale(1.25)', translate: [-4.5, -7] },
  { part: 'leaf', originalTransform: 'translate(65 23) rotate(50) scale(0.6)', translate: [-9, 8] },
];

// Each original group is kept byte for byte inside an added translation group.
// Removing these four wrappers returns the exact original document.
let blueberryCluster = blueberryOriginal;
for (const { part, originalTransform, translate } of placements) {
  const start = `<g transform="${originalTransform}">`;
  const at = blueberryCluster.indexOf(start);
  if (at < 0) throw new Error(`Missing original blueberry part: ${part}`);
  const end = blueberryCluster.indexOf('</g>', at) + 4;
  const group = blueberryCluster.slice(at, end);
  blueberryCluster = blueberryCluster.slice(0, at)
    + `<g data-round14-position="${part}" transform="translate(${translate.join(' ')})">${group}</g>`
    + blueberryCluster.slice(end);
}

export const arrangementProof = {
  source: 'artwork/v3-b/masters/fresh-exotic-1.svg',
  sourceSha256: sha256(blueberryOriginal),
  originalBerryCount: 3,
  resultingBerryCount: 3,
  transforms: placements,
  noGeometryChange: true,
  noPaletteChange: true,
  noIndividualScaleChange: true,
  restoreOriginal: 'Remove the four g[data-round14-position] wrappers only; all original bytes remain in order.',
};

export const blueberryClusterCandidates = [{
  id: 'fresh-exotic-1',
  name: '蓝莓',
  svg: blueberryCluster,
  expectedOccupancy: .66,
  design: {
    silhouette: '沿用原版三枚圆蓝莓，上方一枚、下方两枚紧密相接，收成小型三角果簇',
    angle: '保留三枚原果的朝向和各自尺寸，仅平移果子和原有小叶，前后轻叠',
    material: '完整保留原版粉蓝紫渐变、果粉、暖色细描边、果冠与奶油色反光',
    identity: '三颗带五角果冠的原版蓝莓，保留原叶，不增加果子或装饰',
    container: '透明底裸果，一级整体体量保持小巧，聚拢后不留浮空缝隙',
  },
  reason: '只调整原版三颗蓝莓的相对位置，让它们自然聚成一簇；果形、数量、颜色、材质、描边与叶片均取自原稿，保留一级小体量。',
  arrangementProof,
}];

const mulberryOriginal = exoticTailCandidates.find(({ id }) => id === 'fresh-exotic-8');
if (!mulberryOriginal) throw new Error('Missing selected round13 mulberry');

const palette = {
  '#95669c': '#5f547e',
  '#71437f': '#3e355f',
  '#533060': '#282842',
  '#392345': '#1d2034',
  '#a174aa': '#76638f',
  '#7f4f8f': '#493b67',
  '#5f376e': '#2c2c49',
  '#93649e': '#6a537f',
  '#6f447f': '#453057',
  '#482b59': '#272139',
  '#573b63': '#343047',
  '#d1b0cc': '#b18ba5',
};
const recolourMulberry = (svg) => svg.replace(/#[0-9a-f]{6}\b/gi, (hex) => palette[hex.toLowerCase()] ?? hex);

export const colourProof = {
  source: 'artwork/plan4-food/round13/exotic-tail.mjs',
  sourceId: 'fresh-exotic-8',
  sourceSha256: sha256(mulberryOriginal.svg),
  mapping: palette,
  noGeometryChange: true,
  noOutlineWidthChange: true,
  noStemChange: true,
  transformation: 'Replace complete six-digit hexadecimal colours using mapping; retain all other SVG bytes.',
};

export const mulberryColourCandidates = [{
  id: 'fresh-exotic-8',
  name: '桑葚',
  svg: recolourMulberry(mulberryOriginal.svg),
  expectedOccupancy: .80,
  design: {
    silhouette: '完整沿用已选新稿两枚细长桑葚与紧密小核果轮廓，果子位置及短柄不变',
    angle: '后果左斜、前果右斜的原构图与重叠关系完全保留',
    material: '成熟蓝黑与深紫果色，克制的紫酒色高光，压低浅薰衣草色并保留小核果层次',
    identity: '细长聚合果与密集小核果保留已选新稿特征，细暗轮廓及绿柄沿用',
    container: '两枚裸果透明底，保持原新稿八级占幅与体量',
  },
  reason: '保留已选新桑葚的全部形状、核果数量、坐标、描边粗细与短果柄，仅把果皮调整为成熟深蓝紫色，减少浅薰衣草感，使40px下仍有紧密小核果的层次。',
  colourProof,
}];
