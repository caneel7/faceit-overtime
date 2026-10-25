import type { ComponentProps, ReactNode } from 'react';
import { AccountDetails } from '../../blocks/auth/account-details';
import { AddEmailForm } from '../../blocks/auth/add-email-form';
import { CheckEmailNotice } from '../../blocks/auth/check-email-notice';
import { ConnectedAccounts } from '../../blocks/auth/connected-accounts';
import { ForgotPasswordForm } from '../../blocks/auth/forgot-password-form';
import { ResetPasswordForm } from '../../blocks/auth/reset-password-form';
import { SignInForm } from '../../blocks/auth/sign-in-form';
import { SignUpForm } from '../../blocks/auth/sign-up-form';
import { VerifyEmailStatus } from '../../blocks/auth/verify-email-status';
import { PageShell } from '../../blocks/layout/page-shell';
import { Button } from '../../primitives/button';
import { Card, CardContent } from '../../primitives/card';
import { AuthFrame } from './auth-frame';

const link = 'text-foreground underline underline-offset-4';

type SignInPageProps = ComponentProps<typeof SignInForm> & {
  header: ReactNode;
  signUpHref: string;
};

export function SignInPage({ header, signUpHref, ...form }: SignInPageProps) {
  return (
    <AuthFrame
      header={header}
      title="Sign in"
      description="Organisers can use email. Players sign in with FACEIT."
      footer={
        <span>
          New here?{' '}
          <a href={signUpHref} className={link}>
            Create an account
          </a>
        </span>
      }
    >
      <SignInForm {...form} />
    </AuthFrame>
  );
}

type SignUpPageProps = ComponentProps<typeof SignUpForm> & {
  header: ReactNode;
  registerOrgHref: string;
  sentTo?: string;
  onResend?: () => void;
};

export function SignUpPage({
  header,
  registerOrgHref,
  sentTo,
  onResend,
  ...form
}: SignUpPageProps) {
  return (
    <AuthFrame
      header={header}
      title={sentTo ? 'Almost there' : 'Create an account'}
      description={sentTo ? undefined : 'Players can skip this and sign in with FACEIT instead.'}
      footer={
        sentTo ? undefined : (
          <span className="grid gap-1 text-center">
            <span>
              Already have an account?{' '}
              <a href={form.signInHref} className={link}>
                Sign in
              </a>
            </span>
            <span>
              Running events?{' '}
              <a href={registerOrgHref} className={link}>
                Register your organization
              </a>
            </span>
          </span>
        )
      }
    >
      {sentTo ? (
        <CheckEmailNotice email={sentTo} kind="verify" onResend={onResend} />
      ) : (
        <SignUpForm {...form} />
      )}
    </AuthFrame>
  );
}

type VerifyEmailPageProps = ComponentProps<typeof VerifyEmailStatus> & { header: ReactNode };

export function VerifyEmailPage({ header, ...status }: VerifyEmailPageProps) {
  return (
    <AuthFrame header={header} title={status.state === 'error' ? 'Link not valid' : 'Verifying'}>
      <VerifyEmailStatus {...status} />
    </AuthFrame>
  );
}

type ForgotPasswordPageProps = ComponentProps<typeof ForgotPasswordForm> & {
  header: ReactNode;
  signInHref: string;
};

export function ForgotPasswordPage({ header, signInHref, ...form }: ForgotPasswordPageProps) {
  return (
    <AuthFrame
      header={header}
      title="Reset your password"
      description="We'll email you a link to set a new one."
      footer={
        <a href={signInHref} className={link}>
          Back to sign in
        </a>
      }
    >
      <ForgotPasswordForm {...form} />
    </AuthFrame>
  );
}

type ResetPasswordPageProps = ComponentProps<typeof ResetPasswordForm> & { header: ReactNode };

export function ResetPasswordPage({ header, ...form }: ResetPasswordPageProps) {
  return (
    <AuthFrame header={header} title="Set a new password">
      <ResetPasswordForm {...form} />
    </AuthFrame>
  );
}

type AddEmailPageProps = ComponentProps<typeof AddEmailForm> & { header: ReactNode };

export function AddEmailPage({ header, ...form }: AddEmailPageProps) {
  return (
    <AuthFrame
      header={header}
      title={form.sentTo ? 'Check your email' : 'Add your email'}
      description={
        form.sentTo
          ? undefined
          : 'Organizers and team captains find people by email, and invites are sent there. We confirm it with a link.'
      }
    >
      <AddEmailForm {...form} />
    </AuthFrame>
  );
}

type SettingsPageProps = {
  header: ReactNode;
  account: ComponentProps<typeof AccountDetails>;
  connected: ComponentProps<typeof ConnectedAccounts>;
  addEmailHref?: string;
};

export function SettingsPage({ header, account, connected, addEmailHref }: SettingsPageProps) {
  return (
    <PageShell header={header} width="narrow">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      {account.email === null && addEmailHref ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">Add an email so organizers and captains can invite you.</p>
            <Button asChild size="sm">
              <a href={addEmailHref}>Add email</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <AccountDetails {...account} />
      <ConnectedAccounts {...connected} />
    </PageShell>
  );
}
