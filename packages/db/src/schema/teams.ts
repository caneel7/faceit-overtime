import { isNull } from 'drizzle-orm';
import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { players } from './players';
import { users } from './users';

export const teams = pgTable(
  'teams',
  {
    id: id(),
    name: text('name').notNull(),
    tag: text('tag').notNull(),
    captainUserId: uuid('captain_user_id')
      .notNull()
      .references(() => users.id),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    ...timestamps(),
  },
  (t) => [index('teams_captain_user_idx').on(t.captainUserId).where(isNull(t.deletedAt))],
);

export const teamPlayers = pgTable(
  'team_players',
  {
    id: id(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('team_players_team_player_key').on(t.teamId, t.playerId).where(isNull(t.deletedAt)),
    index('team_players_player_idx').on(t.playerId).where(isNull(t.deletedAt)),
  ],
);
