/** Works in Safari without requestIdleCallback. User input always postpones background work. */
export function watchPlayIdle(onIdle: () => void, onBusy: () => void = () => {}, delay = 2000): () => void {
  let timer: ReturnType<typeof setTimeout>, lastBusy = -Infinity;
  const activity = () => {
    clearTimeout(timer);
    const now = Date.now();
    if (now - lastBusy > 150 || document.hidden) { lastBusy = now; onBusy(); }
    if (!document.hidden) timer = setTimeout(onIdle, delay);
  };
  const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'online', 'goose:art-idle'] as const;
  for (const event of events) window.addEventListener(event, activity, { passive: true });
  document.addEventListener('visibilitychange', activity);
  activity();
  return () => { clearTimeout(timer); for (const event of events) window.removeEventListener(event, activity); document.removeEventListener('visibilitychange', activity); };
}

export function afterPlayIdle(task: () => (() => void), delay = 2000): () => void {
  let cleanup: (() => void) | undefined;
  const stop = watchPlayIdle(() => { stop(); cleanup = task(); }, undefined, delay);
  return () => { stop(); cleanup?.(); };
}
