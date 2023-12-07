import type { Apigatewayv2Authorizer } from '@cdktf/provider-aws/lib/apigatewayv2-authorizer';
import type { DataAwsApigatewayv2Api } from '@cdktf/provider-aws/lib/data-aws-apigatewayv2-api';
import { IamPolicy } from '@cdktf/provider-aws/lib/iam-policy';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import type { LambdaLayerVersion } from '@cdktf/provider-aws/lib/lambda-layer-version';
import type { S3Object } from '@cdktf/provider-aws/lib/s3-object';
import type { AccountWithProvider } from '@project-rouge/infrastructure-core/aws/account';
import * as policy from '@project-rouge/infrastructure-core/aws/iam/policy';
import { AssumeRolePolicyDocument } from '@project-rouge/infrastructure-core/aws/iam/policy/document/assume-role';
import type { Statement } from '@project-rouge/infrastructure-core/aws/iam/statement';
import type { PrincipalServiceIdentifier } from '@project-rouge/infrastructure-core/aws/iam/statement/principal';
import type { PostgresCredentialInputMapping } from '@project-rouge/infrastructure-core/database/postgres/credential';
import { LambdaHandlerWithRoute } from '@project-rouge/infrastructure-core/stack/composition/lambda/lambda-handler-route';
import * as syntax from '@project-rouge/service-core/http/route';
import type { HandlerEnvironmentMapping } from '@project-rouge/service-map/src/handler/api/land-registry-title/get-land-registry-titles/entrypoint';
import { route } from '@project-rouge/service-map/src/handler/api/land-registry-title/get-land-registry-titles/entrypoint';
import { Construct } from 'constructs';

export type HandlerDefinitionProps = {
  readonly providers: {
    readonly environment: AccountWithProvider;
  };

  readonly stack: string;

  readonly source: {
    readonly code: S3Object;
    readonly vendor: LambdaLayerVersion;
  };

  readonly gateway: DataAwsApigatewayv2Api;
  readonly authoriser: Apigatewayv2Authorizer;

  readonly database: {
    readonly database: string;
    readonly credential: PostgresCredentialInputMapping;
  };
};

export class GetLandRegistryTitlesApiHandlerDefinition extends Construct {
  public readonly handler: LambdaHandlerWithRoute<HandlerEnvironmentMapping>;

  /**
   * @inheritdoc
   */
  public constructor(scope: Construct, props: HandlerDefinitionProps) {
    const kind = 'api';

    const resource = 'land-registry-title';
    const operation = 'get-land-registry-titles';

    super(scope, `${kind}-${operation}`);

    // --
    // -- Lambda Function Permission
    // --

    // @see https://aws.permissions.cloud
    const statements: Statement[] = [];

    // --
    // -- Lambda Function Role
    // --

    const assume = AssumeRolePolicyDocument.service<PrincipalServiceIdentifier>(this, 'handler-role-assume', 'lambda.amazonaws.com');
    const role = new IamRole(this, 'handler-role', {
      provider: props.providers.environment.provider,

      name: `invoke-${kind}-${operation}`,
      path: `/service/${props.stack}/`,

      assumeRolePolicy: assume.json,
      maxSessionDuration: ((1 * 60) * 60), // 1 hour
    });

    // --
    // -- Lambda Function
    // --

    this.handler = new LambdaHandlerWithRoute<HandlerEnvironmentMapping>(this, 'handler', {
      providers: {
        target: props.providers.environment,
      },

      identity: {
        stack: props.stack,
        kind,
        name: operation,
        role,
      },

      source: {
        code: props.source.code,
        entrypoint: `handler/${kind}/${resource}/${operation}/entrypoint.handler`,

        layers: [
          props.source.vendor,
        ],
      },

      http: {
        gateway: props.gateway,
        authoriser: props.authoriser,
        method: route.method,
        path: route.path(syntax.lambda),
      },

      environment: {
        RUNTIME: 'lambda',

        POSTGRES_PURPOSE: props.database.credential.purpose,
        POSTGRES_DATABASE: props.database.database,
        POSTGRES_HOSTNAME: props.database.credential.hostname,
        POSTGRES_USERNAME: props.database.credential.username,
        POSTGRES_PASSWORD: 'unused',
      },
    });

    // --
    // -- Lambda Function Permission Assignment
    // --

    new IamRolePolicyAttachment(this, 'handler-role-policy-database', {
      provider: props.providers.environment.provider,

      role: role.id,
      policyArn: props.database.credential.policy,
    });

    if (statements.length > 0) {
      const permissions = new IamPolicy(this, 'handler-role-policy', {
        provider: props.providers.environment.provider,

        name: `invoke-${kind}-${operation}-permissions`,
        path: `/service/${props.stack}/`,

        policy: policy.json(this, 'handler-role-policy-document', statements),
      });

      new IamRolePolicyAttachment(this, 'handler-role-policy-permissions', {
        provider: props.providers.environment.provider,

        role: role.id,
        policyArn: permissions.arn,
      });
    }
  }
}
