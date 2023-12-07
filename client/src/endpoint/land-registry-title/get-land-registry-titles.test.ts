import { never } from '@matt-usurp/grok';
import { partial } from '@matt-usurp/grok/testing';
import type { ClientRequestInput } from '@project-rouge/service-core/http/client';
import { isHttpResponseIdentifier } from '@project-rouge/service-core/http/endpoint';
import type { GetLandRegistryTitles } from './get-land-registry-titles';
import { request } from './get-land-registry-titles';

describe('isHttpResponseIdentifier()', (): void => {
  // This test might look silly but its asserting the types are exhausted as they are tested.
  // The return statement will remove the response from the available possibilities.
  // Finally a never assertion is used to ensure the responses union has been exhausted.
  it('with response, can be used with type exhaustion', (): void => {
    const response = partial<GetLandRegistryTitles.Response>({});

    if (isHttpResponseIdentifier(response, 'failure:request-unauthorised')) {
      return;
    }

    if (isHttpResponseIdentifier(response, 'success:data:land-registry-title')) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw never(response);
    } catch (_) {
      // We do not actually care for the error thrown.
      // Just that the types are passing the build.
    }
  });
});

describe('types, GetLandRegistryTitles', (): void => {
  describe('Response', (): void => {
    it('SuccessLandRegistryTitlesReturned', (): void => {
      // This test just validates types, the expectation means nothing.
      // Please define as much as possible in the type, leave no arrays as empty or optionals.
      // This will help in future when refactoring.
      expect<Required<GetLandRegistryTitles.Response.SuccessLandRegistryTitlesReturned>>({
        status: 200,

        headers: {
          'api-response': 'success:data:land-registry-title',
        },

        body: [
          {
            id: '20795829',

            title_number: 'test:value',

            perimeter: [
              [
                0,
                0,
              ],
            ],
          },
        ],
      }).toBeTypeOf('object');
    });
  });
});

describe('request()', (): void => {
  it('with inputs, can trigger client as expected', async (): Promise<void> => {
    const client = vi.fn();

    client.mockImplementationOnce(async (): Promise<string> => {
      return 'test:client:response';
    });

    const response = await request(client, {
      credentials: {
        actor: 'test:credentials:actor',
      },

      query: {
        latitude: 0,
        longitude: 0,
        radius: undefined,
      },

      hostname: 'https://service.something.net',
    });

    expect(client).toBeCalledTimes(1);
    expect(client).toBeCalledWith<[ClientRequestInput]>({
      signal: undefined,

      credentials: {
        actor: 'test:credentials:actor',
      },

      query: {
        latitude: 0,
        longitude: 0,
      },

      hostname: 'https://service.something.net',

      method: 'GET',
      path: '/land-registry/titles',
    });

    expect(response).toStrictEqual<string>('test:client:response');
  });
});
