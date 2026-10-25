import { useState } from 'react';
import { fn } from 'storybook/test';
import { InvitesDrawer } from '../blocks/invite/invites-drawer';
import { AppHeader } from '../blocks/layout/app-header';
import type { Invite } from '../models/invite';
import { ALL_INVITES } from './invites';
import { MOCK_NOW } from './time';

type MockHeaderOptions = {
  active?: 'events';
  signedIn?: boolean;
  invites?: Invite[];
  faceitConnected?: boolean;
};

function MockHeader({
  active,
  signedIn = true,
  invites = ALL_INVITES,
  faceitConnected = true,
}: MockHeaderOptions) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AppHeader
        nav={[{ label: 'Events', href: '/events', active: active === 'events' }]}
        userState={signedIn ? 'signed_in' : 'signed_out'}
        user={
          signedIn ? { displayName: 'Club Admin', cs2Level: faceitConnected ? 7 : null } : undefined
        }
        inviteCount={invites.filter((i) => i.status === 'pending').length}
        onInvitesClick={() => setOpen(true)}
        signInHref="/signin"
        onSignOut={fn()}
      />
      <InvitesDrawer
        open={open}
        onOpenChange={setOpen}
        invites={invites}
        now={MOCK_NOW}
        faceitConnected={faceitConnected}
        connectFaceitHref="/settings"
        onAccept={fn()}
        onDecline={fn()}
      />
    </>
  );
}

export function mockHeader(options: MockHeaderOptions = {}) {
  return <MockHeader {...options} />;
}

export const pageParameters = { layout: 'fullscreen' } as const;
export const mobileGlobals = { viewport: { value: 'mobile360', isRotated: false } };
