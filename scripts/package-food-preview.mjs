import { cp, copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'dist');
const output = path.join(root, 'dist-preview');
if (path.dirname(output) !== root || path.basename(output) !== 'dist-preview') throw new Error('Unexpected preview output directory');
await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const name of ['assets', 'food-styles', 'notices', 'food-styles.html', 'food-style-frame.html', 'recover.html', 'favicon.svg']) {
  await cp(path.join(build, name), path.join(output, name), { recursive: true });
}
await copyFile(path.join(build, 'food-styles.html'), path.join(output, 'index.html'));
await writeFile(path.join(output, '.nojekyll'), '');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
await writeFile(path.join(output, 'README.md'), `# 鹅巷食光美术对照\n\n独立手机预览，不注册离线缓存。\n\n源码：[goose-lane / ${sha.slice(0, 7)}](https://github.com/EMTismine520/goose-lane/commit/${sha})\n\n[美术对照](https://emtismine520.github.io/goose-lane-art-preview/) · [恢复原游戏入口](https://emtismine520.github.io/goose-lane-art-preview/recover.html)\n`);
console.log('Food comparison: dist-preview/ (no service worker; separate Pages scope).');
