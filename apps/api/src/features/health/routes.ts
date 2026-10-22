import { HealthResponse } from '@overtime/shared';
import {
  AppError,
  describeRoute,
  errorResponses,
  jsonContent,
  respond,
} from '@overtime/shared/hono';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';

export const health = new Hono<AppEnv>().get(
  '/',
  describeRoute({
    tags: ['system'],
    summary: 'Service health',
    description: 'Checks the database with `select 1` (2 s timeout).',
    responses: {
      200: jsonContent(HealthResponse, 'Service and database are up'),
      ...errorResponses('SERVICE_UNAVAILABLE', 'INTERNAL'),
    },
  }),
  async (c) => {
    try {
      await c.var.db.ping();
    } catch (cause) {
      throw new AppError(
        'SERVICE_UNAVAILABLE',
        503,
        'Database unavailable',
        { db: 'down' },
        { cause },
      );
    }
    return respond(c, HealthResponse, { status: 'ok', version: c.env.VERSION, db: 'ok' });
  },
);
