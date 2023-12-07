import { getEnvironmentVariable, getEnvironmentVariableOptional } from '@project-rouge/service-core/environment';
import { SERVICE_ALIAS } from '../config/constants';

export type StackVariableEnvironmentMapping = {
  /**
   * The AWS profile name that relates to credentials on the machine that will run the deployment.
   * This is not needed for any deployments except for those being ran manually from a remote machine.
   * This should be undefined in almost all cases.
   *
   * @example `rg-account-main`
   */
  readonly AWS_PROFILE?: string;

  /**
   * The AWS region that can be given as the default Terraform provider.
   * This doesn't mean the region where resources will be deployed as that may be controlled internally.
   *
   * @example `eu-west-1`
   * @example `us-east-3`
   */
  readonly AWS_REGION: string;

  /**
   * The name of the deployment stage within the stack.
   * This is used for pipelines to pick stacks from the CDK generated directory.
   *
   * @example `infrastructure`
   * @example `database`
   */
  readonly DEPLOY_STAGE: string;

  /**
   * The name of the environment where the deployment will be targetted.
   * This is a machine readable name and use for scoping resources and state.
   *
   * @example `development`
   * @example `production`
   */
  readonly DEPLOY_ENVIRONMENT: string;
};

/**
 * A resolved series of core variables from the core envrionment variables.
 */
export type StackVariableMapping = {
  readonly aws: {
    readonly profile: string | undefined;
    readonly region: string;
  };

  readonly stack: {
    readonly alias: string;
    readonly repository: string;

    readonly state: {
      readonly bucket: string;
    };
  };

  readonly deploy: {
    readonly stage: string;
    readonly environment: string;
  };
};

export const resolveStackVariableMapping = (environment: Partial<StackVariableEnvironmentMapping>): StackVariableMapping => {
  const deploy = {
    stage: getEnvironmentVariable(environment, 'DEPLOY_STAGE'),
    environment: getEnvironmentVariable(environment, 'DEPLOY_ENVIRONMENT'),
  };

  return {
    aws: {
      profile: getEnvironmentVariableOptional(environment, 'AWS_PROFILE'),
      region: getEnvironmentVariable(environment, 'AWS_REGION'),
    },

    stack: {
      alias: SERVICE_ALIAS,
      repository: `service-${SERVICE_ALIAS}`,

      state: {
        bucket: `rg-account-supervisor-${deploy.environment}-stack-state-managed`,
      },
    },

    deploy,
  };
};
