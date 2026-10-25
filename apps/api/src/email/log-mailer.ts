import type { Email, Mailer } from './mailer';

export class LogMailer implements Mailer {
  async send(email: Email): Promise<void> {
    console.log(JSON.stringify({ level: 'info', event: 'email', ...email, html: undefined }));
  }
}
