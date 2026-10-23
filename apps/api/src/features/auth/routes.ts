import { RefreshResponse } from '@overtime/shared';
import { describeRoute, errorResponses, jsonContent, respond } from '@overtime/shared/hono';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { clearSessionCookies, COOKIE, readCookie, setSessionCookies } from '../../lib/cookies';
import { unauthenticated } from '../me/service';
import { revokeByRefreshToken, rotateSession, sessionResponse } from './sessions';

export const auth = new Hono<AppEnv>()
  .post(
    '/refresh',
    describeRoute({
      tags: ['auth'],
      summary: 'Get a new access token',
      description:
        'Uses the `ot_rt` refresh-token cookie, rotates it, and returns a 10-minute access token with the signed-in user. Reusing an already-rotated refresh token revokes the session.',
      responses: {
        200: jsonContent(RefreshResponse, 'New access token and the signed-in user'),
        ...errorResponses('UNAUTHENTICATED'),
      },
    }),
    async (c) => {
      const token = readCookie(c, COOKIE.refresh);
      const result = token
        ? await rotateSession(c.var.db, c.env, token)
        : { kind: 'invalid' as const };
      if (result.kind === 'invalid') {
        clearSessionCookies(c);
        throw unauthenticated();
      }
      if (result.kind === 'rotated') setSessionCookies(c, result.refreshToken);
      return respond(c, RefreshResponse, await sessionResponse(c.var.db, c.env, result));
    },
  )
  .post(
    '/logout',
    describeRoute({
      tags: ['auth'],
      summary: 'Sign out',
      description:
        'Revokes the session behind the `ot_rt` cookie and clears the cookies. Always 204.',
      responses: { 204: { description: 'Signed out' } },
    }),
    async (c) => {
      const token = readCookie(c, COOKIE.refresh);
      if (token) await revokeByRefreshToken(c.var.db, token, 'logout');
      clearSessionCookies(c);
      return c.body(null, 204);
    },
  );
