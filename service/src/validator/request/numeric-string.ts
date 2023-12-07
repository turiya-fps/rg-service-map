import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

export const parseNumericString = (schema: ZodTypeAny) => z.preprocess((a) => {
  if (typeof a === 'string') {
    return parseFloat(a);
  } else if (typeof a === 'number') {
    return a;
  }
  return undefined;
}, schema);
