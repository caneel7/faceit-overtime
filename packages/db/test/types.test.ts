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

  // @ts-expect-error
  await qb.find({ where: { nicknme: 'x' } });
  // @ts-expect-error
  await qb.find({ where: { 'cs2Level ~': 1 } });
  // @ts-expect-error
  await qb.find({ where: { 'cs2Level >': 'high' } });
  // @ts-expect-error
  await qb.find({ where: { 'nickname ILIKE': 5 } });
  // @ts-expect-error
  await qb.find({ where: { 'cs2Elo BETWEEN': [1, 2, 3] } });
  // @ts-expect-error
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

  // @ts-expect-error
  await qb.find({ relations: { captain: 'left' }, where: { captain: { nickname: 'x' } } });
  // @ts-expect-error
  await qb.find({ relations: { coach: 'left' } });

  const widened: Relations<typeof teams, typeof users> = captain;
  // @ts-expect-error
  await db.global.for(teams, widened).find({ where: { captain: { faceitVerified: true } } });
}

export async function scopes(db: DbClient) {
  // @ts-expect-error
  db.global.for(userSessions);
  const toSessions = {
    s: { schema: userSessions, field: users.id, reference: userSessions.userId },
  };
  // @ts-expect-error
  db.global.for(users, toSessions);

  const sessions = db.forUser('u1').for(userSessions);
  const session = {
    refreshTokenHash: 'h',
    authMethods: ['faceit' as const],
    expiresAt: new Date(),
  };
  await sessions.insert(session);
  // @ts-expect-error
  await sessions.insert({ ...session, userId: 'u2' });
  // @ts-expect-error
  await sessions.insert({ ...session, id: 'x' });
  // @ts-expect-error
  await sessions.insert({ refreshTokenHash: 'h', authMethods: ['sms'], expiresAt: new Date() });
  // @ts-expect-error
  await sessions.update('s1', { deletedAt: new Date() });

  await db.forUser('u1').for(trustedDevices).update('d1', { label: 'Phone' });
}

export async function writes(db: DbClient) {
  const qb = db.global.for(teams);
  await qb.insert({ name: 'NAVI', tag: 'NAVI', captainUserId: 'u1', createdBy: 'u1' });
  await qb.update('t1', { captainUserId: 'u2' });
  // @ts-expect-error
  await qb.update('t1', { createdBy: 'u2' });
  // @ts-expect-error
  await qb.insert({ name: 'NAVI', tag: 'NAVI', captainUserId: 'u1' });
}

it('type assertions compile (checked by tsc)', () => {});
