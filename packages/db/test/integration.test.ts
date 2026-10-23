import { randomUUID } from 'node:crypto';
import { inArray } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDbClient, type DbClient } from '../src/client';
import { ConflictError, NotFoundError } from '../src/query/errors';
import { players, users, userSessions } from '../src/schema';
import { unscoped } from '../src/unscoped';

const url = process.env.DATABASE_URL;
if (process.env.REQUIRE_DATABASE && !url)
  throw new Error('DATABASE_URL is required (REQUIRE_DATABASE is set)');
const DAY = 24 * 60 * 60 * 1000;

describe.skipIf(!url)('database (integration)', () => {
  let db: DbClient;
  const run = randomUUID().slice(0, 8);
  const created = new Map<PgTable, string[]>();

  const track = <R extends { id: string }>(table: PgTable, row: R) => {
    created.set(table, [...(created.get(table) ?? []), row.id]);
    return row;
  };
  const newPlayer = async (suffix: string) =>
    track(
      players,
      await db.global.for(players).insert({
        faceitPlayerId: `${run}-${suffix}`,
        nickname: `${run}${suffix}`,
        syncedAt: new Date(),
      }),
    );
  const newUser = async (suffix: string) =>
    track(users, await db.global.for(users).insert({ displayName: `${run}${suffix}` }));
  const newSession = async (userId: string, hash: string) =>
    track(
      userSessions,
      await db
        .forUser(userId)
        .for(userSessions)
        .insert({
          refreshTokenHash: `${run}-${hash}`,
          authMethods: ['password'],
          expiresAt: new Date(Date.now() + 30 * DAY),
        }),
    );

  beforeAll(() => {
    db = createDbClient(url!);
  });

  afterAll(async () => {
    for (const table of [userSessions, users, players]) {
      const ids = created.get(table) ?? [];
      const id = (table as unknown as { id: Parameters<typeof inArray>[0] }).id;
      if (ids.length) await unscoped(db).delete(table).where(inArray(id, ids));
    }
    await db.close();
  });

  it("user B can't see or change user A's rows", async () => {
    const a = await newUser('iso-a');
    const b = await newUser('iso-b');
    const sessionA = await newSession(a.id, 'iso-a');
    await newSession(b.id, 'iso-b');

    const asB = db.forUser(b.id).for(userSessions);
    expect((await asB.find()).map((s) => s.userId)).toEqual([b.id]);
    await expect(asB.getById(sessionA.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(asB.softDelete(sessionA.id)).rejects.toBeInstanceOf(NotFoundError);
    expect((await db.forUser(a.id).for(userSessions).getById(sessionA.id)).deletedAt).toBeNull();
  });

  it('a soft-deleted business key can be used again', async () => {
    const player = await newPlayer('dup');
    await expect(newPlayer('dup')).rejects.toBeInstanceOf(ConflictError);
    await db.global.for(players).softDelete(player.id);
    await expect(newPlayer('dup')).resolves.toMatchObject({ faceitPlayerId: `${run}-dup` });
  });

  it('two requests racing on one refresh token: only one rotates it', async () => {
    const user = await newUser('race');
    await newSession(user.id, 'r0');
    const rotate = (next: string) =>
      db.system
        .for(userSessions)
        .updateWithWhere(
          { refreshTokenHash: `${run}-r0`, revokedAt: null, 'expiresAt >': new Date() },
          { refreshTokenHash: `${run}-${next}`, previousRefreshTokenHash: `${run}-r0` },
        );
    const [first, second] = await Promise.all([rotate('r1'), rotate('r2')]);
    expect(first.length + second.length).toBe(1);
  });
});
