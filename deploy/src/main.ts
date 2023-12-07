import { accounts } from '@project-rouge/infrastructure-core/aws/account';
import { resolveProcessEnvironmentMapping } from '@project-rouge/service-core/environment/resolve';
import { App as TerraformApp } from 'cdktf';
import chalk from 'chalk';
import path from 'path';
import type { StackVariableEnvironmentMapping } from './stack/variable';
import { resolveStackVariableMapping } from './stack/variable';
import { ApplicationStageStack } from './stage/application/stage';
import { FoundationStageStack } from './stage/foundation/stage';

/* eslint-disable no-console */

const prefix = chalk.cyan('[stack]');

const rootdir = path.resolve(__dirname, '..');
const outdir = path.resolve(rootdir, 'build', 'workspace', 'compile');
const envfile = path.resolve(rootdir, '.env');

const main = (): void => {
  const environment = resolveProcessEnvironmentMapping<StackVariableEnvironmentMapping>(envfile);
  const variables = resolveStackVariableMapping(environment);

  const application = new TerraformApp({
    outdir,
  });

  console.log(`${prefix} output ${chalk.dim(application.manifest.outdir)}`);
  console.log(`${prefix} profile ${chalk.green(variables.aws.profile)} with region ${chalk.green(variables.aws.region)}`);
  console.log(`${prefix} stack ${chalk.green('service-')}${chalk.green(variables.stack.alias)} using state ${chalk.green(variables.stack.state.bucket)}`);
  console.log(`${prefix} deploying stage ${chalk.green(variables.deploy.stage)} on environment ${chalk.green(variables.deploy.environment)}`);

  if (variables.deploy.stage === 'foundation') {
    new FoundationStageStack(application, variables, {
      accounts,
    });
  } else if (variables.deploy.stage === 'application') {
    new ApplicationStageStack(application, variables, {
      accounts,
    });
  } else {
    console.error(chalk.red(`${prefix} unknown stage: ${chalk.yellow(variables.deploy.stage)}`));

    return;
  }

  application.synth();

  console.log(`${prefix} done!`);
};

main();
