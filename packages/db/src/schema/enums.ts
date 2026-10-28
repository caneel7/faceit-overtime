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
  'account_activation',
  'email_add',
]);
export const orgRole = pgEnum('org_role', ['owner', 'admin']);
export const inviteStatus = pgEnum('invite_status', [
  'pending',
  'accepted',
  'declined',
  'revoked',
  'expired',
]);
export const tournamentStatus = pgEnum('tournament_status', [
  'draft',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled',
]);
export const game = pgEnum('game', ['cs2']);
export const region = pgEnum('region', ['EU', 'NA', 'SA', 'OCE', 'SEA']);
export const teamRole = pgEnum('team_role', ['player', 'coach']);

export const AUTH_METHODS = authMethod.enumValues;
export const SESSION_REVOKED_REASONS = sessionRevokedReason.enumValues;
export const IDENTITY_PROVIDERS = identityProvider.enumValues;
export const USER_TOKEN_PURPOSES = userTokenPurpose.enumValues;
export const ORG_ROLES = orgRole.enumValues;
export const INVITE_STATUSES = inviteStatus.enumValues;
export const TOURNAMENT_STATUSES = tournamentStatus.enumValues;
export const GAMES = game.enumValues;
export const REGIONS = region.enumValues;
export const TEAM_ROLES = teamRole.enumValues;

export type AuthMethod = (typeof AUTH_METHODS)[number];
export type SessionRevokedReason = (typeof SESSION_REVOKED_REASONS)[number];
export type IdentityProviderName = (typeof IDENTITY_PROVIDERS)[number];
export type UserTokenPurpose = (typeof USER_TOKEN_PURPOSES)[number];
export type OrgRole = (typeof ORG_ROLES)[number];
export type InviteStatus = (typeof INVITE_STATUSES)[number];
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];
export type Game = (typeof GAMES)[number];
export type Region = (typeof REGIONS)[number];
export type TeamRole = (typeof TEAM_ROLES)[number];
