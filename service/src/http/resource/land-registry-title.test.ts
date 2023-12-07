import type { LandRegistryTitleHttpResource } from '@project-rouge/service-map-client/src/resource/land-registry-title';
import { toLandRegistryTitleHttpResource } from './land-registry-title';

describe('toLandRegistryTitleHttpResource()', (): void => {
  it('with domain model, converts to http resource', (): void => {
    expect(
      toLandRegistryTitleHttpResource({
        id: 'test:value:id',

        title_number: 'test:value:title_number',
        polygon: [
          { latitude: 1, longitude: 2 },
          { latitude: 3, longitude: 4 },
          { latitude: 5, longitude: 6 },
        ],
        centroid: { latitude: 7, longitude: 8 },

        updated_at: new Date('2021-10-04T15:27:52.331Z'),
      }),
    ).toStrictEqual<LandRegistryTitleHttpResource>({
      id: 'test:value:id',
      title_number: 'test:value:title_number',
      perimeter: [
        [2, 1],
        [4, 3],
        [6, 5],
      ],
    });
  });
});
