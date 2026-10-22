import { resolver } from 'hono-openapi';
import type { z } from 'zod';
import { ErrorBody, type ErrorCode } from '../errors';

export { describeRoute } from 'hono-openapi';

export function jsonContent(schema: z.ZodType, description: string) {
  return {
    description,
    content: { 'application/json': { schema: resolver(schema) } },
  };
}

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
  INVALID_CREDENTIALS: 401,
  EMAIL_NOT_VERIFIED: 403,
  INVALID_TOKEN: 400,
  RATE_LIMITED: 429,
  EMAIL_TAKEN: 409,
};

export function errorResponses(...codes: ErrorCode[]) {
  const byStatus = new Map<number, ErrorCode[]>();
  for (const code of codes) {
    const status = STATUS_BY_CODE[code];
    byStatus.set(status, [...(byStatus.get(status) ?? []), code]);
  }
  return Object.fromEntries(
    [...byStatus].map(([status, grouped]) => [status, jsonContent(ErrorBody, grouped.join(' | '))]),
  );
}
