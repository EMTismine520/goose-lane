import { useEffect, useRef, useState } from 'react';
import { chapterResourcePaths } from '../platform/chapter-resources';
import { watchPlayIdle } from '../platform/play-idle';
import { perfMark } from '../platform/performance';
import { isArtBusy } from '../platform/asset-queue';

export interface DownloadState {
  release?: string; currentReady?: boolean; playableReady?: boolean; fullReady?: boolean;
  completedBytes?: number; totalBytes?: number; completedFiles?: number; totalFiles?: number;
  state: 'waiting' | 'idle' | 'runtime' | 'detail' | 'complete' | 'paused' | 'network' | 'storage';
}
/** Download progress belongs to UI subscribers, never to a game save. */
export function useThemeOffline(stage: number, enabled: boolean, ready = true, busy = false) {
  const [status, setStatus] = useState<DownloadState>({ state: 'waiting' });
  const request = useRef<(data: object) => void>(() => {});
  const busyRef = useRef(busy); busyRef.current = busy;
  const playerPaused = useRef<boolean | undefined>(undefined), preferenceKey = useRef('');
  const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  useEffect(() => {
    if (!enabled || !ready || !import.meta.env.PROD || !supported) return;
    let disposed = false;
    preferenceKey.current = `goose-lane:downloads:${new URL(import.meta.env.BASE_URL, document.baseURI).pathname}`;
    try {
      const preference = localStorage.getItem(preferenceKey.current);
      if (preference !== null) playerPaused.current = preference === 'paused';
    } catch { /* Cache-only preferences still work when localStorage is restricted. */ }
    const container = navigator.serviceWorker, requestId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const post = (data: object) => { if (!disposed) container.controller?.postMessage({ ...data, requestId }); };
    request.current = post;
    const pause = () => post({ type: 'CACHE_PAUSE', visible: !document.hidden });
    const resume = () => { if (!busyRef.current && !isArtBusy() && !document.hidden && navigator.onLine !== false) post({ type: 'CACHE_RESUME' }); };
    const prepare = () => {
      if (!container.controller) return;
      pause(); post({ type: 'PREPARE_GAME', urls: chapterResourcePaths(stage) });
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      post({ type: 'GAME_DOWNLOAD_PAUSE', paused: playerPaused.current ?? connection?.saveData === true });
      window.dispatchEvent(new Event('goose:art-idle'));
    };
    const message = (event: MessageEvent) => {
      if (event.source !== container.controller || event.data?.requestId !== requestId || event.data?.type !== 'GAME_CACHE_STATE') return;
      const data = event.data as DownloadState; setStatus(data);
      if (data.currentReady) perfMark('current-pack-ready');
      if (data.playableReady) perfMark('all-chapters-ready');
      if (data.fullReady) perfMark('all-resources-ready');
    };
    const visible = () => { if (!document.hidden) prepare(); };
    const stop = watchPlayIdle(resume, pause, 400);
    window.addEventListener('goose:art-busy', pause); window.addEventListener('online', prepare);
    document.addEventListener('visibilitychange', visible);
    container.addEventListener('message', message); container.addEventListener('controllerchange', prepare);
    prepare();
    return () => {
      pause(); disposed = true; request.current = () => {}; stop();
      window.removeEventListener('goose:art-busy', pause); window.removeEventListener('online', prepare);
      document.removeEventListener('visibilitychange', visible);
      container.removeEventListener('message', message); container.removeEventListener('controllerchange', prepare);
    };
  }, [stage, enabled, ready, supported]);
  useEffect(() => {
    if (busy) request.current({ type: 'CACHE_PAUSE', visible: !document.hidden });
    else if (typeof window !== 'undefined') window.dispatchEvent(new Event('goose:art-idle'));
  }, [busy]);
  const choose = (paused: boolean) => {
    playerPaused.current = paused;
    try { localStorage.setItem(preferenceKey.current, paused ? 'paused' : 'automatic'); } catch {}
    setStatus(current => ({ ...current, state: paused ? 'paused' : 'waiting' }));
    request.current({ type: 'GAME_DOWNLOAD_PAUSE', paused });
  };
  return { supported, status, pause: () => choose(true), resume: () => choose(false) };
}
