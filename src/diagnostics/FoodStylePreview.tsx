import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SaveRepository } from '../persistence/save';
import App from '../ui/App';
import { ItemArtProvider } from '../ui/ItemArtContext';
import { createFoodStyleState } from './food-style-state';

function Preview({ repository, scope }: { repository: SaveRepository; scope: string }) {
  const query = new URLSearchParams(location.search);
  const [renderer, setRenderer] = useState<'canvas' | 'auto'>(query.get('renderer') === 'auto' ? 'auto' : 'canvas');
  const [pixelRatio, setPixelRatio] = useState(Number(query.get('dpr')) || 3);
  const config = useMemo(() => ({ renderer, pixelRatio }), [renderer, pixelRatio]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'food-art:config') return;
      // Old style parameters and messages cannot replace the default B artwork.
      if (event.data.renderer === 'canvas' || event.data.renderer === 'auto') setRenderer(event.data.renderer);
      if ([1, 2, 3].includes(event.data.dpr)) setPixelRatio(event.data.dpr);
    };
    addEventListener('message', receive);
    return () => removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.artStyle = 'cartoon';
    const report = () => parent.postMessage({ type: 'food-art:state', style: 'cartoon', renderer, dpr: pixelRatio,
      ready: document.querySelector('[data-board-status]')?.getAttribute('data-board-status') === 'ready' }, location.origin);
    const observer = new MutationObserver(report);
    const target = document.getElementById('root');
    if (target) observer.observe(target, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-board-status'] });
    report();
    return () => observer.disconnect();
  }, [renderer, pixelRatio]);

  return <ItemArtProvider value={config}><App repository={repository} sessionScope={scope} offline={false}/></ItemArtProvider>;
}

export async function renderFoodStylePreview() {
  const layout = new URLSearchParams(location.search).get('layout') === 'sausages' ? 'sausages' : 'showcase';
  const initial = createFoodStyleState(Date.now(), layout);
  const key = 'goose-lane-v4-art-qa-scope';
  const scope = sessionStorage.getItem(key) ?? `goose-lane-v4-art-qa-${crypto.randomUUID()}`;
  sessionStorage.setItem(key, scope);
  const repository = new SaveRepository(scope);
  const previous = await repository.open();
  initial.revision = Math.max(initial.revision, previous.state?.revision ?? -1) + 1;
  await repository.save(initial);
  createRoot(document.getElementById('root')!).render(<Preview repository={repository} scope={scope}/>);
}
