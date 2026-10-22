import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const WEB = 'apps/web/**/*.{js,jsx,mjs,ts,tsx}';

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
    { name: '@overtime/db', message: 'Database access stays in apps/api.' },
    { name: '@overtime/db/unscoped', message: 'Database access stays in apps/api.' },
  ],
  patterns: [
    {
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

  ...nextVitals
    .filter((config) => config.name !== 'next/typescript' && !config.ignores)
    .map((config) => ({ ...config, files: [WEB] })),
  {
    files: [WEB],
    languageOptions: { parser: tseslint.parser },
    settings: { next: { rootDir: fileURLToPath(new URL('./apps/web', import.meta.url)) } },
  },

  {
    files: ['packages/ui/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat['recommended-latest'],
  },
  storybook.configs['flat/recommended'],

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
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', serverOnlyForClients] },
  },

  {
    files: ['packages/db/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@overtime/api', message: 'packages/db must not depend on the api.' }],
          patterns: [
            {
              regex: '^(hono(/.*)?|hono-openapi(/.*)?|@hono/.*)$',
              message:
                'packages/db must not use Hono directly. Use AppError from @overtime/shared/hono.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['apps/api/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@overtime/db/unscoped',
              message:
                'Use db.global / db.forUser. Unscoped queries belong in packages/db/src/queries.',
            },
          ],
        },
      ],
    },
  },

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

  {
    files: ['packages/db/test/types.test.ts'],
    rules: { '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': false }] },
  },
]);
