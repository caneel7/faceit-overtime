'use client';

import { OpaqueToken } from '@overtime/shared';
import { AuthLayout, ResetPasswordForm } from '@overtime/ui';
import { useRouter } from 'next/navigation';
import { UnexpectedError } from '../../../components/unexpected-error';
import { errorCodeOf } from '../../../lib/api-client';
import { useResetPassword } from '../../../lib/auth-queries';

export function ResetPassword({ token }: { token: string | null }) {
  const router = useRouter();
  const reset = useResetPassword();
  const validToken = OpaqueToken.safeParse(token).success;

  const invalidToken = !validToken || errorCodeOf(reset.error) === 'INVALID_TOKEN';
  const unexpected = reset.isError && !invalidToken;

  function handleSubmit({ password }: { password: string }) {
    if (!token) return;
    reset.mutate({ token, password }, { onSuccess: () => router.replace('/dashboard') });
  }

  return (
    <AuthLayout title="Set a new password">
      {unexpected ? <UnexpectedError /> : null}
      <ResetPasswordForm
        onSubmit={handleSubmit}
        forgotPasswordHref="/forgot-password"
        pending={reset.isPending || reset.isSuccess}
        error={invalidToken ? 'invalid_token' : undefined}
      />
    </AuthLayout>
  );
}
