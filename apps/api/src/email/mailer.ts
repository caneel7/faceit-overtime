import type { Bindings } from '../env';
import { LogMailer } from './log-mailer';
import { ResendMailer } from './resend-mailer';
import { ZeptoMailer } from './zepto-mailer';

export type Email = { to: string; subject: string; text: string; html: string };

export type Sender = { address: string; name: string };

export interface Mailer {
  send(email: Email): Promise<void>;
}

function mailerKey(env: Bindings): string {
  return env.MAILER === 'zeptomail' ? env.ZEPTOMAIL_TOKEN : env.RESEND_API_KEY;
}

export function mailerFor(env: Bindings): Mailer {
  if (env.ENVIRONMENT !== 'production' && !mailerKey(env)) return new LogMailer();
  const from = { address: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME };
  switch (env.MAILER) {
    case 'zeptomail':
      return new ZeptoMailer(env.ZEPTOMAIL_URL, env.ZEPTOMAIL_TOKEN, from);
    default:
      return new ResendMailer(env.RESEND_API_KEY, from);
  }
}
