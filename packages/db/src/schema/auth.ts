import { and, isNull } from 'drizzle-orm';
import { bigint, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps, timestamptz } from './columns';
import { authMethod, sessionRevokedReason, twoFactorType } from './enums';
import { users } from './users';

export const userTwoFactors = pgTable(
  'user_two_factors',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: twoFactorType('type').notNull().default('totp'),
    secretEncrypted: text('secret_encrypted').notNull(),
    lastUsedStep: bigint('last_used_step', { mode: 'number' }),
    enabledAt: timestamptz('enabled_at'),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('user_two_factors_user_type_key').on(t.userId, t.type).where(isNull(t.deletedAt)),
  ],
);

export const trustedDevices = pgTable(
  'trusted_devices',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    tokenHash: text('token_hash').notNull().unique('trusted_devices_token_hash_key'),
    label: text('label'),
    userAgent: text('user_agent'),
    ipEncrypted: text('ip_encrypted'),
    ipHmac: text('ip_hmac'),
    lastUsedAt: timestamptz('last_used_at'),
    expiresAt: timestamptz('expires_at').notNull(),
    revokedAt: timestamptz('revoked_at'),
    ...timestamps(),
  },
  (t) => [
    index('trusted_devices_user_active_idx')
      .on(t.userId)
      .where(and(isNull(t.revokedAt), isNull(t.deletedAt))!),
    index('trusted_devices_ip_hmac_idx').on(t.ipHmac).where(isNull(t.deletedAt)),
  ],
);

export const userSessions = pgTable(
  'user_sessions',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    refreshTokenHash: text('refresh_token_hash')
      .notNull()
      .unique('user_sessions_refresh_token_hash_key'),
    previousRefreshTokenHash: text('previous_refresh_token_hash'),
    authMethods: authMethod('auth_methods').array().notNull(),
    trustedDeviceId: uuid('trusted_device_id').references(() => trustedDevices.id),
    userAgent: text('user_agent'),
    ipEncrypted: text('ip_encrypted'),
    ipHmac: text('ip_hmac'),
    lastRefreshedAt: timestamptz('last_refreshed_at').notNull().defaultNow(),
    expiresAt: timestamptz('expires_at').notNull(),
    revokedAt: timestamptz('revoked_at'),
    revokedReason: sessionRevokedReason('revoked_reason'),
    ...timestamps(),
  },
  (t) => [
    index('user_sessions_user_active_idx')
      .on(t.userId)
      .where(and(isNull(t.revokedAt), isNull(t.deletedAt))!),
    index('user_sessions_previous_refresh_token_hash_idx').on(t.previousRefreshTokenHash),
    index('user_sessions_expires_at_idx').on(t.expiresAt),
    index('user_sessions_ip_hmac_idx').on(t.ipHmac).where(isNull(t.deletedAt)),
  ],
);
