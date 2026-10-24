'use client';

import { OpaqueToken, VerifyEmailResponse } from '@overtime/shared';
import { AuthLayout, VerifyEmailStatus } from '@overtime/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api, hasSessionMarker, refreshSession } from '../../../lib/api-client';
import { useSessionStore } from '../../../lib/session-store';

export function VerifyEmail({ token }: { token: string | null }) {
  const router = useRouter();
  const signIn = useSessionStore((s) => s.signIn);
  const [failed, setFailed] = useState(() => !OpaqueToken.safeParse(token).success);
  const started = useRef(false);

  useEffect(() => {
    if (failed || started.current || !token) return;
    started.current = true;
    api.api.auth['verify-email']
      .$post({ json: { token } })
      .then(async (res) => {
        if (res.ok) {
          signIn(VerifyEmailResponse.parse(await res.json()));
          return router.replace('/dashboard');
        }
        if (hasSessionMarker() && (await refreshSession())) return router.replace('/dashboard');
        setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [failed, token, signIn, router]);

  return (
    <AuthLayout title={failed ? 'Link not valid' : 'Verifying'}>
      <VerifyEmailStatus state={failed ? 'error' : 'verifying'} signInHref="/signin" />
    </AuthLayout>
  );
}
