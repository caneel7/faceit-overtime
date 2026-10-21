// Bindings from wrangler.jsonc, typed with DOM fetch types so they don't clash with React's lib
interface CloudflareEnv {
  API: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
  ASSETS: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
}
