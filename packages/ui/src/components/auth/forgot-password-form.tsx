'use client';

import { EmailBody } from '@overtime/shared';
import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { CheckEmailNotice } from './check-email-notice';
import { FIELD_MESSAGES } from './field-errors';
import { FormField } from './form-field';
import { RATE_LIMITED } from './messages';

type ForgotPasswordFormProps = {
  onSubmit: (values: { email: string }) => void;
  pending?: boolean;
  sentTo?: string;
  error?: 'rate_limited';
};

export function ForgotPasswordForm({
  onSubmit,
  pending = false,
  sentTo,
  error,
}: ForgotPasswordFormProps) {
  const [emailError, setEmailError] = useState<string>();

  if (sentTo) return <CheckEmailNotice email={sentTo} kind="reset" />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = EmailBody.safeParse({
      email: String(new FormData(event.currentTarget).get('email') ?? ''),
    });
    if (!parsed.success) {
      setEmailError(FIELD_MESSAGES.email);
      return;
    }
    setEmailError(undefined);
    onSubmit(parsed.data);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      {error === 'rate_limited' ? (
        <Alert variant="destructive">
          <AlertTitle>{RATE_LIMITED.title}</AlertTitle>
          <AlertDescription>{RATE_LIMITED.description}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        id="forgot-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        error={emailError}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
