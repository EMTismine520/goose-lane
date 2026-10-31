import { mkdir, writeFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { CHAPTERS } from '../src/content/chapters';
import { deviceAssetPath, mobileAssetPath } from '../src/content/assets';
import { createInitialState, execute, stateInvariantErrors } from '../src/domain/engine';
import { parseSave, serializeSave } from '../src/persistence/save';
import { auditChapter } from '../src/diagnostics/chapter-audit';
import { planBoardAssets } from '../src/game/board-assets';

const output = path.resolve(process.argv[2] ?? '../output/planv9-implementation-20261031');
await mkdir(output, { recursive: true });
const chapters = [];
for (const chapter of CHAPTERS) {
  let state = createInitialState(1_800_000_000_000);
  if (chapter.id !== 1) {
    state.coins = 60; // Disposable audit fixture; the gameplay simulation earns all entry fees.
    const entered = execute(state, { type: 'unlockAndEnterChapter', chapter: chapter.id }, state.lastSeen);
    if (!entered.ok || entered.state.coins !== 0) throw new Error('Entry failed: ' + chapter.name);
    state = entered.state;
  }
  const audit = auditChapter(state, chapter.id);
  if (stateInvariantErrors(state).length || audit.hardBlockedOrders || audit.targetBlockedOrders || audit.hiddenOrderSources) throw new Error('Incomplete chapter: ' + chapter.name);
  if (parseSave(serializeSave(state)).devices.length !== audit.equipment.length) throw new Error('Roundtrip failed');
  const images = [...new Set(audit.equipment.flatMap(e => {
    const full = deviceAssetPath(`${e.family}-l${e.actualLevel}`)!;
    return [full, mobileAssetPath(full)];
  }))];
  const sizes = await Promise.all(images.map(async p => ({ path: p, bytes: (await stat(path.join('public', p))).size })));
  chapters.push({ ...audit, images: sizes, boardCriticalAssets: planBoardAssets(state).critical.length });
}
const summary = {
  sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceDirty: !!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
  playerStorageAccessed: false, auditEntryFeeFixture: true,
  chapters: chapters.length, storyOrders: chapters.reduce((n, c) => n + c.orders.length, 0),
  recipes: new Set(chapters.flatMap(c => c.recipes)).size,
  regularTemplates: chapters.reduce((n, c) => n + c.regular.length, 0),
  equipment: chapters.reduce((n, c) => n + c.equipment.length, 0),
  onBoard: chapters.map(c => c.onBoard),
  hardBlockedOrders: chapters.reduce((n, c) => n + c.hardBlockedOrders, 0),
  targetBlockedOrders: chapters.reduce((n, c) => n + c.targetBlockedOrders, 0),
  hiddenOrderSources: chapters.reduce((n, c) => n + c.hiddenOrderSources, 0),
};
const json = (name: string, value: unknown) => writeFile(path.join(output, name), JSON.stringify(value, null, 2) + '\n');
await json('chapter-order-audit.json', { summary, chapters });
await json('audit-summary.json', summary);
const csv = (rows: unknown[][]) => '\uFEFF' + rows.map(row => row.map(v => '"' + String(v ?? '').replaceAll('"', '""') + '"').join(',')).join('\n') + '\n';
await writeFile(path.join(output, 'orders-145.csv'), csv([
  ['chapter', 'order', 'targets', 'recursive ingredients', 'required equipment', 'hard gaps', 'target gaps', 'hidden sources'],
  ...chapters.flatMap(c => c.orders.map(o => [c.chapter, o.id, o.targets.map(n => `${n.name}×${n.count}`).join('、'), o.ingredients.map(n => `${n.name}×${n.count}`).join('、'), o.requirements.map(r => `${r.name} ${r.level}级`).join('、'), o.hardDeficits.length, o.targetDeficits.length, o.hidden.length])),
]));
await writeFile(path.join(output, 'equipment-88.csv'), csv([
  ['chapter', 'family', 'name', 'minimum level', 'target level', 'actual level', 'index', 'row', 'column', 'device'],
  ...chapters.flatMap(c => c.equipment.map(e => [c.chapter, e.family, e.name, e.minimumLevel, e.level, e.actualLevel, e.index, Math.floor(e.index! / 7) + 1, e.index! % 7 + 1, e.deviceId])),
]));
await writeFile(path.join(output, 'chapter-provisioning-matrix.md'), '# 全章器材实际配套与上盘位置\n\n' + chapters.map(c => `## ${c.chapter}. ${c.name}\n\n${c.orders.length}个故事订单，${c.equipment.length}台器材全部在盘。\n\n|器材|配套等级|实际等级|棋盘位置|\n|---|---:|---:|---|\n` + c.equipment.map(e => `|${e.name}|${e.level}|${e.actualLevel}|${Math.floor(e.index! / 7) + 1}行${e.index! % 7 + 1}列（${e.index}）|`).join('\n')).join('\n\n') + '\n');
console.log(JSON.stringify({ output, ...summary }));
