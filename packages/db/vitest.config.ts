import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Local runs read DATABASE_URL from the gitignored .env; CI passes it as an environment variable
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  // integration tests make several round trips to a remote database
  test: { testTimeout: 30_000, hookTimeout: 30_000 },
});
