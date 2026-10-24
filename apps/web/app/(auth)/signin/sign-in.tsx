'use client';

import { LoginResponse, type ErrorCode } from '@overtime/shared';
import {
  AuthLayout,
  CheckEmailNotice,
  SignInForm,
  type SignInError,
  type SignInValues,
} from '@overtime/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UnexpectedError } from '../../../components/unexpected-error';
import { api, errorCode } from '../../../lib/api-client';
import { useSessionStore } from '../../../lib/session-store';
import { useLeaveWhenSignedIn } from '../use-leave-when-signed-in';

const ERRORS: Partial<Record<ErrorCode, SignInError>> = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  RATE_LIMITED: 'rate_limited',
};

export function SignIn({ next, initialError }: { next: string; initialError?: SignInError }) {
  const router = useRouter();
  const signIn = useSessionStore((s) => s.signIn);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SignInError | 'unexpected' | undefined>(initialError);
  const [email, setEmail] = useState('');
  const [resendPending, setResendPending] = useState(false);
  const [resent, setResent] = useState(false);
  useLeaveWhenSignedIn(next);

  async function handleSubmit(values: SignInValues) {
    setPending(true);
    setEmail(values.email);
    try {
      const res = await api.api.auth.login.$post({ json: values });
      if (res.ok) {
        signIn(LoginResponse.parse(await res.json()));
        router.replace(next);
        return;
      }
      const code = await errorCode(res);
      setError((code && ERRORS[code]) || 'unexpected');
    } catch {
      setError('unexpected');
    }
    setPending(false);
  }

  async function handleResend() {
    setResendPending(true);
    try {
      const res = await api.api.auth['verify-email'].resend.$post({ json: { email } });
      if (res.ok) setResent(true);
      else setError((await errorCode(res)) === 'RATE_LIMITED' ? 'rate_limited' : 'unexpected');
    } catch {
      setError('unexpected');
    }
    setResendPending(false);
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Organisers can use email. Players sign in with FACEIT."
      footer={
        <span>
          New here?{' '}
          <Link href="/signup" className="text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </span>
      }
    >
      {resent ? (
        <CheckEmailNotice email={email} kind="verify" />
      ) : (
        <>
          {error === 'unexpected' ? <UnexpectedError /> : null}
          <SignInForm
            onSubmit={handleSubmit}
            faceitHref={`/api/auth/faceit/start?next=${encodeURIComponent(next)}`}
            forgotPasswordHref="/forgot-password"
            pending={pending}
            error={error === 'unexpected' ? undefined : error}
            onResendVerification={handleResend}
            resendPending={resendPending}
          />
        </>
      )}
    </AuthLayout>
  );
}
