import { MeResponse } from '@overtime/shared';
import { describeRoute, errorResponses, jsonContent, respond } from '@overtime/shared/hono';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { currentAuth, requireAuth } from '../../middleware/auth';
import { loadMe } from './service';

export const me = new Hono<AppEnv>().get(
  '/',
  describeRoute({
    tags: ['account'],
    summary: 'The signed-in user',
    security: [{ bearerAuth: [] }],
    responses: {
      200: jsonContent(MeResponse, 'The user, linked accounts and FACEIT player'),
      ...errorResponses('UNAUTHENTICATED'),
    },
  }),
  requireAuth,
  async (c) => respond(c, MeResponse, await loadMe(c.var.db, c.env, currentAuth(c).userId)),
);
