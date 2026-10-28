import {
  ConflictError,
  users,
  userSessions,
  userTokens,
  type DbClient,
  type UserTokenPurpose,
} from '@overtime/db';
import type { SessionResponse } from '@overtime/shared';
import { AppError } from '@overtime/shared/hono';
import type { Bindings } from '../../env';
import { blindIndex, encrypt, normalizeEmail, randomToken, sha256Hex } from '../../lib/crypto';
import { dummyPasswordHash, hashPassword, verifyPassword } from '../../lib/password';
import { EMAIL_AAD } from '../me/service';
import { createSession, sessionResponse } from './sessions';

const HOUR = 60 * 60 * 1000;
const TOKEN_LIFETIME: Record<UserTokenPurpose, number> = {
  email_verification: 24 * HOUR,
  password_reset: 30 * 60 * 1000,
  account_activation: 7 * 24 * HOUR,
  email_add: 24 * HOUR,
};

type Client = { userAgent: string | null; ip: string | null };
type NewSession = { body: SessionResponse; refreshToken: string };

export function emailTaken(): AppError {
  return new AppError('EMAIL_TAKEN', 409, 'This email already has an account');
}

function invalidToken(): AppError {
  return new AppError('INVALID_TOKEN', 400, 'This link is invalid or has expired');
}

export async function emailHmac(env: Bindings, email: string): Promise<string> {
  return blindIndex(env.PII_HMAC_KEY, 'email', normalizeEmail(email));
}

export async function isEmailAvailable(db: DbClient, env: Bindings, email: string) {
  const hmac = await emailHmac(env, email);
  return !(await db.global.for(users).findOne({ where: { emailHmac: hmac } }));
}

async function issueToken(db: DbClient, userId: string, purpose: UserTokenPurpose) {
  const token = randomToken();
  const tokens = db.forUser(userId).for(userTokens);
  await tokens.softDeleteWithWhere({ purpose, usedAt: null });
  await tokens.insert({
    purpose,
    tokenHash: await sha256Hex(token),
    expiresAt: new Date(Date.now() + TOKEN_LIFETIME[purpose]),
  });
  return token;
}

async function consumeToken(db: DbClient, token: string, purpose: UserTokenPurpose) {
  const now = new Date();
  const [used] = await db.system
    .for(userTokens)
    .updateWithWhere(
      { tokenHash: await sha256Hex(token), purpose, usedAt: null, 'expiresAt >': now },
      { usedAt: now },
    );
  if (!used) throw invalidToken();
  return used.userId;
}

async function openSession(db: DbClient, env: Bindings, userId: string, client: Client) {
  const session = await createSession(db, env, { userId, authMethods: ['password'], ...client });
  return {
    body: await sessionResponse(db, env, { userId, ...session }),
    refreshToken: session.refreshToken,
  };
}

export async function register(
  db: DbClient,
  env: Bindings,
  input: { email: string; password: string; displayName: string },
): Promise<{ email: string; token: string }> {
  const email = normalizeEmail(input.email);
  const hmac = await emailHmac(env, email);
  if (await db.global.for(users).findOne({ where: { emailHmac: hmac } })) throw emailTaken();

  const passwordHash = await hashPassword(input.password);
  const emailEncrypted = await encrypt(env.PII_ENCRYPTION_KEY, email, EMAIL_AAD);
  const token = await db
    .transaction(async (tx) => {
      const user = await tx.global
        .for(users)
        .insert({ displayName: input.displayName, emailEncrypted, emailHmac: hmac, passwordHash });
      return issueToken(tx, user.id, 'email_verification');
    })
    .catch((err: unknown) => {
      throw err instanceof ConflictError ? emailTaken() : err;
    });
  return { email, token };
}

export async function verifyEmail(
  db: DbClient,
  env: Bindings,
  token: string,
  client: Client,
): Promise<NewSession> {
  return db.transaction(async (tx) => {
    const userId = await consumeToken(tx, token, 'email_verification');
    const user = await tx.global.for(users).getById(userId);
    if (!user.emailVerifiedAt)
      await tx.global.for(users).update(userId, { emailVerifiedAt: new Date() });
    return openSession(tx, env, userId, client);
  });
}

export async function resendVerification(db: DbClient, env: Bindings, email: string) {
  const user = await db.global
    .for(users)
    .findOne({ where: { emailHmac: await emailHmac(env, email), emailVerifiedAt: null } });
  if (!user?.passwordHash) return null;
  return {
    email: normalizeEmail(email),
    token: await issueToken(db, user.id, 'email_verification'),
  };
}

export async function login(
  db: DbClient,
  env: Bindings,
  input: { email: string; password: string },
  client: Client,
): Promise<NewSession> {
  const user = await db.global
    .for(users)
    .findOne({ where: { emailHmac: await emailHmac(env, input.email) } });
  const stored = user?.passwordHash ?? (await dummyPasswordHash());
  const result = await verifyPassword(stored, input.password);
  if (!user?.passwordHash || !result.ok) {
    throw new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect');
  }
  if (!user.emailVerifiedAt) {
    throw new AppError('EMAIL_NOT_VERIFIED', 403, 'Verify your email before signing in');
  }
  if (result.needsRehash) {
    await db.global
      .for(users)
      .update(user.id, { passwordHash: await hashPassword(input.password) });
  }
  return openSession(db, env, user.id, client);
}

export async function forgotPassword(db: DbClient, env: Bindings, email: string) {
  const user = await db.global
    .for(users)
    .findOne({ where: { emailHmac: await emailHmac(env, email) } });
  if (!user?.passwordHash) return null;
  return { email: normalizeEmail(email), token: await issueToken(db, user.id, 'password_reset') };
}

export async function resetPassword(
  db: DbClient,
  env: Bindings,
  input: { token: string; password: string },
  client: Client,
): Promise<NewSession> {
  const passwordHash = await hashPassword(input.password);
  return db.transaction(async (tx) => {
    const userId = await consumeToken(tx, input.token, 'password_reset');
    const user = await tx.global.for(users).getById(userId);
    const now = new Date();
    await tx.global
      .for(users)
      .update(userId, { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? now });
    await tx
      .forUser(userId)
      .for(userSessions)
      .updateWithWhere({ revokedAt: null }, { revokedAt: now, revokedReason: 'password_reset' });
    return openSession(tx, env, userId, client);
  });
}
