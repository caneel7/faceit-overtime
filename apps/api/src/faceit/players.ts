import { players, type DbClient } from '@overtime/db';
import type { FaceitIdentity, FaceitPlayer } from './schemas';

const NEVER_SYNCED = new Date(0);

export async function upsertPlayer(
  db: DbClient,
  identity: FaceitIdentity,
  stats: FaceitPlayer | null,
) {
  const basics = {
    nickname: stats?.nickname ?? identity.nickname,
    avatarUrl: stats?.avatarUrl ?? identity.avatarUrl,
  };
  const synced = stats
    ? {
        country: stats.country,
        cs2Level: stats.cs2Level,
        cs2Elo: stats.cs2Elo,
        cs2Region: stats.cs2Region,
        syncedAt: new Date(),
      }
    : null;
  return db.global.for(players).upsert(
    {
      faceitPlayerId: identity.faceitPlayerId,
      ...basics,
      ...(synced ?? { syncedAt: NEVER_SYNCED }),
    },
    { conflict: ['faceitPlayerId'], set: { ...basics, ...synced } },
  );
}
