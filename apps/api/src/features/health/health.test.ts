import { ErrorBody, HealthResponse } from '@overtime/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { testCtx, testEnv } from '../../../test/env';
import app from '../../index';

const { ctx, settle } = testCtx();
afterEach(() => settle());

if (process.env.REQUIRE_DATABASE && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required (REQUIRE_DATABASE is set)');
}

describe('GET /api/health', () => {
  it.skipIf(!process.env.DATABASE_URL)(
    'returns ok, the version and db ok against a real database',
    async () => {
      const res = await app.request('/api/health', {}, testEnv({}, process.env.DATABASE_URL), ctx);
      expect(res.status).toBe(200);
      expect(HealthResponse.parse(await res.json())).toEqual({
        status: 'ok',
        version: 'v0.0.0-test',
        db: 'ok',
      });
    },
  );

  it.each(['development', 'production'] as const)(
    'returns 503 SERVICE_UNAVAILABLE quickly when the database is unreachable (%s)',
    async (ENVIRONMENT) => {
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      const started = Date.now();
      const res = await app.request('/api/health', {}, testEnv({ ENVIRONMENT }), ctx);

      expect(Date.now() - started).toBeLessThan(2500);
      expect(res.status).toBe(503);
      expect(ErrorBody.parse(await res.json())).toEqual({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database unavailable',
          details: { db: 'down' },
        },
      });
      // the cause is logged, never returned
      expect(log).toHaveBeenCalledWith(expect.stringContaining('"cause"'));
      log.mockRestore();
    },
  );
});
