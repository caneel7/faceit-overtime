import { userSessions, type DbClient } from '@overtime/db';
import { SessionResponse } from '@overtime/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, integrationEnv, openDb, testUsers } from '../../../test/auth';
import { testCtx } from '../../../test/env';
import type { Bindings } from '../../env';
import { decrypt } from '../../lib/crypto';
import app from '../../index';
import { IP_AAD } from './sessions';

function cookies(res: Response): Record<string, string> {
  return Object.fromEntries(
    res.headers.getSetCookie().map((line) => {
      const [pair] = line.split(';');
      const [name, value] = pair!.split('=');
      return [name!.trim(), line.includes('Max-Age=0') ? '' : value!];
    }),
  );
}

describe.skipIf(!databaseUrl)('sessions (integration)', () => {
  let env: Bindings;
  let db: DbClient;
  let people: ReturnType<typeof testUsers>;
  const { ctx, settle } = testCtx();

  const refresh = (token: string) =>
    app.request(
      '/api/auth/refresh',
      { method: 'POST', headers: { cookie: `ot_rt=${token}` } },
      env,
      ctx,
    );
  const me = (accessToken?: string) =>
    app.request(
      '/api/me',
      { headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {} },
      env,
      ctx,
    );

  beforeAll(async () => {
    env = await integrationEnv();
    db = openDb();
    people = testUsers(db, env);
  });

  afterAll(async () => {
    await settle();
    await people.cleanup();
    await db.close();
  });

  it('stores the IP encrypted, and refresh rotates the token and returns a new access token with the user', async () => {
    const user = await people.create('Club Admin');
    const session = await people.signIn(user.id);
    const row = await db.forUser(user.id).for(userSessions).getById(session.sessionId);
    expect(row.ipEncrypted).not.toContain('203.0.113.7');
    expect(await decrypt(env.PII_ENCRYPTION_KEY, row.ipEncrypted!, IP_AAD)).toBe('203.0.113.7');

    const res = await refresh(session.refreshToken);
    expect(res.status).toBe(200);
    const body = SessionResponse.parse(await res.json());
    expect(body.user.displayName).toBe('Club Admin');
    const set = cookies(res);
    expect(set.ot_rt).toBeTruthy();
    expect(set.ot_rt).not.toBe(session.refreshToken);
    expect(set).not.toHaveProperty('ot_at');
    expect(res.headers.getSetCookie().find((l) => l.startsWith('ot_rt='))).toMatch(
      /HttpOnly.*Path=\/api\/auth|Path=\/api\/auth.*HttpOnly/,
    );

    expect((await me(body.accessToken)).status).toBe(200);
    expect((await refresh(set.ot_rt!)).status).toBe(200);
  });

  it('a second tab presenting the old token within 30 s gets an access token without rotating again', async () => {
    const user = await people.create();
    const session = await people.signIn(user.id);
    expect((await refresh(session.refreshToken)).status).toBe(200);

    const again = await refresh(session.refreshToken);
    expect(again.status).toBe(200);
    expect(cookies(again)).not.toHaveProperty('ot_rt');
    expect(SessionResponse.parse(await again.json()).accessToken).toBeTruthy();
  });

  it('replaying a rotated token after the grace window revokes the whole session', async () => {
    const user = await people.create();
    const session = await people.signIn(user.id);
    const first = await refresh(session.refreshToken);
    const current = cookies(first).ot_rt!;
    await db.system
      .for(userSessions)
      .updateWithWhere(
        { id: session.sessionId },
        { lastRefreshedAt: new Date(Date.now() - 31_000) },
      );

    const replay = await refresh(session.refreshToken);
    expect(replay.status).toBe(401);
    expect(cookies(replay).ot_rt).toBe('');
    const row = await db.forUser(user.id).for(userSessions).getById(session.sessionId);
    expect(row.revokedReason).toBe('reuse_detected');
    expect((await refresh(current)).status).toBe(401);
  });

  it('logout revokes the session, clears cookies and is idempotent', async () => {
    const user = await people.create();
    const session = await people.signIn(user.id);
    const res = await app.request(
      '/api/auth/logout',
      { method: 'POST', headers: { cookie: `ot_rt=${session.refreshToken}` } },
      env,
      ctx,
    );
    expect(res.status).toBe(204);
    expect(cookies(res)).toMatchObject({ ot_rt: '', ot_s: '' });
    expect((await refresh(session.refreshToken)).status).toBe(401);
    expect((await app.request('/api/auth/logout', { method: 'POST' }, env, ctx)).status).toBe(204);
  });

  it('/me needs a Bearer token; a refresh cookie alone is not enough', async () => {
    const user = await people.create();
    const session = await people.signIn(user.id);
    expect((await me()).status).toBe(401);
    expect(
      (
        await app.request(
          '/api/me',
          { headers: { cookie: `ot_rt=${session.refreshToken}` } },
          env,
          ctx,
        )
      ).status,
    ).toBe(401);
    expect((await me(session.accessToken)).status).toBe(200);
  });

  it('publishes the public signing key', async () => {
    const res = await app.request('/.well-known/jwks.json', {}, env, ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('public, max-age=300');
    const { keys } = (await res.json()) as { keys: Record<string, string>[] };
    expect(keys[0]).toMatchObject({ kty: 'EC', crv: 'P-256', alg: 'ES256' });
    expect(keys[0]).not.toHaveProperty('d');
  });
});
