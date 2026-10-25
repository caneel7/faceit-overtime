import { mailerFor } from '../../email/mailer';
import { passwordResetEmail, verificationEmail } from '../../email/templates';
import type { Bindings } from '../../env';
import type { AuthJob } from '../auth';
import type { QueueMessage } from './index';

const RETRY_DELAY_SECONDS = 30;

function renderEmail(job: AuthJob) {
  switch (job.name) {
    case 'verification-email':
      return verificationEmail(job.payload.to, job.payload.link);
    case 'password-reset-email':
      return passwordResetEmail(job.payload.to, job.payload.link);
  }
}

export async function consumeAuthJobs(
  messages: readonly QueueMessage<AuthJob>[],
  env: Bindings,
): Promise<void> {
  const mailer = mailerFor(env);
  for (const message of messages) {
    try {
      await mailer.send(renderEmail(message.body));
      message.ack();
    } catch (err) {
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'auth_job_failed',
          job: message.body.name,
          attempt: message.attempts,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
      message.retry({ delaySeconds: RETRY_DELAY_SECONDS });
    }
  }
}
