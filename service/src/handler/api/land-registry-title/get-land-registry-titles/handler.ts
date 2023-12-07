import type { Handler } from '@phasma/handler-aws';
import type { ApiEventSource } from '@project-rouge/service-core/handler/http-api';
import { type WithHttpSessionAuthenticationContext } from '@project-rouge/service-core/handler/http-api/middleware/authoriser/session-authentication';
import type { WithHttpRequestQueryContext } from '@project-rouge/service-core/handler/http-api/middleware/request-query';
import type { HttpResponse } from '@project-rouge/service-core/handler/http-api/response';
import { http } from '@project-rouge/service-core/handler/http-api/response';
import type { GetLandRegistryTitles } from '@project-rouge/service-map-client/src/endpoint/land-registry-title/get-land-registry-titles';
import type { LandRegistryTitleDatabaseRepository } from '../../../../database/repository/land-registry-title';
import type { LandRegistryTitleDomainModel } from '../../../../domain/model/land-registry-title';
import { toLandRegistryTitleHttpResource } from '../../../../http/resource/land-registry-title';

type Context = (
  & WithHttpSessionAuthenticationContext
  & WithHttpRequestQueryContext<GetLandRegistryTitles.Query>
);

type Response = HttpResponse<GetLandRegistryTitles.Response>;
type Definition = Handler.Definition<ApiEventSource, Context, Response>;

/**
 * @operation `get-land-registry-titles`
 */
export class GetLandRegistryTitlesApiHandler implements Handler.Implementation<Definition> {
  public constructor(
    private readonly registryTitleDatabaseRepository: LandRegistryTitleDatabaseRepository,
  ) {}

  /**
   * @inheritdoc
   */
  public async handle({ context }: Handler.Fn.Input<Definition>): Handler.Fn.Output<Definition> {
    const { longitude, latitude, radius } = context.query;

    const results: LandRegistryTitleDomainModel[] = await this.registryTitleDatabaseRepository.findByLocationAndRadius({ longitude, latitude }, radius);

    return http<GetLandRegistryTitles.Response.SuccessLandRegistryTitlesReturned>({
      status: 200,

      headers: {
        'api-response': 'success:data:land-registry-title',
      },

      body: results.map(toLandRegistryTitleHttpResource),
    });
  }
}
