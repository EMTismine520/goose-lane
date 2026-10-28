import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sourceDirty = !!execFileSync('git', ['status','--porcelain'], { encoding: 'utf8' }).trim();
const content = JSON.parse(await readFile('public/content/v3-catalog.json','utf8'));
await writeFile('dist/release.json', JSON.stringify({ sourceCommit,sourceDirty,contentVersion:content.version,schemaVersion:content.schema,artwork:'V4-warm-cartoon',vectorSize:96,sourceSize:512,runtimeSize:256,mobileRuntimeSize:128,boardDprLimit:2,assets:content.counts.total,finished:content.counts.finished,recipes:content.counts.recipes,orders:content.counts.orders },null,2)+'\n');
await writeFile('dist/.nojekyll','');
