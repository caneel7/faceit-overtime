export type AuthJobName = 'verification-email' | 'password-reset-email';

export type EmailLinkPayload = { to: string; link: string };

export type AuthJobPayload = {
  'verification-email': EmailLinkPayload;
  'password-reset-email': EmailLinkPayload;
};

export type AuthJob =
  | { name: 'verification-email'; payload: EmailLinkPayload }
  | { name: 'password-reset-email'; payload: EmailLinkPayload };
