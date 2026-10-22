import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ErrorCode } from '../errors';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: ContentfulStatusCode;
  readonly details: unknown;

  constructor(
    code: ErrorCode,
    status: ContentfulStatusCode,
    message: string,
    details?: unknown,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
