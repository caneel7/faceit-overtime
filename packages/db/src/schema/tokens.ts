import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { baseColumns, timestamptz } from './columns';
import { users } from './users';

export const USER_TOKEN_PURPOSES = ['email_verification', 'password_reset'] as const;
export type UserTokenPurpose = (typeof USER_TOKEN_PURPOSES)[number];

export const userTokens = pgTable(
  'user_tokens',
  {
    ...baseColumns(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    purpose: text('purpose', { enum: USER_TOKEN_PURPOSES }).notNull(),
    tokenHash: text('token_hash').notNull().unique('user_tokens_token_hash_key'),
    expiresAt: timestamptz('expires_at').notNull(),
    usedAt: timestamptz('used_at'),
  },
  (t) => [
    index('user_tokens_user_open_idx')
      .on(t.userId, t.purpose)
      .where(sql`used_at is null and deleted_at is null`),
    check(
      'user_tokens_purpose_check',
      sql`${t.purpose} in ('email_verification', 'password_reset')`,
    ),
    check('user_tokens_expiry_check', sql`${t.expiresAt} > ${t.createdAt}`),
  ],
);
