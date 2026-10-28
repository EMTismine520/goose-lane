type Sample = { name: string; ms: number; detail?: string; };
const enabled = typeof location !== 'undefined' && new URLSearchParams(location.search).get('perf') === '1';
if (enabled) performance.setResourceTimingBufferSize?.(3000);
const samples: Sample[] = [], milestones: Record<string, number> = {}, frameBuckets = new Map<number, number>();
let frameCount = 0, frameTime = 0, slowFrames = 0, lastFrame = 0;

export function perfMark(name: string) {
  if (!enabled || name in milestones) return;
  milestones[name] = performance.now();
  performance.mark(`goose:${name}`);
}
/** Opt-in DOM diagnostics can read the first ready frame without exposing game state. */
export function perfMilestone(name: string) { return milestones[name]; }
export function perfSpan(name: string, detail?: string): () => void {
  if (!enabled) return () => {};
  const started = performance.now();
  return () => { samples.push({ name, ms: performance.now() - started, detail }); if (samples.length > 2000) samples.shift(); };
}
export function resetFrameClock() { lastFrame = 0; }
export function perfFrame(now: number) {
  if (!enabled) return;
  if (lastFrame && now - lastFrame < 2000) {
    const elapsed = now - lastFrame, bucket = Math.min(2000, Math.round(elapsed));
    frameBuckets.set(bucket, (frameBuckets.get(bucket) ?? 0) + 1); frameCount++; frameTime += elapsed;
    if (elapsed > 50) slowFrames++;
  }
  lastFrame = now;
}
export function performanceSnapshot() {
  const sorted = [...frameBuckets].sort(([a], [b]) => a - b);
  let count = 0, p95 = 0;
  for (const [ms, amount] of sorted) { count += amount; if (count >= frameCount * .95) { p95 = ms; break; } }
  const resources = typeof performance === 'undefined' ? [] : performance.getEntriesByType('resource').map(entry => {
    const resource = entry as PerformanceResourceTiming;
    return { url: resource.name, duration: resource.duration, start: resource.startTime, transferBytes: resource.transferSize, encodedBytes: resource.encodedBodySize, decodedBytes: resource.decodedBodySize };
  });
  const navigation = typeof performance === 'undefined' ? undefined : performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return { enabled, measuredAt: new Date().toISOString(), userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    milestones: { ...milestones }, samples: [...samples], resources,
    navigation: navigation && { dns: navigation.domainLookupEnd - navigation.domainLookupStart, connect: navigation.connectEnd - navigation.connectStart,
      tls: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
      ttfb: navigation.responseStart - navigation.requestStart, download: navigation.responseEnd - navigation.responseStart,
      responseStart: navigation.responseStart, responseEnd: navigation.responseEnd, domInteractive: navigation.domInteractive,
      transferBytes: navigation.transferSize, encodedBytes: navigation.encodedBodySize },
    frames: { count: frameCount, averageFps: frameTime ? frameCount * 1000 / frameTime : 0, p95Ms: p95, over50ms: slowFrames, over50msRatio: frameCount ? slowFrames / frameCount : 0 } };
}

/** Decorations adapt; item clarity, gestures, and persisted settings do not change. */
export class DecorationBudget {
  reduced = false;
  private since = 0;
  private previous = 0;
  private count = 0;
  private slow = 0;
  private bad = 0;
  private good = 0;
  sample(now: number) {
    const delta = this.previous ? now - this.previous : 0; this.previous = now;
    if (!delta || delta > 1000) { this.reset(now); return; }
    this.count++; if (delta > 25) this.slow++;
    if (now - this.since < 2000) return;
    if (this.slow / Math.max(1, this.count) > .2) { this.bad++; this.good = 0; }
    else { this.good++; this.bad = 0; }
    if (this.bad >= 3) this.reduced = true;
    if (this.good >= 5) this.reduced = false;
    this.reset(now);
  }
  reset(now = 0) { this.since = now; this.count = 0; this.slow = 0; this.previous = now; }
}
