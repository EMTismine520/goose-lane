import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GameToast } from '../src/ui/GameToast';

describe('quiet production feedback', () => {
  it('suppresses generation messages while keeping failures and other results visible', () => {
    expect(renderToStaticMarkup(<GameToast event={{ type: 'generate', message: '获得香蕉' }} revision={1}/>)).toBe('');
    for (const message of ['体力不足', '棋盘已满', '保存失败']) {
      const html = renderToStaticMarkup(<GameToast event={{ type: 'error', message }} revision={1} hidden/>);
      expect(html).toContain('role="status"');
      expect(html).toContain(message);
    }
    expect(renderToStaticMarkup(<GameToast event={{ type: 'deliver', message: '交付完成' }} revision={2}/>)).toContain('交付完成');
  });
});
