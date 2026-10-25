'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordRequest } from '@overtime/shared';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { CheckEmailNotice } from './check-email-notice';
import { FIELD_MESSAGES } from './field-errors';
import { FormField } from './form-field';
import { RATE_LIMITED } from './messages';

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordRequest) => void;
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordRequest),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  if (sentTo) return <CheckEmailNotice email={sentTo} kind="reset" />;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
      {error === 'rate_limited' ? (
        <Alert variant="destructive">
          <AlertTitle>{RATE_LIMITED.title}</AlertTitle>
          <AlertDescription>{RATE_LIMITED.description}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        id="forgot-email"
        type="email"
        label="Email"
        autoComplete="email"
        {...register('email')}
        error={errors.email ? FIELD_MESSAGES.email : undefined}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
