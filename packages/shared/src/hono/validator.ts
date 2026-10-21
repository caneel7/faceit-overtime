import type { ValidationTargets } from 'hono';
import { validator as openApiValidator } from 'hono-openapi';
import type { z } from 'zod';
import { AppError } from './app-error';

// hono-openapi's validator, but failures become our ErrorBody instead of its default shape
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
