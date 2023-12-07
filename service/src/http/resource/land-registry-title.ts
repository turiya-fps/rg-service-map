import { createGeographicPointCompressed } from '@project-rouge/service-core/data/geographic';
import type { LandRegistryTitleHttpResource } from '@project-rouge/service-map-client/src/resource/land-registry-title';
import type { LandRegistryTitleDomainModel } from '../../domain/model/land-registry-title';

/**
 * Convert a {@link LandRegistryTitleDomainModel} to {@link LandRegistryTitleHttpResource}.
 */
export const toLandRegistryTitleHttpResource = (model: LandRegistryTitleDomainModel): LandRegistryTitleHttpResource => {
  return {
    id: model.id,
    title_number: model.title_number,
    perimeter: model.polygon.map((point) => createGeographicPointCompressed(point.latitude, point.longitude)),
  };
};
