'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterRequest } from '@overtime/shared';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { FIELD_MESSAGES, type FieldErrors } from './field-errors';
import { FormField } from './form-field';
import { RATE_LIMITED } from './messages';

export type SignUpValues = RegisterRequest;
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
  fieldErrors: serverErrors = {},
  error,
}: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(RegisterRequest),
    mode: 'onTouched',
    defaultValues: { displayName: '', email: '', password: '' },
  });
  const taken = emailStatus === 'taken';

  const message = (field: Field) => (errors[field] ? FIELD_MESSAGES[field] : serverErrors[field]);

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => {
        if (!taken) onSubmit(values);
      })}
      noValidate
    >
      {error === 'rate_limited' ? (
        <Alert variant="destructive">
          <AlertTitle>{RATE_LIMITED.title}</AlertTitle>
          <AlertDescription>{RATE_LIMITED.description}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        id="signup-name"
        label="Display name"
        autoComplete="nickname"
        hint="Shown to other organisers and players."
        {...register('displayName')}
        error={message('displayName')}
        disabled={pending}
      />
      <FormField
        id="signup-email"
        type="email"
        label="Email"
        autoComplete="email"
        {...register('email', {
          onBlur: (event: { target: { value: string } }) => {
            const parsed = RegisterRequest.shape.email.safeParse(event.target.value);
            if (parsed.success) onEmailBlur?.(parsed.data);
          },
        })}
        hint={emailStatus === 'checking' ? 'Checking…' : undefined}
        error={
          message('email') ??
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
        type="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 10 characters. A few words work well."
        {...register('password')}
        error={message('password')}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending || taken}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
