import { DataAwsApigatewayv2Api } from '@cdktf/provider-aws/lib/data-aws-apigatewayv2-api';
import { DataAwsS3Bucket } from '@cdktf/provider-aws/lib/data-aws-s3-bucket';
import type { PostgresCredentialInputMapping, PostgresCredentialPurpose, PostgresCredentialSecretMapping } from '@project-rouge/infrastructure-core/database/postgres/credential';
import { AccountInputLookup } from '@project-rouge/infrastructure-core/stack/input';
import { jsondecode } from '@project-rouge/infrastructure-core/terraform';
import type { Construct } from 'constructs';
import { SERVICE_ALIAS } from '../../config/constants';
import type { ApplicationStageProviders } from './provider';

export type ApplicationStageInputMapping = {
  readonly api: DataAwsApigatewayv2Api;

  readonly storage: {
    readonly code: DataAwsS3Bucket;
  };

  readonly database: {
    readonly aurora: {
      readonly database: string;

      readonly read: PostgresCredentialInputMapping;

      readonly write: PostgresCredentialSecretMapping;

      readonly glue: PostgresCredentialSecretMapping;

      readonly endpoint: {
        readonly write: string;
      };
    };
  };

  readonly external: {
    readonly snowflake: {
      readonly landregistry: {
        readonly account: string;
        readonly username: string;
        readonly password: string;
        readonly warehouse: string;
        readonly database: string;
        readonly schema: string;
        readonly table_full: string;
        readonly table_changes: string;
        readonly role: string;
      };
    };
  };
};

export type SnowflakeLandRegistryCredentialSecretMapping = {
  readonly account: string;
  readonly username: string;
  readonly password: string;
  readonly role: string;
  readonly warehouse: string;
  readonly database: string;
  readonly schema: string;
  readonly table_full: string;
  readonly table_changes: string;
};

type PostgresCredential = {
  readonly purpose: PostgresCredentialPurpose;
  readonly username: string;
  readonly password: string;
};

const resolveSnowflakeLandRegistryCredential = (factory: AccountInputLookup): SnowflakeLandRegistryCredentialSecretMapping => {
  const credential = factory.secret(
    'input-external-snowflake-landregistry-credential',
    '/rg/external/snowflake/landregistry/credential',
  );

  const json = jsondecode<SnowflakeLandRegistryCredentialSecretMapping>(credential.secretString);

  return {
    account: json('account'),
    username: json('username'),
    password: json('password'),
    role: json('role'),
    warehouse: json('warehouse'),
    database: json('database'),
    schema: json('schema'),
    table_full: json('table_full'),
    table_changes: json('table_changes'),
  };
};

const resolvePostgresCredential = (factory: AccountInputLookup, purpose: PostgresCredentialPurpose): PostgresCredential => {
  const arn = factory.parameter(
    `input-database-aurora-shared-connection-${purpose}-arn`,
    `/rg/database/aurora-shared/connection/service/map/credential/${purpose}/arn`,
  );

  const credential = factory.secret(
    `input-database-aurora-shared-connection-${purpose}-arn-secret`,
    arn.value,
  );

  const json = jsondecode<PostgresCredentialSecretMapping>(credential.secretString);

  return {
    purpose: purpose,
    username: json('username'),
    password: json('password'),
  };
};

export const resolveHostname = (factory: AccountInputLookup, purpose: PostgresCredentialPurpose): string => {
  return factory.parameter(
    `input-database-aurora-shared-connection-${purpose}-endpoint`,
    `/rg/database/aurora-shared/endpoint/${purpose}`,
  ).value;
};

export const resolvePolicy = (factory: AccountInputLookup, purpose: PostgresCredentialPurpose): string => {
  return factory.parameter(
    `input-database-aurora-shared-connection-${purpose}-policy-arn`,
    `/rg/database/aurora-shared/connection/service/map/credential/${purpose}/policy/arn`,
  ).value;
};

export const resolveApplicationStageInputs = (scope: Construct, providers: ApplicationStageProviders): ApplicationStageInputMapping => {
  const environment = new AccountInputLookup(scope, providers.environment);

  return {
    api: new DataAwsApigatewayv2Api(scope, 'input-service-self-api', {
      provider: environment.account.provider,

      apiId: environment.parameter(
        'input-service-self-api-id',
        `/rg/service/${SERVICE_ALIAS}/api/id`,
      ).value,
    }),

    storage: {
      code: new DataAwsS3Bucket(scope, 'input-storage-code-bucket', {
        provider: environment.account.provider,

        bucket: environment.parameter(
          'input-storage-code-bucket-name',
          '/rg/storage/code/bucket/name',
        ).value,
      }),
    },

    database: {
      aurora: {
        database: environment.parameter(
          'input-database-aurora-shared-database',
          '/rg/database/aurora-shared/database',
        ).value,

        read: {
          ...resolvePostgresCredential(environment, 'read'),
          hostname: resolveHostname(environment, 'read'),
          policy: resolvePolicy(environment, 'read'),
        },

        write: {
          ...resolvePostgresCredential(environment, 'write'),
        },

        glue: {
          ...resolvePostgresCredential(environment, 'glue'),
        },

        endpoint: {
          write: environment.parameter(
            'input-database-shared-endpoint-write',
            '/rg/database/aurora-shared/endpoint/write',
          ).value,
        },
      },
    },

    external: {
      snowflake: {
        landregistry: resolveSnowflakeLandRegistryCredential(environment),
      },
    },
  };
};
