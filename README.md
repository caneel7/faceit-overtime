# Overtime

Overtime is a platform I'm building for community esports organizers to run CS2 tournaments end to end: verified FACEIT rosters, automatic Swiss pairings, result tracking and live standings.

- App: https://overtime.caneel.dev
- API docs: https://overtime-api.caneel.dev/docs

> Unofficial — uses the FACEIT Data API. Not affiliated with or endorsed by FACEIT or ESL FACEIT Group.

## Stack

Turborepo + Bun workspaces, TypeScript throughout.

| Workspace         | What it is                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `apps/web`        | Next.js 16 on Cloudflare Workers (OpenNext). Proxies `/api/*` to the api over a service binding |
| `apps/api`        | Hono on Cloudflare Workers, OpenAPI spec generated from zod schemas                             |
| `packages/shared` | zod schemas and error codes (`.`), plus the server-only Hono base (`./hono`)                    |
| `packages/ui`     | Tailwind + shadcn/ui components, developed in Storybook                                         |
| `packages/engine` | Pure Swiss pairing engine (no I/O)                                                              |
| `packages/db`     | Drizzle schema, migrations and the scoped query layer the api uses for every query              |

## Running locally

Requires Bun 1.4+ and Node 22+.

The database is Neon Postgres 18. Locally I use a `dev` branch of the Neon project (direct, non-pooled connection string). Two gitignored `.env` files point at it:

```sh
# apps/api/.env: wrangler dev emulates Hyperdrive with this connection string
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgres://...
DATABASE_URL=postgres://...   # api integration tests

# packages/db/.env: migrations and db integration tests
DATABASE_URL=postgres://...
```

```sh
bun install
bun run --filter @overtime/db db:migrate
bun run dev          # web on :3000, api on :8787
```

Without `DATABASE_URL` the integration tests are skipped.

Other tasks: `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.

Storybook (local only): `bun run --filter @overtime/ui storybook`, then open http://localhost:6006. Story interaction and accessibility tests run in CI.

## Deploying

CI runs on every pull request to `main`. It also creates a short-lived Neon branch from production, runs the migrations on it, runs the integration tests and deletes the branch. Publishing a GitHub Release deploys that tag to production: migrations first, then the api, then web, followed by a smoke check that both hosts report the new version and a working database.

Each `wrangler.jsonc` has local development settings at the top level and production settings (custom domains, vars, service binding) in `env.production`, which is what the release deploys.

## Roadmap

Coming soon.
