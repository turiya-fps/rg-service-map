import { S3Backend as BaseBackend } from 'cdktf';
import type { Construct } from 'constructs';
import type { StackVariableMapping } from './variable';

/**
 * An custom stack backend that uses a S3 bucket as a storage location with generated storage key.
 */
export class StackBackend extends BaseBackend {
  /**
   * @inherit
   */
  public constructor(scope: Construct, vars: StackVariableMapping) {
    super(scope, {
      region: vars.aws.region,
      bucket: vars.stack.state.bucket,
      key: `states/services/${vars.stack.alias}/${vars.deploy.stage}.tfstate`,
    });
  }
}
