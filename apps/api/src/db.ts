import { createDbClient } from '@overtime/db';
import { createMiddleware } from 'hono/factory';
import type { AppEnv } from './env';

export const DEFAULT_PING_TIMEOUT_MS = 2000;

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const db = createDbClient(c.env.HYPERDRIVE.connectionString, {
    pingTimeoutMs: Number(c.env.DB_PING_TIMEOUT_MS) || DEFAULT_PING_TIMEOUT_MS,
  });
  c.set('db', db);
  try {
    await next();
  } finally {
    c.executionCtx.waitUntil(db.close());
  }
});
