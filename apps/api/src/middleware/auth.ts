import { userSessions } from '@overtime/db';
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { AppEnv, Auth } from '../env';
import { unauthenticated } from '../features/me/service';
import { verifyAccessToken } from '../lib/jwt';

function bearerToken(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
}

export const authenticate = createMiddleware<AppEnv>(async (c, next) => {
  const token = bearerToken(c.req.header('authorization'));
  c.set('auth', token ? await verifyAccessToken(c.env.JWT_SIGNING_KEY, token) : null);
  await next();
});

export function currentAuth(c: Context<AppEnv>): Auth {
  const auth = c.var.auth;
  if (!auth) throw unauthenticated();
  return auth;
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  currentAuth(c);
  await next();
});

export const requireLiveSession = createMiddleware<AppEnv>(async (c, next) => {
  const auth = currentAuth(c);
  const live = await c.var.db
    .forUser(auth.userId)
    .for(userSessions)
    .findOne({ where: { id: auth.sessionId, revokedAt: null, 'expiresAt >': new Date() } });
  if (!live) throw unauthenticated();
  await next();
});
