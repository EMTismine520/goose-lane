import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Apply approved identities to stable IDs. Explicit target inputs make reruns safe
// when poultry slots swap; this never performs chained from-ID replacements.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const readJson = async file => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const contract = await readJson('artwork/plan4-food/content-contract.json');
const data = await readJson('src/content/expansion-data.json');
const before = structuredClone(data);
const raw = new Map(contract.rawItems.map(item => [item.id, item]));
if (raw.size !== 122 || data.items.length !== 122) throw Error('Approved raw-item inventory differs');
const recipeTargets = new Map(contract.recipes.map(recipe => [recipe.id, recipe]));
if (recipeTargets.size !== 31) throw Error('Recipe-reconciliation inventory differs');
for (const item of data.items) {
  const target = raw.get(item.id);
  if (!target || target.chain !== item.chain || target.level !== item.level) throw Error('Raw-item identity differs: ' + item.id);
  item.name = target.name;
  if (contract.changedRawIds.includes(item.id)) {
    item.naming = 'project';
    item.design = 'Plan4：采用用户确认的基础食材身份；referenceName保留原参考出处。';
  }
}
for (const chain of data.chains) {
  const members = contract.rawItems.filter(item => item.chain === chain.id).sort((a, b) => a.level - b.level);
  if (members.length !== chain.names.length) throw Error('Chain inventory differs: ' + chain.id);
  chain.names = members.map(item => item.name);
}
for (const recipe of data.recipes) {
  const target = recipeTargets.get(recipe.id);
  if (!target) continue;
  if (recipe.output !== target.output) throw Error('Recipe output identity differs: ' + recipe.id);
  recipe.name = target.name;
  recipe.inputs = structuredClone(target.inputs);
  if (recipe.name !== recipe.referenceName) {
    recipe.naming = 'project';
    recipe.design = 'Plan4：配方、名称与已确认基础食材一致；referenceName保留原参考出处。';
  }
}
const items = new Map(data.items.map(item => [item.id, item]));
const byOutput = new Map(data.recipes.map(recipe => [recipe.output, recipe]));
const devices = new Map(data.devices.map(device => [device.id, device]));
const costs = [1, 2, 4, 8, 16];
const solved = new Set(), solving = new Set();
function solve(recipe) {
  if (solved.has(recipe.id)) return;
  if (solving.has(recipe.id)) throw Error('Recipe cycle: ' + recipe.id);
  solving.add(recipe.id);
  const inputs = recipe.inputs.map(need => {
    const item = items.get(need.item);
    const upstream = byOutput.get(need.item);
    if (item) {
      const band = Math.floor((item.level - 1) / 3);
      return { name: item.name, rank: item.level, stage: item.stage, effort: costs[band] * 2 ** ((item.level - 1) % 3) / 1.44 * need.count };
    }
    if (!upstream) throw Error('Missing recipe input: ' + need.item);
    solve(upstream);
    return { name: upstream.name, rank: upstream.ancestorRank, stage: upstream.stage, effort: upstream.effort * need.count };
  });
  const family = devices.get(recipe.family);
  if (!family || family.kind !== 'appliance') throw Error('Missing appliance: ' + recipe.family);
  recipe.inputNames = inputs.map(input => input.name);
  recipe.ancestorRank = Math.max(...inputs.map(input => input.rank));
  // Approved identity replacements retain their existing progression and timer.
  const schedule = recipeTargets.get(recipe.id)?.schedule;
  if (schedule && schedule.family !== recipe.family) throw Error('Recipe appliance differs: ' + recipe.id);
  recipe.minDeviceLevel = schedule?.minDeviceLevel ?? (recipe.inputs.some(need => byOutput.has(need.item)) ? 3 : recipe.ancestorRank <= 3 ? 1 : recipe.ancestorRank <= 7 ? 2 : 3);
  recipe.stage = schedule?.stage ?? Math.max(3, family.stage, ...inputs.map(input => input.stage));
  recipe.duration = schedule?.duration ?? (family.baseSeconds + 2 * recipe.inputs.length + 2 * Math.min(recipe.ancestorRank, 8)) * 1000;
  recipe.effort = inputs.reduce((sum, input) => sum + input.effort, 0) + recipe.duration / 15000;
  solving.delete(recipe.id);
  solved.add(recipe.id);
}
data.recipes.forEach(solve);
const recipeKeys = new Set();
for (const recipe of data.recipes) {
  const key = recipe.family + ':' + recipe.inputs.map(need => need.item + ':' + need.count).sort().join(',');
  if (recipeKeys.has(key)) throw Error('Ambiguous recipe: ' + recipe.id);
  recipeKeys.add(key);
}
// Keep order IDs, ordering, output IDs and reference provenance; update only
// values derived from the real recipe. Names are resolved from ITEMS at runtime.
for (const order of data.orders) {
  const recipe = byOutput.get(order.output);
  if (!recipe) continue;
  order.stage = recipe.stage;
  order.minDeviceLevel = recipe.minDeviceLevel;
  order.effort = recipe.effort;
  order.coins = Math.max(24, Math.ceil(24 + recipe.effort * 6));
}
if (data.orders.some((order, i) => order.id !== before.orders[i].id || order.output !== before.orders[i].output)) throw Error('Order identity changed');
const catalogFile = 'src/content/catalog.ts';
let catalog = await readFile(path.join(root, catalogFile), 'utf8');
for (const id of ['fresh-veg', 'fresh-fruit', 'fresh-beast', 'fresh-poultry', 'fresh-spice']) {
  // Preserve the original bootstrap seed range. Later slots are created by
  // installExpansion with its standard band-cost price, not the seed 2**level.
  const names = data.chains.find(chain => chain.id === id).names.slice(0, contract.catalogSeedLevels?.[id]);
  const pattern = new RegExp("(\\{ id: '" + id + "'[^\\r\\n]*?names: )\\[[^\\]]*\\]");
  if (!pattern.test(catalog)) throw Error('Catalog seed chain missing: ' + id);
  catalog = catalog.replace(pattern, '$1[' + names.map(name => "'" + name + "'").join(', ') + ']');
}
const homePattern = /(\['chicken-roll', '香煎鸡肉卷', 34, )\[[^\]]*\]/;
if (!homePattern.test(catalog)) throw Error('Home chicken-roll definition missing');
catalog = catalog.replace(homePattern, '$1[' + contract.homeChickenRollInputIds.map(id => "'" + id + "'").join(', ') + ']');
const writes = [
  ['src/content/expansion-data.json', JSON.stringify(data, null, 2) + '\n'],
  [catalogFile, catalog],
  ['artwork/v3-b/base-recipes.json', JSON.stringify(contract.baseRecipes, null, 2) + '\n'],
];
for (const [file, content] of writes) {
  if (checkOnly) {
    if (await readFile(path.join(root, file), 'utf8') !== content) throw Error('Plan4 content is out of date: ' + file);
  } else await writeFile(path.join(root, file), content);
}
const changedRecipes = data.recipes.flatMap(recipe => {
  const old = before.recipes.find(row => row.id === recipe.id);
  return JSON.stringify(old) === JSON.stringify(recipe) ? [] : [{ id: recipe.id, output: recipe.output, before: old.name, after: recipe.name, inputNames: recipe.inputNames, inputs: recipe.inputs }];
});
const report = {
  mode: checkOnly ? 'check' : 'apply',
  rawItems: 122, recipes: 123, orders: data.orders.length,
  approvedRawNames: contract.changedRawIds.length,
  explicitRecipeTargets: contract.recipes.length,
  changedRecipes,
  recipeRevisions: contract.recipes.map(recipe => ({ id: recipe.id, output: recipe.output, before: recipe.previousName, after: recipe.name, beforeInputNames: recipe.previousInputNames, beforeInputs: recipe.previousInputs, inputs: recipe.inputs })),
  homeInputRevision: { id: 'fresh-home-chicken-roll', output: 'dish-fresh-home-chicken-roll', name: '香煎鸡肉卷', beforeInputIds: ['fresh-poultry-4', 'fresh-poultry-1', 'fresh-spice-2'], afterInputIds: contract.homeChickenRollInputIds },
  stableOrderIdsAndOutputs: true,
  hashes: Object.fromEntries(writes.map(([file, content]) => [file, createHash('sha256').update(content).digest('hex')])),
};
const reportFile = contract.reconciliationReport ?? 'output/plan4-round31-work/content-reconciliation.json';
if (!checkOnly) {
  await mkdir(path.dirname(path.join(root, reportFile)), { recursive: true });
  await writeFile(path.join(root, reportFile), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ mode: report.mode, rawItems: report.rawItems, recipes: report.recipes, orders: report.orders, approvedRawNames: report.approvedRawNames, explicitRecipeTargets: report.explicitRecipeTargets, changedRecipeCount: report.changedRecipes.length, stableOrderIdsAndOutputs: report.stableOrderIdsAndOutputs, hashes: report.hashes, reportFile }, null, 2));
