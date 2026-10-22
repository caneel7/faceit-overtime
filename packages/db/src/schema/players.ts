import { isNull } from 'drizzle-orm';
import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { citext, id, timestamps, timestamptz } from './columns';

export const players = pgTable(
  'players',
  {
    id: id(),
    faceitPlayerId: text('faceit_player_id').notNull(),
    nickname: citext('nickname').notNull(),
    avatarUrl: text('avatar_url'),
    country: text('country'),
    cs2Level: integer('cs2_level'),
    cs2Elo: integer('cs2_elo'),
    cs2Region: text('cs2_region'),
    syncedAt: timestamptz('synced_at').notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('players_faceit_player_id_key').on(t.faceitPlayerId).where(isNull(t.deletedAt)),
  ],
);
