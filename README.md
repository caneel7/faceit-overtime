# Overtime

Overtime is a platform I'm building for community esports organizers to run CS2 tournaments end to end: verified FACEIT rosters, automatic Swiss pairings, result tracking and live standings.

- App: https://overtime.caneel.dev
- API docs: https://overtime-api.caneel.dev/api/docs

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
| `packages/db`     | Drizzle schema and migrations                                                                   |

## Running locally

Requires Bun 1.4+ and Node 22+.

```sh
bun install
cp apps/api/.dev.vars.example apps/api/.dev.vars
bun run dev          # web on :3000, api on :8787
```

Other tasks: `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.

Storybook (local only): `bun run --filter @overtime/ui storybook`, then open http://localhost:6006. Story interaction and accessibility tests run in CI.

## Deploying

CI runs on every pull request to `main`. Publishing a GitHub Release deploys that tag to production: api first, then web, followed by a smoke check that both hosts report the new version.

## Roadmap

Coming soon.
