'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSessionStore } from '../../lib/session-store';

export function useLeaveWhenSignedIn(to: string) {
  const router = useRouter();
  const status = useSessionStore((s) => s.status);
  useEffect(() => {
    if (status === 'signed_in') router.replace(to);
  }, [status, to, router]);
}
