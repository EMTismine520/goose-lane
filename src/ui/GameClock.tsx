import { useEffect, useState, type ReactNode } from 'react';
import { effectiveNow, getEnergyStatus } from '../domain/engine';
import type { Command, GameState } from '../domain/types';

export function SecondClock({ children, active = true }: { children: (now: number) => ReactNode; active?: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => { setNow(Date.now()); if (active && !document.hidden) timer = setTimeout(tick, 1000 - Date.now() % 1000); };
    const visibility = () => { clearTimeout(timer); if (!document.hidden) tick(); };
    if (active) tick();
    document.addEventListener('visibilitychange', visibility);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', visibility); };
  }, [active]);
  return children(now);
}

/** Timer wake-ups follow actual completion timestamps; they never tick the whole React tree. */
export function RecoveryClock({ state, readOnly, busy, act }: { state: GameState | null; readOnly: boolean; busy: boolean; act: (command: Command) => Promise<boolean> }) {
  useEffect(() => {
    if (!state || readOnly || busy) return;
    let timer: ReturnType<typeof setTimeout>, disposed = false, recovering = false;
    const check = () => {
      clearTimeout(timer);
      if (disposed || document.hidden || recovering) return;
      const now = effectiveNow(state, Date.now()), energy = getEnergyStatus(state, now);
      if (state.appliances.some(appliance => appliance.job && appliance.job.endsAt <= now && !appliance.outputSlot) || energy.value !== state.energy.value) {
        recovering = true; void act({ type: 'recover' }).finally(() => { recovering = false; }); return;
      }
      const next = Math.min(...state.appliances.flatMap(appliance => appliance.job && !appliance.outputSlot && appliance.job.endsAt > now ? [appliance.job.endsAt - now] : []), energy.nextRecoveryIn || Infinity);
      if (Number.isFinite(next)) timer = setTimeout(check, Math.max(16, next + 1));
    };
    check(); document.addEventListener('visibilitychange', check);
    return () => { disposed = true; clearTimeout(timer); document.removeEventListener('visibilitychange', check); };
  }, [state, readOnly, busy, act]);
  return null;
}

export function ReadySignal({ onReady }: { onReady: () => void }) { useEffect(onReady, [onReady]); return null; }
