import type { ImmutableContainer } from '@project-rouge/service-core/container';
import type { EnvironmentMapping } from '@project-rouge/service-core/environment';
import type { ContainerBaseServices } from './configure/container-base';
import type { ContainerDatabaseServices } from './configure/container-database';
import { configureContainerWithDomainServices } from './configure/container-domain';
import type { ContainerEnvironment, ContainerParameters } from './configure/container-parameters';

export type Container = ImmutableContainer<(
  & ContainerParameters
  & ContainerBaseServices
  & ContainerDatabaseServices
)>;

/**
 * Prepare the container with the given {@link environment}.
 */
export const createContainerForEnvironment = (environment: EnvironmentMapping): Container => {
  return configureContainerWithDomainServices.build(environment as ContainerEnvironment);
};
