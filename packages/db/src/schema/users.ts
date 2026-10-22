import { sql } from 'drizzle-orm';
import { boolean, check, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { baseColumns, live, timestamptz } from './columns';
import { players } from './players';

export const users = pgTable(
  'users',
  {
    ...baseColumns(),
    playerId: uuid('player_id').references(() => players.id),
    faceitVerified: boolean('faceit_verified').notNull().default(true),
    displayName: text('display_name').notNull(),
    emailEncrypted: text('email_encrypted'),
    emailHmac: text('email_hmac'),
    emailVerifiedAt: timestamptz('email_verified_at'),
    passwordHash: text('password_hash'),
  },
  (t) => [
    uniqueIndex('users_player_id_key').on(t.playerId).where(live),
    uniqueIndex('users_email_hmac_key').on(t.emailHmac).where(live),
    check('users_display_name_check', sql`char_length(${t.displayName}) between 1 and 32`),
    check('users_email_pair_check', sql`(${t.emailHmac} is null) = (${t.emailEncrypted} is null)`),
    check(
      'users_password_needs_email_check',
      sql`${t.passwordHash} is null or ${t.emailHmac} is not null`,
    ),
  ],
);
