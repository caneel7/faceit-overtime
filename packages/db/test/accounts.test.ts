import { randomUUID } from 'node:crypto';
import { inArray } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDbClient, type DbClient } from '../src/client';
import { ConflictError } from '../src/query/errors';
import { players, userIdentities, users, userSessions, userTokens } from '../src/schema';
import { unscoped } from '../src/unscoped';

const url = process.env.DATABASE_URL;
if (process.env.REQUIRE_DATABASE && !url)
  throw new Error('DATABASE_URL is required (REQUIRE_DATABASE is set)');
const DAY = 24 * 60 * 60 * 1000;

describe.skipIf(!url)('accounts, identities and tokens (integration)', () => {
  let db: DbClient;
  const run = randomUUID().slice(0, 8);
  const created = new Map<PgTable, string[]>();

  const track = <R extends { id: string }>(table: PgTable, row: R) => {
    created.set(table, [...(created.get(table) ?? []), row.id]);
    return row;
  };
  const pgCode = (err: unknown): unknown =>
    (err as { code?: unknown }).code ?? (err as { cause?: { code?: unknown } }).cause?.code;
  const rawInsert = (table: PgTable, values: Record<string, unknown>) =>
    unscoped(db)
      .insert(table)
      .values(values as never)
      .returning()
      .then((rows) => {
        track(table, rows[0] as { id: string });
        return 'ok';
      })
      .catch((err: unknown) => pgCode(err));

  const emailUser = async (suffix: string) =>
    track(
      users,
      await db.global.for(users).insert({
        displayName: `${run}${suffix}`,
        emailEncrypted: `v1.${suffix}`,
        emailHmac: `${run}-${suffix}`,
        emailVerifiedAt: new Date(),
        passwordHash: '$scrypt$ln=14,r=8,p=5$s$h',
      }),
    );
  const session = async (userId: string, hash: string) =>
    track(
      userSessions,
      await db
        .forUser(userId)
        .for(userSessions)
        .insert({
          refreshTokenHash: hash,
          authMethods: ['password'],
          expiresAt: new Date(Date.now() + 30 * DAY),
        }),
    );

  beforeAll(() => {
    db = createDbClient(url!);
  });

  afterAll(async () => {
    for (const table of [userTokens, userIdentities, userSessions, users, players]) {
      const ids = created.get(table) ?? [];
      const id = (table as unknown as { id: Parameters<typeof inArray>[0] }).id;
      if (ids.length) await unscoped(db).delete(table).where(inArray(id, ids));
    }
    await db.close();
  });

  describe('users', () => {
    it('allows a FACEIT-only account with no email or password', async () => {
      expect(await rawInsert(users, { displayName: 's1mple' })).toBe('ok');
    });

    it('one live account per email HMAC, reusable after a soft delete', async () => {
      const first = await emailUser('dup');
      await expect(emailUser('dup')).rejects.toBeInstanceOf(ConflictError);
      await db.global.for(users).softDelete(first.id);
      expect((await emailUser('dup')).id).not.toBe(first.id);
    });

    it('enforces display name length, email pairs and password-needs-email', async () => {
      expect(await rawInsert(users, { displayName: '' })).toBe('23514');
      expect(await rawInsert(users, { displayName: 'x'.repeat(33) })).toBe('23514');
      expect(await rawInsert(users, { displayName: 'x', emailHmac: `${run}-half` })).toBe('23514');
      expect(await rawInsert(users, { displayName: 'x', passwordHash: 'h' })).toBe('23514');
      expect(
        await rawInsert(users, {
          displayName: 'x',
          passwordHash: 'h',
          emailHmac: `${run}-full`,
          emailEncrypted: 'v1.x',
        }),
      ).toBe('ok');
    });
  });

  describe('user_identities', () => {
    const link = (userId: string, providerUserId: string) =>
      db.forUser(userId).for(userIdentities).insert({ provider: 'faceit', providerUserId });

    it('one user per provider account and one identity per user and provider', async () => {
      const a = await emailUser('ida');
      const b = await emailUser('idb');
      const first = track(userIdentities, await link(a.id, `${run}-guid`));
      await expect(link(b.id, `${run}-guid`)).rejects.toBeInstanceOf(ConflictError);
      await expect(link(a.id, `${run}-other`)).rejects.toBeInstanceOf(ConflictError);
      await db.forUser(a.id).for(userIdentities).softDelete(first.id);
      track(userIdentities, await link(b.id, `${run}-guid`));
    });

    it('rejects unknown providers', async () => {
      const user = await emailUser('idp');
      expect(
        await rawInsert(userIdentities, {
          userId: user.id,
          provider: 'steam',
          providerUserId: `${run}-s`,
        }),
      ).toBe('23514');
    });

    it('forUser hides other users’ identities; system finds them by provider id', async () => {
      const a = await emailUser('isoa');
      const b = await emailUser('isob');
      const row = track(userIdentities, await link(a.id, `${run}-iso`));
      expect(await db.forUser(b.id).for(userIdentities).find()).toEqual([]);
      const found = await db.system
        .for(userIdentities)
        .findOne({ where: { provider: 'faceit', providerUserId: `${run}-iso` } });
      expect(found?.id).toBe(row.id);
      await db.forUser(a.id).for(userIdentities).softDelete(row.id);
      expect(
        await db.system
          .for(userIdentities)
          .findOne({ where: { provider: 'faceit', providerUserId: `${run}-iso` } }),
      ).toBeUndefined();
    });
  });

  describe('user_tokens', () => {
    it('rejects unknown purposes and expiry before creation', async () => {
      const user = await emailUser('tokchk');
      const base = { userId: user.id, tokenHash: `${run}-${randomUUID()}` };
      expect(
        await rawInsert(userTokens, {
          ...base,
          purpose: 'magic',
          expiresAt: new Date(Date.now() + DAY),
        }),
      ).toBe('23514');
      expect(
        await rawInsert(userTokens, {
          ...base,
          purpose: 'password_reset',
          expiresAt: new Date(Date.now() - DAY),
        }),
      ).toBe('23514');
    });

    it('a conditional update consumes a token for exactly one of two concurrent requests', async () => {
      const user = await emailUser('tokrace');
      track(
        userTokens,
        await db
          .forUser(user.id)
          .for(userTokens)
          .insert({
            purpose: 'password_reset',
            tokenHash: `${run}-race`,
            expiresAt: new Date(Date.now() + DAY),
          }),
      );
      const consume = () =>
        db.system
          .for(userTokens)
          .updateWithWhere(
            { tokenHash: `${run}-race`, usedAt: null, 'expiresAt >': new Date() },
            { usedAt: new Date() },
          );
      const [a, b] = await Promise.all([consume(), consume()]);
      expect(a.length + b.length).toBe(1);
      expect(await consume()).toEqual([]);
    });
  });

  describe('user_sessions', () => {
    it('accepts password sessions and requires faceit or password', async () => {
      const user = await emailUser('amr');
      const base = (extra: Record<string, unknown>) => ({
        userId: user.id,
        refreshTokenHash: `${run}-${randomUUID()}`,
        expiresAt: new Date(Date.now() + DAY),
        ...extra,
      });
      expect(await rawInsert(userSessions, base({ authMethods: ['password'] }))).toBe('ok');
      expect(await rawInsert(userSessions, base({ authMethods: ['totp'] }))).toBe('23514');
      expect(
        await rawInsert(
          userSessions,
          base({
            authMethods: ['password'],
            revokedAt: new Date(),
            revokedReason: 'password_reset',
          }),
        ),
      ).toBe('ok');
    });

    it('system finds a session by refresh-token hash without knowing the user', async () => {
      const user = await emailUser('sys');
      const s = await session(user.id, `${run}-h0`);
      const found = await db.system
        .for(userSessions)
        .findOne({ where: { refreshTokenHash: `${run}-h0`, revokedAt: null } });
      expect(found?.id).toBe(s.id);
      expect(found?.userId).toBe(user.id);
    });

    it('two concurrent compare-and-swap rotations of one token: exactly one wins', async () => {
      const user = await emailUser('rot');
      await session(user.id, `${run}-c0`);
      const rotate = (next: string) =>
        db.system
          .for(userSessions)
          .updateWithWhere(
            { refreshTokenHash: `${run}-c0`, revokedAt: null, 'expiresAt >': new Date() },
            { refreshTokenHash: next, previousRefreshTokenHash: `${run}-c0` },
          );
      const [a, b] = await Promise.all([rotate(`${run}-c1`), rotate(`${run}-c2`)]);
      expect(a.length + b.length).toBe(1);
    });
  });

  describe('upsert', () => {
    const input = (id: string, nickname: string) => ({
      faceitPlayerId: id,
      nickname,
      syncedAt: new Date(),
    });

    it('inserts, then updates the live row on the business key', async () => {
      const players$ = db.global.for(players);
      const first = track(
        players,
        await players$.upsert(input(`${run}-up`, `${run}a`), {
          conflict: ['faceitPlayerId'],
          set: { nickname: `${run}a` },
        }),
      );
      const second = await players$.upsert(input(`${run}-up`, `${run}b`), {
        conflict: ['faceitPlayerId'],
        set: { nickname: `${run}b` },
      });
      expect(second.id).toBe(first.id);
      expect(second.nickname).toBe(`${run}b`);
      expect(second.updatedAt.getTime()).toBeGreaterThanOrEqual(first.updatedAt.getTime());
    });

    it('ignores soft-deleted rows: a new live row is inserted', async () => {
      const players$ = db.global.for(players);
      const old = track(players, await players$.insert(input(`${run}-gone`, `${run}g1`)));
      await players$.softDelete(old.id);
      const fresh = track(
        players,
        await players$.upsert(input(`${run}-gone`, `${run}g2`), {
          conflict: ['faceitPlayerId'],
          set: { nickname: `${run}g2` },
        }),
      );
      expect(fresh.id).not.toBe(old.id);
    });

    it('two concurrent first upserts give one row', async () => {
      const players$ = db.global.for(players);
      const upsert = () =>
        players$.upsert(input(`${run}-race`, `${run}r`), {
          conflict: ['faceitPlayerId'],
          set: { nickname: `${run}r` },
        });
      const [a, b] = await Promise.all([upsert(), upsert()]);
      track(players, a);
      expect(a.id).toBe(b.id);
    });

    it('in a user scope, never updates another user’s row', async () => {
      const a = await emailUser('upa');
      const b = await emailUser('upb');
      track(
        userIdentities,
        await db
          .forUser(a.id)
          .for(userIdentities)
          .insert({ provider: 'faceit', providerUserId: `${run}-owned` }),
      );
      await expect(
        db
          .forUser(b.id)
          .for(userIdentities)
          .upsert(
            { provider: 'faceit', providerUserId: `${run}-owned` },
            { conflict: ['provider', 'providerUserId'], set: { providerUserId: `${run}-owned` } },
          ),
      ).rejects.toBeInstanceOf(ConflictError);
      const still = await db.system
        .for(userIdentities)
        .findOne({ where: { providerUserId: `${run}-owned` } });
      expect(still?.userId).toBe(a.id);
    });
  });
});
