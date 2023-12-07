import type { GeographicPolygonCompressed } from '@project-rouge/service-core/data/geographic';

export type LandRegistryTitleHttpResource = {
  readonly id: string;
  readonly title_number: string;
  readonly perimeter: GeographicPolygonCompressed;
};
