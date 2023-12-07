import { Signer } from '@aws-sdk/rds-signer';
import { SECONDS_IN_MINUTE, withAddedSeconds } from '@project-rouge/service-core/data/date';
import { createPostgresConnectionCredentials, createPostgresDataSource, withPostgresConnectionOptionsOptionsCertificate } from '@project-rouge/service-core/database/source/configuration';
import type { DatabaseConnectionFactory } from '@project-rouge/service-core/database/source/connection';
import { DatabaseConnection } from '@project-rouge/service-core/database/source/connection';
import type { EnvironmentMapping } from '@project-rouge/service-core/environment';
import type { PostgresConnectionDetailsEnvironmentMapping } from '@project-rouge/service-core/environment/database/postgres';
import { resolvePostgresConnectionDetailsFromEnvironment } from '@project-rouge/service-core/environment/database/postgres';
import type { RuntimeEnvironmentMapping } from '@project-rouge/service-core/environment/runtime';
import { RuntimeType } from '@project-rouge/service-core/environment/runtime';
import * as fs from 'fs/promises';
import type { DataSource } from 'typeorm';
import { schemas } from './schema';

const CERTIFICATE_ROOT_FILENAME = 'rds-ca-2019-root.pem';
const CERTIFICATE_DIRECTORY = `${__dirname}/certificates`;

export const createDataSourceForRoleAuthentication = async (environment: Partial<PostgresConnectionDetailsEnvironmentMapping & RuntimeEnvironmentMapping>): Promise<DataSource> => {
  const certificate = await fs.readFile(`${CERTIFICATE_DIRECTORY}/${CERTIFICATE_ROOT_FILENAME}`);

  const postgres = resolvePostgresConnectionDetailsFromEnvironment(environment);

  const signer = new Signer({
    region: 'eu-west-2',

    hostname: postgres.hostname,
    username: postgres.username,
    port: 5432,
  });

  const password = await signer.getAuthToken();

  const credentials = createPostgresConnectionCredentials(postgres.hostname, postgres.username, password, postgres.database);

  return createPostgresDataSource(schemas, withPostgresConnectionOptionsOptionsCertificate(credentials, certificate));
};

export const createDataSourceForSocket = async (environment: Partial<EnvironmentMapping>): Promise<DataSource> => {
  const postgres = resolvePostgresConnectionDetailsFromEnvironment(environment);

  const credentials = createPostgresConnectionCredentials(
    postgres.hostname,
    postgres.username,
    postgres.password,
    postgres.database,
  );

  return createPostgresDataSource(schemas, credentials);
};

export const createDataSourceForRuntime = async (
  runtime: RuntimeType,
  environment: Partial<EnvironmentMapping>,
): Promise<DataSource> => {
  switch (runtime) {
    case RuntimeType.ContinousIntegration:
    case RuntimeType.Lambda:
      return createDataSourceForRoleAuthentication(environment);

    default:
      return createDataSourceForSocket(environment);
  }
};

export const createDatabaseConnectionFactory = (
  runtime: RuntimeType,
  environment: Partial<EnvironmentMapping>,
): DatabaseConnectionFactory => {
  return async (date: Date): Promise<DatabaseConnection> => {
    const source = await createDataSourceForRuntime(runtime, environment);
    const lifetime = withAddedSeconds(date, SECONDS_IN_MINUTE * 10);

    return new DatabaseConnection(source, lifetime);
  };
};
