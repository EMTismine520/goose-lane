/** A live Web Lock is the write authority. It is never stolen from a running tab. */
export interface GameSession {
  readonly readOnly: boolean;
  readonly supported: boolean;
  takeover(): Promise<boolean>;
  release(): void;
}

export async function acquireSession(onReadOnlyChange: (readOnly: boolean) => void): Promise<GameSession> {
  const supported = typeof navigator !== 'undefined' && !!navigator.locks;
  let channel: BroadcastChannel | null = null;
  try { if (typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel('goose-lane-session-v1'); } catch { /* The Web Lock remains authoritative if messaging is restricted. */ }
  let readOnly = true;
  let released = false;
  let acquiring: Promise<boolean> | null = null;
  let unlock: (() => void) | null = null;
  const change = (value: boolean) => { readOnly = value; onReadOnlyChange(value); };
  const session: GameSession = {
    get readOnly() { return readOnly; },
    supported,
    async takeover() {
      if (released || !supported) return false;
      if (!readOnly) return true;
      if (acquiring) return acquiring;
      acquiring = new Promise<boolean>((resolve) => {
        void navigator.locks.request('goose-lane-writer-v1', { mode: 'exclusive', ifAvailable: true }, async (lock) => {
          if (!lock || released) { resolve(false); return; }
          const held = new Promise<void>((done) => { unlock = done; });
          change(false);
          channel?.postMessage({ type: 'writer' });
          resolve(true);
          await held;
        }).catch(() => { change(true); resolve(false); });
      });
      const result = await acquiring;
      acquiring = null;
      return result;
    },
    release() {
      if (released) return;
      released = true;
      const wasWriter = !readOnly;
      unlock?.();
      unlock = null;
      change(true);
      if (wasWriter) channel?.postMessage({ type: 'available' });
      channel?.close();
      if (typeof window !== 'undefined') window.removeEventListener('pagehide', onPageHide);
    },
  };
  const onPageHide = (event: PageTransitionEvent) => {
    // BFCache restores the same React tree and the same permanently released session.
    // Reload only on a persisted return so boot acquires a fresh lock and the latest save.
    if (event.persisted && typeof window !== 'undefined') {
      window.addEventListener('pageshow', (shown: PageTransitionEvent) => {
        if (shown.persisted) window.location.reload();
      }, { once: true });
    }
    session.release();
  };
  if (typeof window !== 'undefined') window.addEventListener('pagehide', onPageHide, { once: true });
  // No time-based lease: a suspended/background tab must never silently lose its authority.
  // Browsers without Web Locks stay read-only; IndexedDB revision checks are a second guard.
  change(true);
  if (!await session.takeover() && supported && !released) {
    // React remount/HMR may request a lock in the same turn its old owner releases it.
    // Let that release settle once; an actual live owner still cannot be displaced.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await session.takeover();
  }
  return session;
}
