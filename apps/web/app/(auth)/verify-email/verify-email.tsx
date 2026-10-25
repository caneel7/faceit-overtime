'use client';

import { OpaqueToken } from '@overtime/shared';
import { AuthLayout, VerifyEmailStatus } from '@overtime/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { hasSessionMarker, refreshSession } from '../../../lib/api-client';
import { useVerifyEmail } from '../../../lib/auth-queries';

export function VerifyEmail({ token }: { token: string | null }) {
  const router = useRouter();
  const { mutate } = useVerifyEmail();
  const [failed, setFailed] = useState(() => !OpaqueToken.safeParse(token).success);
  const started = useRef(false);

  useEffect(() => {
    if (failed || started.current || !token) return;
    started.current = true;
    mutate(token, {
      onSuccess: () => router.replace('/dashboard'),
      onError: async () => {
        if (hasSessionMarker() && (await refreshSession())) return router.replace('/dashboard');
        setFailed(true);
      },
    });
  }, [failed, token, mutate, router]);

  return (
    <AuthLayout title={failed ? 'Link not valid' : 'Verifying'}>
      <VerifyEmailStatus state={failed ? 'error' : 'verifying'} signInHref="/signin" />
    </AuthLayout>
  );
}
