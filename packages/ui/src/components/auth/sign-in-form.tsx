'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequest } from '@overtime/shared';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { FIELD_MESSAGES } from './field-errors';
import { FormField } from './form-field';
import { SIGN_IN_ERRORS, type SignInError } from './messages';

export type SignInValues = LoginRequest;

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(LoginRequest),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

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

      <form className="grid gap-4" onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
        <FormField
          id="signin-email"
          type="email"
          label="Email"
          autoComplete="email"
          {...register('email')}
          error={errors.email ? FIELD_MESSAGES.email : undefined}
          disabled={pending}
        />
        <FormField
          id="signin-password"
          type="password"
          label="Password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password ? FIELD_MESSAGES.currentPassword : undefined}
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
