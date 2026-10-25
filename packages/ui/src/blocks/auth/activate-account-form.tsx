'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DisplayName, Password, z } from '@overtime/shared';
import { useForm } from 'react-hook-form';
import { Button } from '../../primitives/button';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';
import { FIELD_MESSAGES } from '../form/field-errors';
import { FormField } from '../form/form-field';

const ActivateAccountFormValues = z.object({ displayName: DisplayName, password: Password });
export type ActivateAccountFormValues = z.infer<typeof ActivateAccountFormValues>;

type ActivateAccountFormProps = {
  email: string;
  onSubmit: (values: ActivateAccountFormValues) => void;
  pending?: boolean;
};

export function ActivateAccountForm({
  email,
  onSubmit,
  pending = false,
}: ActivateAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateAccountFormValues>({
    resolver: zodResolver(ActivateAccountFormValues),
    mode: 'onTouched',
    defaultValues: { displayName: '', password: '' },
  });

  return (
    <form className="grid gap-4" noValidate onSubmit={handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-2">
        <Label htmlFor="activate-email">Email</Label>
        <Input id="activate-email" value={email} readOnly aria-readonly />
      </div>
      <FormField
        id="activate-name"
        label="Display name"
        autoComplete="nickname"
        hint="Shown to other organisers and players."
        {...register('displayName')}
        error={errors.displayName ? FIELD_MESSAGES.displayName : undefined}
        disabled={pending}
      />
      <FormField
        id="activate-password"
        type="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 10 characters. A few words work well."
        {...register('password')}
        error={errors.password ? FIELD_MESSAGES.password : undefined}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
