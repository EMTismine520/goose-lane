import { useEffect, useRef, useState } from 'react';
import { chapterResourcePaths } from '../platform/chapter-resources';
import { artHandoffState } from '../platform/asset-queue';
import { perfMark, recordDownloadDiagnostics } from '../platform/performance';

export interface DownloadState {
  release?: string; currentReady?: boolean; playableReady?: boolean; fullReady?: boolean;
  completedBytes?: number; totalBytes?: number; completedFiles?: number; totalFiles?: number;
  receivingBytes?: number; bytesPerSecond?: number | null; activeFiles?: number; retryingFiles?: number; failedFiles?: number;
  state: 'waiting' | 'runtime' | 'detail' | 'retrying' | 'complete' | 'paused' | 'network' | 'storage';
}
/** Byte preparation runs independently of input, saves, image decoding and React's game tree. */
export function useThemeOffline(stage: number, enabled: boolean, ready = true) {
  const [status, setStatus] = useState<DownloadState>({ state: 'waiting' });
  const request = useRef<(data: object) => void>(() => {});
  const playerPaused = useRef<boolean | undefined>(undefined);
  const scope = typeof document === 'undefined' ? '' : new URL(import.meta.env.BASE_URL, document.baseURI).pathname;
  const preferenceKey = `goose-lane:downloads:${scope}`;
  const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const session = useRef('');
  useEffect(() => {
    if (!enabled || !ready || !import.meta.env.PROD || !supported) return;
    let disposed = false, frame = 0, pending: DownloadState | undefined;
    session.current ||= crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const preference = localStorage.getItem(preferenceKey);
      if (preference !== null) playerPaused.current = preference === 'paused';
    } catch { /* The worker also retains the user's choice. */ }
    const container = navigator.serviceWorker, requestId = `${session.current}:${stage}`;
    const post = (data: object) => { if (!disposed) container.controller?.postMessage({ ...data, requestId }); };
    request.current = post;
    const handoff = () => ({ ...artHandoffState(), session: session.current });
    const prepare = (reconcile = false) => {
      if (!container.controller) return;
      try {
        const preference = localStorage.getItem(preferenceKey);
        if (preference !== null) playerPaused.current = preference === 'paused';
      } catch { /* The worker retains the last explicit choice if storage is restricted. */ }
      perfMark('worker-controlled');
      post({ type: 'PREPARE_GAME', urls: chapterResourcePaths(stage), handoff: handoff(), reconcile,
        ...(playerPaused.current === undefined ? {} : { paused: playerPaused.current }),
        diagnostic: new URLSearchParams(location.search).get('perf') === '1' });
    };
    const message = (event: MessageEvent) => {
      if (event.source !== container.controller || event.data?.requestId !== requestId || event.data?.type !== 'GAME_CACHE_STATE') return;
      const { diagnostics, ...data } = event.data;
      if (diagnostics) recordDownloadDiagnostics(diagnostics);
      pending = data as DownloadState;
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (!disposed && pending) setStatus(pending); });
      if (data.currentReady) perfMark('current-pack-ready');
      if (data.playableReady) perfMark('all-chapters-ready');
      if (data.fullReady) perfMark('all-resources-ready');
    };
    const visible = () => { if (!document.hidden) prepare(true); };
    const online = () => prepare(true), controlled = () => prepare(), changed = () => post({ type: 'ART_HANDOFF', handoff: handoff() });
    const leaving = () => post({ type: 'ART_HANDOFF', handoff: { ...handoff(), urls: [] } });
    window.addEventListener('goose:art-handoff', changed); window.addEventListener('online', online); window.addEventListener('pagehide', leaving);
    document.addEventListener('visibilitychange', visible);
    container.addEventListener('message', message); container.addEventListener('controllerchange', controlled);
    prepare(!!container.controller);
    return () => {
      disposed = true; request.current = () => {}; cancelAnimationFrame(frame);
      window.removeEventListener('goose:art-handoff', changed); window.removeEventListener('online', online); window.removeEventListener('pagehide', leaving);
      document.removeEventListener('visibilitychange', visible);
      container.removeEventListener('message', message); container.removeEventListener('controllerchange', controlled);
    };
  }, [stage, enabled, ready, supported, preferenceKey]);
  const choose = (paused: boolean) => {
    playerPaused.current = paused;
    try { localStorage.setItem(preferenceKey, paused ? 'paused' : 'automatic'); } catch {}
    setStatus(current => ({ ...current, state: paused ? 'paused' : 'waiting' }));
    request.current({ type: 'GAME_DOWNLOAD_PAUSE', paused });
  };
  return { supported, status, pause: () => choose(true), resume: () => choose(false) };
}
