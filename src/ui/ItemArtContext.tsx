import { createContext, useContext, type ReactNode } from 'react';
import type { ItemArtOverrides } from '../content/assets';

export interface ItemArtConfig {
  items?: ItemArtOverrides;
  renderer?: 'canvas' | 'auto';
  pixelRatio?: number;
}

const ItemArtContext = createContext<ItemArtConfig>({});

/** Only the separate development preview supplies a value. */
export function ItemArtProvider({ value, children }: { value: ItemArtConfig; children: ReactNode }) {
  return <ItemArtContext.Provider value={value}>{children}</ItemArtContext.Provider>;
}

export const useItemArt = () => useContext(ItemArtContext);
