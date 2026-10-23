import {
  createDbClient,
  players,
  userIdentities,
  users,
  userSessions,
  userTokens,
  type DbClient,
} from '@overtime/db';
import { unscoped } from '@overtime/db/unscoped';
import { inArray } from 'drizzle-orm';
import type { Bindings } from '../src/env';
import { createSession } from '../src/features/auth/sessions';
import { testEnv } from './env';
import { testSecret, testSigningKey } from './keys';

export const databaseUrl = process.env.DATABASE_URL;
if (process.env.REQUIRE_DATABASE && !databaseUrl)
  throw new Error('DATABASE_URL is required (REQUIRE_DATABASE is set)');

export async function integrationEnv(): Promise<Bindings> {
  return testEnv(
    {
      JWT_SIGNING_KEY: await testSigningKey(),
      PII_ENCRYPTION_KEY: testSecret(),
      PII_HMAC_KEY: testSecret(),
    },
    databaseUrl,
  );
}

export function openDb(): DbClient {
  return createDbClient(databaseUrl!);
}

export function testUsers(db: DbClient, env: Bindings) {
  const run = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];

  return {
    run,
    async create(displayName = `${run} user`) {
      const user = await db.global.for(users).insert({ displayName });
      userIds.push(user.id);
      return user;
    },
    signIn(userId: string) {
      return createSession(db, env, {
        userId,
        authMethods: ['password'],
        userAgent: 'vitest',
        ip: '203.0.113.7',
      });
    },
    async cleanup() {
      if (!userIds.length) return;
      const raw = unscoped(db);
      await raw.delete(userSessions).where(inArray(userSessions.userId, userIds));
      await raw.delete(userTokens).where(inArray(userTokens.userId, userIds));
      await raw.delete(userIdentities).where(inArray(userIdentities.userId, userIds));
      const rows = await raw.delete(users).where(inArray(users.id, userIds)).returning();
      const playerIds = rows.map((r) => r.playerId).filter((id): id is string => id !== null);
      if (playerIds.length) await raw.delete(players).where(inArray(players.id, playerIds));
    },
  };
}
