import { createDbClient } from '@overtime/db';
import { createMiddleware } from 'hono/factory';
import type { AppEnv } from './env';

// One client per request (Hyperdrive does the pooling). postgres.js only connects on the first query,
// so routes that never touch the database never open a connection.
export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const db = createDbClient(c.env.HYPERDRIVE.connectionString);
  c.set('db', db);
  try {
    await next();
  } finally {
    c.executionCtx.waitUntil(db.close());
  }
});
