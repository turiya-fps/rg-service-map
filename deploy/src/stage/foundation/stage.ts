import { Apigatewayv2Api } from '@cdktf/provider-aws/lib/apigatewayv2-api';
import { Apigatewayv2Stage } from '@cdktf/provider-aws/lib/apigatewayv2-stage';
import { SqsQueue } from '@cdktf/provider-aws/lib/sqs-queue';
import { SqsQueuePolicy } from '@cdktf/provider-aws/lib/sqs-queue-policy';
import { SsmParameter } from '@cdktf/provider-aws/lib/ssm-parameter';
import type { AccountWithPurpose } from '@project-rouge/infrastructure-core/aws/account';
import { DomainAssignmentApiGateway } from '@project-rouge/infrastructure-core/stack/composition/domain/domain-assignment-apigw';
import { TerraformOutput, TerraformStack } from 'cdktf';
import type { Construct } from 'constructs';
import { StackBackend } from '../../stack/backend';
import type { StackVariableMapping } from '../../stack/variable';
import { resolveFoundationStageInputs } from './input';
import { resolveFoundationStageProviders } from './provider';

type Props = {
  readonly accounts: AccountWithPurpose[];
};

export class FoundationStageStack extends TerraformStack {
  /**
   * @inheritdoc
   */
  public constructor(scope: Construct, vars: StackVariableMapping, props: Props) {
    super(scope, 'target');

    // --
    // -- Terraform Setup
    // --

    new StackBackend(this, vars);

    const providers = resolveFoundationStageProviders(this, vars, props.accounts);
    const inputs = resolveFoundationStageInputs(this, providers);

    // --
    // -- Api Gateway
    // --

    const gateway = new Apigatewayv2Api(this, 'api', {
      provider: providers.environment.provider,

      name: `service-${vars.stack.alias}-http`,
      protocolType: 'HTTP',

      corsConfiguration: {
        allowHeaders: ['*'],
        allowMethods: ['*'],
        allowOrigins: ['*'],
        exposeHeaders: ['*'],
      },
    });

    new TerraformOutput(this, 'api-id', {
      value: gateway.id,
    });

    new SsmParameter(this, 'api-ssm-parameter-id', {
      provider: providers.environment.provider,

      name: `/rg/service/${vars.stack.alias}/api/id`,
      description: `The api gateway id for service ${vars.stack.alias}`,

      type: 'String',
      value: gateway.id,
    });

    // --
    // -- Api Gateway Stage
    // --

    const stage = new Apigatewayv2Stage(this, 'api-stage', {
      provider: providers.environment.provider,

      apiId: gateway.id,
      name: 'main',
      autoDeploy: true,

      lifecycle: {
        ignoreChanges: [
          'deployment_id',
        ],
      },
    });

    new TerraformOutput(this, 'stage-name', {
      value: stage.name,
    });

    // --
    // -- Api Gateway Domain
    // --

    new DomainAssignmentApiGateway(this, 'domain-codename', {
      providers: {
        target: providers.environment,
      },

      domain: {
        name: inputs.domain.codename.hostname,
        zone: inputs.domain.codename.zone,
        certificate: inputs.domain.codename.certificate,
      },

      api: {
        gateway,
        stage,
      },
    });

    if (inputs.domain.brand !== undefined) {
      new DomainAssignmentApiGateway(this, 'domain-brand', {
        providers: {
          target: providers.environment,
        },

        domain: {
          name: inputs.domain.brand.hostname,
          zone: inputs.domain.brand.zone,
          certificate: inputs.domain.brand.certificate,
        },

        api: {
          gateway,
          stage,
        },
      });
    }

    // --
    // -- SQS Events Queue
    // --

    const serviceEventDlq = new SqsQueue(this, 'event-dlq', {
      provider: providers.environment.provider,

      name: `${vars.stack.alias}-event-dlq`,
    });

    const serviceEventQueue = new SqsQueue(this, 'event-queue', {
      provider: providers.environment.provider,

      name: `${vars.stack.alias}-event-queue`,
      redrivePolicy: JSON.stringify({
        deadLetterTargetArn: serviceEventDlq.arn,
        maxReceiveCount: 1,
      }),
    });

    new SsmParameter(this, 'event-queue-arn', {
      provider: providers.environment.provider,

      name: `/rg/service/${vars.stack.alias}/queue/event/arn`,

      description: `The arn for the event queue for service ${vars.stack.alias}`,

      type: 'String',
      value: serviceEventQueue.arn,
    });

    new TerraformOutput(this, 'queue-arn', {
      value: serviceEventQueue.arn,
    });

    const eventsPrincipal = {
      Service: [
        'events.amazonaws.com',
      ],
    };

    const queuePolicy: string = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'SQSQueuePolicy',
          Effect: 'Allow',
          Principal: eventsPrincipal,
          Action: [
            'sqs:SendMessage',
          ],
          Resource: serviceEventQueue.arn,
        },
      ],
    });

    new SqsQueuePolicy(this, 'event-queue-resource-policy', {
      provider: providers.environment.provider,
      queueUrl: serviceEventQueue.url,
      policy: queuePolicy,
    });

    // --
    // -- AWS Glue Parameters
    // --

    new SsmParameter(this, 'snowflake-land-registry-table-full-name', {
      provider: providers.environment.provider,

      name: '/rg/external/snowflake/landregistry/table/full/name',
      description: 'The table name of the Snowflake land registry full dataset',
      type: 'String',
      value: providers.environment.name === 'production' ? 'LAND_REGISTRY_BACKEND' : 'LAND_REGISTRY_BACKEND_DEV',
    });

    new SsmParameter(this, 'snowflake-land-registry-table-changes-name', {
      provider: providers.environment.provider,

      name: '/rg/external/snowflake/landregistry/table/changes/name',
      description: 'The table name of the Snowflake land registry updates changes dataset',
      type: 'String',
      value: providers.environment.name === 'production' ? 'LAND_REGISTRY_BACKEND_CHANGES' : 'LAND_REGISTRY_BACKEND_CHANGES_DEV',
    });
  }
}
