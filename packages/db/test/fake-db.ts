import { drizzle } from 'drizzle-orm/postgres-js';
import { makeClient, type DbClient } from '../src/client';
import type { Executor } from '../src/query/builder';

export type Call = { sql: string; params: unknown[] };

// A postgres.js stand-in: records every query Drizzle sends and answers with the queued rows or error (default: no rows)
export function fakeDb(results: (unknown[] | Error)[] = []): { db: DbClient; calls: Call[] } {
  const calls: Call[] = [];
  const queue = [...results];
  const client = {
    options: { parsers: {}, serializers: {} },
    unsafe(query: string, params: unknown[] = []) {
      calls.push({ sql: query, params });
      const next = queue.shift() ?? [];
      const result = next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
      result.catch(() => {});
      return Object.assign(result, { values: () => result });
    },
    begin: (fn: (c: unknown) => unknown) => fn(client),
  };
  const executor = drizzle({ client: client as never }) as unknown as Executor;
  return { db: makeClient(executor, 2000, async () => {}), calls };
}
