import { EntitySchema } from 'typeorm';
import type { LandRegistryTitleDatabaseRecord } from '../record/land-registry-title';
import { schema, TableName } from '../table';

export const LandRegistryTitleDatabaseSchema = new EntitySchema<LandRegistryTitleDatabaseRecord>({
  schema,
  name: TableName.LandRegistryTitle,

  columns: {
    id: {
      name: 'id',
      type: 'character varying',
      primary: true,
      nullable: false,
    },

    title_number: {
      name: 'title_number',
      type: 'character varying',
      length: 200,
      nullable: false,
    },

    polygon: {
      name: 'polygon',
      type: 'polygon',
      nullable: false,
    },

    centroid: {
      name: 'centroid',
      type: 'point',
      nullable: false,
    },

    updated_at: {
      name: 'updated_at',
      type: 'timestamp',
      nullable: false,
    },
  },

  indices: [
    { columns: ['id'], unique: true },
  ],
});
