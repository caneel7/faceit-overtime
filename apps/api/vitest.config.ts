import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Local runs read DATABASE_URL from the gitignored .env; CI passes it as an environment variable
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({});
