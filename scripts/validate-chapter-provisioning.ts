import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CHAPTERS } from '../src/content/chapters';
import { MODERN_RECIPES } from '../src/content/catalog';
import { chapterPlayer, simulateChapters } from '../src/diagnostics/chapter-simulation';

const output = path.resolve(process.argv[2] ?? '../output/planv9-implementation-20261031');
await mkdir(output, { recursive: true });
const save = (name: string, value: unknown) => writeFile(path.join(output, name), JSON.stringify(value, null, 2) + '\n');
const strictEquipment = true;
const depth = (item: string): number => {
  const recipe = MODERN_RECIPES.find(r => r.output === item);
  return recipe ? 1 + Math.max(...recipe.inputs.map(n => depth(n.item))) : 0;
};
const economy = [];
for (const c of CHAPTERS) {
  const high = [...c.dependencies.recipes].sort((a, b) => (b.minDeviceLevel ?? 1) - (a.minDeviceLevel ?? 1) || depth(b.output) - depth(a.output))[0];
  const nested = [...c.dependencies.recipes].sort((a, b) => depth(b.output) - depth(a.output) || (b.minDeviceLevel ?? 1) - (a.minDeviceLevel ?? 1))[0];
  const representatives = [...new Set([high, nested].filter(Boolean))];
  const samples = [];
  for (let seed = 1; seed <= 200; seed++) {
    const p = chapterPlayer(seed, { strictEquipment }); p.enter(c.id); p.resetPeak();
    const before = p.report; p.regular(); const startup = p.report;
    for (const recipe of representatives) p.ensure(recipe.output);
    const after = p.report;
    if (after.equipmentPurchases || after.equipmentMerges) throw new Error('Extra equipment consumption');
    samples.push({ seed, startup: { generated: startup.generated - before.generated, income: startup.coins - before.coins }, generated: after.generated - before.generated, energySpent: after.energySpent - before.energySpent, merges: after.merges - before.merges, commands: after.commands - before.commands, waitMs: after.waitMs - before.waitMs, coinChange: after.coins - before.coins, peakOccupancy: after.peakOccupancy, equipmentPurchases: after.equipmentPurchases, equipmentMerges: after.equipmentMerges });
  }
  const sorted = samples.map(s => s.startup.generated).sort((a, b) => a - b), p90 = sorted[179];
  const target = [5, 6, 7].includes(c.id) ? 30 : 20;
  if (p90 > target || samples.some(s => s.startup.income <= 0)) throw new Error('Startup economy target failed: ' + c.name);
  economy.push({ chapter: c.id, name: c.name, seeds: 200, productionP50: sorted[99], productionP90: p90, target, representatives: representatives.map(r => ({ id: r.id, name: r.name, level: r.minDeviceLevel, depth: depth(r.output) })), passed: true, samples });
  console.log(JSON.stringify({ chapter: c.id, seeds: 200, startupProductionP90: p90, representatives: representatives.map(r => r.name), passed: true }));
}
await save('strict-startup-and-recipes.json', { strictEquipment, inventoryOrGoldInjected: false, simulatedNotHumanPlaytime: true, chapters: economy });
const reports = [];
for (const [seed, order] of [[42, [6, 2, 8, 1, 4, 7, 3, 5]], [1868919585, [7, 8, 3, 5, 1, 4, 6, 2]], [123456789, [8, 4, 2, 6, 7, 5, 3, 1]]] as const) {
  const result = simulateChapters(seed, [...order], { strictEquipment });
  if (result.report.storyOrders !== 145 || !result.report.allStoriesComplete || result.report.equipmentPurchases || result.report.equipmentMerges) throw new Error('Strict story simulation incomplete');
  reports.push(result.report);
  console.log(JSON.stringify(result.report));
}
await save('strict-complete-simulations.json', reports);
console.log(JSON.stringify({ output, startupAndRecipeCases: 1600, fullStoryRuns: reports.length, equipmentPurchases: 0, equipmentMerges: 0, passed: true }));
