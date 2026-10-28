import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { citext, id, timestamps, timestamptz } from './columns';
import { inviteStatus, orgRole } from './enums';
import { users } from './users';

export const orgs = pgTable(
  'orgs',
  {
    id: id(),
    slug: citext('slug').notNull(),
    name: text('name').notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    ...timestamps(),
  },
  (t) => [uniqueIndex('orgs_slug_key').on(t.slug).where(isNull(t.deletedAt))],
);

export const orgUsers = pgTable(
  'org_users',
  {
    id: id(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => orgs.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: orgRole('role').notNull(),
    status: inviteStatus('status').notNull(),
    invitedBy: uuid('invited_by').references(() => users.id),
    expiresAt: timestamptz('expires_at'),
    respondedAt: timestamptz('responded_at'),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('org_users_live_key')
      .on(t.orgId, t.userId)
      .where(and(isNull(t.deletedAt), inArray(t.status, [sql`'pending'`, sql`'accepted'`]))!),
    uniqueIndex('org_users_owner_key')
      .on(t.orgId)
      .where(and(eq(t.role, sql`'owner'`), isNull(t.deletedAt))!),
    index('org_users_user_idx').on(t.userId, t.status).where(isNull(t.deletedAt)),
  ],
);
