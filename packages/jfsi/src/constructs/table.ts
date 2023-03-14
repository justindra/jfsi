import { App, TableProps } from 'sst/constructs';
import { getRemovalPolicy } from './removal-policy.js';

function generateGsiFields(gsiNumber: number) {
  const gsiFields: TableProps['fields'] = {};
  new Array(gsiNumber).fill(0).forEach((_, i) => {
    gsiFields[`gsi${i + 1}pk`] = 'string';
    gsiFields[`gsi${i + 1}sk`] = 'string';
  });
  return gsiFields;
}

function generateGsiGlobalIndexes(gsiNumber: number) {
  const gsiGlobalIndexes: TableProps['globalIndexes'] = {};
  new Array(gsiNumber).fill(0).forEach((_, i) => {
    gsiGlobalIndexes[`gsi${i + 1}`] = {
      partitionKey: `gsi${i + 1}pk`,
      sortKey: `gsi${i + 1}sk`,
    };
  });
  return gsiGlobalIndexes;
}

/**
 * Generate default table options to be used with ElectroDB.
 * @param app The SST app.
 * @param gsiNumber The number of GSIs to generate
 */
export function generateDefaultTableOptions(
  app: App,
  gsiNumber: number
): TableProps {
  const gsiFields = generateGsiFields(gsiNumber);
  const gsiGlobalIndexes = generateGsiGlobalIndexes(gsiNumber);

  return {
    fields: {
      pk: 'string',
      sk: 'string',
      ...gsiFields,
    },
    primaryIndex: {
      partitionKey: 'pk',
      sortKey: 'sk',
    },
    globalIndexes: gsiGlobalIndexes,
    cdk: {
      table: { removalPolicy: getRemovalPolicy(app) },
    },
  };
}
