import type { GsiKeys } from '../../common/type-utilities.js';

export const AUDIT_FIELDS = {
  createdAt: {
    type: 'string',
    default: () => new Date().toISOString(),
    set: () => new Date().toISOString(),
    readOnly: true,
  },
  updatedAt: {
    type: 'string',
    watch: '*',
    default: () => new Date().toISOString(),
    set: () => new Date().toISOString(),
    readOnly: true,
  },
  createdBy: {
    type: 'string',
  },
  updatedBy: {
    type: 'string',
  },
} as const;

/**
 * Generate the DDB keys based on the number of GSIs provided.
 * @param gsiNumber The number of GSIs to generate
 */
export function generateDDBKeys<N extends number>(gsiNumber: N) {
  const res: Record<
    string,
    {
      partitionKey: string;
      sortKey: string;
      indexName?: string;
    }
  > = {
    defaultIndex: {
      partitionKey: 'pk',
      sortKey: 'sk',
    },
  };
  new Array(gsiNumber).fill(0).forEach((_, i) => {
    res[`gsi${i + 1}`] = {
      partitionKey: `gsi${i + 1}pk`,
      sortKey: `gsi${i + 1}sk`,
      indexName: `gsi${i + 1}`,
    };
  });
  return res as Record<
    GsiKeys<N>,
    {
      partitionKey: string;
      sortKey: string;
      indexName: string;
    }
  > & {
    defaultIndex: {
      partitionKey: string;
      sortKey: string;
    };
  };
}

export const DDB_KEYS = generateDDBKeys(2);
