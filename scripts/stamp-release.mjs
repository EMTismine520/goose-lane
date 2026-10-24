import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await writeFile('dist/release.json', JSON.stringify({ sourceCommit, artwork: 'B', svgWidth: 96, svgHeight: 96, assets: 38 }, null, 2) + '\n');
await writeFile('dist/.nojekyll', '');
