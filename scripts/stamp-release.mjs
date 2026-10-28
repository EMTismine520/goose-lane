import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await writeFile('dist/release.json', JSON.stringify({ sourceCommit,contentVersion:'3.0.0',schemaVersion:3,artwork:'B-warm-cartoon',vectorSize:96,sourceSize:512,runtimeSize:256,mobileRuntimeSize:128,boardDprLimit:2,assets:311,finished:139,recipes:123,orders:145 }, null, 2) + '\n');
await writeFile('dist/.nojekyll', '');
