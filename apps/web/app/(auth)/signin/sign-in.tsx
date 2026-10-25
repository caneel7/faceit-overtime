'use client';

import type { ErrorCode } from '@overtime/shared';
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
import { errorCodeOf } from '../../../lib/api-client';
import { useLogin, useResendVerification } from '../../../lib/auth-queries';
import { useLeaveWhenSignedIn } from '../use-leave-when-signed-in';

const ERRORS: Partial<Record<ErrorCode, SignInError>> = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  RATE_LIMITED: 'rate_limited',
};

function signInError(error: unknown): SignInError | 'unexpected' {
  const code = errorCodeOf(error);
  return (code && ERRORS[code]) || 'unexpected';
}

export function SignIn({ next, initialError }: { next: string; initialError?: SignInError }) {
  const router = useRouter();
  const login = useLogin();
  const resend = useResendVerification();
  const [email, setEmail] = useState('');
  useLeaveWhenSignedIn(next);

  function handleSubmit(values: SignInValues) {
    setEmail(values.email);
    resend.reset();
    login.mutate(values, { onSuccess: () => router.replace(next) });
  }

  const failure = resend.error ?? login.error;
  const error = failure ? signInError(failure) : login.isIdle ? initialError : undefined;

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
      {resend.isSuccess ? (
        <CheckEmailNotice email={email} kind="verify" />
      ) : (
        <>
          {error === 'unexpected' ? <UnexpectedError /> : null}
          <SignInForm
            onSubmit={handleSubmit}
            faceitHref={`/api/auth/faceit/start?next=${encodeURIComponent(next)}`}
            forgotPasswordHref="/forgot-password"
            pending={login.isPending || login.isSuccess}
            error={error === 'unexpected' ? undefined : error}
            onResendVerification={() => resend.mutate({ email })}
            resendPending={resend.isPending}
          />
        </>
      )}
    </AuthLayout>
  );
}
