import type { LandRegistryTitleDomainModel } from './land-registry-title';

// This can be removed when the file has something other than types in it.
import './land-registry-title';

it('type test', (): void => {
  const model: LandRegistryTitleDomainModel = {
    id: 'test:domain-model:id',

    title_number: 'test:domain-model:title-number',

    polygon: [
      {
        latitude: 0,
        longitude: 0,
      },
    ],

    centroid: {
      latitude: 0,
      longitude: 0,
    },

    updated_at: new Date(),
  };

  expect(model).toBeTypeOf('object');
});
