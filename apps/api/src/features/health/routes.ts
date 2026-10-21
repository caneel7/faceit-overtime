import { HealthResponse } from '@overtime/shared';
import { describeRoute, errorResponses, jsonContent, respond } from '@overtime/shared/hono';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';

export const health = new Hono<AppEnv>().get(
  '/',
  describeRoute({
    tags: ['system'],
    summary: 'Service health',
    responses: {
      200: jsonContent(HealthResponse, 'Service is up'),
      ...errorResponses('INTERNAL'),
    },
  }),
  (c) => respond(c, HealthResponse, { status: 'ok', version: c.env.VERSION }),
);
