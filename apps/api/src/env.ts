import type { DbClient } from '@overtime/db';

export type Bindings = {
  ENVIRONMENT: 'production' | 'development';
  APP_URL: string;
  VERSION: string;
  HYPERDRIVE: { connectionString: string };
};

export type Variables = {
  db: DbClient;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
