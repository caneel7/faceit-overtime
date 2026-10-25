import type { Bindings } from '../../env';
import type { AuthJob } from '../auth';
import { consumeAuthJobs } from './auth';

export type QueueMessage<Body> = {
  body: Body;
  attempts: number;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
};

export async function handleQueueBatch(
  batch: { queue: string; messages: readonly QueueMessage<unknown>[] },
  env: Bindings,
): Promise<void> {
  switch (batch.queue) {
    case 'overtime-auth':
      return consumeAuthJobs(batch.messages as readonly QueueMessage<AuthJob>[], env);
    default:
      console.error(JSON.stringify({ level: 'error', event: 'queue_unknown', queue: batch.queue }));
      for (const message of batch.messages) message.ack();
  }
}
