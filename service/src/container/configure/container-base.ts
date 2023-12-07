import type { DateFactory } from '@project-rouge/service-core/data/date';
import { date } from '@project-rouge/service-core/data/date';
import { UniqueIdentifierFactory } from '@project-rouge/service-core/data/identifier';
import type { IdentityFactory } from '@project-rouge/service-core/data/identity';
import { identity } from '@project-rouge/service-core/data/identity';
import { TimestampFactory } from '@project-rouge/service-core/data/timestamp';
import type { LogWriteFunction } from '@project-rouge/service-core/logger';
import { Logger } from '@project-rouge/service-core/logger';
import { createConsoleLogWriter } from '@project-rouge/service-core/logger/writer/console';
import { configureContainerWithParameters } from './container-parameters';

/**
 * These are services commonly needed across the codebase.
 */
export type ContainerBaseServices = {
  /** @deprecated use timestamp.factory */
  readonly 'date.factory': DateFactory;

  /** @deprecated use identifier.factory */
  readonly 'identity.factory': IdentityFactory;

  readonly 'identifier.factory': UniqueIdentifierFactory;
  readonly 'timestamp.factory': TimestampFactory;

  readonly 'logger.writer': LogWriteFunction;
  readonly 'logger': Logger;
};

/**
 * A {@link ContainerBuilder} extending {@link configureContainerWithParameters} with {@link ContainerBaseServices}.
 */
export const configureContainerWithBaseServices = configureContainerWithParameters.extend<ContainerBaseServices>({
  'date.factory': () => {
    return date;
  },

  'identity.factory': () => {
    return identity;
  },

  'identifier.factory': ({}) => {
    return new UniqueIdentifierFactory();
  },

  'timestamp.factory': ({}) => {
    return new TimestampFactory();
  },

  // --
  // -- Logger
  // --

  'logger.writer': ({ container }) => {
    return createConsoleLogWriter(
      container.get('environment.runtime.local') === true,
    );
  },

  'logger': ({ container }) => {
    return new Logger(
      container.provide('logger.writer'),
      container.provide('logger.level'),
      [],
    );
  },
});
