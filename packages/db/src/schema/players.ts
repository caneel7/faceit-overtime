import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { baseColumns, citext, live, timestamptz } from './columns';

// A FACEIT identity. Exists without an Overtime user when a captain adds someone by nickname.
export const players = pgTable(
  'players',
  {
    ...baseColumns(),
    faceitPlayerId: text('faceit_player_id').notNull(),
    nickname: citext('nickname').notNull(),
    avatarUrl: text('avatar_url'),
    country: text('country'),
    cs2Level: integer('cs2_level'),
    cs2Elo: integer('cs2_elo'),
    cs2Region: text('cs2_region'),
    syncedAt: timestamptz('synced_at').notNull(),
  },
  (t) => [
    uniqueIndex('players_faceit_player_id_key').on(t.faceitPlayerId).where(live),
    check('players_cs2_level_check', sql`${t.cs2Level} between 1 and 10`),
  ],
);
