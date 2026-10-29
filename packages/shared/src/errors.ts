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
  'FORBIDDEN',
  'ALREADY_MEMBER',
  'ALREADY_INVITED',
  'INVITE_CLOSED',
  'TEAM_FULL',
  'FACEIT_REQUIRED',
  'CAPTAIN_CANNOT_LEAVE',
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
