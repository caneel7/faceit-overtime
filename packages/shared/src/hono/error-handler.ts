import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ErrorBody, ErrorCode } from '../errors';
import { AppError } from './app-error';

const CODE_BY_STATUS: Partial<Record<number, ErrorCode>> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

function errorJson(
  c: Context,
  status: ContentfulStatusCode,
  code: ErrorCode,
  message: string,
  details?: unknown,
) {
  const body: ErrorBody = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return c.json(body, status);
}

function logError(c: Context, err: Error, extra?: Record<string, unknown>) {
  console.error(
    JSON.stringify({
      level: 'error',
      method: c.req.method,
      path: c.req.path,
      error: err.message,
      stack: err.stack,
      ...(err.cause instanceof Error ? { cause: err.cause.message } : {}),
      ...extra,
    }),
  );
}

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    if (err.status >= 500) logError(c, err, { details: err.details });
    // INTERNAL details describe our own bugs; keep them out of production responses
    const exposeDetails = err.code !== 'INTERNAL' || c.env?.ENVIRONMENT !== 'production';
    return errorJson(c, err.status, err.code, err.message, exposeDetails ? err.details : undefined);
  }

  // Hono raises these itself, e.g. malformed JSON in a request body
  if (err instanceof HTTPException) {
    const code = CODE_BY_STATUS[err.status];
    if (code) return errorJson(c, err.status as ContentfulStatusCode, code, err.message);
  }

  logError(c, err);
  return errorJson(c, 500, 'INTERNAL', 'Internal server error');
};

export const notFound: NotFoundHandler = (c) => errorJson(c, 404, 'NOT_FOUND', 'Route not found');
