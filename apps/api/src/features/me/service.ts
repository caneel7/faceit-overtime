import {
  createDbClient,
  NotFoundError,
  players,
  userIdentities,
  users,
  type DbClient,
} from '@overtime/db';
import type { MeResponse, Player } from '@overtime/shared';
import { AppError } from '@overtime/shared/hono';
import type { Bindings } from '../../env';
import { FaceitClient } from '../../faceit/client';
import { upsertPlayer } from '../../faceit/players';
import { decrypt } from '../../lib/crypto';

export const EMAIL_AAD = 'users.email';
export const PLAYER_STALE_MS = 24 * 60 * 60 * 1000;

export function unauthenticated(): AppError {
  return new AppError('UNAUTHENTICATED', 401, 'Sign in to continue');
}

export async function loadMe(db: DbClient, env: Bindings, userId: string): Promise<MeResponse> {
  const [user, identities] = await Promise.all([
    db.global
      .for(users)
      .getById(userId)
      .catch((err: unknown) => {
        throw err instanceof NotFoundError ? unauthenticated() : err;
      }),
    db
      .forUser(userId)
      .for(userIdentities)
      .find({ orderBy: { createdAt: 'asc' } }),
  ]);
  const player = user.playerId
    ? await db.global.for(players).findOne({ where: { id: user.playerId } })
    : undefined;
  const email = user.emailEncrypted
    ? await decrypt(env.PII_ENCRYPTION_KEY, user.emailEncrypted, EMAIL_AAD)
    : null;

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      email,
      emailVerified: user.emailVerifiedAt !== null,
      hasPassword: user.passwordHash !== null,
      createdAt: user.createdAt.toISOString(),
    },
    identities: identities.map((identity) => ({
      provider: identity.provider,
      providerUserId: identity.providerUserId,
      linkedAt: identity.createdAt.toISOString(),
    })),
    player: player
      ? {
          id: player.id,
          faceitPlayerId: player.faceitPlayerId,
          nickname: player.nickname,
          avatarUrl: player.avatarUrl,
          country: player.country,
          cs2Level: player.cs2Level,
          cs2Elo: player.cs2Elo,
          cs2Region: player.cs2Region,
          syncedAt: player.syncedAt.toISOString(),
        }
      : null,
  };
}

export function playerIsStale(player: Player): boolean {
  return Date.now() - Date.parse(player.syncedAt) > PLAYER_STALE_MS;
}

export async function refreshPlayer(env: Bindings, faceitPlayerId: string): Promise<void> {
  try {
    const stats = await FaceitClient.fromEnv(env).player(faceitPlayerId);
    if (!stats) return;
    const db = createDbClient(env.HYPERDRIVE.connectionString);
    try {
      await upsertPlayer(db, stats, stats);
    } finally {
      await db.close();
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'faceit_data_failed',
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}
