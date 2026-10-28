export type ActivateUpdate = () => Promise<void>;
import { afterPlayIdle } from './play-idle';

/** Registers only a production build. Updates remain waiting until the caller has saved safely. */
export function registerPwa(
  onUpdate: (activate: ActivateUpdate) => void,
  onError?: (message: string) => void,
): () => void {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return () => {};

  let disposed = false;
  let requestedUpdate = false;
  let reloading = false;
  let registration: ServiceWorkerRegistration | undefined;
  let installing: ServiceWorker | null = null;
  let announced: ServiceWorker | null = null;
  let activating: Promise<void> | undefined;
  let cancelActivation: (() => void) | undefined;
  let cancelCheck: (() => void) | undefined;
  const container = navigator.serviceWorker;

  const controllerChanged = () => {
    if (!requestedUpdate || disposed || reloading) return;
    reloading = true;
    window.location.reload();
  };
  container.addEventListener('controllerchange', controllerChanged);

  const announce = () => {
    const worker = registration?.waiting;
    if (disposed || !worker || worker === announced || !container.controller) return;
    announced = worker;
    onUpdate(() => {
      if (disposed) return Promise.reject(new Error('更新监听已关闭，请刷新后重试。'));
      if (activating) return activating;
      const waiting = registration?.waiting;
      if (!waiting) return Promise.reject(new Error('更新已失效，请刷新后重试。'));
      requestedUpdate = true;
      activating = new Promise<void>((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout>;
        const clear = () => {
          clearTimeout(timeout);
          container.removeEventListener('controllerchange', completed);
          cancelActivation = undefined;
        };
        const completed = () => { clear(); resolve(); };
        cancelActivation = () => { clear(); reject(new Error('更新监听已关闭。')); };
        container.addEventListener('controllerchange', completed);
        timeout = setTimeout(() => {
          clear(); requestedUpdate = false; activating = undefined;
          reject(new Error('更新尚未完成，请保持页面打开后重试。'));
        }, 15000);
        try { waiting.postMessage({ type: 'SKIP_WAITING' }); }
        catch (error) { clear(); requestedUpdate = false; reject(error); }
      });
      return activating.catch(error => { activating = undefined; throw error; });
    });
  };

  const installStateChanged = () => { if (installing?.state === 'installed') announce(); };
  const updateFound = () => {
    installing?.removeEventListener('statechange', installStateChanged);
    installing = registration?.installing ?? null;
    installing?.addEventListener('statechange', installStateChanged);
  };
  const checkForUpdate = () => {
    if (disposed || document.visibilityState === 'hidden') return;
    cancelCheck?.();
    cancelCheck = afterPlayIdle(() => {
      void registration?.update().catch(() => { /* Offline is expected; the installed release remains available. */ });
      return () => {};
    });
  };

  const base = new URL(import.meta.env.BASE_URL, document.baseURI);
  void container.register(new URL('sw.js', base).href, { scope: base.pathname, updateViaCache: 'none' }).then(result => {
    if (disposed) return;
    registration = result;
    registration.addEventListener('updatefound', updateFound);
    updateFound();
    announce();
    document.addEventListener('visibilitychange', checkForUpdate);
    window.addEventListener('online', checkForUpdate);
  }).catch(() => {
    if (!disposed) onError?.('离线资源暂未准备好，联网后重新打开即可重试。');
  });

  return () => {
    disposed = true;
    cancelCheck?.();
    cancelActivation?.();
    container.removeEventListener('controllerchange', controllerChanged);
    registration?.removeEventListener('updatefound', updateFound);
    installing?.removeEventListener('statechange', installStateChanged);
    document.removeEventListener('visibilitychange', checkForUpdate);
    window.removeEventListener('online', checkForUpdate);
  };
}
