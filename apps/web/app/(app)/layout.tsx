'use client';

import { Skeleton } from '@overtime/ui';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useSessionStore } from '../../lib/session-store';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSessionStore((s) => s.status);

  useEffect(() => {
    if (status === 'signed_out') router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status !== 'signed_in') {
    return (
      <main className="mx-auto grid w-full max-w-3xl gap-4 px-4 py-10" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  return <main className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-10">{children}</main>;
}
