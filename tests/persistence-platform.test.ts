import { afterEach, describe, expect, it, vi } from 'vitest';
import { acquireSession } from '../src/platform/session';
import type { GameSession } from '../src/platform/session';
import { audio } from '../src/platform/audio';

const sessions: GameSession[] = [];
afterEach(() => {
  sessions.splice(0).forEach((session) => session.release());
  audio.dispose();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('exclusive browser writer', () => {
  function locks() {
    let occupied = false;
    vi.stubGlobal('navigator', { locks: {
      async request(_name: string, _options: unknown, callback: (lock: object | null) => Promise<void>): Promise<void> {
        if (occupied) { await callback(null); return; }
        occupied = true;
        try { await callback({}); } finally { occupied = false; }
      },
    } });
    vi.stubGlobal('BroadcastChannel', undefined);
  }
  it('grants only one writer, never forcibly steals, and permits takeover after release', async () => {
    locks();
    const firstChange = vi.fn(); const secondChange = vi.fn();
    const first = await acquireSession(firstChange); sessions.push(first);
    const second = await acquireSession(secondChange); sessions.push(second);
    expect(first.readOnly).toBe(false); expect(second.readOnly).toBe(true);
    expect(await second.takeover()).toBe(false);
    first.release(); await Promise.resolve(); await Promise.resolve();
    expect(await second.takeover()).toBe(true);
    expect(second.readOnly).toBe(false);
    expect(firstChange).toHaveBeenLastCalledWith(true);
    expect(secondChange).toHaveBeenLastCalledWith(false);
    expect(await first.takeover()).toBe(false);
  });
  it('stays read-only if the browser cannot guarantee mutual exclusion', async () => {
    vi.stubGlobal('navigator', {}); vi.stubGlobal('BroadcastChannel', undefined);
    const session = await acquireSession(vi.fn()); sessions.push(session);
    expect(session.supported).toBe(false); expect(session.readOnly).toBe(true);
    expect(await session.takeover()).toBe(false);
  });
  it('deduplicates simultaneous takeover attempts', async () => {
    locks();
    const session = await acquireSession(vi.fn()); sessions.push(session);
    expect(await Promise.all([session.takeover(), session.takeover()])).toEqual([true, true]);
  });
  it('settles an old effect release before completing same-turn remount acquisition', async () => {
    locks();
    const first = await acquireSession(vi.fn()); sessions.push(first);
    first.release();
    // No await between cleanup and the new mount, as in React StrictMode/HMR.
    const replacement = await acquireSession(vi.fn()); sessions.push(replacement);
    expect(replacement.readOnly).toBe(false);
  });
});

describe('gesture-gated, bounded audio', () => {
  function environment() {
    const page = new EventTarget() as EventTarget & { hidden: boolean };
    page.hidden = false;
    const parameter = () => ({ value: 0, setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
    const voices: { stop: ReturnType<typeof vi.fn> }[] = [];
    const gains: ReturnType<typeof parameter>[] = [];
    class Context {
      static created = 0;
      currentTime = 1;
      state = 'suspended';
      destination = {};
      constructor() { Context.created++; }
      async resume() { this.state = 'running'; }
      async suspend() { this.state = 'suspended'; }
      async close() { this.state = 'closed'; }
      createGain() { const gain = parameter(); gains.push(gain); return { gain, connect: vi.fn(), disconnect: vi.fn() }; }
      createOscillator() {
        const voice = { frequency: parameter(), type: 'sine', connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
        voices.push(voice); return voice;
      }
    }
    vi.stubGlobal('window', { AudioContext: Context });
    vi.stubGlobal('document', page);
    vi.useFakeTimers();
    return { page, Context, voices, gains };
  }
  it('creates no context before the first gesture and no second context on later gestures', async () => {
    const { Context } = environment();
    audio.configure({ music: true, sound: true, volume: 0.4, reducedMotion: false });
    audio.play('merge'); expect(Context.created).toBe(0);
    await audio.unlock(); await audio.unlock();
    expect(Context.created).toBe(1); expect(vi.getTimerCount()).toBe(1);
  });
  it('stops the music scheduler in the background and resumes exactly one scheduler', async () => {
    const { page, voices } = environment();
    audio.configure({ music: true, sound: true, volume: 0.4, reducedMotion: false }); await audio.unlock();
    expect(vi.getTimerCount()).toBe(1);
    page.hidden = true; page.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(0); expect(voices[0].stop).toHaveBeenCalled();
    const before = voices.length; audio.play('deliver'); expect(voices.length).toBe(before);
    page.hidden = false; page.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);
    page.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);
  });
  it('keeps music and effects independently muted and clears timers on dispose', async () => {
    const { voices, gains } = environment();
    audio.configure({ music: false, sound: true, volume: 0.6, reducedMotion: false }); await audio.unlock();
    expect(vi.getTimerCount()).toBe(0);
    audio.play('merge'); expect(voices.length).toBe(3);
    audio.configure({ music: true, sound: false, volume: 0.5, reducedMotion: false });
    const before = voices.length; audio.play('deliver'); expect(voices.length).toBe(before);
    expect(gains[1].setTargetAtTime).toHaveBeenLastCalledWith(0, 1, 0.015);
    expect(vi.getTimerCount()).toBe(1);
    audio.dispose(); expect(vi.getTimerCount()).toBe(0);
  });
});
