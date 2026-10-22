import type { AppType } from '@overtime/api';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { hc } from 'hono/client';

export async function serverApi() {
  const { env } = await getCloudflareContext({ async: true });
  return hc<AppType>('https://api.internal', {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => env.API.fetch(input, init),
  });
}
