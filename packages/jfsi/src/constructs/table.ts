import type { GsiKeys } from '../common/type-utilities.js';
import { getRemovalPolicy } from './removal-policy.js';

// Helper type to generate the keys based on the provided field names
type GenericIndex<TPk extends string, TSk extends string> = {
  [key in TPk | TSk]: string;
};

// Helper type to generate keys with suffixes like 'gsi1pk', 'gsi1sk', ..., 'gsiNpk', 'gsiNsk'.
type GsiFields<N extends number> = `${GsiKeys<N>}pk` | `${GsiKeys<N>}sk`;

function generateGsiFields<N extends number>(gsiNumber: N) {
  const gsiFields: Record<string, 'string'> = {};
  new Array(gsiNumber).fill(0).forEach((_, i) => {
    gsiFields[`gsi${i + 1}pk`] = 'string';
    gsiFields[`gsi${i + 1}sk`] = 'string';
  });
  return gsiFields as Record<GsiFields<N>, 'string'>;
}

function generateGsiGlobalIndexes<
  N extends number,
  TPk extends string,
  TSk extends string
>(gsiNumber: N, fieldNames: { pk: TPk; sk: TSk }) {
  const gsiGlobalIndexes: Record<string, GenericIndex<TPk, TSk>> = {};
  new Array(gsiNumber).fill(0).forEach((_, i) => {
    (gsiGlobalIndexes as any)[`gsi${i + 1}`] = {
      [fieldNames.pk]: `gsi${i + 1}pk`,
      [fieldNames.sk]: `gsi${i + 1}sk`,
    } as GenericIndex<TPk, TSk>;
  });
  return gsiGlobalIndexes as Record<GsiKeys<N>, GenericIndex<TPk, TSk>>;
}

/**
 * Generate default table options to be used with ElectroDB.
 * @param app The SST app.
 * @param gsiNumber The number of GSIs to generate
 * @param sstVersion The sst version to support
 */
export function generateDefaultTableOptions<
  N extends number,
  TVersion extends '2' | '3' = '2'
>(
  app: { stage: string },
  gsiNumber: N,
  sstVersion: TVersion = '2' as TVersion
) {
  const pkFieldName = (
    sstVersion === '2' ? 'partitionKey' : 'hashKey'
  ) as TVersion extends '2' ? 'partitionKey' : 'hashKey';
  const skFieldName = (
    sstVersion === '2' ? 'sortKey' : 'rangeKey'
  ) as TVersion extends '2' ? 'sortKey' : 'rangeKey';

  const gsiFields = generateGsiFields(gsiNumber);
  const gsiGlobalIndexes = generateGsiGlobalIndexes(gsiNumber, {
    pk: pkFieldName,
    sk: skFieldName,
  });

  return {
    fields: {
      pk: 'string' as const,
      sk: 'string' as const,
      ...gsiFields,
    },
    primaryIndex: {
      [pkFieldName]: 'pk',
      [skFieldName]: 'sk',
    } as GenericIndex<typeof pkFieldName, typeof skFieldName>,
    globalIndexes: gsiGlobalIndexes,
    ...(sstVersion === '2'
      ? {
          cdk: {
            table: { removalPolicy: getRemovalPolicy(app) },
          },
        }
      : {}),
  };
}
