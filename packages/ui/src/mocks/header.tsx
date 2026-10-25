import { fn } from 'storybook/test';
import { AppHeader } from '../blocks/layout/app-header';

type MockHeaderOptions = {
  active?: 'events' | 'teams' | 'organizations';
  signedIn?: boolean;
  inviteCount?: number;
};

export function mockHeader({ active, signedIn = true, inviteCount = 0 }: MockHeaderOptions = {}) {
  return (
    <AppHeader
      nav={[
        { label: 'Events', href: '/events', active: active === 'events' },
        { label: 'Teams', href: '/teams', active: active === 'teams' },
        { label: 'Organizations', href: '/organizations', active: active === 'organizations' },
      ]}
      userState={signedIn ? 'signed_in' : 'signed_out'}
      user={signedIn ? { displayName: 'Club Admin', cs2Level: 8 } : undefined}
      inviteCount={inviteCount}
      signInHref="/signin"
      onSignOut={fn()}
    />
  );
}

export const pageParameters = { layout: 'fullscreen' } as const;
export const mobileGlobals = { viewport: { value: 'mobile360', isRotated: false } };
