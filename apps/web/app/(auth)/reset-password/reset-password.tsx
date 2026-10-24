'use client';

import { OpaqueToken, ResetPasswordResponse } from '@overtime/shared';
import { AuthLayout, ResetPasswordForm } from '@overtime/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UnexpectedError } from '../../../components/unexpected-error';
import { api, errorCode } from '../../../lib/api-client';
import { useSessionStore } from '../../../lib/session-store';

export function ResetPassword({ token }: { token: string | null }) {
  const router = useRouter();
  const signIn = useSessionStore((s) => s.signIn);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<'invalid_token' | 'unexpected' | undefined>(() =>
    OpaqueToken.safeParse(token).success ? undefined : 'invalid_token',
  );

  async function handleSubmit({ password }: { password: string }) {
    if (!token) return;
    setPending(true);
    setError(undefined);
    try {
      const res = await api.api.auth.password.reset.$post({ json: { token, password } });
      if (res.ok) {
        signIn(ResetPasswordResponse.parse(await res.json()));
        router.replace('/dashboard');
        return;
      }
      setError((await errorCode(res)) === 'INVALID_TOKEN' ? 'invalid_token' : 'unexpected');
    } catch {
      setError('unexpected');
    }
    setPending(false);
  }

  return (
    <AuthLayout title="Set a new password">
      {error === 'unexpected' ? <UnexpectedError /> : null}
      <ResetPasswordForm
        onSubmit={handleSubmit}
        forgotPasswordHref="/forgot-password"
        pending={pending}
        error={error === 'invalid_token' ? error : undefined}
      />
    </AuthLayout>
  );
}
