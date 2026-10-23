import {
  createLocalJWKSet,
  jwtVerify,
  SignJWT,
  generateKeyPair,
  decodeProtectedHeader,
} from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { testSecret, testSigningKey } from '../../test/keys';
import { blindIndex, decrypt, encrypt, normalizeEmail, normalizeIp } from './crypto';
import {
  publicJwks,
  signAccessToken,
  signOAuthState,
  verifyAccessToken,
  verifyOAuthState,
} from './jwt';
import { safeNext } from './redirect';

describe('encryption at rest', () => {
  const key = testSecret();

  it('round-trips and refuses ciphertext moved to another column or tampered with', async () => {
    const value = await encrypt(key, 'admin@uni-esports.club', 'users.email');
    expect(value).toMatch(/^v1\.[\w-]+\.[\w-]+$/);
    expect(value).not.toContain('admin');
    expect(await decrypt(key, value, 'users.email')).toBe('admin@uni-esports.club');
    await expect(decrypt(key, value, 'user_sessions.ip')).rejects.toThrow();
    await expect(decrypt(key, value.slice(0, -2) + 'AA', 'users.email')).rejects.toThrow();
  });

  it('gives one blind index per normalised email or IP, separated by domain', async () => {
    const hmac = testSecret();
    const a = await blindIndex(hmac, 'email', normalizeEmail(' Admin@Uni-Esports.Club '));
    const b = await blindIndex(hmac, 'email', normalizeEmail('admin@uni-esports.club'));
    expect(a).toBe(b);
    expect(await blindIndex(hmac, 'ip', normalizeIp('::ffff:1.2.3.4'))).toBe(
      await blindIndex(hmac, 'ip', normalizeIp('1.2.3.4')),
    );
    expect(normalizeIp('2001:0DB8:0000:0000:0000:0000:0000:0001')).toBe('2001:db8::1');
    expect(await blindIndex(hmac, 'ip', 'x')).not.toBe(await blindIndex(hmac, 'email', 'x'));
  });
});

describe('access tokens', () => {
  let pem: string;
  const claims = { userId: 'u1', sessionId: 's1', amr: ['password' as const] };

  beforeAll(async () => {
    pem = await testSigningKey();
  });

  it('are ES256 with the JWKS kid and verify with only the published public key', async () => {
    const token = await signAccessToken(pem, claims);
    const header = decodeProtectedHeader(token);
    const jwks = await publicJwks(pem);
    expect(header).toMatchObject({ alg: 'ES256', typ: 'at+jwt', kid: jwks.keys[0]!.kid });
    expect(jwks.keys[0]).not.toHaveProperty('d');

    const { payload } = await jwtVerify(token, createLocalJWKSet(jwks), {
      issuer: 'overtime',
      audience: 'overtime',
    });
    expect(payload).toMatchObject({ sub: 'u1', sid: 's1', amr: ['password'] });
    expect(payload.exp! - payload.iat!).toBe(600);
    expect(await verifyAccessToken(pem, token)).toEqual(claims);
  });

  it('rejects forged, expired, wrongly typed and tampered tokens', async () => {
    const otherPem = await testSigningKey();
    const fromOtherKey = await signAccessToken(otherPem, claims);
    const oauthState = await signOAuthState(pem, {
      state: 's',
      verifier: 'v',
      next: '/',
      intent: 'sign_in',
    });
    const hs256 = await new SignJWT({ sid: 's1', amr: ['password'] })
      .setProtectedHeader({ alg: 'HS256', typ: 'at+jwt' })
      .setIssuer('overtime')
      .setAudience('overtime')
      .setSubject('u1')
      .setExpirationTime('10m')
      .sign(new TextEncoder().encode('x'.repeat(32)));
    const { privateKey } = await generateKeyPair('ES256');
    const kid = (await publicJwks(pem)).keys[0]!.kid;
    const expired = await new SignJWT({ sid: 's1', amr: ['password'] })
      .setProtectedHeader({ alg: 'ES256', typ: 'at+jwt', kid })
      .setIssuer('overtime')
      .setAudience('overtime')
      .setSubject('u1')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 1200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 600)
      .sign(privateKey);
    const valid = await signAccessToken(pem, claims);
    const [h, p, s] = valid.split('.');
    const tampered = [h, p!.slice(0, -2) + (p!.endsWith('A') ? 'BB' : 'AA'), s].join('.');

    for (const token of [fromOtherKey, oauthState, hs256, expired, tampered, 'not-a-jwt']) {
      expect(await verifyAccessToken(pem, token)).toBeNull();
    }
    expect(await verifyOAuthState(pem, valid)).toBeNull();
    expect(await verifyOAuthState(pem, oauthState)).toMatchObject({ intent: 'sign_in' });
  });
});

describe('safeNext', () => {
  it.each([
    ['/x', '/x'],
    ['/o/demo/t/open?tab=standings', '/o/demo/t/open?tab=standings'],
    ['//evil.com', '/dashboard'],
    ['https://evil.com', '/dashboard'],
    ['/\\evil.com', '/dashboard'],
    ['/%0d%0aSet-Cookie:x', '/%0d%0aSet-Cookie:x'],
    ['/\nx', '/dashboard'],
    ['', '/dashboard'],
    [undefined, '/dashboard'],
  ])('%j → %j', (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });
});
