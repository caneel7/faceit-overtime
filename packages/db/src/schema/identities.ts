import { isNull } from 'drizzle-orm';
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { identityProvider } from './enums';
import { users } from './users';

export const userIdentities = pgTable(
  'user_identities',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    provider: identityProvider('provider').notNull(),
    providerUserId: text('provider_user_id').notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('user_identities_provider_key')
      .on(t.provider, t.providerUserId)
      .where(isNull(t.deletedAt)),
    uniqueIndex('user_identities_user_provider_key')
      .on(t.userId, t.provider)
      .where(isNull(t.deletedAt)),
  ],
);
