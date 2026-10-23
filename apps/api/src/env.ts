import type { AuthMethod, DbClient } from '@overtime/db';

export type Bindings = {
  ENVIRONMENT: 'production' | 'development';
  APP_URL: string;
  VERSION: string;
  HYPERDRIVE: { connectionString: string };
  JWT_SIGNING_KEY: string;
  PII_ENCRYPTION_KEY: string;
  PII_HMAC_KEY: string;
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
