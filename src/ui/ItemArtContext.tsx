import { createContext, useContext, type ReactNode } from 'react';

export interface ItemArtConfig {
  renderer?: 'canvas' | 'auto';
  pixelRatio?: number;
}

const ItemArtContext = createContext<ItemArtConfig>({});

/** Preview controls rendering only; every page uses the same default B artwork. */
export function ItemArtProvider({ value, children }: { value: ItemArtConfig; children: ReactNode }) {
  return <ItemArtContext.Provider value={value}>{children}</ItemArtContext.Provider>;
}

export const useItemArt = () => useContext(ItemArtContext);
