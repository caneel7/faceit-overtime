// Compile-time guarantees. `tsc` (the typecheck task) fails if any @ts-expect-error line stops being an error.
import { expectTypeOf, it } from 'vitest';
import type { DbClient } from '../src/client';
import type { Relations, Row } from '../src/query/types';
import { players, teams, trustedDevices, users, userSessions } from '../src/schema';

const captain = {
  captain: { schema: users, field: teams.captainUserId, reference: users.id },
} as const satisfies Relations<typeof teams>;

export async function filters(db: DbClient) {
  const qb = db.global.for(players);

  await qb.find({ where: { nickname: 's1mple', 'cs2Level >=': 8, 'cs2Region IN': ['EU'] } });
  await qb.find({ where: [{ country: 'UA' }, { 'avatarUrl ISNULL': true }] });

  // @ts-expect-error misspelled column
  await qb.find({ where: { nicknme: 'x' } });
  // @ts-expect-error unknown operator
  await qb.find({ where: { 'cs2Level ~': 1 } });
  // @ts-expect-error wrong value type for the column
  await qb.find({ where: { 'cs2Level >': 'high' } });
  // @ts-expect-error LIKE needs a string
  await qb.find({ where: { 'nickname ILIKE': 5 } });
  // @ts-expect-error BETWEEN needs exactly two values
  await qb.find({ where: { 'cs2Elo BETWEEN': [1, 2, 3] } });
  // @ts-expect-error orderBy on an unknown column
  await qb.find({ orderBy: { elo: 'desc' } });
}

export async function relations(db: DbClient) {
  const qb = db.global.for(teams, captain);

  const nested = await qb.find({
    relations: { captain: 'left' },
    where: { captain: { faceitVerified: true } },
  });
  expectTypeOf(nested[0]!.teams).toEqualTypeOf<Row<typeof teams>>();
  expectTypeOf(nested[0]!.captain).toEqualTypeOf<Row<typeof users> | null>();

  const inner = await qb.find({ relations: { captain: 'inner' } });
  expectTypeOf(inner[0]!.captain).toEqualTypeOf<Row<typeof users>>();

  const plain = await qb.find();
  expectTypeOf(plain[0]!).toEqualTypeOf<Row<typeof teams>>();

  // @ts-expect-error relation filter on a column the related table doesn't have
  await qb.find({ relations: { captain: 'left' }, where: { captain: { nickname: 'x' } } });
  // @ts-expect-error undeclared relation
  await qb.find({ relations: { coach: 'left' } });

  // A widened relations object (e.g. annotated as Record<string, …>) loses its keys, so filtering on it doesn't compile
  const widened: Relations<typeof teams, typeof users> = captain;
  // @ts-expect-error relation keys are gone
  await db.global.for(teams, widened).find({ where: { captain: { faceitVerified: true } } });
}

export async function scopes(db: DbClient) {
  // @ts-expect-error user-owned table through the global scope
  db.global.for(userSessions);
  const toSessions = {
    s: { schema: userSessions, field: users.id, reference: userSessions.userId },
  };
  // @ts-expect-error relation from a global table to a user-owned one
  db.global.for(users, toSessions);

  const sessions = db.forUser('u1').for(userSessions);
  const session = {
    refreshTokenHash: 'h',
    authMethods: ['faceit' as const],
    expiresAt: new Date(),
  };
  await sessions.insert(session);
  // @ts-expect-error userId comes from the scope
  await sessions.insert({ ...session, userId: 'u2' });
  // @ts-expect-error system columns are never inputs
  await sessions.insert({ ...session, id: 'x' });
  // @ts-expect-error unknown auth method
  await sessions.insert({ refreshTokenHash: 'h', authMethods: ['sms'], expiresAt: new Date() });
  // @ts-expect-error deletedAt goes through softDelete
  await sessions.update('s1', { deletedAt: new Date() });

  await db.forUser('u1').for(trustedDevices).update('d1', { label: 'Phone' });
}

export async function writes(db: DbClient) {
  const qb = db.global.for(teams);
  await qb.insert({ name: 'NAVI', tag: 'NAVI', captainUserId: 'u1', createdBy: 'u1' });
  await qb.update('t1', { captainUserId: 'u2' });
  // @ts-expect-error createdBy never changes
  await qb.update('t1', { createdBy: 'u2' });
  // @ts-expect-error createdBy is required on insert
  await qb.insert({ name: 'NAVI', tag: 'NAVI', captainUserId: 'u1' });
}

it('type assertions compile (checked by tsc)', () => {});
