'use client';

import { AuthLayout, ForgotPasswordForm } from '@overtime/ui';
import Link from 'next/link';
import { useState } from 'react';
import { UnexpectedError } from '../../../components/unexpected-error';
import { api, errorCode } from '../../../lib/api-client';
import { useLeaveWhenSignedIn } from '../use-leave-when-signed-in';

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string>();
  const [error, setError] = useState<'rate_limited' | 'unexpected'>();
  useLeaveWhenSignedIn('/dashboard');

  async function handleSubmit({ email }: { email: string }) {
    setPending(true);
    setError(undefined);
    try {
      const res = await api.api.auth.password.forgot.$post({ json: { email } });
      if (res.ok) setSentTo(email);
      else setError((await errorCode(res)) === 'RATE_LIMITED' ? 'rate_limited' : 'unexpected');
    } catch {
      setError('unexpected');
    }
    setPending(false);
  }

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
      {error === 'unexpected' ? <UnexpectedError /> : null}
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        pending={pending}
        sentTo={sentTo}
        error={error === 'rate_limited' ? error : undefined}
      />
    </AuthLayout>
  );
}
