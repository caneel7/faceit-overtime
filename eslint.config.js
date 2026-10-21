import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const WEB = 'apps/web/**/*.{js,jsx,mjs,ts,tsx}';

// Server-only code that must never reach the browser bundle (see @overtime/shared "./hono")
const serverOnlyForClients = {
  paths: [
    {
      name: '@overtime/shared/hono',
      message: 'Server only. Import schemas from "@overtime/shared".',
    },
    {
      name: '@overtime/api',
      allowTypeImports: true,
      message: 'Only `import type` from the api (e.g. AppType).',
    },
  ],
  patterns: [
    {
      // everything from hono except "hono/client", plus hono-openapi and @hono/*
      regex: '^(hono(/(?!client$).*)?|hono-openapi(/.*)?|@hono/.*)$',
      message: 'Hono server code stays in apps/api. Use "hono/client" for the typed client.',
    },
  ],
};

export default defineConfig([
  globalIgnores([
    '**/node_modules/',
    '**/dist/',
    '**/.next/',
    '**/.open-next/',
    '**/.wrangler/',
    '**/.turbo/',
    '**/storybook-static/',
    '**/coverage/',
    '**/next-env.d.ts',
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // Next.js rules (react, hooks, a11y, @next/next) for the web app only.
  // next/typescript is skipped: typescript-eslint is already configured above.
  ...nextVitals
    .filter((config) => config.name !== 'next/typescript' && !config.ignores)
    .map((config) => ({ ...config, files: [WEB] })),
  {
    files: [WEB],
    // eslint-config-next swaps in its own parser; typescript-eslint rules need theirs
    languageOptions: { parser: tseslint.parser },
    settings: { next: { rootDir: fileURLToPath(new URL('./apps/web', import.meta.url)) } },
  },

  {
    files: ['packages/ui/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat['recommended-latest'],
  },
  storybook.configs['flat/recommended'],

  // The isomorphic shared entry must not import Hono or the "./hono" folder
  {
    files: ['packages/shared/src/**/*.ts'],
    ignores: ['packages/shared/src/hono/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['hono', 'hono/*', 'hono-openapi', 'hono-openapi/*', '@hono/*'],
              message: 'Only src/hono/** may import Hono.',
            },
            {
              group: ['./hono', './hono/*', '../hono', '../hono/*'],
              message: 'The "." entry must not depend on the server-only "./hono" entry.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}', 'packages/db/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', serverOnlyForClients] },
  },

  // The engine is pure: no imports from outside the package (tests may use vitest)
  {
    files: ['packages/engine/src/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ regex: '^(?!\\.)', message: 'packages/engine has no dependencies.' }] },
      ],
    },
  },

  // Handlers return JSON through respond() so every response is checked against its schema
  {
    files: ['apps/api/src/features/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='json'][callee.object.name='c']",
          message: 'Use respond(c, Schema, data) from @overtime/shared/hono.',
        },
      ],
    },
  },
]);
