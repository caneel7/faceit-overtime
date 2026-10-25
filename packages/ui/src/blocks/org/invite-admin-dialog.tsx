'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Email, z } from '@overtime/shared';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../primitives/dialog';
import { RATE_LIMITED } from '../auth/messages';
import { FIELD_MESSAGES } from '../form/field-errors';
import { FormField } from '../form/form-field';

const InviteAdminFormValues = z.object({ email: Email });
type InviteAdminFormValues = z.infer<typeof InviteAdminFormValues>;

export type InviteAdminError = 'already_member' | 'already_invited' | 'rate_limited';

const ERRORS: Record<InviteAdminError, string> = {
  already_member: "They're already an admin of this organization.",
  already_invited: 'They already have a pending invite. You can revoke it and invite again.',
  rate_limited: RATE_LIMITED.description,
};

type InviteAdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgName: string;
  onSubmit: (email: string) => void;
  pending?: boolean;
  error?: InviteAdminError;
};

function InviteAdminForm({
  orgName,
  onSubmit,
  pending = false,
  error,
}: Omit<InviteAdminDialogProps, 'open' | 'onOpenChange'>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteAdminFormValues>({
    resolver: zodResolver(InviteAdminFormValues),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values.email))}
    >
      <DialogHeader>
        <DialogTitle>Invite an admin</DialogTitle>
        <DialogDescription>
          They'll get an email and see the invite in Overtime, and become an admin of {orgName} once
          they accept. No account yet? The email lets them create one.
        </DialogDescription>
      </DialogHeader>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{ERRORS[error]}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        id="invite-admin-email"
        type="email"
        label="Email"
        autoComplete="off"
        {...register('email')}
        error={errors.email ? FIELD_MESSAGES.email : undefined}
        disabled={pending}
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send invite'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function InviteAdminDialog({ open, onOpenChange, ...form }: InviteAdminDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{open ? <InviteAdminForm {...form} /> : null}</DialogContent>
    </Dialog>
  );
}
