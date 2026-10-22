import type { ValidationTargets } from 'hono';
import { validator as openApiValidator } from 'hono-openapi';
import type { z } from 'zod';
import { AppError } from './app-error';

export function validator<Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) {
  return openApiValidator(target, schema, (result) => {
    if (!result.success) {
      throw new AppError('VALIDATION_FAILED', 400, 'Invalid request', result.error);
    }
  });
}
