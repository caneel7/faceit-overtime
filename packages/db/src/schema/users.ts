import { boolean, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { baseColumns, live } from './columns';
import { players } from './players';

export const users = pgTable(
  'users',
  {
    ...baseColumns(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    // false only for the nickname-link fallback (FR-AUTH-3)
    faceitVerified: boolean('faceit_verified').notNull().default(true),
  },
  (t) => [uniqueIndex('users_player_id_key').on(t.playerId).where(live)],
);
