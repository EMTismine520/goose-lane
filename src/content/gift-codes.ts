export const GIFT_CODE_MAX_LENGTH = 64;

/** Offline gifts: each deliberate submission may redeem the same code again. */
export const GIFT_CODES: readonly { readonly key: string; readonly energy: number }[] = [
  { key: 'GOOSE100', energy: 100 },
  { key: 'JIAJIABB', energy: 1000 },
  { key: 'SISIBB', energy: 10000 },
];
