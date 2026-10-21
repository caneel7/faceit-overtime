import { HealthResponse } from '@overtime/shared';
import { describe, expect, it } from 'vitest';
import app from '../../index';
import type { Bindings } from '../../env';

const env: Bindings = {
  ENVIRONMENT: 'development',
  APP_URL: 'http://localhost:3000',
  VERSION: 'v0.0.0-test',
};

describe('GET /api/health', () => {
  it('returns ok with the deployed version', async () => {
    const res = await app.request('/api/health', {}, env);
    expect(res.status).toBe(200);
    expect(HealthResponse.parse(await res.json())).toEqual({
      status: 'ok',
      version: 'v0.0.0-test',
    });
  });
});
