import { configureContainerWithDatabaseServices } from './container-database';

/**
 * These are domain level services commonly needed across the codebase.
 */
export type ContainerDomainServices = {
  // 'domain.land_registry_title.factory': LandRegistryTitleDomainModelFactory;
};

/**
 * A {@link ContainerBuilder} extending {@link configureContainerWithDatabaseServices} with {@link ContainerDomainServices}.
 */
export const configureContainerWithDomainServices = configureContainerWithDatabaseServices.extend<ContainerDomainServices>({
});
