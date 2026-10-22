import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  // only needed by `migrate`; `generate` diffs the schema against the committed snapshots
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  migrations: { schema: 'drizzle', table: '__drizzle_migrations' },
  strict: true,
});
