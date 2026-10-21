import { getCloudflareContext } from '@opennextjs/cloudflare';

// Browser → overtime.caneel.dev/api/* → api Worker over the service binding.
// Same origin for the browser: first-party cookies, no CORS.

const HOP_BY_HOP = [
  'connection',
  'keep-alive',
  'proxy-connection',
  'transfer-encoding',
  'upgrade',
  'te',
  'trailer',
  'host',
];

async function proxy(request: Request): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const url = new URL(request.url);

  const headers = new Headers(request.headers);
  for (const name of HOP_BY_HOP) headers.delete(name);
  headers.set('x-forwarded-host', url.host);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await env.API.fetch(`https://api.internal${url.pathname}${url.search}`, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual',
    // Required by Node's fetch when streaming a request body (next dev runs on Node)
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit);

  // Re-wrap so Next can attach its own headers; status, headers (incl. set-cookie) and body pass through
  return new Response(upstream.body, upstream);
}

export const dynamic = 'force-dynamic';
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
