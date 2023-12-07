import { partial } from '@matt-usurp/grok/testing';
import type { GetLandRegistryTitles } from '@project-rouge/service-map-client/src/endpoint/land-registry-title/get-land-registry-titles';
import type { SafeParseError, SafeParseSuccess, ZodError, ZodIssue } from 'zod';
import * as validator from './validator';

describe('query', (): void => {
  it('with empty, errors', async (): Promise<void> => {
    const result = await validator.query().spa({});

    expect(result).toStrictEqual<SafeParseError<unknown>>({
      success: false,

      error: expect.objectContaining(partial<ZodError<unknown>>({
        name: 'ZodError',

        issues: [
          expect.objectContaining(partial<ZodIssue>({
            received: 'undefined',
            expected: 'number',

            path: expect.arrayContaining([
              'latitude',
            ]),
          })),
          expect.objectContaining(partial<ZodIssue>({
            received: 'undefined',
            expected: 'number',

            path: expect.arrayContaining([
              'longitude',
            ]),
          })),
        ],
      })),
    });
  });

  it('with data, parses, validates', async (): Promise<void> => {
    const query: GetLandRegistryTitles.Query = {
      latitude: 0,
      longitude: 0,
      radius: 0,
    };

    const result = await validator.query().spa(query);

    expect(result).toStrictEqual<SafeParseSuccess<GetLandRegistryTitles.Query>>({
      success: true,

      data: {
        latitude: 0,
        longitude: 0,
        radius: 0,
      },
    });
  });
});
