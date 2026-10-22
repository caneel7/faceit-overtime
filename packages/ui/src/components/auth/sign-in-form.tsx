'use client';

import { SignInBody } from '@overtime/shared';
import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { FIELD_MESSAGES, fieldErrors, type FieldErrors } from './field-errors';
import { FormField } from './form-field';
import { SIGN_IN_ERRORS, type SignInError } from './messages';

export type SignInValues = { email: string; password: string };

type SignInFormProps = {
  onSubmit: (values: SignInValues) => void;
  faceitHref: string;
  forgotPasswordHref: string;
  pending?: boolean;
  error?: SignInError;
  onResendVerification?: () => void;
  resendPending?: boolean;
};

export function SignInForm({
  onSubmit,
  faceitHref,
  forgotPasswordHref,
  pending = false,
  error,
  onResendVerification,
  resendPending = false,
}: SignInFormProps) {
  const [errors, setErrors] = useState<FieldErrors<'email' | 'password'>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = SignInBody.safeParse({
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    });
    if (!parsed.success) {
      setErrors(
        fieldErrors(parsed.error, {
          email: FIELD_MESSAGES.email,
          password: FIELD_MESSAGES.currentPassword,
        }),
      );
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  const message = error ? SIGN_IN_ERRORS[error] : null;

  return (
    <div className="grid gap-4">
      {message ? (
        <Alert variant="destructive">
          <AlertTitle>{message.title}</AlertTitle>
          <AlertDescription>
            <p>{message.description}</p>
            {error === 'email_not_verified' && onResendVerification ? (
              <Button
                type="button"
                variant="link"
                className="h-auto px-0"
                onClick={onResendVerification}
                disabled={resendPending}
              >
                {resendPending ? 'Sending…' : 'Send a new verification link'}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button asChild variant="faceit" className="w-full">
        <a href={faceitHref}>Sign in with FACEIT</a>
      </Button>

      <Separator label="or" />

      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="signin-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email}
          disabled={pending}
        />
        <FormField
          id="signin-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          error={errors.password}
          disabled={pending}
        />
        <div className="flex justify-end">
          <a
            href={forgotPasswordHref}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
