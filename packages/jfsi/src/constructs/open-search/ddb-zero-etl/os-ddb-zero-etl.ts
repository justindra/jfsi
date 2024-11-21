import {
  CompositePrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnPipeline } from 'aws-cdk-lib/aws-osis';
import { Construct } from 'constructs';
import { Bucket, Stack, Table } from 'sst/constructs';

type OpenSearchDynamoDBZeroETLIntegrationBaseProps<
  TTemplateProps extends { entityConfigs: any }
> = {
  /**
   * The version for the pipeline. This is used to migrate over indexes, when
   * there are significant changes to the mappings. It's better to switch over
   * to a new index.
   */
  version: string;
  /** The DDB Table to stream from */
  table: Table;
  /** The bucket to store exports and DLQs */
  bucket: Bucket;
  /** The OpenSearch domain name */
  openSearchDomainName: string;
  /** The OpenSearch domain endpoint */
  openSearchDomainEndpoint: string;
  entityConfigs: TTemplateProps['entityConfigs'];
  generateTemplateFn: (props: TTemplateProps) => {
    template: string;
    indexes: Record<string, string>;
  };
};

/**
 * Construct to create the DynamoDB Zero ETL integration with OpenSearch
 */
export class OpenSearchDynamoDBZeroETLIntegration<
  TProps extends { entityConfigs: any }
> extends Construct {
  private role: Role;
  private cloudwatchLogsGroup: LogGroup;
  pipeline: CfnPipeline;

  indexes: Record<string, string>;

  constructor(
    stack: Stack,
    id: string,
    {
      version,
      table,
      bucket,
      openSearchDomainName,
      openSearchDomainEndpoint,
      entityConfigs,
      generateTemplateFn,
    }: OpenSearchDynamoDBZeroETLIntegrationBaseProps<TProps>
  ) {
    super(stack, id);

    if (!table.cdk.table.tableStreamArn) {
      throw new Error(
        'Table must have a stream enabled to use the DynamoDB Zero ETL integration'
      );
    }

    // Create the IAM Role to be used by the Pipeline
    this.role = new Role(stack, `${id}-pipeline-role`, {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('osis-pipelines.amazonaws.com'),
        new ServicePrincipal('cloudsearch.amazonaws.com')
      ),
      inlinePolicies: {
        pipelineRole: new PolicyDocument({
          statements: [
            new PolicyStatement({
              sid: 'allowDescribeOpenSearchDomain',
              actions: ['es:DescribeDomain'],
              resources: [
                `arn:aws:es:${stack.region}:*:domain/${openSearchDomainName}`,
              ],
              effect: Effect.ALLOW,
            }),
            new PolicyStatement({
              sid: 'allowWriteToOpenSearch',
              actions: ['es:ESHttp*'],
              resources: [
                `arn:aws:es:${stack.region}:*:domain/${openSearchDomainName}`,
                `arn:aws:es:${stack.region}:*:domain/${openSearchDomainName}/*`,
              ],
              effect: Effect.ALLOW,
            }),
            new PolicyStatement({
              sid: 'allowRunExportJob',
              effect: Effect.ALLOW,
              actions: [
                'dynamodb:DescribeTable',
                'dynamodb:DescribeContinuousBackups',
                'dynamodb:ExportTableToPointInTime',
              ],
              resources: [table.tableArn],
            }),
            new PolicyStatement({
              sid: 'allowCheckExportJob',
              effect: Effect.ALLOW,
              actions: ['dynamodb:DescribeExport'],
              resources: [`${table.tableArn}/export/*`],
            }),
            new PolicyStatement({
              sid: 'allowReadFromStream',
              effect: Effect.ALLOW,
              actions: [
                'dynamodb:DescribeStream',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
              ],
              resources: [`${table.tableArn}/stream/*`],
            }),
            new PolicyStatement({
              sid: 'allowReadAndWriteToS3ForExport',
              effect: Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:AbortMultipartUpload',
                's3:PutObject',
                's3:PutObjectAcl',
              ],
              resources: [`${bucket.bucketArn}/${table.tableName}/*`],
            }),
          ],
        }),
      },
    });

    // Create the CloudWatch Logs Group
    this.cloudwatchLogsGroup = new LogGroup(stack, `${id}-pipeline-logs`, {
      logGroupName: `/aws/vendedlogs/OpenSearchIntegration/${id}-pipeline-logs/${version}`,
      retention: RetentionDays.ONE_MONTH,
    });

    // Generate the pipeline configuration template
    const { template, indexes } = generateTemplateFn({
      version,
      table,
      bucket,
      openSearchDomainEndpoint,
      pipelineRole: this.role,
      region: stack.region,
      entityConfigs,
    } as any as TProps);

    // Save the indexes that has been generated
    this.indexes = indexes;

    // Create the pipeline
    this.pipeline = new CfnPipeline(stack, `${id}-pipeline`, {
      maxUnits: 4,
      minUnits: 1,
      pipelineConfigurationBody: template,
      // Pipeline name must be maximum of 28 characters
      pipelineName: `${id
        .slice(0, 19)
        .replace(/^-+|-+$/g, '')}-${version}-pipeline`
        .slice(0, 28)
        .replace(/^-+|-+$/g, ''),
      logPublishingOptions: {
        cloudWatchLogDestination: {
          logGroup: this.cloudwatchLogsGroup.logGroupName,
        },
        isLoggingEnabled: true,
      },
      tags: [{ key: 'version', value: version }],
    });
  }
}
