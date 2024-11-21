import { kebabCase } from 'change-case';
import type { Entity, EntityItem } from 'electrodb';
import {
  GenerateSourceProps,
  OpenSearchFieldConfig,
  generateIndexName,
  generateOpenSearchSink,
  generateTemplate,
} from './base';
import { Function } from 'sst/constructs';

export type GenerateElectroDBEntityConfigProps<
  E extends Entity<any, any, any, any> = Entity<any, any, any, any>,
> = {
  entityName: E['schema']['model']['entity'];
  includeKeys?: (keyof EntityItem<E>)[];
  mappings: Partial<Record<keyof EntityItem<E>, OpenSearchFieldConfig>> &
    Record<string, OpenSearchFieldConfig>;
  processors?: { type: 'lambda'; function: Function }[];
};

/**
 * Generate the entities' configuration for DynamoDB, this function is used to
 * structure the data properly and provide a way to share typing with the
 * ElectroDB entities.
 *
 * @param entityName The name of the entity as defined in ElectroDB
 * @param includeKeys The keys to include in the index
 * @param mappings The mappings of those keys
 * @returns
 */
function generateEntityConfig<E extends Entity<any, any, any, any>>({
  version,
  entityName,
  includeKeys,
  mappings,
  processors,
}: GenerateElectroDBEntityConfigProps<E> & { version: string }) {
  // If there are any keys in includeKeys that don't have a mapping, log a warning
  const mappingKeysConfigured = Object.keys(mappings);
  const missingMappings = (includeKeys || []).filter(
    (key) => !mappingKeysConfigured.includes(key as string),
  );
  if (missingMappings.length) {
    console.warn(
      `The following keys are included in the index but do not have a mapping configured: ${missingMappings.join(
        ', ',
      )}`,
    );
  }

  return {
    entityName,
    indexName: generateIndexName(version, entityName),
    routeName: kebabCase(entityName),
    includeKeys,
    indexMapping: {
      mappings: {
        properties: {
          ...mappings,
          sk: { type: 'keyword' },
          pk: { type: 'keyword' },
          __edb_e__: { type: 'keyword' },
        },
      },
    },
    processors,
  };
}

export type GenerateElectroDBTemplateProps = GenerateSourceProps & {
  /**
   * The version for the pipeline. This is used to migrate over indexes, when
   * there are significant changes to the mappings. It's better to switch over
   * to a new index.
   */
  version: string;
  openSearchDomainEndpoint: string;
  /**
   * The entity configuration for the DynamoDB Zero ETL integration
   */
  entityConfigs: GenerateElectroDBEntityConfigProps[];
};

/**
 * Generate the OpenSearch pipeline configuration template for a DynamoDB Zero
 * ETL integration.
 */
export function generateElectroDBTemplate({
  version,
  table,
  bucket,
  openSearchDomainEndpoint,
  region,
  entityConfigs: propEntityConfigs,
  pipelineRole,
}: GenerateElectroDBTemplateProps) {
  const s3Prefix = `${table.tableName}/${version}`;

  const entityConfigs = propEntityConfigs.map((c) =>
    generateEntityConfig({ ...c, version }),
  );

  const routes: Record<string, string>[] = entityConfigs.map((c) => ({
    [c.routeName]: `contains(/sk, "${c.entityName.toLowerCase()}")`,
  }));

  const sink = entityConfigs.map((s) =>
    generateOpenSearchSink({
      openSearchDomainEndpoint,
      region,
      s3KeyPrefix: s3Prefix,
      pipelineRole,
      bucket,
      indexName: s.indexName,
      routeName: s.routeName,
      templateContent: s.indexMapping,
    }),
  );

  const processor = entityConfigs
    .map((c) => {
      const processors = [];

      const selectionFn = `contains(/sk, "${c.entityName.toLowerCase()}")`;

      if (c.includeKeys) {
        processors.push({
          select_entries: {
            include_keys: ['pk', 'sk', '__edb_e__', ...c.includeKeys],
            select_when: selectionFn,
          },
        });
      }
      if (c.processors) {
        c.processors.forEach((p) => {
          if (p.type === 'lambda') {
            processors.push({
              aws_lambda: {
                function_name: p.function.functionName,
                invocation_type: 'request-response',
                // TODO: Add a role that allows the lambda to be invoked
                aws: { region },
                lambda_when: selectionFn,
                batch: { key_name: 'events' },
              },
            });
          }
        });
      }
      return processors;
    })
    .flat()
    .filter((p) => !!p);

  // Add a catch-all route for entities that don't have a specific route
  processor.push({
    select_entries: {
      include_keys: ['pk', 'sk', '__edb_e__'],
      select_when: `not (${entityConfigs
        .map((c) => `contains(/sk, "${c.entityName.toLowerCase()}")`)
        .join(' or ')})`,
    },
  });

  const otherIndexName = generateIndexName(version, 'other');
  routes.push({
    other: `not (${entityConfigs
      .map((c) => `contains(/sk, "${c.entityName.toLowerCase()}")`)
      .join(' or ')})`,
  });

  sink.push(
    generateOpenSearchSink({
      openSearchDomainEndpoint,
      region,
      s3KeyPrefix: s3Prefix,
      pipelineRole,
      bucket,
      indexName: otherIndexName,
      routeName: 'other',
      templateContent: {
        mappings: {
          properties: {
            sk: { type: 'keyword' },
            pk: { type: 'keyword' },
            __edb_e__: { type: 'keyword' },
          },
        },
      },
    }),
  );

  return generateTemplate({
    table,
    bucket,
    region,
    s3KeyPrefix: s3Prefix,
    pipelineRole,
    processor,
    routes,
    sink,
    indexConfig: [
      ...entityConfigs,
      {
        entityName: 'other',
        indexName: otherIndexName,
      },
    ],
  });
}
