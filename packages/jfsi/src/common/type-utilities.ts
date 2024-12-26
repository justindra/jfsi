// Helper type to generate keys 'gsi1', 'gsi2', ..., 'gsiN' as a union.
export type GsiKeys<
  N extends number,
  Acc extends unknown[] = [unknown]
> = Acc['length'] extends N
  ? `gsi${Acc['length']}`
  : `gsi${Acc['length']}` | GsiKeys<N, [...Acc, unknown]>;
