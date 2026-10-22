import type { DbClient } from '@overtime/db';

export type Bindings = {
  ENVIRONMENT: 'production' | 'development';
  APP_URL: string;
  VERSION: string;
  // only the field we use, so apps/web (which reads AppType without the Workers types) still typechecks
  HYPERDRIVE: { connectionString: string };
};

export type Variables = {
  db: DbClient;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
