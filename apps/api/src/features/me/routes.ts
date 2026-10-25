import { MeResponse } from '@overtime/shared';
import { describeRoute, errorResponses, jsonContent, respond } from '@overtime/shared/hono';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { currentAuth, requireAuth } from '../../middleware/auth';
import { loadMe, playerIsStale, refreshPlayer } from './service';

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
  async (c) => {
    const me = await loadMe(c.var.db, c.env, currentAuth(c).userId);
    if (me.player && playerIsStale(me.player)) {
      c.executionCtx.waitUntil(refreshPlayer(c.env, me.player.faceitPlayerId));
    }
    return respond(c, MeResponse, me);
  },
);
