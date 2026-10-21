import { notFound, onError } from '@overtime/shared/hono';
import { Scalar } from '@scalar/hono-api-reference';
import { Hono } from 'hono';
import { openAPIRouteHandler } from 'hono-openapi';
import pkg from '../package.json';
import type { AppEnv } from './env';
import { health } from './features/health/routes';

// API routes are chained so their types flow into AppType for the web client
const app = new Hono<AppEnv>().basePath('/api').route('/health', health);

app.get(
  '/openapi.json',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Overtime API',
        version: pkg.version,
        description: 'Swiss-format CS2 tournament platform. Unofficial — uses the FACEIT Data API.',
      },
    },
    exclude: ['/api/openapi.json', '/api/docs'],
  }),
);
app.get('/docs', Scalar({ url: '/api/openapi.json', pageTitle: 'Overtime API' }));

app.onError(onError);
app.notFound(notFound);

export type AppType = typeof app;
export default app;
