import type { PostgresConnectionDetailsEnvironmentMapping } from '@project-rouge/service-core/environment/database/postgres';
import type { RuntimeEnvironmentMapping } from '@project-rouge/service-core/environment/runtime';
import { RuntimeType } from '@project-rouge/service-core/environment/runtime';
import { api } from '@project-rouge/service-core/handler/http-api';
import { WithHttpSessionAuthentication } from '@project-rouge/service-core/handler/http-api/middleware/authoriser/session-authentication';
import { WithHttpRequestQuery } from '@project-rouge/service-core/handler/http-api/middleware/request-query';
import { WithHttpResponseTransformer } from '@project-rouge/service-core/handler/http-api/middleware/response-transformer';
import { router } from '@project-rouge/service-core/http/route';
import type { GetLandRegistryTitles } from '@project-rouge/service-map-client/src/endpoint/land-registry-title/get-land-registry-titles';
import { createContainerForEnvironment } from '../../../../container/configure';
import { LandRegistryTitleDatabaseRepository } from '../../../../database/repository/land-registry-title';
import { GetLandRegistryTitlesApiHandler } from './handler';
import * as validator from './validator';

/**
 * The environment variables required for this handler.
 */
export type HandlerEnvironmentMapping = (
  & RuntimeEnvironmentMapping
  & PostgresConnectionDetailsEnvironmentMapping
);

/**
 * The composed route for this endpoint.
 */
export const route = router<GetLandRegistryTitles.Method, GetLandRegistryTitles.Path>('GET', () => {
  return '/land-registry/titles';
});

/**
 * The lambda function "handler" entrypoint.
 */
export const handler = api(async (application, environment) => {
  const container = createContainerForEnvironment(environment);
  const runtime = container.get('environment.runtime');
  const database = container.get('database.connection.writer');

  return application
    .use(new WithHttpResponseTransformer())
    .use(new WithHttpSessionAuthentication(runtime === RuntimeType.Local))
    .use(new WithHttpRequestQuery<GetLandRegistryTitles.Query>(validator.query()))
    .handle(
      new GetLandRegistryTitlesApiHandler(
        new LandRegistryTitleDatabaseRepository(database),
      ),
    );
});
