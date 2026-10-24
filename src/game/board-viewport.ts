interface BoardScale {
  getParentBounds(): boolean;
  refresh(): unknown;
}

/** FIT uses cached parent bounds; refresh alone can leave a formerly hidden canvas at 0px. */
export function refreshBoardViewport(scale: BoardScale, parent: Pick<HTMLElement, 'getBoundingClientRect'>): boolean {
  const { width, height } = parent.getBoundingClientRect();
  if (width <= 0 || height <= 0) return false;
  scale.getParentBounds();
  scale.refresh();
  return true;
}
