import { chapterDefinition } from '../content/chapters';
import { artUrl, deviceAssetPath, itemAssetPath, mobileAssetPath } from '../content/assets';
import { loadArtImage } from './asset-queue';
import type { GameState } from '../domain/types';

export function chapterResourcePaths(chapter: number, mobile = true): string[] {
  const c = chapterDefinition(chapter)!;
  const paths = [...c.dependencies.items.map(itemAssetPath), ...c.dependencies.families.flatMap(f=>[1,2,3].map(l=>deviceAssetPath(`${f}-l${l}`)))].filter((p):p is string=>!!p);
  return [...new Set(paths.map(p=>mobile?mobileAssetPath(p):p))];
}
/** Load the exact first screen before a purchase can change persisted state. */
export async function prepareChapter(state: GameState, chapter: number | 'original'): Promise<void> {
  const existing=state.workspaces?.[chapter==='original'?'original':`chapter-${chapter}`];
  const c=chapterDefinition(chapter==='original'?existing!.chapter:chapter)!;
  const paths=existing ? [...existing.board.flatMap(i=>i?[itemAssetPath(i.item)]:[]),...existing.devices.filter(d=>d.index!==null).map(d=>deviceAssetPath(`${d.familyId}-l${d.level}`)),...existing.appliances.flatMap(a=>[...a.inputSlots,...(a.outputSlot?[a.outputSlot]:[])].map(i=>itemAssetPath(i.item)))]
    : c.starter.families.map(f=>deviceAssetPath(`${f}-l${c.starter.levels[f]??1}`));
  paths.push(...c.orders.slice(0,3).flatMap(o=>o.needs.map(n=>itemAssetPath(n.item))));
  await Promise.all([...new Set(paths.filter((p):p is string=>!!p).map(mobileAssetPath))].map(p=>loadArtImage(artUrl(p),0)));
}
