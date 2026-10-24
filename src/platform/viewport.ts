const MOBILE_VIEWPORT = 'width=device-width, initial-scale=1.0, viewport-fit=cover';

/** Use measured CSS pixels on kernels without dvh and repair an oversized mobile layout viewport. */
export function installGameViewport(): () => void {
  const root = document.documentElement;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  const originalContent = viewport?.content;
  const originalHeight = root.style.getPropertyValue('--app-height');
  const originalMobile = root.dataset.mobileViewport;
  let correctedViewport = false;

  if (mobile) {
    root.dataset.mobileViewport = 'true';
    // Some mobile shells retain a wide layout viewport despite width=device-width.
    // A numeric device width makes the intended layout explicit at initial entry.
    const deviceWidth = window.screen.width;
    if (viewport && deviceWidth > 0 && window.innerWidth > deviceWidth * 1.15 && window.innerHeight > window.innerWidth) {
      viewport.content = `width=${deviceWidth}, initial-scale=1.0, viewport-fit=cover`;
      correctedViewport = true;
    }
  }

  const resize = () => {
    const visual = window.visualViewport;
    // Pinch zoom must keep its normal behavior; its smaller visual viewport is not a layout resize.
    const height = visual && Math.abs(visual.scale - 1) < 0.01 ? visual.height : window.innerHeight;
    if (height > 0) root.style.setProperty('--app-height', `${height}px`);
  };
  const orientation = () => {
    if (correctedViewport && viewport) viewport.content = MOBILE_VIEWPORT;
    correctedViewport = false;
    resize();
  };
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', orientation);
  window.visualViewport?.addEventListener('resize', resize);
  const frame = requestAnimationFrame(resize);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    window.removeEventListener('orientationchange', orientation);
    window.visualViewport?.removeEventListener('resize', resize);
    if (originalHeight) root.style.setProperty('--app-height', originalHeight);
    else root.style.removeProperty('--app-height');
    if (originalMobile === undefined) delete root.dataset.mobileViewport;
    else root.dataset.mobileViewport = originalMobile;
    if (viewport && originalContent !== undefined) viewport.content = originalContent;
  };
}
