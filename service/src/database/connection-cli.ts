import { resolveProcessEnvironmentMapping } from '@project-rouge/service-core/environment/resolve';
import { resolveRuntimeTypeFromEnvironment } from '@project-rouge/service-core/environment/runtime';
import path from 'path';
import { createDataSourceForRuntime } from './connection';

const envfile = path.resolve(__dirname, '..', '..', '.env');
const environment = resolveProcessEnvironmentMapping(envfile);
const runtime = resolveRuntimeTypeFromEnvironment(environment);

const source = createDataSourceForRuntime(runtime, environment);

source.catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

export default source;
