import { sql } from 'drizzle-orm';
import { bigint, check, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { baseColumns, live, timestamptz } from './columns';
import { users } from './users';

export const AUTH_METHODS = ['faceit', 'totp', 'trusted_device'] as const;
export const SESSION_REVOKED_REASONS = [
  'logout',
  'reuse_detected',
  'user_revoked',
  'two_factor_reset',
] as const;

const inList = (values: readonly string[]) => sql.raw(values.map((v) => `'${v}'`).join(', '));

export const userTwoFactors = pgTable(
  'user_two_factors',
  {
    ...baseColumns(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: text('type', { enum: ['totp'] })
      .notNull()
      .default('totp'),
    secretEncrypted: text('secret_encrypted').notNull(),
    lastUsedStep: bigint('last_used_step', { mode: 'number' }),
    enabledAt: timestamptz('enabled_at'),
  },
  (t) => [
    uniqueIndex('user_two_factors_user_type_key').on(t.userId, t.type).where(live),
    check('user_two_factors_type_check', sql`${t.type} in ('totp')`),
  ],
);

export const trustedDevices = pgTable(
  'trusted_devices',
  {
    ...baseColumns(),
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
  },
  (t) => [
    index('trusted_devices_user_active_idx')
      .on(t.userId)
      .where(sql`revoked_at is null and deleted_at is null`),
    index('trusted_devices_ip_hmac_idx').on(t.ipHmac).where(live),
    check('trusted_devices_expiry_check', sql`${t.expiresAt} > ${t.createdAt}`),
  ],
);

export const userSessions = pgTable(
  'user_sessions',
  {
    ...baseColumns(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    refreshTokenHash: text('refresh_token_hash')
      .notNull()
      .unique('user_sessions_refresh_token_hash_key'),
    previousRefreshTokenHash: text('previous_refresh_token_hash'),
    authMethods: text('auth_methods', { enum: AUTH_METHODS }).array().notNull(),
    trustedDeviceId: uuid('trusted_device_id').references(() => trustedDevices.id),
    userAgent: text('user_agent'),
    ipEncrypted: text('ip_encrypted'),
    ipHmac: text('ip_hmac'),
    lastRefreshedAt: timestamptz('last_refreshed_at').notNull().defaultNow(),
    expiresAt: timestamptz('expires_at').notNull(),
    revokedAt: timestamptz('revoked_at'),
    revokedReason: text('revoked_reason', { enum: SESSION_REVOKED_REASONS }),
  },
  (t) => [
    index('user_sessions_user_active_idx')
      .on(t.userId)
      .where(sql`revoked_at is null and deleted_at is null`),
    index('user_sessions_previous_refresh_token_hash_idx').on(t.previousRefreshTokenHash),
    index('user_sessions_expires_at_idx').on(t.expiresAt),
    index('user_sessions_ip_hmac_idx').on(t.ipHmac).where(live),
    check(
      'user_sessions_auth_methods_check',
      sql`${t.authMethods} <@ array[${inList(AUTH_METHODS)}]::text[] and 'faceit' = any(${t.authMethods})`,
    ),
    check(
      'user_sessions_revoked_reason_check',
      sql`${t.revokedReason} in (${inList(SESSION_REVOKED_REASONS)})`,
    ),
    check(
      'user_sessions_revoked_check',
      sql`(${t.revokedAt} is null) = (${t.revokedReason} is null)`,
    ),
  ],
);
