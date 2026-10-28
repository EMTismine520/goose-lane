import { afterEach, describe, expect, it, vi } from 'vitest';
import { afterPlayIdle, watchPlayIdle } from '../src/platform/play-idle';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function environment() {
  vi.useFakeTimers();
  const windowMock = new EventTarget(), documentMock = Object.assign(new EventTarget(), { hidden: false });
  vi.stubGlobal('window', windowMock); vi.stubGlobal('document', documentMock);
  return { windowMock, documentMock };
}
describe('background work yields to play', () => {
  it('postpones work until two quiet seconds and cleans up the registered service', () => {
    const {windowMock}=environment(), cleanup=vi.fn(), task=vi.fn(()=>cleanup);
    const stop=afterPlayIdle(task);
    vi.advanceTimersByTime(1500); windowMock.dispatchEvent(new Event('pointerdown'));
    vi.advanceTimersByTime(1999); expect(task).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(task).toHaveBeenCalledOnce();
    windowMock.dispatchEvent(new Event('pointerdown'));vi.advanceTimersByTime(3000);expect(task).toHaveBeenCalledOnce();
    stop();expect(cleanup).toHaveBeenCalledOnce();
  });
  it('pauses hidden pages and waits again when foreground images finish', () => {
    const {windowMock,documentMock}=environment(), idle=vi.fn(),busy=vi.fn();
    const stop=watchPlayIdle(idle,busy);
    documentMock.hidden=true;documentMock.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(10000);expect(idle).not.toHaveBeenCalled();
    documentMock.hidden=false;documentMock.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(1500);windowMock.dispatchEvent(new Event('goose:art-idle'));
    vi.advanceTimersByTime(1999);expect(idle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);expect(idle).toHaveBeenCalledOnce();
    stop();
  });
});
