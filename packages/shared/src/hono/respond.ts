import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { z } from 'zod';
import { AppError } from './app-error';

// Every JSON response goes through its contract schema. A mismatch is our bug, so it's a 500.
export function respond<S extends z.ZodType, const T extends ContentfulStatusCode = 200>(
  c: Context,
  schema: S,
  data: z.input<S>,
  status?: T,
) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new AppError('INTERNAL', 500, 'Response contract violated', parsed.error.issues);
  }
  return c.json(parsed.data as z.output<S>, (status ?? 200) as T);
}
