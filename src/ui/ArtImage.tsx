import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { artUrl, mobileAssetPath, sizedArtPath } from '../content/assets';
import { loadArtImage } from '../platform/asset-queue';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> { path: string; size: number; }
/** Hidden/offscreen panels never compete with the current board for image slots. */
export function ArtImage({ path, size, loading = 'lazy', ...props }: Props) {
  const element = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState<{ path: string; url: string } | null>(null);
  const source = sizedArtPath(path, size, typeof window === 'undefined' ? 1 : window.devicePixelRatio);
  useEffect(() => {
    let disposed = false, observer: IntersectionObserver | undefined;
    const show = () => {
      observer?.disconnect();
      const url = artUrl(source);
      void loadArtImage(url, 1).then(() => { if (!disposed) setLoaded({ path: source, url }); }, () => {
        const fallback = artUrl(mobileAssetPath(path));
        if (fallback === url) return;
        void loadArtImage(fallback, 1).then(() => { if (!disposed) setLoaded({ path: source, url: fallback }); }, () => {});
      });
    };
    window.addEventListener('online', show);
    if (loading === 'eager' || typeof IntersectionObserver === 'undefined') show();
    else {
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) show(); }, { rootMargin: '120px' });
      if (element.current) observer.observe(element.current);
    }
    return () => { disposed = true; observer?.disconnect(); window.removeEventListener('online', show); };
  }, [source, path, loading]);
  return <img {...props} ref={element} width={size} height={size} src={loaded?.path === source ? loaded.url : undefined} loading={loading} decoding="async" data-art-status={loaded?.path === source ? 'ready' : 'loading'}/>;
}
