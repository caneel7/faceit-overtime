import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { DbClient } from './client';
import { executors } from './client';

export function unscoped(db: DbClient): PostgresJsDatabase {
  const executor = executors.get(db);
  if (!executor) throw new Error('Not a client created by createDbClient');
  return executor as unknown as PostgresJsDatabase;
}
