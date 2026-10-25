'use client';

import { AuthLayout, CheckEmailNotice, SignUpForm, type EmailStatus } from '@overtime/ui';
import Link from 'next/link';
import { useState } from 'react';
import { UnexpectedError } from '../../../components/unexpected-error';
import { errorCodeOf } from '../../../lib/api-client';
import {
  useEmailAvailability,
  useRegister,
  useResendVerification,
} from '../../../lib/auth-queries';
import { useLeaveWhenSignedIn } from '../use-leave-when-signed-in';

export default function SignUpPage() {
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const availability = useEmailAvailability(checkedEmail);
  const register = useRegister();
  const resend = useResendVerification();
  useLeaveWhenSignedIn('/dashboard');

  const registerCode = errorCodeOf(register.error);
  const sentTo = register.isSuccess ? register.variables.email : null;

  let emailStatus: EmailStatus = 'unknown';
  if (registerCode === 'EMAIL_TAKEN') emailStatus = 'taken';
  else if (availability.isFetching) emailStatus = 'checking';
  else if (availability.data) emailStatus = availability.data.available ? 'available' : 'taken';

  const rateLimited = registerCode === 'RATE_LIMITED';
  const unexpected = register.isError && !rateLimited && registerCode !== 'EMAIL_TAKEN';

  function handleEmailBlur(email: string) {
    register.reset();
    setCheckedEmail(email);
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
          onResend={() => resend.mutate({ email: sentTo })}
          resendPending={resend.isPending}
          resent={resend.isSuccess}
        />
      ) : (
        <>
          {unexpected ? <UnexpectedError /> : null}
          <SignUpForm
            onSubmit={(values) => register.mutate(values)}
            onEmailBlur={handleEmailBlur}
            emailStatus={emailStatus}
            signInHref="/signin"
            pending={register.isPending}
            error={rateLimited ? 'rate_limited' : undefined}
          />
        </>
      )}
    </AuthLayout>
  );
}
