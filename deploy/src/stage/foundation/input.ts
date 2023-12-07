import { DataAwsRoute53Zone } from '@cdktf/provider-aws/lib/data-aws-route53-zone';
import type { AccountPurposeEnvironment, AccountWithProvider, AccountWithPurpose } from '@project-rouge/infrastructure-core/aws/account';
import type { ResourceWithArn } from '@project-rouge/infrastructure-core/aws/resource';
import { AccountInputLookup } from '@project-rouge/infrastructure-core/stack/input';
import type { Construct } from 'constructs';
import { SERVICE_ALIAS } from '../../config/constants';
import type { FoundationStageProviders } from './provider';

type ServiceDomainPurpose = {
  readonly hostname: string;
  readonly zone: DataAwsRoute53Zone;
  readonly certificate: ResourceWithArn;
};

export type FoundationStageInputMapping = {
  readonly domain: {
    readonly codename: ServiceDomainPurpose;
    readonly brand: ServiceDomainPurpose | undefined;
  };
};

const resolveServiceDomainPurpose = (scope: Construct, provider: AccountWithProvider<AccountWithPurpose<AccountPurposeEnvironment>>): ServiceDomainPurpose | undefined => {
  if (provider.branded === false) {
    return undefined;
  }

  const environment = new AccountInputLookup(scope, provider);

  return Object.freeze<ServiceDomainPurpose>({
    hostname: environment.parameter(
      'input-domain-brand-api-record-service-self-hostname',
      `/rg/domain/brand/api/record/service/${SERVICE_ALIAS}/hostname`,
    ).value,

    zone: new DataAwsRoute53Zone(scope, 'input-domain-brand-zone', {
      provider: environment.account.provider,

      zoneId: environment.parameter(
        'input-domain-brand-api-zone-id',
        '/rg/domain/brand/api/zone/id',
      ).value,
    }),

    certificate: {
      arn: environment.parameter(
        'input-domain-brand-api-record-service-self-certificate-arn',
        `/rg/domain/brand/api/record/service/${SERVICE_ALIAS}/certificate/arn`,
      ).value,
    },
  });
};

export const resolveFoundationStageInputs = (scope: Construct, providers: FoundationStageProviders): FoundationStageInputMapping => {
  const environment = new AccountInputLookup(scope, providers.environment);

  return {
    domain: {
      codename: {
        hostname: environment.parameter(
          'input-domain-codename-env-record-service-self-hostname',
          `/rg/domain/codename/env/record/service/${SERVICE_ALIAS}/hostname`,
        ).value,

        zone: new DataAwsRoute53Zone(scope, 'input-domain-codename-zone', {
          provider: environment.account.provider,

          zoneId: environment.parameter(
            'input-domain-codename-env-zone-id',
            '/rg/domain/codename/env/zone/id',
          ).value,
        }),

        certificate: {
          arn: environment.parameter(
            'input-domain-codename-env-record-service-self-certificate-arn',
            `/rg/domain/codename/env/record/service/${SERVICE_ALIAS}/certificate/arn`,
          ).value,
        },
      },

      brand: resolveServiceDomainPurpose(scope, providers.environment),
    },
  };
};
