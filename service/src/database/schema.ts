import type { EntitySchema } from 'typeorm';
import { LandRegistryTitleDatabaseSchema } from './schema/land-registry-title';

/**
 * Register all entities (as schemas) that TypeORM should be aware of here.
 *
 * This list is maintained manually because the string searching is deprecated and slow.
 * Another reason comes down to where the command is ran because of TypeORM CLI issues and the relative file paths.
 * These issues may be resolved in future but until now all entities should be mentioned here.
 */
export const schemas: EntitySchema[] = [
  LandRegistryTitleDatabaseSchema,
];
