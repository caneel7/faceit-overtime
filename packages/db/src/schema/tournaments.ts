import { isNull, sql } from 'drizzle-orm';
import { index, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { citext, id, timestamps, timestamptz } from './columns';
import { game, region, tournamentStatus } from './enums';
import { orgs } from './orgs';
import { users } from './users';

export const tournaments = pgTable(
  'tournaments',
  {
    id: id(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => orgs.id),
    slug: citext('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    game: game('game').notNull().default('cs2'),
    status: tournamentStatus('status').notNull().default('draft'),
    teamSize: integer('team_size').notNull().default(5),
    maxSubs: integer('max_subs').notNull().default(1),
    maxTeams: integer('max_teams').notNull().default(16),
    minLevel: integer('min_level').notNull().default(1),
    maxLevel: integer('max_level').notNull().default(10),
    regions: region('regions')
      .array()
      .notNull()
      .default(sql`'{}'`),
    registrationOpensAt: timestamptz('registration_opens_at').notNull(),
    registrationClosesAt: timestamptz('registration_closes_at').notNull(),
    startsAt: timestamptz('starts_at').notNull(),
    endsAt: timestamptz('ends_at').notNull(),
    winsToAdvance: integer('wins_to_advance').notNull().default(3),
    lossesToEliminate: integer('losses_to_eliminate').notNull().default(3),
    bestOf: integer('best_of').notNull().default(1),
    deciderBestOf: integer('decider_best_of').notNull().default(3),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('tournaments_slug_key').on(t.slug).where(isNull(t.deletedAt)),
    index('tournaments_org_status_idx').on(t.orgId, t.status).where(isNull(t.deletedAt)),
    index('tournaments_status_closes_idx')
      .on(t.status, t.registrationClosesAt)
      .where(isNull(t.deletedAt)),
  ],
);
