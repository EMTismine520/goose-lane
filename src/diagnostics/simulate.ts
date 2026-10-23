import { writeFileSync } from 'node:fs';
import { simulateCampaign } from './campaign';
import type { SimulationStrategy } from './campaign';

const strategies: SimulationStrategy[] = ['simple-first', 'reward-first', 'stockpile', 'storage-heavy'];
const reports = strategies.map(strategy => simulateCampaign(strategy).report);
const result = {
  generatedAt: new Date().toISOString(),
  methodology: 'Legal commands only, fixed initial seed, 400 ms virtual time per action. Timers advance to readiness. This proves reachability and economy, not human session length or entertainment quality.',
  reports,
};
writeFileSync(new URL('./simulation-results.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
