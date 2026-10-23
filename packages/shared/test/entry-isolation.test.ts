import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';

const FORBIDDEN = [
  /node_modules[\\/](\.bun[\\/][^\\/]+[\\/]node_modules[\\/])?hono[\\/]/,
  /node_modules[\\/](\.bun[\\/][^\\/]+[\\/]node_modules[\\/])?hono-openapi[\\/]/,
  /node_modules[\\/](\.bun[\\/][^\\/]+[\\/]node_modules[\\/])?@hono[\\/]/,
  /node_modules[\\/](\.bun[\\/][^\\/]+[\\/]node_modules[\\/])?@standard-community[\\/]/,
  /[\\/]src[\\/]hono[\\/]/,
];

async function bundledInputs(entry: string) {
  const { metafile } = await build({
    entryPoints: [fileURLToPath(new URL(entry, import.meta.url))],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    write: false,
    metafile: true,
    logLevel: 'silent',
  });
  return Object.keys(metafile.inputs);
}

const leaks = (inputs: string[]) => inputs.filter((p) => FORBIDDEN.some((re) => re.test(p)));

describe('@overtime/shared "." entry', () => {
  it('pulls no Hono or OpenAPI code into a browser bundle', async () => {
    const inputs = await bundledInputs('../src/index.ts');
    expect(inputs.some((p) => p.includes('zod'))).toBe(true);
    expect(leaks(inputs)).toEqual([]);
  });
});
