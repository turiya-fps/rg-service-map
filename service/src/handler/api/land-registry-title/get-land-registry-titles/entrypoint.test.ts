import { partial } from '@matt-usurp/grok/testing';
import type { ApiEventSourcePayload, ApiEventSourceResponseValue } from '@project-rouge/service-core/handler/http-api';
import { express, lambda } from '@project-rouge/service-core/http/route';
import type { GetLandRegistryTitles } from '@project-rouge/service-map-client/src/endpoint/land-registry-title/get-land-registry-titles';
import { handler, route } from './entrypoint';

describe('route', (): void => {
  it('method', (): void => {
    expect(route.method).toStrictEqual<GetLandRegistryTitles.Method>('GET');
  });

  it('path, lambda syntax', (): void => {
    expect(route.path(lambda)).toStrictEqual<string>('/land-registry/titles');
  });

  it('path, express syntax', (): void => {
    expect(route.path(express)).toStrictEqual<string>('/land-registry/titles');
  });
});

// handler testing is purely to test some specific middleware cases.
// such as validation of requests and expected error responses.
// we cannot effectively mock internally constructed instances here.

describe('handler', (): void => {
  it('with request, with authoriser response missing, return unauthorised', async (): Promise<void> => {
    const response = await handler(
      partial<ApiEventSourcePayload>({}),
      partial({}),
    );

    expect(response).toStrictEqual<ApiEventSourceResponseValue>({
      statusCode: 401,

      headers: {
        'api-response': 'failure:request-unauthorised',
        'api-authoriser': 'header:missing',

        'content-type': 'application/json',
        'content-length': '0',
      },

      body: '',
    });
  });
});
