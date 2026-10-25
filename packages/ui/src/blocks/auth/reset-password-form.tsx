'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Password, z } from '@overtime/shared';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import { FIELD_MESSAGES } from '../form/field-errors';
import { FormField } from '../form/form-field';

const NewPassword = z.object({ password: Password });
type NewPassword = z.infer<typeof NewPassword>;

type ResetPasswordFormProps = {
  onSubmit: (values: NewPassword) => void;
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPassword>({
    resolver: zodResolver(NewPassword),
    mode: 'onTouched',
    defaultValues: { password: '' },
  });

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

  return (
    <form className="grid gap-4" onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
      <FormField
        id="reset-password"
        type="password"
        label="New password"
        autoComplete="new-password"
        hint="At least 10 characters. You'll be signed out everywhere else."
        {...register('password')}
        error={errors.password ? FIELD_MESSAGES.password : undefined}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  );
}
