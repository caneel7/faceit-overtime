'use client';

import { Email, SignUpBody } from '@overtime/shared';
import { useState, type FocusEvent, type FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { FIELD_MESSAGES, fieldErrors, type FieldErrors } from './field-errors';
import { FormField } from './form-field';
import { RATE_LIMITED } from './messages';

export type SignUpValues = { email: string; password: string; displayName: string };
export type EmailStatus = 'unknown' | 'checking' | 'available' | 'taken';
type Field = keyof SignUpValues;

type SignUpFormProps = {
  onSubmit: (values: SignUpValues) => void;
  onEmailBlur?: (email: string) => void;
  emailStatus?: EmailStatus;
  signInHref: string;
  pending?: boolean;
  fieldErrors?: FieldErrors<Field>;
  error?: 'rate_limited';
};

export function SignUpForm({
  onSubmit,
  onEmailBlur,
  emailStatus = 'unknown',
  signInHref,
  pending = false,
  fieldErrors: serverErrors,
  error,
}: SignUpFormProps) {
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const shown = { ...serverErrors, ...errors };
  const taken = emailStatus === 'taken';

  function handleEmailBlur(event: FocusEvent<HTMLInputElement>) {
    const parsed = Email.safeParse(event.currentTarget.value);
    if (parsed.success) onEmailBlur?.(parsed.data);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = SignUpBody.safeParse({
      displayName: String(data.get('displayName') ?? ''),
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    });
    if (!parsed.success) {
      setErrors(
        fieldErrors(parsed.error, {
          displayName: FIELD_MESSAGES.displayName,
          email: FIELD_MESSAGES.email,
          password: FIELD_MESSAGES.password,
        }),
      );
      return;
    }
    setErrors({});
    if (taken) return;
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
        id="signup-name"
        name="displayName"
        label="Display name"
        autoComplete="nickname"
        hint="Shown to other organisers and players."
        error={shown.displayName}
        disabled={pending}
      />
      <FormField
        id="signup-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        onBlur={handleEmailBlur}
        hint={emailStatus === 'checking' ? 'Checking…' : undefined}
        error={
          shown.email ??
          (taken ? (
            <>
              This email already has an account.{' '}
              <a href={signInHref} className="underline underline-offset-4">
                Sign in instead
              </a>
            </>
          ) : undefined)
        }
        disabled={pending}
      />
      <FormField
        id="signup-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 10 characters. A few words work well."
        error={shown.password}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending || taken}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
