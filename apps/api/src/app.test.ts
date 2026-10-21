import { ErrorBody } from '@overtime/shared';
import { describe, expect, it } from 'vitest';
import type { Bindings } from './env';
import app from './index';

const env: Bindings = {
  ENVIRONMENT: 'production',
  APP_URL: 'https://overtime.caneel.dev',
  VERSION: 'v0.0.0-test',
};

describe('OpenAPI', () => {
  it('serves an OpenAPI 3.1 document with the health route and error responses', async () => {
    const res = await app.request('/api/openapi.json', {}, env);
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
          get: { responses: { 200: jsonWith('version'), 500: jsonWith('error') } },
        },
      },
    });
    expect(Object.keys(spec.paths)).toEqual(['/api/health']);
  });

  it('serves the API reference page', async () => {
    const res = await app.request('/api/docs', {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });
});

describe('global behaviour', () => {
  it('returns 404 NOT_FOUND for unknown routes', async () => {
    const res = await app.request('/api/nope', {}, env);
    expect(res.status).toBe(404);
    expect(ErrorBody.parse(await res.json()).error.code).toBe('NOT_FOUND');
  });

  it('sends no CORS headers', async () => {
    const res = await app.request(
      '/api/health',
      { headers: { origin: 'https://evil.example' } },
      env,
    );
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
