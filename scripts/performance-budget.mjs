import { readFile, writeFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { tsImport } from 'tsx/esm/api';

const { planBoardAssets } = await tsImport('../src/game/board-assets.ts', import.meta.url);
const { createUiPreviewState } = await tsImport('../src/diagnostics/ui-preview-state.ts', import.meta.url);
const { availableOrders } = await tsImport('../src/domain/engine.ts', import.meta.url);
const { itemPresentation, mobileAssetPath } = await tsImport('../src/content/assets.ts', import.meta.url);
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const startup = new Set(['index.html']), visited = new Set();
const visit = key => {
  if (visited.has(key)) return; visited.add(key);
  const entry = manifest[key]; if (!entry) throw new Error('Missing startup module: ' + key);
  startup.add(entry.file); for (const css of entry.css || []) startup.add(css);
  for (const dependency of entry.imports || []) visit(dependency);
};
visit('index.html'); visit('src/game/Board.tsx');
const engine = Object.keys(manifest).find(key => /(?:^|\/)phaser-[\w-]+\.js$/.test(manifest[key].file));
if (!engine) throw new Error('Missing Phaser chunk'); visit(engine);
const files = [];
for (const file of startup) { const data = await readFile('dist/' + file); files.push({ file, bytes: data.length, gzipReferenceBytes: gzipSync(data).length }); }
const codeBytes = files.reduce((sum, file) => sum + file.gzipReferenceBytes, 0);
const scenarios = [];
for (const scenario of ['opening', 'late', 'full', 'legacy']) {
  const state = createUiPreviewState(scenario, 1800000000000), plan = planBoardAssets(state);
  const images = new Set(plan.critical.map(asset => asset.path));
  for (const order of availableOrders(state).slice(0, 3)) for (const need of order.needs) {
    const path = itemPresentation(need.item).path; if (path) images.add(mobileAssetPath(path));
  }
  let imageBytes = 0; for (const image of images) imageBytes += (await stat('dist/' + image)).size;
  const gzipReferenceBytes = codeBytes + imageBytes;
  const budget = scenario === 'opening' ? 1024 * 1024 : scenario === 'legacy' ? null : 1.5 * 1024 * 1024;
  scenarios.push({ scenario, blockingTextures: 0, initialTextures: plan.critical.length, prewarmTextures: plan.soon.length, visibleImageRequests: images.size, imageBytes, gzipReferenceBytes, budgetBytes: budget, budgetScope: 'startup-code-and-visible-art', artBytesInformational: false, pass: budget === null || gzipReferenceBytes <= budget });
}
const offline = JSON.parse(await readFile('dist/offline-budget.json', 'utf8'));
const mobile = JSON.parse(await readFile('public/assets/mobile-manifest.json', 'utf8'));
const report = { note: 'Build-time gzip reference, not a real iPhone network or frame-rate result. HTTP transfer and true-device timing are separate acceptance items.', startupCode: files, codeGzipReferenceBytes: codeBytes, mobileArt: { files: mobile.length, bytes: mobile.reduce((sum, row) => sum + row.bytes, 0) }, offline, scenarios };
await writeFile('dist/performance-budget.json', JSON.stringify(report, null, 2) + '\n');
if (scenarios.some(scenario => !scenario.pass)) throw new Error('Startup code + visible art budget exceeded; see dist/performance-budget.json');
console.log('Startup code + visible art budget passed: ' + scenarios.map(row => row.scenario + ' ' + (row.gzipReferenceBytes / 1024).toFixed(0) + ' KiB / ' + row.initialTextures + ' initial textures').join('; '));
