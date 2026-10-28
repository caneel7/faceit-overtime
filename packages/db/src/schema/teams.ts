import { and, eq, isNull, sql } from 'drizzle-orm';
import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps, timestamptz } from './columns';
import { inviteStatus, teamRole } from './enums';
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

export const teamMembers = pgTable(
  'team_members',
  {
    id: id(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: teamRole('role').notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('team_members_team_user_key').on(t.teamId, t.userId).where(isNull(t.deletedAt)),
    index('team_members_user_idx').on(t.userId).where(isNull(t.deletedAt)),
  ],
);

export const teamInvites = pgTable(
  'team_invites',
  {
    id: id(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: teamRole('role').notNull(),
    status: inviteStatus('status').notNull(),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => users.id),
    expiresAt: timestamptz('expires_at').notNull(),
    respondedAt: timestamptz('responded_at'),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('team_invites_open_key')
      .on(t.teamId, t.userId)
      .where(and(eq(t.status, sql`'pending'`), isNull(t.deletedAt))!),
    index('team_invites_user_idx').on(t.userId, t.status).where(isNull(t.deletedAt)),
  ],
);
