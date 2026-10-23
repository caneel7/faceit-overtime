import { createMiddleware } from 'hono/factory';
import type { AppEnv, Bindings } from '../env';
import type { AuthJobPayload } from './auth';
import { JobQueue, requestContext } from './job-queue';

export class QueueService {
  private static queues: { auth: JobQueue<AuthJobPayload> } | undefined;

  static init(env: Bindings): void {
    QueueService.queues ??= {
      auth: new JobQueue<AuthJobPayload>('auth', env.AUTH_QUEUE),
    };
  }

  static get auth(): JobQueue<AuthJobPayload> {
    if (!QueueService.queues) throw new Error('QueueService.init(env) has not run');
    return QueueService.queues.auth;
  }
}

export const queueMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  QueueService.init(c.env);
  await requestContext.run(c.executionCtx, next);
});
