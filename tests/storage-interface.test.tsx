import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createInitialState, getBoardEntity, unlockedCells } from '../src/domain/engine';
import { Storage } from '../src/ui/panels';
import type { GameState } from '../src/domain/types';

const renderStorage = (state: GameState) => renderToStaticMarkup(<Storage state={state} dispatch={async () => true}/>);
const retrieveButton = (html: string) => html.match(/<button[^>]*aria-label="取回[^>]*>/)![0];

describe('storage drawer retrieval feedback', () => {
  it('shows used capacity and disables retrieval when only locked and device cells are empty', () => {
    const state = createInitialState(1000);
    state.storage = [{uid:'stored-food',item:'fresh-veg-1'}];
    for (let index=0;index<unlockedCells(state);index++) {
      if(getBoardEntity(state,index).kind==='empty') state.board[index]={uid:`full-${index}`,item:'fresh-veg-1'};
    }
    expect(state.board.some(item=>item===null)).toBe(true);
    const html = renderStorage(state);
    expect(html).toContain(`已用 <strong>1</strong> / ${state.storageCapacity} 格`);
    expect(html).toContain('棋盘满了，先回棋盘合成或交付订单');
    expect(retrieveButton(html)).toContain('disabled=""');
    expect(retrieveButton(html)).toContain('aria-describedby="storage-space-status"');
    expect(html).not.toContain('点击取回棋盘');
  });

  it('re-enables retrieval when a usable cell opens and explains the actual storage path', () => {
    const state = createInitialState(1000);
    state.storage = [{uid:'stored-food',item:'fresh-veg-1'}];
    const freeIndices = Array.from({length:unlockedCells(state)},(_,index)=>index).filter(index=>getBoardEntity(state,index).kind==='empty');
    for (const index of freeIndices.slice(1)) state.board[index]={uid:`full-${index}`,item:'fresh-veg-1'};
    const html = renderStorage(state);
    expect(html).toContain('棋盘还有 1 个空位');
    expect(retrieveButton(html)).not.toContain('disabled');
    expect(html).toContain('点击取回棋盘');
    expect(html).toContain('在棋盘选中食材 → 整理 → 放入仓库');
  });
});
