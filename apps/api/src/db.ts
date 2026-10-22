import { createDbClient } from '@overtime/db';
import { createMiddleware } from 'hono/factory';
import type { AppEnv } from './env';

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const db = createDbClient(c.env.HYPERDRIVE.connectionString);
  c.set('db', db);
  try {
    await next();
  } finally {
    c.executionCtx.waitUntil(db.close());
  }
});
