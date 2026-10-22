import { AppError } from '@overtime/shared/hono';

// A malformed filter or call: a bug in our code, so it surfaces as a 500
export class QueryBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryBuilderError';
  }
}

// "Doesn't exist", "deleted" and "not yours" all look the same to the caller
export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', 404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  readonly constraint: string | undefined;

  constructor(constraint?: string, options?: { cause?: unknown }) {
    super('CONFLICT', 409, 'Conflicts with an existing record', undefined, options);
    this.name = 'ConflictError';
    this.constraint = constraint;
  }
}

type PgErrorLike = { code?: unknown; constraint_name?: unknown; cause?: unknown };

// postgres.js raises PostgresError; Drizzle wraps it in DrizzleQueryError with the original as `cause`
export function toConflictError(err: unknown): ConflictError | undefined {
  for (
    let e = err as PgErrorLike | undefined;
    e && typeof e === 'object';
    e = e.cause as PgErrorLike
  ) {
    if (e.code === '23505') {
      const constraint = typeof e.constraint_name === 'string' ? e.constraint_name : undefined;
      return new ConflictError(constraint, { cause: err });
    }
  }
  return undefined;
}
