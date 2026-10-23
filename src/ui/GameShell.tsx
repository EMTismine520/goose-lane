import type { ReactNode } from 'react';
export function GameShell({children,page}:{children:ReactNode;page:string}) { return <main className={`game-shell page-${page}`} aria-label="鹅巷食光">{children}</main>; }
