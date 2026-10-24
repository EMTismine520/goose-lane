import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ItemArtOverrides } from '../content/assets';
import { SaveRepository } from '../persistence/save';
import App from '../ui/App';
import { ItemArtProvider } from '../ui/ItemArtContext';
import { createFoodStyleState } from './food-style-state';

type Style = 'painted' | 'cartoon';
type Manifest = Record<Style, ItemArtOverrides>;

function Preview({ repository, manifest, scope }: { repository: SaveRepository; manifest: Manifest; scope: string }) {
  const query = new URLSearchParams(location.search);
  const [variant, setVariant] = useState<Style>(query.get('style') === 'cartoon' ? 'cartoon' : 'painted');
  const [renderer, setRenderer] = useState<'canvas' | 'auto'>(query.get('renderer') === 'auto' ? 'auto' : 'canvas');
  const [pixelRatio, setPixelRatio] = useState(Number(query.get('dpr')) || 3);
  const config = useMemo(() => ({ items: manifest[variant], renderer, pixelRatio }), [manifest, variant, renderer, pixelRatio]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'food-art:config') return;
      if (event.data.style === 'painted' || event.data.style === 'cartoon') setVariant(event.data.style);
      if (event.data.renderer === 'canvas' || event.data.renderer === 'auto') setRenderer(event.data.renderer);
      if ([1, 2, 3].includes(event.data.dpr)) setPixelRatio(event.data.dpr);
    };
    addEventListener('message', receive);
    return () => removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.artStyle = variant;
    const report = () => parent.postMessage({ type: 'food-art:state', style: variant, renderer, dpr: pixelRatio,
      ready: document.querySelector('[data-board-status]')?.getAttribute('data-board-status') === 'ready' }, location.origin);
    const observer = new MutationObserver(report);
    observer.observe(document.getElementById('root')!, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-board-status'] });
    report();
    return () => observer.disconnect();
  }, [variant, renderer, pixelRatio]);

  return <ItemArtProvider value={config}><App repository={repository} sessionScope={scope} offline={false}/></ItemArtProvider>;
}

export async function renderFoodStylePreview(manifestUrl = '/art/food-styles/manifest.json') {
  const response = await fetch(manifestUrl);
  if (!response.ok) throw new Error('请先打包五种食材的美术样板。');
  const manifest = await response.json() as Manifest;
  // The published page may live under a GitHub Pages project subdirectory.
  for (const items of Object.values(manifest)) for (const item of Object.values(items)) {
    item.path = new URL(item.path, response.url).pathname;
  }
  const initial = createFoodStyleState();
  // Reuse this tab's test database on reset; separate tabs never share a writer or save.
  const key = 'goose-lane-art-qa-scope';
  const scope = sessionStorage.getItem(key) ?? `goose-lane-art-qa-${crypto.randomUUID()}`;
  sessionStorage.setItem(key, scope);
  const repository = new SaveRepository(scope);
  const previous = await repository.open();
  initial.revision = Math.max(initial.revision, previous.state?.revision ?? -1) + 1;
  await repository.save(initial);
  createRoot(document.getElementById('root')!).render(<Preview repository={repository} manifest={manifest} scope={scope}/>);
}
