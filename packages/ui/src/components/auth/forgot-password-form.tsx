'use client';

import { ForgotPasswordRequest } from '@overtime/shared';
import type { FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { CheckEmailNotice } from './check-email-notice';
import { FIELD_MESSAGES } from './field-errors';
import { FormField } from './form-field';
import { RATE_LIMITED } from './messages';
import { useFieldValidation } from './use-field-validation';

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
  const { errors, setErrors, field } = useFieldValidation<'email'>({
    email: { schema: ForgotPasswordRequest.shape.email, message: FIELD_MESSAGES.email },
  });

  if (sentTo) return <CheckEmailNotice email={sentTo} kind="reset" />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = ForgotPasswordRequest.safeParse({
      email: String(new FormData(event.currentTarget).get('email') ?? ''),
    });
    if (!parsed.success) {
      setErrors({ email: FIELD_MESSAGES.email });
      return;
    }
    setErrors({});
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
        {...field('email')}
        error={errors.email}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
