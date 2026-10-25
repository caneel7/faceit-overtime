import { ConflictError, userIdentities, users, userSessions, type DbClient } from '@overtime/db';
import { DisplayName } from '@overtime/shared';
import type { Bindings } from '../../env';
import { FaceitClient } from '../../faceit/client';
import { FaceitOAuth } from '../../faceit/oauth';
import { upsertPlayer } from '../../faceit/players';
import type { FaceitIdentity, FaceitPlayer } from '../../faceit/schemas';
import { randomToken, sha256Hex, timingSafeEqual } from '../../lib/crypto';
import { signOAuthState, verifyOAuthState, type OAuthState } from '../../lib/jwt';
import { createSession } from './sessions';

type Client = { userAgent: string | null; ip: string | null };

export type CallbackQuery = { code?: string; state?: string; error?: string };
export type CallbackResult = { location: string; refreshToken?: string };

function logFailure(event: string, err: unknown) {
  console.error(
    JSON.stringify({
      level: 'error',
      event,
      error: err instanceof Error ? err.message : String(err),
    }),
  );
}

function displayNameFrom(nickname: string): string {
  const parsed = DisplayName.safeParse(nickname.slice(0, 32));
  return parsed.success ? parsed.data : 'FACEIT player';
}

export async function startFaceit(
  env: Bindings,
  input: Pick<OAuthState, 'next' | 'intent' | 'sub'>,
): Promise<{ url: string; stateCookie: string }> {
  const state = randomToken();
  const verifier = randomToken();
  return {
    url: await FaceitOAuth.fromEnv(env).authorizeUrl({ state, verifier }),
    stateCookie: await signOAuthState(env.JWT_SIGNING_KEY, { state, verifier, ...input }),
  };
}

async function faceitUser(
  db: DbClient,
  faceit: FaceitIdentity,
  stats: FaceitPlayer | null,
): Promise<string> {
  const attempt = () =>
    db.transaction(async (tx) => {
      const player = await upsertPlayer(tx, faceit, stats);
      const identity = await tx.system
        .for(userIdentities)
        .findOne({ where: { provider: 'faceit', providerUserId: faceit.faceitPlayerId } });
      if (identity) return identity.userId;
      const user = await tx.global
        .for(users)
        .insert({ displayName: displayNameFrom(faceit.nickname), playerId: player.id });
      await tx
        .forUser(user.id)
        .for(userIdentities)
        .insert({ provider: 'faceit', providerUserId: faceit.faceitPlayerId });
      return user.id;
    });
  return attempt().catch((err: unknown) => {
    if (err instanceof ConflictError) return attempt();
    throw err;
  });
}

async function linkFaceit(
  db: DbClient,
  userId: string,
  refreshToken: string | undefined,
  faceit: FaceitIdentity,
  stats: FaceitPlayer | null,
): Promise<string> {
  const failed = (error: string) => `/settings?error=${error}`;
  if (!refreshToken) return failed('session_mismatch');
  const hash = await sha256Hex(refreshToken);
  const now = new Date();
  const session = await db.system.for(userSessions).findOne({
    where: [
      { refreshTokenHash: hash, revokedAt: null, 'expiresAt >': now },
      { previousRefreshTokenHash: hash, revokedAt: null, 'expiresAt >': now },
    ],
  });
  if (!session || session.userId !== userId) return failed('session_mismatch');

  const existing = await db.system
    .for(userIdentities)
    .findOne({ where: { provider: 'faceit', providerUserId: faceit.faceitPlayerId } });
  if (existing) {
    return existing.userId === userId ? '/settings?connected=faceit' : failed('identity_in_use');
  }
  const own = await db
    .forUser(userId)
    .for(userIdentities)
    .findOne({ where: { provider: 'faceit' } });
  if (own) return failed('already_connected');

  try {
    await db.transaction(async (tx) => {
      const player = await upsertPlayer(tx, faceit, stats);
      await tx
        .forUser(userId)
        .for(userIdentities)
        .insert({ provider: 'faceit', providerUserId: faceit.faceitPlayerId });
      await tx.global.for(users).update(userId, { playerId: player.id });
    });
  } catch (err) {
    if (!(err instanceof ConflictError)) throw err;
    return failed(
      err.constraint === 'user_identities_user_provider_key'
        ? 'already_connected'
        : 'identity_in_use',
    );
  }
  return '/settings?connected=faceit';
}

export async function completeFaceit(
  db: DbClient,
  env: Bindings,
  input: {
    query: CallbackQuery;
    stateCookie: string | undefined;
    refreshToken: string | undefined;
    client: Client;
  },
): Promise<CallbackResult> {
  const oauth = input.stateCookie
    ? await verifyOAuthState(env.JWT_SIGNING_KEY, input.stateCookie)
    : null;
  if (!oauth) return { location: '/signin?error=state_mismatch' };
  const failed = (error: string): CallbackResult => ({
    location: oauth.intent === 'link' ? `/settings?error=${error}` : `/signin?error=${error}`,
  });

  const { code, state, error } = input.query;
  if (error) return failed(error === 'access_denied' ? 'access_denied' : 'faceit_unavailable');
  if (!code || !state || !timingSafeEqual(state, oauth.state)) return failed('state_mismatch');

  let faceit: FaceitIdentity;
  try {
    faceit = await FaceitOAuth.fromEnv(env).identify(code, oauth.verifier);
  } catch (err) {
    logFailure('faceit_oauth_failed', err);
    return failed('faceit_unavailable');
  }
  const stats = await FaceitClient.fromEnv(env)
    .player(faceit.faceitPlayerId)
    .catch((err: unknown) => {
      logFailure('faceit_data_failed', err);
      return null;
    });

  if (oauth.intent === 'link') {
    if (!oauth.sub) return failed('session_mismatch');
    return { location: await linkFaceit(db, oauth.sub, input.refreshToken, faceit, stats) };
  }

  const userId = await faceitUser(db, faceit, stats);
  const session = await createSession(db, env, {
    userId,
    authMethods: ['faceit'],
    ...input.client,
  });
  return { location: oauth.next, refreshToken: session.refreshToken };
}
