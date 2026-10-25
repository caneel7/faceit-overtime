'use client';

import { AuthLayout, ForgotPasswordForm } from '@overtime/ui';
import Link from 'next/link';
import { UnexpectedError } from '../../../components/unexpected-error';
import { errorCodeOf } from '../../../lib/api-client';
import { useForgotPassword } from '../../../lib/auth-queries';
import { useLeaveWhenSignedIn } from '../use-leave-when-signed-in';

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  useLeaveWhenSignedIn('/dashboard');

  const rateLimited = errorCodeOf(forgot.error) === 'RATE_LIMITED';
  const sentTo = forgot.isSuccess ? forgot.variables.email : undefined;

  return (
    <AuthLayout
      title="Reset your password"
      description={sentTo ? undefined : "Enter your account's email and we'll send a link."}
      footer={
        <Link href="/signin" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      {forgot.isError && !rateLimited ? <UnexpectedError /> : null}
      <ForgotPasswordForm
        onSubmit={(values) => forgot.mutate(values)}
        pending={forgot.isPending}
        sentTo={sentTo}
        error={rateLimited ? 'rate_limited' : undefined}
      />
    </AuthLayout>
  );
}
