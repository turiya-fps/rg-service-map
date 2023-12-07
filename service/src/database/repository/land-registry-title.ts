import type { GeographicPoint } from '@project-rouge/service-core/data/geographic';
import type { DatabaseConnectionManager } from '@project-rouge/service-core/database/source/manager';
import type { LandRegistryTitleDomainModel } from '../../domain/model/land-registry-title';
import type { LandRegistryTitleDatabaseRecord } from '../record/land-registry-title';
import { toLandRegistryTitleDomainModel } from '../record/land-registry-title';
import { LandRegistryTitleDatabaseSchema } from '../schema/land-registry-title';

/**
 * A type that represents the 4 edges of a rectangular polygon
 */
export type MaxAndMinCoords = {
  readonly maxLng: number;
  readonly minLng: number;
  readonly maxLat: number;
  readonly minLat: number;
};

// describes coordinate boundaries of a horizontal rectangle of height 2*radius in metres and width 1.618*height
// calculations account for the variance of longitude as the latitude changes
const calculateMaxLongitude = (point: GeographicPoint, radius: number): number => {
  return point.longitude + ((radius / (111000 * Math.cos(point.latitude * Math.PI / 180))));
};
const calculateMinLongitude = (point: GeographicPoint, radius: number): number => {
  return point.longitude - ((radius / (111000 * Math.cos(point.latitude * Math.PI / 180))));
};
const calculateMaxLatitude = (point: GeographicPoint, radius: number): number => {
  return point.latitude + (radius / 111000);
};
const calculateMinLatitude = (point: GeographicPoint, radius: number): number => {
  return point.latitude - (radius / 111000);
};

export const findBoundingCoordsByLocationAndRadius = (point: GeographicPoint, radius: number): MaxAndMinCoords => {
  const maxLng = calculateMaxLongitude(point, radius * 1.618);
  const minLng = calculateMinLongitude(point, radius * 1.618);
  const maxLat = calculateMaxLatitude(point, radius);
  const minLat = calculateMinLatitude(point, radius);
  return {
    maxLng,
    minLng,
    maxLat,
    minLat,
  };
};

/**
 * @kind `database-repository`
 */
export class LandRegistryTitleDatabaseRepository {
  public constructor(
    private readonly database: DatabaseConnectionManager,
  ) {}

  public async findByLocationAndRadius(point: GeographicPoint, radius: number = 200): Promise<LandRegistryTitleDomainModel[]> {
    const qb = await this.database.querybuilder(LandRegistryTitleDatabaseSchema).select('self');

    const { maxLng, minLng, maxLat, minLat } = findBoundingCoordsByLocationAndRadius(point, radius);

    qb.where('self.centroid[0] < :maxLng AND self.centroid[0] > :minLng AND self.centroid[1] > :minLat AND self.centroid[1] < :maxLat');

    qb.setParameters({ maxLng, minLng, maxLat, minLat });

    const records = await qb.getMany();

    return records.map((record: LandRegistryTitleDatabaseRecord) => toLandRegistryTitleDomainModel(record));
  }
}
