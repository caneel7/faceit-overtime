import type { Email, Mailer, Sender } from './mailer';

export class ZeptoMailer implements Mailer {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly from: Sender,
  ) {}

  async send(email: Email): Promise<void> {
    const authorization = this.token.startsWith('Zoho-enczapikey ')
      ? this.token
      : `Zoho-enczapikey ${this.token}`;
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { authorization, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        from: this.from,
        to: [{ email_address: { address: email.to } }],
        subject: email.subject,
        textbody: email.text,
        htmlbody: email.html,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`ZeptoMail responded ${res.status}`);
  }
}
