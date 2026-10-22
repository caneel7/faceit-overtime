import { pgEnum } from 'drizzle-orm/pg-core';

export const authMethod = pgEnum('auth_method', ['faceit', 'password', 'totp', 'trusted_device']);
export const sessionRevokedReason = pgEnum('session_revoked_reason', [
  'logout',
  'reuse_detected',
  'user_revoked',
  'two_factor_reset',
  'password_reset',
]);
export const twoFactorType = pgEnum('two_factor_type', ['totp']);
export const identityProvider = pgEnum('identity_provider', ['faceit']);
export const userTokenPurpose = pgEnum('user_token_purpose', [
  'email_verification',
  'password_reset',
]);

export const AUTH_METHODS = authMethod.enumValues;
export const SESSION_REVOKED_REASONS = sessionRevokedReason.enumValues;
export const IDENTITY_PROVIDERS = identityProvider.enumValues;
export const USER_TOKEN_PURPOSES = userTokenPurpose.enumValues;

export type AuthMethod = (typeof AUTH_METHODS)[number];
export type SessionRevokedReason = (typeof SESSION_REVOKED_REASONS)[number];
export type IdentityProviderName = (typeof IDENTITY_PROVIDERS)[number];
export type UserTokenPurpose = (typeof USER_TOKEN_PURPOSES)[number];
