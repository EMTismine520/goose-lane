import { perfSpan } from './performance';

/** A promoted request keeps its original promise; failed work can be retried explicitly. */
export class AssetQueue<T> {
  private jobs = new Map<string, { key: string; priority: number; order: number; run: () => Promise<T>; resolve: (value: T) => void; reject: (error: unknown) => void; promise: Promise<T>; running: boolean }>();
  private active = 0;
  private sequence = 0;
  constructor(private readonly concurrency = 4, private readonly onIdle?: () => void) {}

  request(key: string, priority: number, run: () => Promise<T>): Promise<T> {
    const existing = this.jobs.get(key);
    if (existing) { existing.priority = Math.min(existing.priority, priority); return existing.promise; }
    let resolve!: (value: T) => void, reject!: (error: unknown) => void;
    const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
    this.jobs.set(key, { key, priority, order: this.sequence++, run, resolve, reject, promise, running: false });
    this.pump();
    return promise;
  }

  private pump() {
    while (this.active < this.concurrency) {
      const next = [...this.jobs.values()].filter(job => !job.running).sort((a, b) => a.priority - b.priority || a.order - b.order)[0];
      if (!next) return;
      next.running = true; this.active++;
      void Promise.resolve().then(next.run).then(next.resolve, next.reject).finally(() => {
        this.active--; this.jobs.delete(next.key); this.pump(); if (!this.jobs.size) this.onIdle?.();
      });
    }
  }
}

const queue = new AssetQueue<HTMLImageElement>(4, () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('goose:art-idle')); });
const decoded = new Map<string, HTMLImageElement>();
let decodedBytes = 0;
const baseUrl = (source: string) => new URL(source, document.baseURI).href;

/** React and Phaser both use native images, sharing URLs, decoding, and the four-slot queue. */
export function loadArtImage(source: string, priority = 1): Promise<HTMLImageElement> {
  const url = baseUrl(source), saved = decoded.get(url);
  if (saved) { decoded.delete(url); decoded.set(url, saved); return Promise.resolve(saved); }
  return queue.request(url, priority, () => new Promise<HTMLImageElement>((resolve, reject) => {
    const finishLoad = perfSpan('image-load', source);
    let finished = false;
    const image = new Image(); image.decoding = 'async';
    const timeout = setTimeout(() => { finish(); image.src = ''; reject(new Error('素材加载超时，请联网重试。')); }, 30000);
    const finish = () => { if (finished) return; finished = true; clearTimeout(timeout); image.onload = null; image.onerror = null; finishLoad(); };
    image.onerror = () => { finish(); reject(new Error('素材暂未加载成功。')); };
    image.onload = () => {
      const finishDecode = perfSpan('image-decode', source);
      void (typeof image.decode === 'function' ? image.decode() : Promise.resolve()).then(() => {
        if (finished) return;
        finishDecode(); finish(); decoded.set(url, image); decodedBytes += image.naturalWidth * image.naturalHeight * 4;
        while (decoded.size > 96 || decodedBytes > 12 * 1024 * 1024) {
          const oldest = decoded.entries().next().value;
          if (!oldest) break;
          decoded.delete(oldest[0]); decodedBytes -= oldest[1].naturalWidth * oldest[1].naturalHeight * 4;
        }
        resolve(image);
      }, error => { finishDecode(); finish(); reject(error); });
    };
    image.src = url;
  }));
}
