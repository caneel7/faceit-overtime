import type { Bindings } from '../src/env';

export const UNREACHABLE_DB = 'postgres://overtime:overtime@127.0.0.1:1/overtime';

export function testEnv(
  overrides: Partial<Bindings> = {},
  connectionString = UNREACHABLE_DB,
): Bindings {
  return {
    ENVIRONMENT: 'development',
    APP_URL: 'http://localhost:3000',
    VERSION: 'v0.0.0-test',
    HYPERDRIVE: { connectionString },
    ...overrides,
  };
}

export function testCtx() {
  const pending: Promise<unknown>[] = [];
  const ctx = {
    waitUntil: (p: Promise<unknown>) => void pending.push(p),
    passThroughOnException: () => {},
    props: {},
  } as unknown as ExecutionContext;
  return { ctx, settle: () => Promise.allSettled(pending) };
}
