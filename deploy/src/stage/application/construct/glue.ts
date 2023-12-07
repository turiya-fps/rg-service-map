import { GlueJob } from '@cdktf/provider-aws/lib/glue-job';
import { GlueTrigger } from '@cdktf/provider-aws/lib/glue-trigger';
import { IamPolicy } from '@cdktf/provider-aws/lib/iam-policy';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { S3Object } from '@cdktf/provider-aws/lib/s3-object';
import { SsmParameter } from '@cdktf/provider-aws/lib/ssm-parameter';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';
import path from 'path';
import type { StackVariableMapping } from '../../../stack/variable';
import type { ApplicationStageInputMapping } from '../input';
import type { ApplicationStageProviders } from '../provider';

export class GlueConstruct extends Construct {
  /**
   * @inheritdoc
   */
  public constructor(scope: Construct, vars: StackVariableMapping, providers: ApplicationStageProviders, inputs: ApplicationStageInputMapping) {
    super(scope, 'glue');

    const jarFiles = {
      aurora: 'postgresql-driver.jar',
      snowflake: 'snowflake-jdbc-driver.jar',
      spark: 'spark-snowflake-driver.jar',
    };

    const root = path.resolve(__dirname, '../../../../..');

    const files = {
      script: `${root}/service/build/workspace/glue/script/land-registry-data-sync.py`,
      jar: {
        aurora: `${root}/service/build/workspace/glue/jar/${jarFiles.aurora}`,
        snowflake: `${root}/service/build/workspace/glue/jar/${jarFiles.snowflake}`,
        spark: `${root}/service/build/workspace/glue/jar/${jarFiles.spark}`,
      },
    };

    const script = new S3Object(this, 'object-script-py', {
      provider: providers.environment.provider,

      bucket: inputs.storage.code.bucket,
      key: `services/${vars.stack.alias}/glue/script/land-registry-data-sync.py`,

      source: files.script,

      sourceHash: Fn.filebase64sha256(files.script),
    });

    const aurora = new S3Object(this, 'object-jar-aurora', {
      provider: providers.environment.provider,

      bucket: inputs.storage.code.bucket,
      key: `services/${vars.stack.alias}/glue/jar/${jarFiles.aurora}`,

      source: files.jar.aurora,
    });

    const snowflake = new S3Object(this, 'object-jar-snowflake', {
      provider: providers.environment.provider,

      bucket: inputs.storage.code.bucket,
      key: `services/${vars.stack.alias}/glue/jar/${jarFiles.snowflake}`,

      source: files.jar.snowflake,
    });

    const spark = new S3Object(this, 'object-jar-spark', {
      provider: providers.environment.provider,

      bucket: inputs.storage.code.bucket,
      key: `services/${vars.stack.alias}/glue/jar/${jarFiles.spark}`,

      source: files.jar.spark,
    });

    // --
    // -- AWS Glue
    // --

    const glueRole = new IamRole(this, 'glue-role', {
      provider: providers.environment.provider,
      path: '/service/map/',
      name: 'glue-role-land-registry',
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'glue.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
          },
        ],
      }),
    });

    const glueCustomPolicy = new IamPolicy(this, 'glue-custom-policy', {
      provider: providers.environment.provider,

      path: '/service/map/',

      name: 'glue-custom-policy',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'SnowflakeAccess',
            Effect: 'Allow',
            Action: [
              'glue:GetConnection',
            ],
            Resource: [
              `arn:aws:glue:${providers.environment.provider.region}:${providers.environment.id}:connection/*`,
            ],
          },
          {
            Sid: 'AuroraAccess',
            Effect: 'Allow',
            Action: [
              'glue:GetConnection',
              'rds-data:ExecuteSql',
              'rds-data:ExecuteStatement',
              'rds-data:BatchExecuteStatement',
            ],
            Resource: [
              `arn:aws:glue:${providers.environment.provider.region}:${providers.environment.id}:connection/*`,
              `arn:aws:rds:${providers.environment.provider.region}:${providers.environment.id}:cluster:*`,
            ],
          },
          {
            Sid: 'S3Access',
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject',
            ],
            Resource: [
              '*',
            ],
          },
          {
            Sid: 'CloudWatchLogsAccess',
            Effect: 'Allow',
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
            ],
            Resource: [
              '*',
            ],
          },
        ],
      }),
    });

    new IamRolePolicyAttachment(this, 'glue-role-service-policy-attachment', {
      provider: providers.environment.provider,

      role: glueRole.name,
      policyArn: 'arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole',
    });

    new IamRolePolicyAttachment(this, 'glue-role-custom-policy-attachment', {
      provider: providers.environment.provider,

      role: glueRole.name,
      policyArn: glueCustomPolicy.arn,
    });

    type SyncType =
    | 'full' // sync all data
    | 'updates'; // only sync data updated or created in the last month

    const createGlueJob = (syncType: SyncType) => {
      const jobName = `service-${vars.stack.alias}-glue-land-registry-data-sync-${syncType}`;

      return new GlueJob(this, `glue-job-${syncType.toLowerCase()}`, {
        provider: providers.environment.provider,

        name: jobName,
        description: 'Ingest land registry data from Snowflake to Aurora',

        roleArn: glueRole.arn,

        glueVersion: '4.0',
        command: {
          name: 'glueetl',
          pythonVersion: '3',
          scriptLocation: `s3://${script.bucket}/${script.key}`,
        },
        defaultArguments: {
          '--additional-python-modules': 'psycopg2-binary==2.9.3',
          '--insecureMode': 'true',
          '--enable-metrics': 'true',
          '--enable-continuous-cloudwatch-log': (providers.environment.alias === 'development' ? 'true' : 'false'),
          '--enable-continuous-log-filter': (providers.environment.alias === 'development' ? 'true' : 'false'),
          '--extra-jars': `s3://${aurora.bucket}/${aurora.key},s3://${snowflake.bucket}/${snowflake.key},s3://${spark.bucket}/${spark.key}`,
          '--JOB_NAME': jobName,
          '--SYNC_TYPE': syncType,

          '--SNOWFLAKE_URL': `${inputs.external.snowflake.landregistry.account}.snowflakecomputing.com`,
          '--SNOWFLAKE_ACCOUNT': inputs.external.snowflake.landregistry.account,
          '--SNOWFLAKE_WAREHOUSE': inputs.external.snowflake.landregistry.warehouse,
          '--SNOWFLAKE_DB': inputs.external.snowflake.landregistry.database,
          '--SNOWFLAKE_SCHEMA': inputs.external.snowflake.landregistry.schema,
          '--SNOWFLAKE_TABLE': inputs.external.snowflake.landregistry[syncType === 'full' ? 'table_full' : 'table_changes'],
          '--SNOWFLAKE_USER': inputs.external.snowflake.landregistry.username,
          '--SNOWFLAKE_PASSWORD': inputs.external.snowflake.landregistry.password,
          '--SNOWFLAKE_ROLE': inputs.external.snowflake.landregistry.role,

          '--AURORA_HOST': inputs.database.aurora.endpoint.write,
          '--AURORA_PORT': '5432',
          '--AURORA_DB': inputs.database.aurora.database,
          '--AURORA_SCHEMA': 'rg_service_map',
          '--AURORA_TABLE': 'land_registry_title',
          '--AURORA_USER': inputs.database.aurora.glue.username,
          '--AURORA_PASSWORD': inputs.database.aurora.glue.password,
        },
        workerType: 'G.1X',
        numberOfWorkers: 10,
        executionClass: 'STANDARD',
        maxRetries: 1,
        timeout: 2880,
      });
    };

    createGlueJob('full');

    const glueJobSyncMonthly = createGlueJob('updates');

    new SsmParameter(this, 'glue-job-sync-updates-name-ssm-parameter', {
      provider: providers.environment.provider,

      name: `/rg/service/${vars.stack.alias}/glue/job/sync-land-registry-data-updates/name`,
      description: `${glueJobSyncMonthly.name}`,

      type: 'String',
      value: glueJobSyncMonthly.name,
    });

    new GlueTrigger(this, 'glue-trigger', {
      provider: providers.environment.provider,

      name: `service-${vars.stack.alias}-glue-land-registry-data-sync-updates-schedule`,
      type: 'SCHEDULED',
      schedule: 'cron(0 0 6 * ? *)', // 6th of the month at 00:00
      actions: [{
        jobName: glueJobSyncMonthly.name,
      }],
    });
  }
}
