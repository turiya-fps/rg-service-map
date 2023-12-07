import type { ToZodSchema } from '@project-rouge/service-core/validation/zod';
import type { GetLandRegistryTitles } from '@project-rouge/service-map-client/src/endpoint/land-registry-title/get-land-registry-titles';
import type { ZodSchema } from 'zod';
import { z } from 'zod';
import { parseNumericString } from '../../../../validator/request/numeric-string';

/**
 * Endpoint request path parameter validation.
 */
export const query = (): ZodSchema => {
  return z.object<ToZodSchema<GetLandRegistryTitles.Query>>({
    latitude: parseNumericString(z.number()),
    longitude: parseNumericString(z.number()),
    radius: parseNumericString(z.number().max(300).optional()),
  });
};
