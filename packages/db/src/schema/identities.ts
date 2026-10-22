import { sql } from 'drizzle-orm';
import { check, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { baseColumns, live } from './columns';
import { users } from './users';

export const IDENTITY_PROVIDERS = ['faceit'] as const;
export type IdentityProviderName = (typeof IDENTITY_PROVIDERS)[number];

export const userIdentities = pgTable(
  'user_identities',
  {
    ...baseColumns(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    provider: text('provider', { enum: IDENTITY_PROVIDERS }).notNull(),
    providerUserId: text('provider_user_id').notNull(),
  },
  (t) => [
    uniqueIndex('user_identities_provider_key').on(t.provider, t.providerUserId).where(live),
    uniqueIndex('user_identities_user_provider_key').on(t.userId, t.provider).where(live),
    check('user_identities_provider_check', sql`${t.provider} in ('faceit')`),
  ],
);
