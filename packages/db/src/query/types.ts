import type { Column, SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type {
  players,
  teamPlayers,
  teams,
  trustedDevices,
  users,
  userSessions,
  userTwoFactors,
} from '../schema';

export type GlobalTable = typeof players | typeof users | typeof teams | typeof teamPlayers;
export type UserTable = typeof userSessions | typeof userTwoFactors | typeof trustedDevices;
export type AnyTable = GlobalTable | UserTable;

export type Row<T extends PgTable> = T['$inferSelect'];
export type Col<T extends PgTable> = keyof Row<T> & string;
type TableName<T extends PgTable> = T['_']['name'];
type Value<T extends PgTable, K extends Col<T>> = NonNullable<Row<T>[K]>;

type SystemColumn = 'id' | 'createdAt' | 'updatedAt' | 'deletedAt';
export type NewRow<T extends PgTable, ScopeCol extends string = never> = Omit<
  T['$inferInsert'],
  SystemColumn | ScopeCol
>;
export type Patch<T extends PgTable, ScopeCol extends string = never> = Partial<
  Omit<NewRow<T, ScopeCol>, 'createdBy'>
>;

export type Relation<T extends PgTable, Target extends PgTable = PgTable> = {
  schema: Target;
  field: T['_']['columns'][keyof T['_']['columns']];
  reference: Column;
  condition?(rel: Target): SQL;
};
export type Relations<T extends PgTable, Target extends PgTable = PgTable> = Record<
  string,
  Relation<T, Target>
>;
export type JoinKind = 'left' | 'inner';
export type JoinSpec<R> = { [K in keyof R]?: JoinKind };

export const COMPARISON_OPS = ['>', '>=', '<', '<='] as const;
export const OPERATORS = [
  ...COMPARISON_OPS,
  '!=',
  'LIKE',
  'ILIKE',
  'IN',
  'NOT_IN',
  'BETWEEN',
  'ISNULL',
  'NOTNULL',
] as const;
export type Operator = (typeof OPERATORS)[number];

type Clause<T extends PgTable, R = object> = {
  [K in Col<T>]?: Row<T>[K];
} & {
  [K in Col<T> as `${K} ${(typeof COMPARISON_OPS)[number] | '!='}`]?: Value<T, K>;
} & {
  [K in Col<T> as `${K} ${'LIKE' | 'ILIKE'}`]?: string;
} & {
  [K in Col<T> as `${K} ${'IN' | 'NOT_IN'}`]?: readonly Value<T, K>[];
} & {
  [K in Col<T> as `${K} BETWEEN`]?: readonly [Value<T, K>, Value<T, K>];
} & {
  [K in Col<T> as `${K} ${'ISNULL' | 'NOTNULL'}`]?: true;
} & {
  [K in keyof R as string extends K ? never : K]?: R[K] extends Relation<PgTable, infer Target>
    ? Clause<Target>
    : never;
};

export type Where<T extends PgTable, R = object> = Clause<T, R> | readonly Clause<T, R>[];

export type OrderBy<T extends PgTable> = { [K in Col<T>]?: 'asc' | 'desc' };

export type FindOpts<T extends PgTable, R, J extends JoinSpec<R>> = {
  where?: Where<T, R>;
  relations?: J;
  orderBy?: OrderBy<T>;
  limit?: number;
  offset?: number;
  withDeleted?: true;
};

type Joined<R, J> = {
  [K in keyof J & keyof R]: R[K] extends Relation<PgTable, infer Target>
    ? J[K] extends 'inner'
      ? Row<Target>
      : Row<Target> | null
    : never;
};

export type Result<T extends PgTable, R, J> = keyof J extends never
  ? Row<T>
  : { [K in TableName<T>]: Row<T> } & Joined<R, J>;

export type Page<Item> = { items: Item[]; total: number };
