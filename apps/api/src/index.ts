import { notFound, onError } from '@overtime/shared/hono';
import { Scalar } from '@scalar/hono-api-reference';
import { Hono } from 'hono';
import { openAPIRouteHandler } from 'hono-openapi';
import pkg from '../package.json';
import { dbMiddleware } from './db';
import type { AppEnv } from './env';
import { health } from './features/health/routes';

const api = new Hono<AppEnv>().basePath('/api').use(dbMiddleware).route('/health', health);

const app = new Hono<AppEnv>()
  .get('/', (c) => c.redirect('/docs', 302))
  .get(
    '/openapi.json',
    openAPIRouteHandler(api, {
      documentation: {
        info: {
          title: 'Overtime API',
          version: pkg.version,
          description:
            'Swiss-format CS2 tournament platform. Unofficial — uses the FACEIT Data API.',
        },
      },
    }),
  )
  .get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'Overtime API' }))
  .route('/', api);

app.onError(onError);
app.notFound(notFound);

export type AppType = typeof api;
export default app;
