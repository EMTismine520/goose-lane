import { createRoot } from 'react-dom/client';
import App from '../ui/App';
import { ItemArtProvider } from '../ui/ItemArtContext';
import { SaveRepository } from '../persistence/save';
import { createUiPreviewState, UI_SCENARIOS, type UiScenario } from './ui-preview-state';
import PerformanceTools from '../ui/PerformanceTools';
import '../ui/game.css';

const query = new URLSearchParams(location.search);
if (query.get('perf') !== '1') { query.set('perf', '1'); location.replace(`${location.pathname}?${query}`); }
else {
  const scenario = UI_SCENARIOS.includes(query.get('scenario') as UiScenario) ? query.get('scenario') as UiScenario : 'opening';
  const scope = `goose-performance-${scenario}-${query.get('run') ?? 'preview'}`;
  const repository = new SaveRepository(scope);
  const loaded = await repository.open();
  if (!loaded.state) await repository.save(createUiPreviewState(scenario));
  const renderer = query.get('renderer') === 'canvas' ? 'canvas' : 'auto';
  function Diagnostics() {
    return <><ItemArtProvider value={{ renderer }}><App repository={repository} sessionScope={scope} offline={query.get('offline') === '1'}/></ItemArtProvider><PerformanceTools label={`${scenario} · 独立存档 · ${renderer}`}/></>;
  }
  createRoot(document.getElementById('root')!).render(<Diagnostics/>);
}
