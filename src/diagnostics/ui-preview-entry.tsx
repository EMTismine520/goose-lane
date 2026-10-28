import { createRoot } from 'react-dom/client';
import App from '../ui/App';
import { ItemArtProvider } from '../ui/ItemArtContext';
import { SaveRepository } from '../persistence/save';
import { createUiPreviewState, UI_SCENARIOS, type UiScenario } from './ui-preview-state';
import '../ui/game.css';

const query=new URLSearchParams(location.search);
const scenario=UI_SCENARIOS.includes(query.get('scenario') as UiScenario)?query.get('scenario') as UiScenario:'opening';
const scope=`goose-v4-ui-${scenario}-${query.get('run')??'preview'}`;
const requestedRatio=Number(query.get('dpr'));
const pixelRatio=[1,2,3].includes(requestedRatio)?requestedRatio:undefined;
const repository=new SaveRepository(scope);
const loaded=await repository.open();
if(!loaded.state){
  const initial=createUiPreviewState(scenario);
  if(query.get('motion')==='reduced')initial.settings.reducedMotion=true;
  await repository.save(initial);
}
document.title=`界面验收样板 · ${scenario} · 独立存档`;
createRoot(document.getElementById('root')!).render(<ItemArtProvider value={{renderer:query.get('renderer')==='canvas'?'canvas':'auto',pixelRatio}}><App repository={repository} sessionScope={scope} offline={false}/></ItemArtProvider>);
