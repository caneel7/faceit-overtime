'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Email, z } from '@overtime/shared';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import { FIELD_MESSAGES } from '../form/field-errors';
import { FormField } from '../form/form-field';
import { CheckEmailNotice } from './check-email-notice';
import { RATE_LIMITED } from './messages';

const AddEmailFormValues = z.object({ email: Email });
type AddEmailFormValues = z.infer<typeof AddEmailFormValues>;

type AddEmailFormProps = {
  suggestedEmail: string | null;
  onSubmit: (email: string) => void;
  signInHref: string;
  skipHref?: string;
  sentTo?: string;
  pending?: boolean;
  error?: 'email_taken' | 'rate_limited';
};

export function AddEmailForm({
  suggestedEmail,
  onSubmit,
  signInHref,
  skipHref,
  sentTo,
  pending = false,
  error,
}: AddEmailFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddEmailFormValues>({
    resolver: zodResolver(AddEmailFormValues),
    mode: 'onTouched',
    defaultValues: { email: suggestedEmail ?? '' },
  });

  if (sentTo) return <CheckEmailNotice email={sentTo} kind="verify" />;

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values.email))}
    >
      {error === 'rate_limited' ? (
        <Alert variant="destructive">
          <AlertTitle>{RATE_LIMITED.title}</AlertTitle>
          <AlertDescription>{RATE_LIMITED.description}</AlertDescription>
        </Alert>
      ) : null}
      {error === 'email_taken' ? (
        <Alert variant="destructive">
          <AlertTitle>That email belongs to another account</AlertTitle>
          <AlertDescription>
            <p>
              <a href={signInHref} className="underline underline-offset-4">
                Sign in with that account
              </a>{' '}
              and connect FACEIT from its settings instead. Accounts are never merged.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}
      <FormField
        id="add-email"
        type="email"
        label="Email"
        autoComplete="email"
        hint={
          suggestedEmail
            ? 'From your FACEIT account. Change it if you prefer another address.'
            : undefined
        }
        {...register('email')}
        error={errors.email ? FIELD_MESSAGES.email : undefined}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send confirmation link'}
      </Button>
      {skipHref ? (
        <a
          href={skipHref}
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Skip for now
        </a>
      ) : null}
    </form>
  );
}
