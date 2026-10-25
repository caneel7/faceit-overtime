'use client';

import { UserMenu } from '@overtime/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignOut } from '../lib/auth-queries';
import { useSessionStore } from '../lib/session-store';

export function SiteHeader() {
  const router = useRouter();
  const status = useSessionStore((s) => s.status);
  const me = useSessionStore((s) => s.me);
  const signOut = useSignOut();

  function handleSignOut() {
    signOut.mutate(undefined, { onSettled: () => router.replace('/') });
  }

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Over<span className="text-primary">time</span>
      </Link>
      <UserMenu
        state={status === 'unknown' ? 'loading' : status}
        user={
          me
            ? {
                displayName: me.user.displayName,
                avatarUrl: me.player?.avatarUrl,
                cs2Level: me.player?.cs2Level,
              }
            : undefined
        }
        signInHref="/signin"
        onSignOut={handleSignOut}
      />
    </header>
  );
}
