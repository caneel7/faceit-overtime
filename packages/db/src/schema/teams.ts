import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { baseColumns, live } from './columns';
import { players } from './players';
import { users } from './users';

// Global, not org-scoped: a team can play in any org's tournaments
export const teams = pgTable(
  'teams',
  {
    ...baseColumns(),
    name: text('name').notNull(),
    tag: text('tag').notNull(),
    // current captain; changes when the captaincy is transferred
    captainUserId: uuid('captain_user_id')
      .notNull()
      .references(() => users.id),
    // who created the team; never changes
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
  },
  (t) => [
    index('teams_captain_user_idx').on(t.captainUserId).where(live),
    check('teams_tag_check', sql`char_length(${t.tag}) between 1 and 5`),
  ],
);

// Own id instead of (team_id, player_id): a player who left and rejoins gets a new row
export const teamPlayers = pgTable(
  'team_players',
  {
    ...baseColumns(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
  },
  (t) => [
    uniqueIndex('team_players_team_player_key').on(t.teamId, t.playerId).where(live),
    index('team_players_player_idx').on(t.playerId).where(live),
  ],
);
