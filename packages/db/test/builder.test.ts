import { getTableColumns, getTableName, sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { ConflictError, NotFoundError, QueryBuilderError } from '../src/query/errors';
import {
  players,
  teamPlayers,
  teams,
  trustedDevices,
  users,
  userSessions,
  userTwoFactors,
} from '../src/schema';
import { fakeDb } from './fake-db';

const USER_ID = '0190a7a0-0000-7000-8000-000000000001';

// One valid patch per table, so every method can run against every table
const PATCHES = new Map<PgTable, Record<string, unknown>>([
  [players, { country: 'GB' }],
  [users, { faceitVerified: false }],
  [teams, { name: 'Renamed' }],
  [teamPlayers, { playerId: 'p2' }],
  [userSessions, { userAgent: 'ua' }],
  [userTwoFactors, { lastUsedStep: 1 }],
  [trustedDevices, { label: 'Phone' }],
]);

// Loose view of the builder for table-driven tests; the typed API is covered by types.test.ts
type Loose = {
  find(opts?: object): Promise<unknown[]>;
  findOne(opts: object): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  count(opts?: object): Promise<number>;
  paginate(opts: object): Promise<unknown>;
  update(id: string, values: object): Promise<unknown>;
  updateWithWhere(where: object, values: object): Promise<unknown>;
  softDelete(id: string): Promise<unknown>;
  softDeleteWithWhere(where: object): Promise<unknown>;
};

const METHODS: [string, (qb: Loose, patch: object) => Promise<unknown>][] = [
  ['find', (qb) => qb.find()],
  ['findOne', (qb) => qb.findOne({ where: { id: 'x' } })],
  ['getById', (qb) => qb.getById('x')],
  ['count', (qb) => qb.count()],
  ['paginate', (qb) => qb.paginate({ page: 1, pageSize: 10 })],
  ['update', (qb, patch) => qb.update('x', patch)],
  ['updateWithWhere', (qb, patch) => qb.updateWithWhere({ id: 'x' }, patch)],
  ['softDelete', (qb) => qb.softDelete('x')],
  ['softDeleteWithWhere', (qb) => qb.softDeleteWithWhere({ id: 'x' })],
];

async function run(
  table: PgTable,
  scope: 'global' | 'user',
  method: (qb: Loose, patch: object) => Promise<unknown>,
) {
  const { db, calls } = fakeDb();
  const s = scope === 'global' ? db.global : db.forUser(USER_ID);
  const qb = s.for(table as never) as unknown as Loose;
  await method(qb, PATCHES.get(table)!).catch((err: unknown) => {
    if (!(err instanceof NotFoundError)) throw err;
  });
  return calls[0]!;
}

describe('every method × every table', () => {
  const globalTables = [players, users, teams, teamPlayers];
  const userTables = [userSessions, userTwoFactors, trustedDevices];

  for (const table of globalTables) {
    const name = getTableName(table);
    it.each(METHODS)(`global ${name}: %s filters out deleted rows`, async (_, method) => {
      const call = await run(table, 'global', method);
      expect(call.sql).toContain(`"${name}"."deleted_at" is null`);
      expect(call.sql).not.toMatch(/"user_id" = /);
    });
  }

  for (const table of userTables) {
    const name = getTableName(table);
    it.each(METHODS)(`forUser ${name}: %s filters by user and deleted rows`, async (_, method) => {
      const call = await run(table, 'user', method);
      expect(call.sql).toMatch(new RegExp(`"${name}"\\."user_id" = \\$\\d`));
      expect(call.sql).toContain(`"${name}"."deleted_at" is null`);
      expect(call.params).toContain(USER_ID);
    });
  }
});

describe('scopes', () => {
  it('global refuses user-owned tables', () => {
    const { db } = fakeDb();
    expect(() => db.global.for(userSessions as never)).toThrow(/can't be queried from this scope/);
  });

  it('global refuses a relation to a user-owned table', () => {
    const { db } = fakeDb();
    const rel = {
      session: { schema: userSessions, field: users.id, reference: userSessions.userId },
    };
    expect(() => db.global.for(users, rel as never)).toThrow(/joins a table this scope can't read/);
  });

  it('forUser can read global tables without a user filter', async () => {
    const { db, calls } = fakeDb();
    await db.forUser(USER_ID).for(players).find();
    expect(calls[0]!.sql).toBe(
      `select ${Object.values(getTableColumns(players))
        .map((c) => `"${c.name}"`)
        .join(', ')} from "players" where "players"."deleted_at" is null`,
    );
  });

  it('forUser needs a user id', () => {
    const { db } = fakeDb();
    expect(() => db.forUser('')).toThrow(QueryBuilderError);
  });
});

describe('joins', () => {
  const device = {
    device: {
      schema: trustedDevices,
      field: userSessions.trustedDeviceId,
      reference: trustedDevices.id,
    },
  } as const;

  it('puts the joined table’s scope and soft-delete checks in ON, not WHERE', async () => {
    const { db, calls } = fakeDb();
    await db
      .forUser(USER_ID)
      .for(userSessions, device)
      .find({
        relations: { device: 'left' },
        where: { device: { 'expiresAt >': new Date(0) } },
      });
    const [, on, where] = calls[0]!.sql.match(
      / left join "trusted_devices" on \((.*)\) where \((.*)\)$/,
    )!;
    expect(on).toBe(
      '"user_sessions"."trusted_device_id" = "trusted_devices"."id" and "trusted_devices"."deleted_at" is null and "trusted_devices"."user_id" = $1',
    );
    expect(where).toBe(
      '"user_sessions"."user_id" = $2 and "user_sessions"."deleted_at" is null and "trusted_devices"."expires_at" > $3',
    );
  });

  it('keeps scope and soft delete outside an OR', async () => {
    const { db, calls } = fakeDb();
    await db
      .forUser(USER_ID)
      .for(userSessions)
      .find({ where: [{ userAgent: 'a' }, { userAgent: 'b' }] });
    expect(calls[0]!.sql).toMatch(
      /where \("user_sessions"\."user_id" = \$1 and "user_sessions"\."deleted_at" is null and \("user_sessions"\."user_agent" = \$2 or "user_sessions"\."user_agent" = \$3\)\)$/,
    );
  });

  it('adds a declared condition to ON', async () => {
    const { db, calls } = fakeDb();
    const rel = {
      active: {
        schema: trustedDevices,
        field: userSessions.trustedDeviceId,
        reference: trustedDevices.id,
        condition: (t: typeof trustedDevices) => sql`${t.revokedAt} is null`,
      },
    };
    await db
      .forUser(USER_ID)
      .for(userSessions, rel)
      .count({ relations: { active: 'inner' } });
    expect(calls[0]!.sql).toContain('and "trusted_devices"."revoked_at" is null)');
  });

  it('withDeleted drops the soft-delete filter on the main table only', async () => {
    const { db, calls } = fakeDb();
    const captain = { captain: { schema: users, field: teams.captainUserId, reference: users.id } };
    await db.global
      .for(teams, captain)
      .find({ relations: { captain: 'inner' }, withDeleted: true });
    expect(calls[0]!.sql).not.toContain('"teams"."deleted_at" is null');
    expect(calls[0]!.sql).toContain('"users"."deleted_at" is null');
  });

  it('returns plain rows without relations and nested rows with them', async () => {
    const team = ['t1', null, null, null, 'NAVI', 'NAVI', 'u1', 'u1'];
    const user = ['u1', null, null, null, 'p1', true];
    const captain = { captain: { schema: users, field: teams.captainUserId, reference: users.id } };

    const plain = fakeDb([[team]]);
    const [row] = await plain.db.global.for(teams, captain).find();
    expect(row).toMatchObject({ id: 't1', name: 'NAVI' });

    const nested = fakeDb([[[...team, ...user]], [[...team, ...user.map(() => null)]]]);
    const [withCaptain] = await nested.db.global
      .for(teams, captain)
      .find({ relations: { captain: 'left' } });
    expect(withCaptain).toMatchObject({
      teams: { id: 't1' },
      captain: { id: 'u1', playerId: 'p1' },
    });
    const [noCaptain] = await nested.db.global
      .for(teams, captain)
      .find({ relations: { captain: 'left' } });
    expect(noCaptain!.captain).toBeNull();
  });

  it('rejects unknown relations and a relation named like the table', () => {
    const { db } = fakeDb();
    const qb = db.global.for(teams);
    expect(() => qb.toSQL({ relations: { nope: 'left' } as never })).toThrow(
      /Unknown relation "nope"/,
    );
    const clash = { teams: { schema: users, field: teams.captainUserId, reference: users.id } };
    expect(() => db.global.for(teams, clash)).toThrow(/clashes with the table name/);
  });
});

describe('writes', () => {
  it('insert sets user_id from the scope and ignores system columns', async () => {
    const { db, calls } = fakeDb([[{}]]);
    await db
      .forUser(USER_ID)
      .for(trustedDevices)
      .insert({
        tokenHash: 'h',
        expiresAt: new Date(0),
        ...({ userId: 'someone-else', id: 'x', deletedAt: new Date(0) } as object),
      });
    const { sql, params } = calls[0]!;
    expect(sql).toMatch(/values \(default, default, default, default, \$1, \$2,/);
    expect(params[0]).toBe(USER_ID);
    expect(params).not.toContain('someone-else');
    expect(params).not.toContain('x');
  });

  it('update never writes createdBy, the scope column or system columns', async () => {
    const { db, calls } = fakeDb([[{}]]);
    await db.global.for(teams).update('t1', {
      name: 'New',
      ...({ createdBy: 'u2', id: 'x', deletedAt: null } as object),
    });
    expect(calls[0]!.sql).toMatch(/^update "teams" set "updated_at" = \$1, "name" = \$2 where/);
  });

  it('update and softDelete throw NotFoundError when nothing matched', async () => {
    const { db } = fakeDb();
    await expect(db.global.for(teams).update('t1', { name: 'x' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(db.global.for(teams).softDelete('t1')).rejects.toBeInstanceOf(NotFoundError);
    await expect(db.global.for(teams).getById('t1')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('softDelete sets deleted_at = now() and never issues DELETE', async () => {
    const { db, calls } = fakeDb([[{}]]);
    await db.global.for(teams).softDelete('t1');
    expect(calls[0]!.sql).toMatch(/^update "teams" set "updated_at" = \$1, "deleted_at" = now\(\)/);
  });

  it.each([
    [
      'insertMany([])',
      (db: ReturnType<typeof fakeDb>['db']) => db.global.for(teams).insertMany([]),
    ],
    [
      'update with an empty patch',
      (db: ReturnType<typeof fakeDb>['db']) => db.global.for(teams).update('t1', {}),
    ],
    [
      'updateWithWhere({})',
      (db: ReturnType<typeof fakeDb>['db']) =>
        db.global.for(teams).updateWithWhere({}, { name: 'x' }),
    ],
    [
      'softDeleteWithWhere(undefined)',
      (db: ReturnType<typeof fakeDb>['db']) =>
        db.global.for(teams).softDeleteWithWhere(undefined as never),
    ],
  ])('%s throws QueryBuilderError', async (_, call) => {
    const { db, calls } = fakeDb();
    await expect(call(db)).rejects.toBeInstanceOf(QueryBuilderError);
    expect(calls).toHaveLength(0);
  });

  it('maps a unique violation to ConflictError (409)', async () => {
    const pgError = Object.assign(new Error('duplicate key'), {
      code: '23505',
      constraint_name: 'players_faceit_player_id_key',
    });
    const { db } = fakeDb([pgError]);
    const err = await db.global
      .for(players)
      .insert({ faceitPlayerId: 'f1', nickname: 'n', syncedAt: new Date() })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ConflictError);
    expect(err).toMatchObject({
      status: 409,
      code: 'CONFLICT',
      constraint: 'players_faceit_player_id_key',
    });
  });
});

describe('paginate', () => {
  it('reads the total from count(*) over () on the same query', async () => {
    const row = ['t1', null, null, null, 'NAVI', 'NAVI', 'u1', 'u1', 42];
    const { db, calls } = fakeDb([[row]]);
    const page = await db.global.for(teams).paginate({ page: 2, pageSize: 10 });
    expect(calls[0]!.sql).toMatch(/count\(\*\) over \(\) from "teams" .* limit \$1 offset \$2$/);
    expect(calls[0]!.params).toEqual([10, 10]);
    expect(page).toEqual({ items: [expect.objectContaining({ id: 't1' })], total: 42 });
    expect(page.items[0]).not.toHaveProperty('__total');
  });

  it('counts separately past the last page', async () => {
    const { db, calls } = fakeDb([[], [[7]]]);
    expect(await db.global.for(teams).paginate({ page: 5, pageSize: 10 })).toEqual({
      items: [],
      total: 7,
    });
    expect(calls[1]!.sql).toMatch(/^select count\(\*\)::int from "teams"/);
  });

  it.each([
    [{ page: 0, pageSize: 10 }],
    [{ page: 1.5, pageSize: 10 }],
    [{ page: 1, pageSize: 0 }],
    [{ page: 1, pageSize: 101 }],
  ])('rejects %o', async (opts) => {
    const { db } = fakeDb();
    await expect(db.global.for(teams).paginate(opts)).rejects.toBeInstanceOf(QueryBuilderError);
  });
});

describe('client', () => {
  it('runs a transaction on one client and forbids close() inside it', async () => {
    const { db, calls } = fakeDb();
    await db.transaction(async (tx) => {
      await tx.global.for(teams).find();
      await expect(tx.close()).rejects.toThrow(/inside a transaction/);
    });
    expect(calls.map((c) => c.sql.split(' ')[0])).toEqual(['select']);
  });

  it('ping runs select 1', async () => {
    const { db, calls } = fakeDb();
    await db.ping();
    expect(calls[0]!.sql).toBe('select 1');
  });
});
