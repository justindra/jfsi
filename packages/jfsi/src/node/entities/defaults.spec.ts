import { describe, expect, it } from 'vitest';
import { generateDDBKeys } from './defaults.js';

describe('Generate DDB Keys', () => {
  it('should generate the right number of gsi keys', () => {
    const keys = generateDDBKeys(3);

    expect(keys).toEqual({
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
      gsi3: {
        partitionKey: 'gsi3pk',
        sortKey: 'gsi3sk',
        indexName: 'gsi3',
      },
    });
  });
});
