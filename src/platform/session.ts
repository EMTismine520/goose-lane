/** Prefer a live Web Lock; older browsers rely on SaveRepository's atomic token comparison. */
export interface GameSession {
  readonly readOnly: boolean;
  readonly supported: boolean;
  takeover(): Promise<boolean>;
  release(): void;
}

export async function acquireSession(onReadOnlyChange: (readOnly: boolean) => void, scope?: string): Promise<GameSession> {
  const suffix = scope ? `:${scope}` : '';
  const hasLocks = typeof navigator !== 'undefined' && typeof navigator.locks?.request === 'function';
  const supported = globalThis.isSecureContext !== false && (hasLocks || typeof indexedDB !== 'undefined');
  let channel: BroadcastChannel | null = null;
  try { if (typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel('goose-lane-session-v1' + suffix); } catch { /* The Web Lock remains authoritative if messaging is restricted. */ }
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
      if (!hasLocks) {
        // This grants permission to attempt a transaction, not exclusive tab ownership.
        // SaveRepository compares the saved token and writes in ONE readwrite transaction;
        // GameController stops stale writers before publishing their uncommitted state.
        change(false);
        return true;
      }
      if (acquiring) return acquiring;
      acquiring = new Promise<boolean>((resolve) => {
        void navigator.locks.request('goose-lane-writer-v1' + suffix, { mode: 'exclusive', ifAvailable: true }, async (lock) => {
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
  // Native locks are never stolen. No expiring lease is used in either mode.
  change(true);
  if (!await session.takeover() && supported && !released) {
    // React remount/HMR may request a lock in the same turn its old owner releases it.
    // Let that release settle once; an actual live owner still cannot be displaced.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await session.takeover();
  }
  return session;
}
