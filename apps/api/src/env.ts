export type Bindings = {
  ENVIRONMENT: 'production' | 'development';
  APP_URL: string;
  VERSION: string;
};

export type AppEnv = {
  Bindings: Bindings;
};
