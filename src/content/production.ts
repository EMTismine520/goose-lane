export const ENERGY_CONFIG = { initial: 60, naturalCap: 100, recoveryInterval: 120_000, buildCompletionReward: 50 } as const;
export interface ProductionDefinition { energyCost: number; drops: { item: string; weight: number }[]; }
/** Tuned local design values, independent of the three observed source-game samples. */
export const PRODUCTION: Record<string, ProductionDefinition> = {
  'fresh-veg': { energyCost: 1, drops: [{ item: 'fresh-veg-1', weight: 72 }, { item: 'fresh-veg-2', weight: 20 }, { item: 'fresh-veg-3', weight: 8 }] },
  'fresh-fruit': { energyCost: 1, drops: [{ item: 'fresh-fruit-1', weight: 72 }, { item: 'fresh-fruit-2', weight: 20 }, { item: 'fresh-fruit-3', weight: 8 }] },
};

export function nextRandom(seed: number): { seed: number; value: number } {
  let next = seed >>> 0;
  next ^= next << 13; next ^= next >>> 17; next ^= next << 5;
  next >>>= 0;
  return { seed: next, value: next / 0x1_0000_0000 };
}
