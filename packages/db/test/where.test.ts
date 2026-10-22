import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { QueryBuilderError } from '../src/query/errors';
import { getWhere } from '../src/query/where';
import { players, teams, users } from '../src/schema';

const dialect = new PgDialect();
const render = (sql: ReturnType<typeof getWhere>) => {
  const { sql: text, params } = dialect.sqlToQuery(sql);
  return { sql: text, params };
};
const toSQL = (where: unknown) => render(getWhere(players, where));
const d = new Date('2026-01-01T00:00:00Z');

describe('getWhere', () => {
  it.each([
    ['equals', { country: 'GB' }, '"players"."country" = $1', ['GB']],
    ['null means IS NULL', { avatarUrl: null }, '"players"."avatar_url" is null', []],
    ['>', { 'cs2Level >': 5 }, '"players"."cs2_level" > $1', [5]],
    ['>=', { 'cs2Level >=': 5 }, '"players"."cs2_level" >= $1', [5]],
    ['<', { 'cs2Elo <': 2000 }, '"players"."cs2_elo" < $1', [2000]],
    ['<=', { 'syncedAt <=': d }, '"players"."synced_at" <= $1', [d.toISOString()]],
    ['!=', { 'cs2Region !=': 'NA' }, '"players"."cs2_region" <> $1', ['NA']],
    ['LIKE', { 'nickname LIKE': 's1%' }, '"players"."nickname" like $1', ['s1%']],
    ['ILIKE', { 'nickname ILIKE': '%s1%' }, '"players"."nickname" ilike $1', ['%s1%']],
    ['IN', { 'cs2Region IN': ['EU', 'NA'] }, '"players"."cs2_region" in ($1, $2)', ['EU', 'NA']],
    ['NOT_IN', { 'cs2Region NOT_IN': ['SA'] }, '"players"."cs2_region" not in ($1)', ['SA']],
    [
      'BETWEEN',
      { 'cs2Elo BETWEEN': [1500, 2000] },
      '"players"."cs2_elo" between $1 and $2',
      [1500, 2000],
    ],
    ['ISNULL', { 'country ISNULL': true }, '"players"."country" is null', []],
    ['NOTNULL', { 'country NOTNULL': true }, '"players"."country" is not null', []],
  ])('%s', (_, where, sql, params) => {
    expect(toSQL(where)).toEqual({ sql, params });
  });

  it('ANDs the keys of one object', () => {
    expect(toSQL({ country: 'GB', 'cs2Level >=': 8 }).sql).toBe(
      '("players"."country" = $1 and "players"."cs2_level" >= $2)',
    );
  });

  it('ORs a top-level array', () => {
    expect(toSQL([{ country: 'GB' }, { country: 'DE', 'cs2Level >': 5 }]).sql).toBe(
      '("players"."country" = $1 or ("players"."country" = $2 and "players"."cs2_level" > $3))',
    );
  });

  it('filters a joined relation on its own table', () => {
    const ctx = { joined: new Map([['user', users]]), declared: new Set(['user']) };
    expect(render(getWhere(teams, { user: { faceitVerified: true } }, ctx))).toEqual({
      sql: '"users"."faceit_verified" = $1',
      params: [true],
    });
  });

  it.each([
    ['unknown column', { nickame: 'x' }, /Unknown column "nickame"/],
    ['unknown operator', { 'cs2Level ~': 1 }, /Unknown operator "~"/],
    ['key with two spaces', { 'cs2Level > x': 1 }, /Invalid filter key/],
    ['empty filter', {}, /Empty filter/],
    ['empty OR', [], /Empty OR filter/],
    ['not an object', 'country = GB', /must be an object/],
    ['undefined value', { country: undefined }, /expects a single value or null/],
    ['array for equals', { country: ['GB'] }, /expects a single value or null/],
    ['nested OR', { country: [{ a: 1 }] }, /expects a single value or null/],
    ['null for >', { 'cs2Level >': null }, /expects a single non-null value/],
    ['number for ILIKE', { 'nickname ILIKE': 5 }, /expects a string/],
    ['empty IN', { 'cs2Region IN': [] }, /expects a non-empty array/],
    ['scalar for NOT_IN', { 'cs2Region NOT_IN': 'EU' }, /expects a non-empty array/],
    ['3 values for BETWEEN', { 'cs2Elo BETWEEN': [1, 2, 3] }, /expects exactly 2 values/],
  ])('throws on %s', (_, where, message) => {
    expect(() => toSQL(where)).toThrow(QueryBuilderError);
    expect(() => toSQL(where)).toThrow(message);
  });

  it('throws on a declared relation that is not joined in this call', () => {
    const ctx = { joined: new Map(), declared: new Set(['user']) };
    expect(() => getWhere(teams, { user: { faceitVerified: true } }, ctx)).toThrow(
      /Relation "user" is not joined/,
    );
  });
});
