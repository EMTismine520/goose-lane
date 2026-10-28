import { renderFoodStylePreview } from './FoodStylePreview';
import '../ui/game.css';

void renderFoodStylePreview().catch(() => {
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = '试玩样板暂未加载，请检查网络后刷新重试。';
  document.getElementById('root')!.replaceChildren(message);
});
