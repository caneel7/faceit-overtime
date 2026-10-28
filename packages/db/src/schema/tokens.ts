import { and, isNull } from 'drizzle-orm';
import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps, timestamptz } from './columns';
import { userTokenPurpose } from './enums';
import { users } from './users';

export const userTokens = pgTable(
  'user_tokens',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    purpose: userTokenPurpose('purpose').notNull(),
    tokenHash: text('token_hash').notNull().unique('user_tokens_token_hash_key'),
    expiresAt: timestamptz('expires_at').notNull(),
    usedAt: timestamptz('used_at'),
    ...timestamps(),
    emailEncrypted: text('email_encrypted'),
    emailHmac: text('email_hmac'),
  },
  (t) => [
    index('user_tokens_user_open_idx')
      .on(t.userId, t.purpose)
      .where(and(isNull(t.usedAt), isNull(t.deletedAt))!),
  ],
);
