import type { RequestHandlerFunction, RequestHandlerInputWithAuthentication, RequestHandlerInputWithQuery } from '@project-rouge/service-core/http/client';
import type { CommonResponse, CommonResponseIdentifier, HttpMethod } from '@project-rouge/service-core/http/endpoint';
import type { ResourceName } from '../../resource';
import type { LandRegistryTitleHttpResource } from '../../resource/land-registry-title';

/**
 * Return a collection of `project` resources.
 *
 * @operation `get-project-collection`
 */
export namespace GetLandRegistryTitles {
  /**
   * Method required for the endpoint.
   */
  export type Method = HttpMethod.Get;

  /**
   * Path parameters required for the endpoint.
   */
  export type Path = never;

  /**
   * The payload that is required when posting to this endpoint.
   */
  export type Payload = never;

  /**
   * The query that is required when posting to this endpoint.
   */
  export type Query = {
    readonly latitude: number;
    readonly longitude: number;
    readonly radius?: number;
  };

  /**
   * Response types that are used to conditionally switch on {@link Response} structures.
   */
  export namespace ResponseIdentifier {
    export type SuccessLandRegistryTitlesReturned = CommonResponseIdentifier.SuccessData<ResourceName.LandRegistryTitles>;
  }

  /**
   * Responses structures for the defined {@link ResponseIdentifier} entries.
   */
  export type Response = (
    | CommonResponse.FailureRequestUnauthorised

    | Response.SuccessLandRegistryTitlesReturned
  );

  export namespace Response {
    export type SuccessLandRegistryTitlesReturned = CommonResponse.SuccessData<ResponseIdentifier.SuccessLandRegistryTitlesReturned, LandRegistryTitleHttpResource[]>;
  }

  /**
   * The {@link RequestHandlerFunction} input parameters required for this endpoint.
   */
  export type RequestHandlerInput = (
    & RequestHandlerInputWithAuthentication
    & RequestHandlerInputWithQuery<Query>
  );

  /**
   * A {@link RequestHandlerFunction} that is typed against this endpoint.
   */
  export type RequestHandler = RequestHandlerFunction<RequestHandlerInput, Response>;
}

/**
 * A request handler for invoking the endpoint via the given client.
 *
 * This function is bound to the types declared in {@link GetLandRegistryTitle},
 * meaning the request and response types can be validated by the build.
 */
export const request: GetLandRegistryTitles.RequestHandler = async (client, configuration) => {
  const { credentials, hostname, signal, query } = configuration;

  return client({
    credentials,
    hostname,
    signal,

    method: 'GET' satisfies GetLandRegistryTitles.Method,
    path: '/land-registry/titles',

    query,
  });
};
