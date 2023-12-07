import type { GeographicPointDatabaseValue } from '@project-rouge/service-core/database/data/geographic/point';
import { fromGeographicPointDatabaseValue, toGeographicPointDatabaseValue } from '@project-rouge/service-core/database/data/geographic/point';
import type { GeographicPolygonDatabaseValue } from '@project-rouge/service-core/database/data/geographic/polygon';
import { fromGeographicPolygonDatabaseValue, toGeographicPolygonDatabaseValue } from '@project-rouge/service-core/database/data/geographic/polygon';
import type { LandRegistryTitleDomainModel } from '../../domain/model/land-registry-title';
/**
 * @kind `database-record`
 */
export type LandRegistryTitleDatabaseRecord = {
  readonly id: string;
  readonly title_number: string;
  readonly polygon: GeographicPolygonDatabaseValue;
  readonly centroid: GeographicPointDatabaseValue;
  readonly updated_at: Date;
};

export const toLandRegistryTitleDomainModel = (record: LandRegistryTitleDatabaseRecord): LandRegistryTitleDomainModel => {
  return {
    id: record.id,

    title_number: record.title_number,

    polygon: fromGeographicPolygonDatabaseValue(record.polygon),

    centroid: fromGeographicPointDatabaseValue(record.centroid),

    updated_at: record.updated_at,
  };
};

export const fromLandRegistryTitleDomainModel = (model: LandRegistryTitleDomainModel): LandRegistryTitleDatabaseRecord => {
  return {
    id: model.id,

    title_number: model.title_number,

    polygon: toGeographicPolygonDatabaseValue(model.polygon),

    centroid: toGeographicPointDatabaseValue(model.centroid),

    updated_at: model.updated_at,
  };
};
