import { useLayoutEffect, useState, type RefObject } from 'react';
import { getMergeLayout, type MergeLayout } from './ui-guidance';

/** Observe fixed chrome and the shell, never the board whose size this hook changes. */
export function useMergeLayout(area: RefObject<HTMLDivElement | null>, active: boolean): MergeLayout {
  const [layout, setLayout] = useState<MergeLayout>({ cell: 40, footerHeight: 104, scroll: false });
  useLayoutEffect(() => {
    if (!active || !area.current) return;
    const page = area.current.parentElement!;
    const shell = page.closest<HTMLElement>('.game-shell')!;
    const resource = shell.querySelector<HTMLElement>('.resource-bar')!;
    const orders = page.querySelector<HTMLElement>('.customer-section')!;
    const guide = page.querySelector<HTMLElement>('.guide-bar')!;
    const measure = () => {
      const bounds = shell.getBoundingClientRect();
      if (!bounds.width || !bounds.height || !page.getBoundingClientRect().width) return;
      const next = getMergeLayout({ width: bounds.width, height: bounds.height,
        resourceHeight: resource.getBoundingClientRect().height, ordersHeight: orders.getBoundingClientRect().height,
        guideHeight: guide.getBoundingClientRect().height });
      setLayout(previous => previous.cell === next.cell && previous.footerHeight === next.footerHeight && previous.scroll === next.scroll ? previous : next);
    };
    const observer = new ResizeObserver(measure);
    for (const element of [shell, resource, orders, guide]) observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [area, active]);
  return layout;
}
