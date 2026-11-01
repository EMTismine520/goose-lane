import { Check, Coins } from 'lucide-react';
import type { GameEvent } from '../domain/types';

/** Generation is acknowledged on the board; errors and other results stay visible. */
export function GameToast({ event, revision, hidden = false }: { event: GameEvent | null; revision: number; hidden?: boolean }) {
  if (!event?.message || event.type === 'generate' || hidden && event.type !== 'error') return null;
  return <div key={revision} className={`game-toast ${event.type === 'error' ? 'error' : ''}`} role="status">
    {event.type === 'deliver' ? <Coins size={17}/> : event.type === 'error' ? null : <Check size={17}/>}
    <span>{event.message}</span>
  </div>;
}
