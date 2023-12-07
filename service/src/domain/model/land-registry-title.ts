import type { GeographicPoint, GeographicPolygon } from '@project-rouge/service-core/data/geographic';

export type LandRegistryTitleDomainModel = {
  readonly id: string;
  readonly title_number: string;
  readonly polygon: GeographicPolygon;
  readonly centroid: GeographicPoint;
  readonly updated_at: Date;
};
