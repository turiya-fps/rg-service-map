import { ContainerBuilder } from '@project-rouge/service-core/container';
import type { EnvironmentMapping } from '@project-rouge/service-core/environment';
import { getEnvironmentVariable } from '@project-rouge/service-core/environment';
import { RuntimeType, resolveRuntimeTypeFromEnvironment } from '@project-rouge/service-core/environment/runtime';
import type { LogLevel } from '@project-rouge/service-core/logger';
import { createLogLevelFromString } from '@project-rouge/service-core/logger';

/**
 * These are all possible environment variables the container will need.
 */
export type ContainerEnvironment = {
  /** @see {@link RuntimeType} */
  readonly RUNTIME: string;

  /** @see {@link LogLevel} */
  readonly LOGLEVEL: string;

  readonly SERVICE_ALIAS: string;

  readonly POSTGRES_PURPOSE: string;
  readonly POSTGRES_DATABASE: string;
  readonly POSTGRES_HOSTNAME: string;
  readonly POSTGRES_USERNAME: string;
  readonly POSTGRES_PASSWORD: string;
};

export type ContainerParameters = {
  readonly 'service.alias': string;

  readonly 'environment': EnvironmentMapping;
  readonly 'environment.runtime': RuntimeType;
  readonly 'environment.runtime.local': boolean;

  readonly 'logger.level': LogLevel;
};

/**
 * A {@link ContainerBuilder} providing {@link ContainerParameters}.
 */
export const configureContainerWithParameters = new ContainerBuilder<ContainerParameters, ContainerEnvironment>({
  'service.alias': ({ environment }) => {
    return getEnvironmentVariable(environment, 'SERVICE_ALIAS');
  },

  // --
  // -- Environment
  // --

  'environment': ({ environment }) => environment,

  'environment.runtime': ({ environment }) => {
    return resolveRuntimeTypeFromEnvironment(environment);
  },

  'environment.runtime.local': ({ container }) => {
    return container.get('environment.runtime') === RuntimeType.Local;
  },

  // --
  // -- Logger
  // --

  'logger.level': ({ environment }) => {
    return createLogLevelFromString(
      getEnvironmentVariable(environment, 'LOGLEVEL'),
    );
  },
});
