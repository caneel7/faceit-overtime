import { sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { QueryBuilder, type Executor, type ScopeConfig } from './query/builder';
import { QueryBuilderError } from './query/errors';
import type { GlobalTable, Relations, UserTable } from './query/types';
import {
  players,
  teamPlayers,
  teams,
  trustedDevices,
  users,
  userSessions,
  userTwoFactors,
} from './schema';

const GLOBAL_TABLES: ReadonlySet<PgTable> = new Set([players, users, teams, teamPlayers]);
const USER_TABLES: ReadonlySet<PgTable> = new Set([userSessions, userTwoFactors, trustedDevices]);
const ALL_TABLES: ReadonlySet<PgTable> = new Set([...GLOBAL_TABLES, ...USER_TABLES]);

export interface Scope<TT extends PgTable, ScopeCol extends string = never> {
  for<T extends TT, R extends Relations<T, TT> = Record<never, never>>(
    table: T,
    relations?: R,
  ): QueryBuilder<T, R, ScopeCol>;
}

export interface DbClient {
  readonly global: Scope<GlobalTable>;
  forUser(userId: string): Scope<UserTable | GlobalTable, 'userId'>;
  transaction<R>(fn: (tx: DbClient) => Promise<R>): Promise<R>;
  ping(): Promise<void>;
  close(): Promise<void>;
}

export type DbClientOptions = {
  connectTimeoutMs?: number;
  pingTimeoutMs?: number;
  max?: number;
};

export const executors = new WeakMap<DbClient, Executor>();

function scope<TT extends PgTable, ScopeCol extends string = never>(
  db: Executor,
  config: ScopeConfig,
): Scope<TT, ScopeCol> {
  return {
    for: (table, relations) => new QueryBuilder(db, config, table, relations),
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

export function makeClient(
  db: Executor,
  pingTimeoutMs: number,
  close: () => Promise<void>,
): DbClient {
  const client: DbClient = {
    global: scope(db, { tables: GLOBAL_TABLES }),
    forUser(userId) {
      if (!userId) throw new QueryBuilderError('forUser needs a user id');
      return scope(db, {
        tables: ALL_TABLES,
        owner: { column: 'userId', value: userId, tables: USER_TABLES },
      });
    },
    transaction(fn) {
      return db.transaction((tx) =>
        fn(
          makeClient(tx as unknown as Executor, pingTimeoutMs, async () => {
            throw new QueryBuilderError("close() can't be called inside a transaction");
          }),
        ),
      );
    },
    async ping() {
      await withTimeout(db.execute(sql`select 1`), pingTimeoutMs);
    },
    close,
  };
  executors.set(client, db);
  return client;
}

// One client per request. postgres.js connects on the first query, so routes that never query never connect.
export function createDbClient(connectionString: string, opts: DbClientOptions = {}): DbClient {
  const { connectTimeoutMs = 10_000, pingTimeoutMs = 2000, max = 5 } = opts;
  const sqlClient = postgres(connectionString, {
    max,
    connect_timeout: Math.ceil(connectTimeoutMs / 1000),
  });
  const db = drizzle({ client: sqlClient }) as unknown as Executor;
  return makeClient(db, pingTimeoutMs, () => sqlClient.end({ timeout: 5 }));
}
