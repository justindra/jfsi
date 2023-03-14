import type { App } from 'sst/constructs';
import { expect, test } from 'vitest';
import { generateDefaultTableOptions } from './table.js';

test('Default Table Options should return correct number of gsi', () => {
  const options = generateDefaultTableOptions({ stage: 'prod' } as App, 2);
  expect(options.fields).toEqual({
    pk: 'string',
    sk: 'string',
    gsi1pk: 'string',
    gsi1sk: 'string',
    gsi2pk: 'string',
    gsi2sk: 'string',
  });

  expect(options.globalIndexes).toEqual({
    gsi1: {
      partitionKey: 'gsi1pk',
      sortKey: 'gsi1sk',
    },
    gsi2: {
      partitionKey: 'gsi2pk',
      sortKey: 'gsi2sk',
    },
  });
});
