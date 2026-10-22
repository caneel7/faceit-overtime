import { isNull } from 'drizzle-orm';
import { boolean, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps, timestamptz } from './columns';
import { players } from './players';

export const users = pgTable(
  'users',
  {
    id: id(),
    playerId: uuid('player_id').references(() => players.id),
    faceitVerified: boolean('faceit_verified').notNull().default(true),
    displayName: text('display_name').notNull(),
    emailEncrypted: text('email_encrypted'),
    emailHmac: text('email_hmac'),
    emailVerifiedAt: timestamptz('email_verified_at'),
    passwordHash: text('password_hash'),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('users_player_id_key').on(t.playerId).where(isNull(t.deletedAt)),
    uniqueIndex('users_email_hmac_key').on(t.emailHmac).where(isNull(t.deletedAt)),
  ],
);
