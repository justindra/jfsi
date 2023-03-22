export const AUDIT_FIELDS = {
  createdAt: {
    type: 'string',
    set: () => new Date().toISOString(),
    readOnly: true,
  },
  updatedAt: {
    type: 'string',
    watch: '*',
    set: () => new Date().toISOString(),
    readOnly: true,
  },
  createdBy: {
    type: 'string',
    readOnly: true,
  },
  updatedBy: {
    type: 'string',
    readOnly: true,
  },
} as const;

export const DDB_KEYS = {
  defaultIndex: {
    partitionKey: 'pk',
    sortKey: 'sk',
  },
  gsi1: {
    partitionKey: 'gsi1pk',
    sortKey: 'gsi1sk',
    indexName: 'gsi1',
  },
  gsi2: {
    partitionKey: 'gsi2pk',
    sortKey: 'gsi2sk',
    indexName: 'gsi2',
  },
} as const;
