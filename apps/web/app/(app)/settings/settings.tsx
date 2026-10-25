'use client';

import { FaceitLinkResponse, MeResponse } from '@overtime/shared';
import { AccountDetails, ConnectedAccounts, type ConnectError } from '@overtime/ui';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { useSessionStore } from '../../../lib/session-store';

export function Settings({
  initialError,
  justConnected,
}: {
  initialError?: ConnectError;
  justConnected: boolean;
}) {
  const me = useSessionStore((s) => s.me);
  const setMe = useSessionStore((s) => s.setMe);
  const [error, setError] = useState(initialError);
  const [connectPending, setConnectPending] = useState(false);

  useEffect(() => {
    api.api.me
      .$get()
      .then(async (res) => {
        if (res.ok) setMe(MeResponse.parse(await res.json()));
      })
      .catch(() => undefined);
  }, [setMe]);

  async function handleConnect() {
    setConnectPending(true);
    setError(undefined);
    const res = await api.api.auth.faceit.link.$post().catch(() => null);
    const link = res?.ok ? FaceitLinkResponse.safeParse(await res.json()) : null;
    if (link?.success) {
      window.location.assign(link.data.url);
      return;
    }
    setError('faceit_unavailable');
    setConnectPending(false);
  }

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
        faceit={me.player ? { status: 'connected', player: me.player } : { status: 'not_connected' }}
        onConnect={handleConnect}
        connectPending={connectPending}
        error={error}
        justConnected={justConnected}
      />
    </>
  );
}
