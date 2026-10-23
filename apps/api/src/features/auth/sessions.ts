import {
  userSessions,
  type AuthMethod,
  type DbClient,
  type SessionRevokedReason,
} from '@overtime/db';
import type { SessionResponse } from '@overtime/shared';
import type { Bindings } from '../../env';
import { SESSION_TTL_SECONDS } from '../../lib/cookies';
import { blindIndex, encrypt, normalizeIp, randomToken, sha256Hex } from '../../lib/crypto';
import { ACCESS_TOKEN_TTL_SECONDS, signAccessToken, type AccessClaims } from '../../lib/jwt';
import { storableUserAgent } from '../../lib/user-agent';
import { loadMe } from '../me/service';

export const REFRESH_GRACE_MS = 30_000;
export const IP_AAD = 'user_sessions.ip';

type IssuedAccess = { accessToken: string; expiresAt: Date };

function sessionExpiry(from: Date): Date {
  return new Date(from.getTime() + SESSION_TTL_SECONDS * 1000);
}

export async function issueAccessToken(env: Bindings, claims: AccessClaims): Promise<IssuedAccess> {
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
  return { accessToken: await signAccessToken(env.JWT_SIGNING_KEY, claims), expiresAt };
}

export async function createSession(
  db: DbClient,
  env: Bindings,
  input: { userId: string; authMethods: AuthMethod[]; userAgent: string | null; ip: string | null },
): Promise<{ sessionId: string; refreshToken: string } & IssuedAccess> {
  const refreshToken = randomToken();
  const ip = input.ip ? normalizeIp(input.ip) : null;
  const session = await db
    .forUser(input.userId)
    .for(userSessions)
    .insert({
      refreshTokenHash: await sha256Hex(refreshToken),
      authMethods: input.authMethods,
      userAgent: storableUserAgent(input.userAgent),
      ipEncrypted: ip ? await encrypt(env.PII_ENCRYPTION_KEY, ip, IP_AAD) : null,
      ipHmac: ip ? await blindIndex(env.PII_HMAC_KEY, 'ip', ip) : null,
      expiresAt: sessionExpiry(new Date()),
    });
  const access = await issueAccessToken(env, {
    userId: input.userId,
    sessionId: session.id,
    amr: session.authMethods,
  });
  return { sessionId: session.id, refreshToken, ...access };
}

export type RotateResult =
  | ({ kind: 'rotated'; userId: string; refreshToken: string } & IssuedAccess)
  | ({ kind: 'grace'; userId: string } & IssuedAccess)
  | { kind: 'invalid' };

export async function rotateSession(
  db: DbClient,
  env: Bindings,
  presentedToken: string,
): Promise<RotateResult> {
  const sessions = db.system.for(userSessions);
  const oldHash = await sha256Hex(presentedToken);
  const refreshToken = randomToken();
  const now = new Date();

  const [rotated] = await sessions.updateWithWhere(
    { refreshTokenHash: oldHash, revokedAt: null, 'expiresAt >': now },
    {
      refreshTokenHash: await sha256Hex(refreshToken),
      previousRefreshTokenHash: oldHash,
      lastRefreshedAt: now,
      expiresAt: sessionExpiry(now),
    },
  );
  if (rotated) {
    const access = await issueAccessToken(env, {
      userId: rotated.userId,
      sessionId: rotated.id,
      amr: rotated.authMethods,
    });
    return { kind: 'rotated', userId: rotated.userId, refreshToken, ...access };
  }

  const previous = await sessions.findOne({
    where: { previousRefreshTokenHash: oldHash, revokedAt: null, 'expiresAt >': now },
  });
  if (!previous) return { kind: 'invalid' };

  if (now.getTime() - previous.lastRefreshedAt.getTime() <= REFRESH_GRACE_MS) {
    const access = await issueAccessToken(env, {
      userId: previous.userId,
      sessionId: previous.id,
      amr: previous.authMethods,
    });
    return { kind: 'grace', userId: previous.userId, ...access };
  }

  await sessions.updateWithWhere(
    { id: previous.id, revokedAt: null },
    { revokedAt: now, revokedReason: 'reuse_detected' },
  );
  console.warn(
    JSON.stringify({ level: 'warn', event: 'refresh_reuse_detected', sessionId: previous.id }),
  );
  return { kind: 'invalid' };
}

export async function revokeByRefreshToken(
  db: DbClient,
  presentedToken: string,
  reason: SessionRevokedReason,
): Promise<void> {
  const hash = await sha256Hex(presentedToken);
  await db.system.for(userSessions).updateWithWhere(
    [
      { refreshTokenHash: hash, revokedAt: null },
      { previousRefreshTokenHash: hash, revokedAt: null },
    ],
    { revokedAt: new Date(), revokedReason: reason },
  );
}

export async function sessionResponse(
  db: DbClient,
  env: Bindings,
  session: { userId: string } & IssuedAccess,
): Promise<SessionResponse> {
  return {
    ...(await loadMe(db, env, session.userId)),
    accessToken: session.accessToken,
    expiresAt: session.expiresAt.toISOString(),
  };
}
