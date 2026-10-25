'use client';

import { AccountDetails, ConnectedAccounts, type ConnectError } from '@overtime/ui';
import { useFaceitLink, useMe } from '../../../lib/auth-queries';
import { useSessionStore } from '../../../lib/session-store';

export function Settings({
  initialError,
  justConnected,
}: {
  initialError?: ConnectError;
  justConnected: boolean;
}) {
  const sessionMe = useSessionStore((s) => s.me);
  const { data } = useMe();
  const link = useFaceitLink();
  const me = data ?? sessionMe;

  if (!me) return null;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <AccountDetails
        displayName={me.user.displayName}
        email={me.user.email}
        emailVerified={me.user.emailVerified}
        hasPassword={me.user.hasPassword}
      />
      <ConnectedAccounts
        faceit={
          me.player ? { status: 'connected', player: me.player } : { status: 'not_connected' }
        }
        onConnect={() => link.mutate()}
        connectPending={link.isPending || link.isSuccess}
        error={link.isError ? 'faceit_unavailable' : link.isIdle ? initialError : undefined}
        justConnected={justConnected}
      />
    </>
  );
}
