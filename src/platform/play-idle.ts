/** Works in Safari without requestIdleCallback. User input always postpones background work. */
export function watchPlayIdle(onIdle: () => void, onBusy: () => void = () => {}, delay = 2000): () => void {
  let timer: ReturnType<typeof setTimeout>, lastBusy = -Infinity;
  const activity = () => {
    clearTimeout(timer);
    const now = Date.now();
    if (now - lastBusy > 150 || document.hidden) { lastBusy = now; onBusy(); }
    if (!document.hidden) timer = setTimeout(() => { if (!dragging && !touching) onIdle(); }, delay);
  };
  let dragging = false, touching = false;
  const down = () => { dragging = true; activity(); };
  const up = () => { dragging = false; activity(); };
  const move = () => { if (dragging) activity(); };
  const touchDown = () => { touching = true; activity(); };
  const touchUp = () => { touching = false; activity(); };
  const touchMove = () => { if (touching) activity(); };
  const events = ['keydown', 'wheel', 'online', 'goose:art-idle'] as const;
  for (const event of events) window.addEventListener(event, activity, { passive: true });
  window.addEventListener('pointerdown', down, { passive: true }); window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', up, { passive: true }); window.addEventListener('pointercancel', up, { passive: true });
  window.addEventListener('touchstart', touchDown, { passive: true }); window.addEventListener('touchmove', touchMove, { passive: true });
  window.addEventListener('touchend', touchUp, { passive: true }); window.addEventListener('touchcancel', touchUp, { passive: true });
  document.addEventListener('visibilitychange', activity);
  activity();
  return () => { clearTimeout(timer); for (const event of events) window.removeEventListener(event, activity); document.removeEventListener('visibilitychange', activity);
    window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    window.removeEventListener('touchstart', touchDown); window.removeEventListener('touchmove', touchMove); window.removeEventListener('touchend', touchUp); window.removeEventListener('touchcancel', touchUp); };
}

export function afterPlayIdle(task: () => (() => void), delay = 2000): () => void {
  let cleanup: (() => void) | undefined;
  const stop = watchPlayIdle(() => { stop(); cleanup = task(); }, undefined, delay);
  return () => { stop(); cleanup?.(); };
}
