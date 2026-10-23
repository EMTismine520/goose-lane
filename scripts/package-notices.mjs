import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist/notices', { recursive: true });
await cp('docs/THIRD_PARTY_NOTICES.md', 'dist/notices/THIRD_PARTY_NOTICES.md');
await cp('docs/ASSETS.md', 'dist/notices/ASSETS.md');
await cp('docs/licenses', 'dist/notices/licenses', { recursive: true });
