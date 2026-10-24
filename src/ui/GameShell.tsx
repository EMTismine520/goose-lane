import { useLayoutEffect, type ReactNode } from 'react';
import { installGameViewport } from '../platform/viewport';
export function GameShell({children,page}:{children:ReactNode;page:string}) {
 useLayoutEffect(() => installGameViewport(), []);
 return <main className={`game-shell page-${page}`} aria-label="鹅巷食光">{children}</main>;
}
