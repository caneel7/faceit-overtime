import type { AppType } from '@overtime/api';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { hc } from 'hono/client';

// Server-side client: calls the api Worker directly over the service binding (no public hop).
// The host is never resolved; the binding routes the request.
export async function serverApi() {
  const { env } = await getCloudflareContext({ async: true });
  return hc<AppType>('https://api.internal', {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => env.API.fetch(input, init),
  });
}
