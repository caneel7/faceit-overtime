import { AUTH_METHODS, type AuthMethod } from '@overtime/db';
import { z } from '@overtime/shared';
import {
  calculateJwkThumbprint,
  exportJWK,
  importJWK,
  importPKCS8,
  jwtVerify,
  SignJWT,
  type JWK,
  type JWTHeaderParameters,
} from 'jose';

export const ISSUER = 'overtime';
export const ACCESS_TOKEN_TTL_SECONDS = 600;
export const OAUTH_STATE_TTL_SECONDS = 600;

const ALG = 'ES256';
const ACCESS_TYP = 'at+jwt';
const OAUTH_TYP = 'oauth+jwt';

type SigningKey = { privateKey: CryptoKey; publicKey: CryptoKey; publicJwk: JWK & { kid: string } };

const keyCache = new Map<string, Promise<SigningKey>>();

async function loadKey(pem: string): Promise<SigningKey> {
  const privateKey = await importPKCS8(pem.replace(/\\n/g, '\n'), ALG, { extractable: true });
  const { kty, crv, x, y } = await exportJWK(privateKey);
  const jwk: JWK = { kty, crv, x, y };
  const kid = await calculateJwkThumbprint(jwk);
  const publicKey = (await importJWK(jwk, ALG)) as CryptoKey;
  return { privateKey, publicKey, publicJwk: { ...jwk, kid, alg: ALG, use: 'sig' } };
}

function signingKey(pem: string): Promise<SigningKey> {
  let key = keyCache.get(pem);
  if (!key) {
    key = loadKey(pem);
    keyCache.set(pem, key);
  }
  return key;
}

async function verify(pem: string, token: string, typ: string) {
  const key = await signingKey(pem);
  const { payload } = await jwtVerify(
    token,
    (header: JWTHeaderParameters) => {
      if (header.kid !== key.publicJwk.kid) throw new Error('Unknown signing key');
      return key.publicKey;
    },
    { algorithms: [ALG], issuer: ISSUER, audience: ISSUER, typ },
  );
  return payload;
}

export async function publicJwks(pem: string): Promise<{ keys: JWK[] }> {
  return { keys: [(await signingKey(pem)).publicJwk] };
}

export type AccessClaims = { userId: string; sessionId: string; amr: AuthMethod[] };

const AccessPayload = z.object({
  sub: z.string(),
  sid: z.string(),
  amr: z.array(z.enum(AUTH_METHODS)).min(1),
});

export async function signAccessToken(pem: string, claims: AccessClaims): Promise<string> {
  const key = await signingKey(pem);
  return new SignJWT({ sid: claims.sessionId, amr: claims.amr })
    .setProtectedHeader({ alg: ALG, typ: ACCESS_TYP, kid: key.publicJwk.kid })
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(key.privateKey);
}

export async function verifyAccessToken(pem: string, token: string): Promise<AccessClaims | null> {
  try {
    const payload = AccessPayload.parse(await verify(pem, token, ACCESS_TYP));
    return { userId: payload.sub, sessionId: payload.sid, amr: payload.amr };
  } catch {
    return null;
  }
}

export const OAuthState = z.object({
  state: z.string(),
  verifier: z.string(),
  next: z.string(),
  intent: z.enum(['sign_in', 'link']),
  sub: z.string().optional(),
});
export type OAuthState = z.infer<typeof OAuthState>;

export async function signOAuthState(pem: string, state: OAuthState): Promise<string> {
  const key = await signingKey(pem);
  return new SignJWT(state)
    .setProtectedHeader({ alg: ALG, typ: OAUTH_TYP, kid: key.publicJwk.kid })
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${OAUTH_STATE_TTL_SECONDS}s`)
    .sign(key.privateKey);
}

export async function verifyOAuthState(pem: string, token: string): Promise<OAuthState | null> {
  try {
    return OAuthState.parse(await verify(pem, token, OAUTH_TYP));
  } catch {
    return null;
  }
}
