import { userSessions, type DbClient } from '@overtime/db';
import { SessionResponse } from '@overtime/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, integrationEnv, openDb, testUsers } from '../../../test/auth';
import { testCtx } from '../../../test/env';
import type { Bindings } from '../../env';
import { app } from '../../index';

function setCookies(res: Response): Record<string, string> {
  return Object.fromEntries(
    res.headers.getSetCookie().map((line) => {
      const [name, value] = line.split(';')[0]!.split('=');
      return [name!, line.includes('Max-Age=0') ? '' : value!];
    }),
  );
}

describe.skipIf(!databaseUrl)('sessions (integration)', () => {
  let env: Bindings;
  let db: DbClient;
  let people: ReturnType<typeof testUsers>;
  const { ctx, settle } = testCtx();

  const post = (path: string, refreshToken?: string) =>
    app.request(
      path,
      { method: 'POST', headers: refreshToken ? { cookie: `ot_rt=${refreshToken}` } : {} },
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

  it('refresh rotates the refresh token and returns a new access token in the body', async () => {
    const user = await people.create('Club Admin');
    const session = await people.signIn(user.id);

    const res = await post('/api/auth/refresh', session.refreshToken);
    expect(res.status).toBe(200);
    const body = SessionResponse.parse(await res.json());
    expect(body.user.displayName).toBe('Club Admin');
    const cookies = setCookies(res);
    expect(cookies.ot_rt).not.toBe(session.refreshToken);
    expect(cookies).not.toHaveProperty('ot_at');

    const me = await app.request(
      '/api/me',
      { headers: { authorization: `Bearer ${body.accessToken}` } },
      env,
      ctx,
    );
    expect(me.status).toBe(200);
  });

  it('replaying an old refresh token after the grace window revokes the whole session', async () => {
    const user = await people.create();
    const session = await people.signIn(user.id);
    const current = setCookies(await post('/api/auth/refresh', session.refreshToken)).ot_rt!;
    await db.system
      .for(userSessions)
      .updateWithWhere(
        { id: session.sessionId },
        { lastRefreshedAt: new Date(Date.now() - 31_000) },
      );

    expect((await post('/api/auth/refresh', session.refreshToken)).status).toBe(401);
    expect((await post('/api/auth/refresh', current)).status).toBe(401);
  });

  it('logout revokes the session and clears the cookies', async () => {
    const user = await people.create();
    const session = await people.signIn(user.id);

    const res = await post('/api/auth/logout', session.refreshToken);
    expect(res.status).toBe(204);
    expect(setCookies(res)).toMatchObject({ ot_rt: '', ot_s: '' });
    expect((await post('/api/auth/refresh', session.refreshToken)).status).toBe(401);
  });
});
