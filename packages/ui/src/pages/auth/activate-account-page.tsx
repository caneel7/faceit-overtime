import type { ReactNode } from 'react';
import {
  ActivateAccountForm,
  type ActivateAccountFormValues,
} from '../../blocks/auth/activate-account-form';
import { InviteCard } from '../../blocks/invite/invite-card';
import type { OrgInvite } from '../../models/invite';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import { AuthFrame } from './auth-frame';

type ActivateAccountPageProps = {
  header: ReactNode;
  step: 'set_password' | 'accept' | 'expired';
  email: string;
  invite: OrgInvite;
  now: string;
  signInHref: string;
  onSubmit: (values: ActivateAccountFormValues) => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  pending?: boolean;
};

export function ActivateAccountPage({
  header,
  step,
  email,
  invite,
  now,
  signInHref,
  onSubmit,
  onAccept,
  onDecline,
  pending,
}: ActivateAccountPageProps) {
  if (step === 'expired') {
    return (
      <AuthFrame header={header} title="Link not valid">
        <Alert variant="destructive">
          <AlertTitle>This invite link doesn't work any more</AlertTitle>
          <AlertDescription>
            Invite links work once and expire after 7 days. Ask the organization's owner to invite
            you again.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <a href={signInHref}>Go to sign in</a>
        </Button>
      </AuthFrame>
    );
  }

  if (step === 'accept') {
    return (
      <AuthFrame
        header={header}
        title="One more step"
        description="Your account is ready. Accept the invite to start helping out."
      >
        <InviteCard
          invite={invite}
          now={now}
          faceitConnected
          connectFaceitHref="/settings"
          onAccept={onAccept}
          onDecline={onDecline}
          pending={pending}
        />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      header={header}
      title="Create your account"
      description={`${invite.invitedBy} invited you to help run ${invite.org.name}. Set a name and password to continue.`}
    >
      <ActivateAccountForm email={email} onSubmit={onSubmit} pending={pending} />
    </AuthFrame>
  );
}
