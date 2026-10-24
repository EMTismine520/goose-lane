interface BoardScale {
  getParentBounds(): boolean;
  refresh(): unknown;
}

/** Phaser 4 has no GameConfig.resolution. Scale the backing store and camera together. */
export function boardPixelRatio(deviceRatio: number): number {
  return Number.isFinite(deviceRatio) ? Math.min(3, Math.max(1, Math.ceil(deviceRatio))) : 1;
}

/** FIT already maps CSS to backing pixels; our centered camera maps these to design units. */
export function boardPoint(point: { x: number; y: number }, pixelRatio: number) {
  return { x: point.x / pixelRatio, y: point.y / pixelRatio };
}

/** FIT uses cached parent bounds; refresh alone can leave a formerly hidden canvas at 0px. */
export function refreshBoardViewport(scale: BoardScale, parent: Pick<HTMLElement, 'getBoundingClientRect'>): boolean {
  const { width, height } = parent.getBoundingClientRect();
  if (width <= 0 || height <= 0) return false;
  scale.getParentBounds();
  scale.refresh();
  return true;
}
