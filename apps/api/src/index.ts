import { notFound, onError } from '@overtime/shared/hono';
import { Scalar } from '@scalar/hono-api-reference';
import { Hono } from 'hono';
import { openAPIRouteHandler } from 'hono-openapi';
import pkg from '../package.json';
import { dbMiddleware } from './db';
import type { AppEnv } from './env';
import { auth } from './features/auth/routes';
import { health } from './features/health/routes';
import { me } from './features/me/routes';
import { publicJwks } from './lib/jwt';
import { authenticate } from './middleware/auth';
import { handleQueueBatch } from './queues/consumers';
import { queueMiddleware } from './queues/queue-service';

const api = new Hono<AppEnv>()
  .basePath('/api')
  .use(dbMiddleware)
  .use(queueMiddleware)
  .use(authenticate)
  .route('/health', health)
  .route('/auth', auth)
  .route('/me', me);

export const app = new Hono<AppEnv>()
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
        components: {
          securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
        },
      },
    }),
  )
  .get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'Overtime API' }))
  .get('/.well-known/jwks.json', async (c) => {
    c.header('Cache-Control', 'public, max-age=300');
    return c.json(await publicJwks(c.env.JWT_SIGNING_KEY));
  })
  .route('/', api);

app.onError(onError);
app.notFound(notFound);

export type AppType = typeof api;

export default {
  fetch: app.fetch,
  queue: handleQueueBatch,
};
