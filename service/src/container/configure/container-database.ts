import type { DatabaseConnectionFactory } from '@project-rouge/service-core/database/source/connection';
import { DatabaseConnectionManager } from '@project-rouge/service-core/database/source/manager';
import { createDatabaseConnectionFactory } from '../../database/connection';
import { LandRegistryTitleDatabaseRepository } from '../../database/repository/land-registry-title';
import { configureContainerWithBaseServices } from './container-base';

/**
 * These are database services commonly used across the codebase.
 */
export type ContainerDatabaseServices = {
  'database.connection.factory': DatabaseConnectionFactory;
  'database.connection.manager': DatabaseConnectionManager;

  'database.connection.reader': DatabaseConnectionManager;
  'database.connection.writer': DatabaseConnectionManager;

  // --
  // -- Repositories
  // --

  readonly 'database.land_registry_title.repository': LandRegistryTitleDatabaseRepository;
};

/**
 * A {@link ContainerBuilder} extending {@link configureContainerWithBaseServices} with {@link ContainerDatabaseServices}.
 */
export const configureContainerWithDatabaseServices = configureContainerWithBaseServices.extend<ContainerDatabaseServices>({
  'database.connection.factory': ({ container }) => {
    return createDatabaseConnectionFactory(
      container.provide('environment.runtime'),
      container.provide('environment'),
    );
  },

  'database.connection.manager': ({ container }) => {
    return new DatabaseConnectionManager(
      container.provide('database.connection.factory'),
      container.provide('timestamp.factory'),
    );
  },

  'database.connection.reader': ({ container }) => container.get('database.connection.manager'),
  'database.connection.writer': ({ container }) => container.get('database.connection.manager'),

  // --
  // -- Repositories
  // --

  'database.land_registry_title.repository': ({ container }) => {
    return new LandRegistryTitleDatabaseRepository(
      container.provide('database.connection.manager'),
    );
  },
});
