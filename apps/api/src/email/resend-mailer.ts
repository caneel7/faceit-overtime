import type { Email, Mailer, Sender } from './mailer';

const RESEND_URL = 'https://api.resend.com/emails';

export class ResendMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: Sender,
  ) {}

  async send(email: Email): Promise<void> {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        from: `${this.from.name} <${this.from.address}>`,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  }
}
