'use client';

import { EmailAvailabilityResponse } from '@overtime/shared';
import {
  AuthLayout,
  CheckEmailNotice,
  SignUpForm,
  type EmailStatus,
  type SignUpValues,
} from '@overtime/ui';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { UnexpectedError } from '../../../components/unexpected-error';
import { api, errorCode } from '../../../lib/api-client';
import { useLeaveWhenSignedIn } from '../use-leave-when-signed-in';

export default function SignUpPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<'rate_limited' | 'unexpected'>();
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('unknown');
  const [sentTo, setSentTo] = useState<string>();
  const [resendPending, setResendPending] = useState(false);
  const [resent, setResent] = useState(false);
  const lastChecked = useRef<string>(null);
  useLeaveWhenSignedIn('/dashboard');

  async function handleEmailBlur(email: string) {
    if (lastChecked.current === email) return;
    lastChecked.current = email;
    setEmailStatus('checking');
    try {
      const res = await api.api.auth['email-available'].$get({ query: { email } });
      if (lastChecked.current !== email) return;
      if (!res.ok) return setEmailStatus('unknown');
      const { available } = EmailAvailabilityResponse.parse(await res.json());
      setEmailStatus(available ? 'available' : 'taken');
    } catch {
      setEmailStatus('unknown');
    }
  }

  async function handleSubmit(values: SignUpValues) {
    setPending(true);
    setError(undefined);
    try {
      const res = await api.api.auth.register.$post({ json: values });
      if (res.ok) {
        setSentTo(values.email);
      } else {
        const code = await errorCode(res);
        if (code === 'EMAIL_TAKEN') setEmailStatus('taken');
        else setError(code === 'RATE_LIMITED' ? 'rate_limited' : 'unexpected');
      }
    } catch {
      setError('unexpected');
    }
    setPending(false);
  }

  async function handleResend() {
    if (!sentTo) return;
    setResendPending(true);
    try {
      const res = await api.api.auth['verify-email'].resend.$post({ json: { email: sentTo } });
      if (res.ok) setResent(true);
    } catch {
      setResent(false);
    }
    setResendPending(false);
  }

  return (
    <AuthLayout
      title={sentTo ? 'Almost there' : 'Create an account'}
      description={sentTo ? undefined : 'For organisers. Players can sign in with FACEIT.'}
      footer={
        <span>
          Have an account?{' '}
          <Link href="/signin" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </span>
      }
    >
      {sentTo ? (
        <CheckEmailNotice
          email={sentTo}
          kind="verify"
          onResend={handleResend}
          resendPending={resendPending}
          resent={resent}
        />
      ) : (
        <>
          {error === 'unexpected' ? <UnexpectedError /> : null}
          <SignUpForm
            onSubmit={handleSubmit}
            onEmailBlur={handleEmailBlur}
            emailStatus={emailStatus}
            signInHref="/signin"
            pending={pending}
            error={error === 'rate_limited' ? error : undefined}
          />
        </>
      )}
    </AuthLayout>
  );
}
