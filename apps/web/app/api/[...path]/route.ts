import { getCloudflareContext } from '@opennextjs/cloudflare';

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
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit);

  return new Response(upstream.body, upstream);
}

export const dynamic = 'force-dynamic';
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
