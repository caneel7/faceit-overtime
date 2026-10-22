'use client';

import { Password } from '@overtime/shared';
import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { FIELD_MESSAGES } from './field-errors';
import { FormField } from './form-field';

type ResetPasswordFormProps = {
  onSubmit: (values: { password: string }) => void;
  forgotPasswordHref: string;
  pending?: boolean;
  error?: 'invalid_token';
};

export function ResetPasswordForm({
  onSubmit,
  forgotPasswordHref,
  pending = false,
  error,
}: ResetPasswordFormProps) {
  const [passwordError, setPasswordError] = useState<string>();

  if (error === 'invalid_token') {
    return (
      <div className="grid gap-4">
        <Alert variant="destructive">
          <AlertTitle>This reset link doesn't work any more</AlertTitle>
          <AlertDescription>
            <p>Reset links work once and expire after 30 minutes.</p>
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <a href={forgotPasswordHref}>Get a new link</a>
        </Button>
      </div>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Password.safeParse(
      String(new FormData(event.currentTarget).get('password') ?? ''),
    );
    if (!parsed.success) {
      setPasswordError(FIELD_MESSAGES.password);
      return;
    }
    setPasswordError(undefined);
    onSubmit({ password: parsed.data });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <FormField
        id="reset-password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        hint="At least 10 characters. You'll be signed out everywhere else."
        error={passwordError}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  );
}
