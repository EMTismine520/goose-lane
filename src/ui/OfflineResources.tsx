import { createContext, useContext, type ReactNode } from 'react';
import { useThemeOffline } from './useThemeOffline';

const Downloads = createContext<(ReturnType<typeof useThemeOffline> & { enabled: boolean }) | null>(null);
export function OfflineProvider({ stage, enabled, ready, children }: { stage: number; enabled: boolean; ready: boolean; children: ReactNode }) {
  const downloads = useThemeOffline(stage, enabled, ready);
  return <Downloads.Provider value={{ ...downloads, enabled }}>{children}</Downloads.Provider>;
}
function description({ supported, status }: ReturnType<typeof useThemeOffline>) {
  if (!supported) return '当前浏览器暂不支持离线准备，联网可继续游玩。';
  if (status.fullReady) return '全部游戏资源已准备好';
  if (status.state === 'storage') return '资源缓存暂不可写，联网可继续游玩。';
  if (status.state === 'network') return `还有${status.failedFiles ?? 0}项资源未完成，可重试`;
  if (status.state === 'paused') return '自动准备已暂停';
  if (status.state === 'retrying') return '正在下载全部资源，部分文件正在重试';
  if (status.playableReady) return '全部章节已可离线游玩，正在补齐高清';
  if (status.currentReady) return '当前章节已准备好，正在补齐其他章节';
  return '正在准备游戏资源';
}
export function OfflineStatus() {
  const downloads = useContext(Downloads);
  if (!downloads?.enabled || !import.meta.env.PROD) return null;
  const { status } = downloads;
  const label = status.fullReady ? '✓' : status.state === 'paused' ? 'Ⅱ' : status.totalBytes ? `${Math.min(99, Math.floor((status.completedBytes ?? 0) / status.totalBytes * 100))}%` : '↓';
  return <span className="download-status" aria-label={description(downloads)} title={description(downloads)} data-cache-state={status.state}>{label}</span>;
}
export function OfflineSettings() {
  const downloads = useContext(Downloads);
  if (!downloads) return null;
  const { status } = downloads;
  const resumable = ['paused', 'network', 'storage'].includes(status.state);
  return <section className="offline-packs" aria-label="游戏资源准备">
    <b>游戏资源自动准备</b><p role="status">{description(downloads)}</p>
    {!!status.totalBytes && <><progress aria-label="游戏资源准备进度" value={status.completedBytes ?? 0} max={status.totalBytes}/>
      <small>{((status.completedBytes ?? 0) / 1048576).toFixed(1)} / {(status.totalBytes / 1048576).toFixed(1)} MiB 已缓存</small>
      {!status.fullReady && status.state !== 'paused' && status.bytesPerSecond != null && <small>接收速度 {(status.bytesPerSecond / 1024).toFixed(0)} KiB/s</small>}
      {!!status.retryingFiles && <small>{status.retryingFiles}项正在重试</small>}</>}
    <p>进入后自动下载全部章节与高清图片，游玩时持续准备。离开后，下次打开继续。</p>
    {!status.fullReady && <button className="outline" disabled={!downloads.supported} onClick={resumable ? downloads.resume : downloads.pause}>{status.state === 'network' || status.state === 'storage' ? '重试未完成资源' : resumable ? '继续准备' : '暂停自动准备'}</button>}
  </section>;
}
