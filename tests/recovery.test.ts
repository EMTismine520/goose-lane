import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const html = await readFile('public/recover.html', 'utf8');
const script = html.match(/<script>([\s\S]+?)<\/script>/)![1];

describe('legacy link opens B directly', () => {
  it.each(['goose-lane', 'goose-lane-art-preview'])('opens B immediately under /%s/ without accessing workers or old saves', project => {
    const root = `https://emtismine520.github.io/${project}/`;
    const location = { href: root + 'recover.html?save=legacy#repair', replace: vi.fn() };
    // No document, worker or storage API is available: startup cannot wait for repair or a click.
    runInNewContext(script, { URL, location });
    expect(location.replace).toHaveBeenCalledExactlyOnceWith(root + 'food-styles.html');
  });

  it('also redirects without JavaScript and keeps a direct link available', () => {
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=./food-styles.html">');
    expect(html).toContain('href="./food-styles.html"');
    expect(html).not.toContain('<button');
  });
});
