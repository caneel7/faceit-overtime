import type { AuthMethod, DbClient } from '@overtime/db';

export type RateLimiter = { limit(options: { key: string }): Promise<{ success: boolean }> };

export type Bindings = {
  ENVIRONMENT: 'production' | 'development';
  APP_URL: string;
  VERSION: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  MAILER: 'resend' | 'zeptomail';
  ZEPTOMAIL_URL: string;
  HYPERDRIVE: { connectionString: string };
  AUTH_QUEUE: { send(body: unknown): Promise<void> };
  SIGNIN_LIMITER: RateLimiter;
  IP_LIMITER: RateLimiter;
  EMAIL_LIMITER: RateLimiter;
  JWT_SIGNING_KEY: string;
  PII_ENCRYPTION_KEY: string;
  PII_HMAC_KEY: string;
  RESEND_API_KEY: string;
  ZEPTOMAIL_TOKEN: string;
};

export type Auth = { userId: string; sessionId: string; amr: AuthMethod[] };

export type Variables = {
  db: DbClient;
  auth: Auth | null;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
