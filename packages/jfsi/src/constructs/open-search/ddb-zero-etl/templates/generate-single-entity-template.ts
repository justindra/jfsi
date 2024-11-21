import {
  GenerateSourceProps,
  OpenSearchFieldConfig,
  generateIndexName,
  generateOpenSearchSink,
  generateTemplate,
} from './base';

export type GenerateSingleEntityConfigProps<
  E extends Record<string, any> = Record<string, any>,
> = {
  entityName: string;
  includeKeys?: (keyof E)[];
  mappings: Partial<Record<keyof E, OpenSearchFieldConfig>>;
};

/**
 * Generate the entities' configuration for DynamoDB, this function is used to
 * structure the data properly and provide a way to share typing.
 *
 * @param entityName The name of the entity as defined in ElectroDB
 * @param includeKeys The keys to include in the index
 * @param mappings The mappings of those keys
 * @returns
 */
function generateSingleEntityConfig<
  E extends Record<string, any> = Record<string, any>,
>({
  version,
  entityName,
  includeKeys,
  mappings,
}: GenerateSingleEntityConfigProps<E> & { version: string }) {
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
    includeKeys,
    indexMapping: { mappings: { properties: mappings } },
  };
}

export type GenerateSingleEntityTemplateProps = GenerateSourceProps & {
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
  entityConfigs: GenerateSingleEntityConfigProps;
};

/**
 * Generate the OpenSearch pipeline configuration template for a DynamoDB Zero
 * ETL integration. This is a template that is to be used with a basic table
 * that only contains a single entity.
 */
export function generateSingleEntityTemplate({
  version,
  table,
  bucket,
  openSearchDomainEndpoint,
  region,
  entityConfigs: propEntityConfig,
  pipelineRole,
}: GenerateSingleEntityTemplateProps) {
  const s3Prefix = `${table.tableName}/${version}`;

  const entityConfig = generateSingleEntityConfig({
    ...propEntityConfig,
    version,
  });

  const sink = [
    generateOpenSearchSink({
      bucket,
      openSearchDomainEndpoint,
      pipelineRole,
      region,
      s3KeyPrefix: s3Prefix,
      indexName: entityConfig.indexName,
      templateContent: entityConfig.indexMapping,
    }),
  ];

  const processor = entityConfig.includeKeys
    ? [{ select_entries: { include_keys: entityConfig.includeKeys } }]
    : undefined;

  return generateTemplate({
    table,
    bucket,
    region,
    s3KeyPrefix: s3Prefix,
    pipelineRole,
    processor,
    sink,
    indexConfig: [entityConfig],
  });
}
