import { Role } from 'aws-cdk-lib/aws-iam';
import { kebabCase } from 'change-case';
import { Bucket, Table } from 'sst/constructs';
import { stringify as yamlStringify } from 'yaml';

export type GenerateSourceProps = {
  table: Table;
  bucket: Bucket;
  region: string;
  s3KeyPrefix: string;
  pipelineRole: Role;
};

/**
 * Generate the source configuration for a DynamoDB Zero ETL integration.
 */
function generateSource({
  table,
  bucket,
  region,
  s3KeyPrefix,
  pipelineRole,
}: GenerateSourceProps) {
  return {
    dynamodb: {
      acknowledgments: true,
      tables: [
        {
          table_arn: table.tableArn,
          stream: { start_position: 'LATEST', view_on_remove: 'OLD_IMAGE' },
          export: {
            s3_bucket: bucket.bucketName,
            s3_region: region,
            s3_prefix: `${s3KeyPrefix}/data/`,
          },
        },
      ],
      aws: {
        sts_role_arn: pipelineRole.roleArn,
        region,
      },
    },
  };
}

/**
 *  The field configuration for OpenSearch (ElasticSearch) index mappings
 */
export type OpenSearchFieldConfig =
  | {
      type: 'keyword';
      fields?: Record<string, OpenSearchFieldConfig>;
    }
  | { type: 'text' }
  | { type: 'boolean' }
  | { type: 'integer' }
  | { type: 'long' }
  | { type: 'float' }
  | { type: 'date' };

/**
 * Generate the name for the index based on the version and entity name
 * @param version The version of the pipeline
 * @param entityName The name of the entity
 * @returns
 */
export function generateIndexName(version: string, entityName: string) {
  return `${kebabCase(version)}-${kebabCase(entityName)}`;
}

type GenerateSinkProps = Omit<GenerateSourceProps, 'table'> & {
  openSearchDomainEndpoint: string;
  indexName: string;
  routeName?: string;
  templateContent?: any;
};

export function generateOpenSearchSink({
  openSearchDomainEndpoint,
  indexName,
  routeName,
  templateContent,
  bucket,
  region,
  s3KeyPrefix,
  pipelineRole,
}: GenerateSinkProps) {
  return {
    opensearch: {
      hosts: [`https://${openSearchDomainEndpoint}`],
      index: indexName,
      ...(!!routeName ? { routes: [routeName] } : {}),
      index_type: 'custom',
      normalize_index: true,
      document_id: '${getMetadata("primary_key")}',
      action: '${getMetadata("opensearch_action")}',
      document_version: '${getMetadata("document_version")}',
      document_version_type: 'external',
      ...(!!templateContent
        ? { template_content: JSON.stringify(templateContent) }
        : {}),
      aws: {
        sts_role_arn: pipelineRole.roleArn,
        region,
      },
      dlq: {
        s3: {
          bucket: bucket.bucketName,
          key_path_prefix: `${s3KeyPrefix}/dlq/${indexName}/`,
          region,
          sts_role_arn: pipelineRole.roleArn,
        },
      },
    },
  };
}

type GenerateTemplateProps = GenerateSourceProps & {
  processor?: any[];
  routes?: any[];
  sink: any[];
  indexConfig: { entityName: string; indexName: string }[];
};

export function generateTemplate({
  table,
  bucket,
  region,
  s3KeyPrefix,
  pipelineRole,
  processor,
  routes,
  sink,
  indexConfig,
}: GenerateTemplateProps) {
  const config = {
    version: '2',
    'dynamodb-pipeline': {
      source: generateSource({
        table,
        bucket,
        region,
        s3KeyPrefix,
        pipelineRole,
      }),
      processor,
      routes,
      sink,
    },
  };

  const indexes: Record<string, string> = {};

  indexConfig.forEach((s) => {
    indexes[s.entityName] = s.indexName;
  });
  return {
    template: yamlStringify(config, { defaultStringType: 'QUOTE_SINGLE' }),
    indexes,
  };
}
