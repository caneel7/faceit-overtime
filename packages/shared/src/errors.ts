import { z } from 'zod';

export const ErrorCode = z.enum([
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'NOT_FOUND',
  'CONFLICT',
  'INTERNAL',
  'SERVICE_UNAVAILABLE',
  'INVALID_CREDENTIALS',
  'EMAIL_NOT_VERIFIED',
  'INVALID_TOKEN',
  'RATE_LIMITED',
  'EMAIL_TAKEN',
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

export const ErrorBody = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorBody = z.infer<typeof ErrorBody>;
