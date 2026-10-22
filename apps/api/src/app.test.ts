import { ErrorBody } from '@overtime/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { testCtx, testEnv } from '../test/env';
import app from './index';

const env = testEnv({ ENVIRONMENT: 'production', APP_URL: 'https://overtime.caneel.dev' });
const { ctx, settle } = testCtx();
afterEach(() => settle());

describe('OpenAPI', () => {
  it('serves an OpenAPI 3.1 document with the health route and error responses', async () => {
    const res = await app.request('/openapi.json', {}, env, ctx);
    expect(res.status).toBe(200);
    const spec = (await res.json()) as { paths: Record<string, unknown> };
    const jsonWith = (property: string) => ({
      content: {
        'application/json': { schema: { properties: { [property]: expect.anything() } } },
      },
    });

    expect(spec).toMatchObject({
      openapi: expect.stringMatching(/^3\.1/),
      info: { title: 'Overtime API' },
      paths: {
        '/api/health': {
          get: {
            responses: { 200: jsonWith('db'), 503: jsonWith('error'), 500: jsonWith('error') },
          },
        },
      },
    });
    expect(Object.keys(spec.paths)).toEqual(['/api/health']);
  });

  it('serves the API reference page', async () => {
    const res = await app.request('/docs', {}, env, ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toContain('/openapi.json');
  });

  it('redirects the host root to the docs', async () => {
    const res = await app.request('/', {}, env, ctx);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/docs');
  });

  it.each(['/api/docs', '/api/openapi.json'])('no longer serves %s', async (path) => {
    const res = await app.request(path, {}, env, ctx);
    expect(res.status).toBe(404);
  });
});

describe('global behaviour', () => {
  it('returns 404 NOT_FOUND for unknown routes', async () => {
    const res = await app.request('/api/nope', {}, env, ctx);
    expect(res.status).toBe(404);
    expect(ErrorBody.parse(await res.json()).error.code).toBe('NOT_FOUND');
  });

  it('sends no CORS headers', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await app.request(
      '/api/health',
      { headers: { origin: 'https://evil.example' } },
      env,
      ctx,
    );
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
