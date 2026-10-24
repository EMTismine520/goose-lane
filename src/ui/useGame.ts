import { useEffect, useRef, useState } from 'react';
import type { Command, GameEvent } from '../domain/types';
import { GameController } from '../platform/game-controller';
import type { GameView } from '../platform/game-controller';
import type { SaveRepository, SaveSlotId } from '../persistence/save';
import { acquireSession } from '../platform/session';

export function downloadText(text: string, name: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function useGame(repository?: SaveRepository, sessionScope?: string) {
  const controller = useRef<GameController | null>(null);
  const [view, setView] = useState<GameView>({ state: null, readOnly: true, busy: false, error: '', bootError: '', notice: null, savedAt: 0, recovered: false, pendingCommands: 0, pendingUids: [], sessionEpoch: 0 });
  useEffect(() => {
    const current = new GameController(downloadText, { repository, acquire: sessionScope ? change => acquireSession(change, sessionScope) : undefined });
    controller.current = current;
    const unsubscribe = current.subscribe(setView);
    void current.start();
    return () => {
      unsubscribe(); current.dispose();
      if (controller.current === current) controller.current = null;
    };
  }, [repository, sessionScope]);
  useEffect(() => {
    if (!view.notice) return;
    const timer = setTimeout(() => controller.current?.setNotice(null), 3400);
    return () => clearTimeout(timer);
  }, [view.notice]);
  const active = (): GameController => {
    if (!controller.current) throw new Error('正在打开游戏，请稍后重试。');
    return controller.current;
  };
  return {
    ...view,
    dispatch: (command: Command) => controller.current?.dispatch(command) ?? Promise.resolve(false),
    setNotice: (notice: GameEvent | null) => controller.current?.setNotice(notice),
    exportSave: () => controller.current?.exportSave(),
    importSave: (source: string) => active().importSave(source),
    recoverPrevious: () => active().recoverPrevious(),
    retry: () => controller.current?.retry(),
    exportRaw: () => controller.current?.exportRaw(),
    applyUpdate: (activate: () => Promise<void>) => active().applyUpdate(activate),
    listSlots: () => active().listSlots(),
    saveSlot: (id: SaveSlotId) => active().saveSlot(id),
    loadSlot: (id: SaveSlotId) => active().loadSlot(id),
    restartGame: () => active().restartGame(),
    canWriteSaves: () => controller.current?.canWriteSaves() ?? false,
  };
}
