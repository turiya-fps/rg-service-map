import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import type { AccountAlias, AccountPurposeEnvironment, AccountWithProvider, AccountWithPurpose } from '@project-rouge/infrastructure-core/aws/account';
import { getAccountByAliasOrThrow } from '@project-rouge/infrastructure-core/aws/account';
import { createResourceTagMapping } from '@project-rouge/infrastructure-core/aws/tagging';
import { AccountProviderFactory } from '@project-rouge/infrastructure-core/stack/provider';
import type { Construct } from 'constructs';
import type { StackVariableMapping } from '../../stack/variable';

export type FoundationStageProviders = {
  readonly environment: AccountWithProvider<AccountWithPurpose<AccountPurposeEnvironment>>;
};

export const resolveFoundationStageProviders = (
  scope: Construct,
  vars: StackVariableMapping,
  accounts: AccountWithPurpose[],
): FoundationStageProviders => {
  const alias = `account-environment-${vars.deploy.environment}` as AccountAlias;

  const region = vars.aws.region;
  const role = `deployment/deploy-service-${vars.stack.alias}`;

  const tags = createResourceTagMapping(
    `service-${vars.stack.alias}`,
    vars.stack.repository,
    vars.deploy.stage,
    vars.deploy.environment,
  );

  // A default provider to prevent Terraform from crying over default region.
  // This is not ideal as it means provider can be missed on resources and be applied with this.
  new AwsProvider(scope, 'provider-default-aws', {
    region: vars.aws.region,
  });

  const factory = new AccountProviderFactory(scope, tags);

  // Setup core providers that are to be manually assigned to resources within the stack.
  // Resources assigned to these are deployed within the respective account as expected.
  const environment = factory.createForDelegate(region, getAccountByAliasOrThrow(accounts, alias), role) as AccountWithProvider<AccountWithPurpose<AccountPurposeEnvironment>>;

  return {
    environment,
  };
};
