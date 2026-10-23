import type { Bindings } from '../src/env';

const allowAll = { limit: async () => ({ success: true }) };

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
    EMAIL_FROM: 'no-reply@example.test',
    AUTH_QUEUE: { send: async () => {} },
    EMAIL_FROM_NAME: 'Overtime',
    MAILER: 'resend',
    ZEPTOMAIL_URL: 'https://zeptomail.invalid/v1.1/email',
    SIGNIN_LIMITER: allowAll,
    IP_LIMITER: allowAll,
    EMAIL_LIMITER: allowAll,
    RESEND_API_KEY: '',
    ZEPTOMAIL_TOKEN: '',
    JWT_SIGNING_KEY: '',
    PII_ENCRYPTION_KEY: '',
    PII_HMAC_KEY: '',
    ...overrides,
  } as Bindings;
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
