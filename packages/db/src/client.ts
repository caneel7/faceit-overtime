import { ne, sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { QueryBuilder, type Executor, type ScopeConfig } from './query/builder';
import { QueryBuilderError } from './query/errors';
import type {
  AnyTable,
  GlobalTable,
  OrgTable,
  PublishedTable,
  Relations,
  UserTable,
} from './query/types';
import {
  orgs,
  orgUsers,
  players,
  teamInvites,
  teamMembers,
  teams,
  tournaments,
  trustedDevices,
  userIdentities,
  users,
  userSessions,
  userTokens,
  userTwoFactors,
} from './schema';

const GLOBAL_TABLES: ReadonlySet<PgTable> = new Set([
  players,
  users,
  teams,
  orgs,
  teamMembers,
  teamInvites,
]);
const USER_TABLES: ReadonlySet<PgTable> = new Set([
  userSessions,
  userTwoFactors,
  trustedDevices,
  userIdentities,
  userTokens,
  orgUsers,
]);
const ORG_TABLES: ReadonlySet<PgTable> = new Set([tournaments, orgUsers]);
const PUBLISHED_TABLES: ReadonlySet<PgTable> = new Set([orgs, tournaments]);
const USER_SCOPE_TABLES: ReadonlySet<PgTable> = new Set([...GLOBAL_TABLES, ...USER_TABLES]);
const ORG_SCOPE_TABLES: ReadonlySet<PgTable> = new Set([...GLOBAL_TABLES, ...ORG_TABLES]);
const ALL_TABLES: ReadonlySet<PgTable> = new Set([...GLOBAL_TABLES, ...USER_TABLES, ...ORG_TABLES]);
const PUBLISHED_FILTERS: ScopeConfig['filters'] = new Map([
  [tournaments as PgTable, () => ne(tournaments.status, 'draft')],
]);

export interface Scope<TT extends PgTable, ScopeCol extends string = never, Owned = never> {
  for<T extends TT, R extends Relations<T, TT> = Record<never, never>>(
    table: T,
    relations?: R,
  ): QueryBuilder<T, R, T extends Owned ? ScopeCol : never>;
}

export type ReadQueryBuilder<T extends PgTable, R extends Relations<T>> = Pick<
  QueryBuilder<T, R>,
  'find' | 'findOne' | 'getById' | 'count' | 'paginate' | 'toSQL'
>;

export interface ReadScope<TT extends PgTable> {
  for<T extends TT, R extends Relations<T, TT> = Record<never, never>>(
    table: T,
    relations?: R,
  ): ReadQueryBuilder<T, R>;
}

export interface DbClient {
  readonly global: Scope<GlobalTable>;
  readonly published: ReadScope<PublishedTable>;
  readonly system: Scope<AnyTable>;
  forUser(userId: string): Scope<UserTable | GlobalTable, 'userId', UserTable>;
  forOrg(orgId: string): Scope<OrgTable | GlobalTable, 'orgId', OrgTable>;
  forOrgs(orgIds: readonly string[]): ReadScope<OrgTable | GlobalTable>;
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

function scope<TT extends PgTable, ScopeCol extends string = never, Owned = never>(
  db: Executor,
  config: ScopeConfig,
): Scope<TT, ScopeCol, Owned> {
  return {
    for: (table, relations) => new QueryBuilder(db, config, table, relations),
  };
}

function readScope<TT extends PgTable>(
  db: Executor,
  config: Omit<ScopeConfig, 'readOnly'>,
): ReadScope<TT> {
  return {
    for: (table, relations) =>
      new QueryBuilder(db, { ...config, readOnly: true }, table, relations),
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
    published: readScope(db, { tables: PUBLISHED_TABLES, filters: PUBLISHED_FILTERS }),
    system: scope(db, { tables: ALL_TABLES }),
    forUser(userId) {
      if (!userId) throw new QueryBuilderError('forUser needs a user id');
      return scope(db, {
        tables: USER_SCOPE_TABLES,
        owner: { column: 'userId', value: userId, tables: USER_TABLES },
      });
    },
    forOrg(orgId) {
      if (!orgId) throw new QueryBuilderError('forOrg needs an org id');
      return scope(db, {
        tables: ORG_SCOPE_TABLES,
        owner: { column: 'orgId', value: orgId, tables: ORG_TABLES },
      });
    },
    forOrgs(orgIds) {
      return readScope(db, {
        tables: ORG_SCOPE_TABLES,
        owner: { column: 'orgId', value: orgIds, tables: ORG_TABLES },
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

export function createDbClient(connectionString: string, opts: DbClientOptions = {}): DbClient {
  const { connectTimeoutMs = 10_000, pingTimeoutMs = 2000, max = 5 } = opts;
  const sqlClient = postgres(connectionString, {
    max,
    connect_timeout: Math.ceil(connectTimeoutMs / 1000),
  });
  const db = drizzle({ client: sqlClient }) as unknown as Executor;
  return makeClient(db, pingTimeoutMs, () => sqlClient.end({ timeout: 5 }));
}
