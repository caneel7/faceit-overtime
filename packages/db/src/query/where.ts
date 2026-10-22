import {
  and,
  between,
  eq,
  getTableColumns,
  getTableName,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notInArray,
  or,
  type Column,
  type SQL,
} from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { QueryBuilderError } from './errors';
import { OPERATORS, type Operator } from './types';

type Clause = Record<string, unknown>;

export type WhereContext = {
  joined: ReadonlyMap<string, PgTable>;
  declared: ReadonlySet<string>;
};

const NO_RELATIONS: WhereContext = { joined: new Map(), declared: new Set() };
const isOperator = (op: string): op is Operator => (OPERATORS as readonly string[]).includes(op);

function isPlainObject(value: unknown): value is Clause {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
  );
}

function isScalar(value: unknown): boolean {
  return ['string', 'number', 'boolean', 'bigint'].includes(typeof value) || value instanceof Date;
}

export function getWhere(table: PgTable, where: unknown, ctx: WhereContext = NO_RELATIONS): SQL {
  if (Array.isArray(where)) {
    if (where.length === 0) throw new QueryBuilderError('Empty OR filter');
    return or(...where.map((clause) => getClause(table, clause, ctx))) as SQL;
  }
  return getClause(table, where, ctx);
}

function getClause(table: PgTable, clause: unknown, ctx: WhereContext): SQL {
  if (!isPlainObject(clause))
    throw new QueryBuilderError('A filter must be an object or an array of objects');
  const entries = Object.entries(clause);
  if (entries.length === 0) throw new QueryBuilderError('Empty filter');

  const conditions = entries.map(([key, value]) => {
    if (ctx.declared.has(key)) {
      const rel = ctx.joined.get(key);
      if (!rel) throw new QueryBuilderError(`Relation "${key}" is not joined in this call`);
      if (!isPlainObject(value))
        throw new QueryBuilderError(`Filter for relation "${key}" must be an object`);
      return getClause(rel, value, NO_RELATIONS);
    }
    return getCondition(table, key, value);
  });
  return (conditions.length === 1 ? conditions[0] : and(...conditions)) as SQL;
}

function getCondition(table: PgTable, key: string, value: unknown): SQL {
  const parts = key.split(' ');
  if (parts.length > 2) throw new QueryBuilderError(`Invalid filter key "${key}"`);
  const [name = '', op] = parts;

  const column: Column | undefined = getTableColumns(table)[name];
  if (!column) throw new QueryBuilderError(`Unknown column "${name}" on ${getTableName(table)}`);

  const fail = (expected: string) => {
    throw new QueryBuilderError(`"${key}" expects ${expected}`);
  };

  if (op === undefined) {
    if (value === null) return isNull(column);
    if (!isScalar(value)) fail('a single value or null');
    return eq(column, value);
  }
  if (!isOperator(op)) throw new QueryBuilderError(`Unknown operator "${op}" in "${key}"`);

  switch (op) {
    case '>':
    case '>=':
    case '<':
    case '<=':
    case '!=': {
      if (!isScalar(value)) fail('a single non-null value');
      const compare = { '>': gt, '>=': gte, '<': lt, '<=': lte, '!=': ne }[op];
      return compare(column, value);
    }
    case 'LIKE':
    case 'ILIKE':
      if (typeof value !== 'string') fail('a string');
      return op === 'LIKE' ? like(column, value as string) : ilike(column, value as string);
    case 'IN':
    case 'NOT_IN':
      if (!Array.isArray(value) || value.length === 0 || !value.every(isScalar))
        fail('a non-empty array');
      return op === 'IN'
        ? inArray(column, value as unknown[])
        : notInArray(column, value as unknown[]);
    case 'BETWEEN': {
      if (!Array.isArray(value) || value.length !== 2 || !value.every(isScalar))
        fail('exactly 2 values');
      const [from, to] = value as [unknown, unknown];
      return between(column, from, to);
    }
    case 'ISNULL':
      return isNull(column);
    case 'NOTNULL':
      return isNotNull(column);
  }
}
