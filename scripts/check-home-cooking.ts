import { writeFileSync, mkdirSync } from 'node:fs';
import { simulateHomeCooking } from '../src/diagnostics/home-cooking';
import { serializeSave } from '../src/persistence/save';

const seeds = [0x6f657321, 123456789, 987654321];
const runs = seeds.map(seed => simulateHomeCooking(seed));
mkdirSync('docs/validation/home-cooking', { recursive: true });
writeFileSync('docs/validation/home-cooking/simulation.json', JSON.stringify(runs.map(run => run.report), null, 2) + '\n');
// This is a separate QA fixture produced entirely by commands, never the player's save.
writeFileSync('docs/validation/home-cooking/played-save.json', serializeSave(runs[0].state));
console.log(JSON.stringify(runs.map(run => ({ seed: run.report.seed, ...run.report.home })), null, 2));
