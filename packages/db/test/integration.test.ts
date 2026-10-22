import { randomUUID } from 'node:crypto';
import { inArray, sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDbClient, type DbClient } from '../src/client';
import { ConflictError, NotFoundError } from '../src/query/errors';
import {
  players,
  teamPlayers,
  teams,
  trustedDevices,
  users,
  userSessions,
  userTwoFactors,
} from '../src/schema';
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
    track(
      users,
      await db.global
        .for(users)
        .insert({ playerId: (await newPlayer(suffix)).id, displayName: `${run}${suffix}` }),
    );
  const newSession = async (userId: string, suffix: string) =>
    track(
      userSessions,
      await db
        .forUser(userId)
        .for(userSessions)
        .insert({
          refreshTokenHash: `${run}-${suffix}`,
          authMethods: ['faceit'],
          expiresAt: new Date(Date.now() + 30 * DAY),
        }),
    );
  const pgCode = (err: unknown): unknown =>
    (err as { code?: unknown }).code ?? (err as { cause?: { code?: unknown } }).cause?.code;
  const rawInsert = (table: PgTable, values: Record<string, unknown>) =>
    unscoped(db)
      .insert(table)
      .values(values as never)
      .catch((err: unknown) => pgCode(err));

  beforeAll(() => {
    db = createDbClient(url!);
  });

  afterAll(async () => {
    for (const table of [
      teamPlayers,
      teams,
      userSessions,
      trustedDevices,
      userTwoFactors,
      users,
      players,
    ]) {
      const ids = created.get(table) ?? [];
      const id = (table as unknown as { id: Parameters<typeof inArray>[0] }).id;
      if (ids.length) await unscoped(db).delete(table).where(inArray(id, ids));
    }
    await db.close();
  });

  describe('schema', () => {
    it('has the 9 tables, all migrations and uuidv7 ids', async () => {
      const tables = await unscoped(db).execute<{ table_name: string }>(
        sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
      );
      expect(tables.map((t) => t.table_name)).toEqual(
        expect.arrayContaining([
          'players',
          'team_players',
          'teams',
          'trusted_devices',
          'user_identities',
          'user_sessions',
          'user_tokens',
          'user_two_factors',
          'users',
        ]),
      );
      const migrations = await unscoped(db).execute(
        sql`select id from drizzle.__drizzle_migrations`,
      );
      expect(migrations.length).toBeGreaterThanOrEqual(3);

      const player = await newPlayer('uuid');
      expect(player.id[14]).toBe('7');
    });

    it('has the partial unique and lookup indexes', async () => {
      const rows = await unscoped(db).execute<{ indexname: string; indexdef: string }>(
        sql`select indexname, indexdef from pg_indexes where schemaname = 'public'`,
      );
      const defs = new Map(rows.map((r) => [r.indexname, r.indexdef]));
      for (const name of [
        'players_faceit_player_id_key',
        'users_player_id_key',
        'user_two_factors_user_type_key',
        'team_players_team_player_key',
      ]) {
        expect(defs.get(name)).toMatch(/^CREATE UNIQUE INDEX .* WHERE \(deleted_at IS NULL\)$/);
      }
      for (const name of [
        'user_sessions_user_active_idx',
        'user_sessions_previous_refresh_token_hash_idx',
        'user_sessions_expires_at_idx',
        'user_sessions_ip_hmac_idx',
        'trusted_devices_user_active_idx',
        'trusted_devices_ip_hmac_idx',
        'teams_captain_user_idx',
        'team_players_player_idx',
      ]) {
        expect(defs.has(name), name).toBe(true);
      }
    });
  });

  describe('constraints', () => {
    it('a FACEIT id is unique among live players and reusable after a soft delete', async () => {
      const player = await newPlayer('dup');
      await expect(newPlayer('dup')).rejects.toBeInstanceOf(ConflictError);
      await db.global.for(players).softDelete(player.id);
      await expect(newPlayer('dup')).resolves.toMatchObject({ faceitPlayerId: `${run}-dup` });
    });

    it('a player can leave a team and rejoin as a new row', async () => {
      const captain = await newUser('cap');
      const team = track(
        teams,
        await db.global
          .for(teams)
          .insert({ name: 'T', tag: 'T', captainUserId: captain.id, createdBy: captain.id }),
      );
      const rp = db.global.for(teamPlayers);
      const first = track(
        teamPlayers,
        await rp.insert({ teamId: team.id, playerId: captain.playerId! }),
      );
      await expect(
        rp.insert({ teamId: team.id, playerId: captain.playerId! }),
      ).rejects.toBeInstanceOf(ConflictError);
      await rp.softDelete(first.id);
      const again = track(
        teamPlayers,
        await rp.insert({ teamId: team.id, playerId: captain.playerId! }),
      );
      expect(again.id).not.toBe(first.id);
    });

    it('one live 2FA enrolment per user and type', async () => {
      const user = await newUser('2fa');
      const tf = db.forUser(user.id).for(userTwoFactors);
      track(userTwoFactors, await tf.insert({ secretEncrypted: 'v1.x.y' }));
      await expect(tf.insert({ secretEncrypted: 'v1.x.z' })).rejects.toBeInstanceOf(ConflictError);
    });

    it('nicknames compare case-insensitively (citext)', async () => {
      await newPlayer('CaSe');
      const found = await db.global
        .for(players)
        .findOne({ where: { nickname: `${run}case`.toUpperCase() } });
      expect(found?.faceitPlayerId).toBe(`${run}-CaSe`);
    });
  });

  describe('forUser isolation', () => {
    it("user B can't see or change user A's rows", async () => {
      const a = await newUser('iso-a');
      const b = await newUser('iso-b');
      const sessionA = await newSession(a.id, 'iso-a');
      await newSession(b.id, 'iso-b');

      const asB = db.forUser(b.id).for(userSessions);
      expect((await asB.find()).map((s) => s.userId)).toEqual([b.id]);
      expect(await asB.count({ where: { id: sessionA.id } })).toBe(0);
      await expect(asB.getById(sessionA.id)).rejects.toBeInstanceOf(NotFoundError);
      await expect(asB.update(sessionA.id, { userAgent: 'x' })).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(asB.softDelete(sessionA.id)).rejects.toBeInstanceOf(NotFoundError);
      expect(await asB.updateWithWhere({ id: sessionA.id }, { userAgent: 'x' })).toEqual([]);

      const stillA = await db.forUser(a.id).for(userSessions).getById(sessionA.id);
      expect(stillA.userAgent).toBeNull();
      expect(stillA.deletedAt).toBeNull();
    });

    it('a join to a user-owned table only matches the scoped user’s rows', async () => {
      const a = await newUser('join-a');
      const b = await newUser('join-b');
      const deviceA = track(
        trustedDevices,
        await db
          .forUser(a.id)
          .for(trustedDevices)
          .insert({ tokenHash: `${run}-dev-a`, expiresAt: new Date(Date.now() + 15 * DAY) }),
      );
      await rawInsert(userSessions, {
        userId: b.id,
        refreshTokenHash: `${run}-join-b`,
        authMethods: ['faceit', 'trusted_device'],
        trustedDeviceId: deviceA.id,
        expiresAt: new Date(Date.now() + DAY),
      });
      const rows = await unscoped(db)
        .select({ id: userSessions.id })
        .from(userSessions)
        .where(sql`${userSessions.refreshTokenHash} = ${`${run}-join-b`}`);
      track(userSessions, rows[0]!);

      const device = {
        device: {
          schema: trustedDevices,
          field: userSessions.trustedDeviceId,
          reference: trustedDevices.id,
        },
      } as const;
      const [row] = await db
        .forUser(b.id)
        .for(userSessions, device)
        .find({ relations: { device: 'left' } });
      expect(row!.device).toBeNull();
    });
  });

  describe('soft delete and reads', () => {
    it('hides soft-deleted rows unless withDeleted', async () => {
      const user = await newUser('sd');
      const session = await newSession(user.id, 'sd');
      const qb = db.forUser(user.id).for(userSessions);
      await qb.softDelete(session.id);
      expect(await qb.find()).toEqual([]);
      expect(await qb.find({ withDeleted: true })).toHaveLength(1);
      await expect(qb.update(session.id, { userAgent: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    });

    it('paginate returns a total that matches its items with a to-one join', async () => {
      const captain = await newUser('pg');
      for (const n of [1, 2, 3]) {
        track(
          teams,
          await db.global.for(teams).insert({
            name: `${run}-pg-${n}`,
            tag: 'PG',
            captainUserId: captain.id,
            createdBy: captain.id,
          }),
        );
      }
      const rel = {
        captain: { schema: users, field: teams.captainUserId, reference: users.id },
      } as const;
      const qb = db.global.for(teams, rel);
      const where = { 'name LIKE': `${run}-pg-%` };
      const first = await qb.paginate({
        page: 1,
        pageSize: 2,
        where,
        relations: { captain: 'inner' },
        orderBy: { name: 'asc' },
      });
      expect(first.total).toBe(3);
      expect(first.items.map((i) => i.teams.name)).toEqual([`${run}-pg-1`, `${run}-pg-2`]);
      expect(first.items[0]!.captain.id).toBe(captain.id);
      expect(await qb.paginate({ page: 3, pageSize: 2, where })).toEqual({ items: [], total: 3 });
    });

    it('a throw inside a transaction rolls back', async () => {
      await expect(
        db.transaction(async (tx) => {
          await tx.global
            .for(players)
            .insert({ faceitPlayerId: `${run}-tx`, nickname: 'tx', syncedAt: new Date() });
          throw new Error('boom');
        }),
      ).rejects.toThrow('boom');
      expect(await db.global.for(players).count({ where: { faceitPlayerId: `${run}-tx` } })).toBe(
        0,
      );
    });

    it('ping succeeds', async () => {
      await expect(db.ping()).resolves.toBeUndefined();
    });
  });
});
