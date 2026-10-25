import type { Meta, StoryObj } from '@storybook/react-vite';
import { almostFullEvent, anyoneEvent, openEvent, PUBLIC_EVENTS } from '../../mocks/events';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { LIVE_EVENTS, ONE_LIVE_EVENT } from '../../mocks/matches';
import { MOCK_NOW } from '../../mocks/time';
import { HomePage } from './home-page';

const forYou = [openEvent, almostFullEvent, anyoneEvent];
const openNow = PUBLIC_EVENTS.filter((e) => e.status === 'registration_open');

const meta = {
  title: 'Pages/Home/HomePage',
  component: HomePage,
  parameters: pageParameters,
  args: {
    header: mockHeader(),
    viewer: { kind: 'player', level: 7, region: 'EU', elo: 1720 },
    now: MOCK_NOW,
    openEvents: forYou,
    live: LIVE_EVENTS,
    eventHref: (id: string) => `/event/${id}`,
    allEventsHref: '/events',
    registerOrgHref: '/organizations/new',
    connectFaceitHref: '/settings',
    signUpHref: '/signup',
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Player: Story = {};

export const SignedOut: Story = {
  args: {
    viewer: { kind: 'signed_out' },
    header: mockHeader({ signedIn: false }),
    openEvents: openNow,
  },
};

export const SignedInWithoutFaceit: Story = {
  args: {
    viewer: { kind: 'no_faceit' },
    header: mockHeader({ faceitConnected: false }),
    openEvents: openNow,
  },
};

export const NothingAtYourLevel: Story = { args: { openEvents: [], live: ONE_LIVE_EVENT } };

export const NothingLive: Story = { args: { live: [] } };

export const Loading: Story = { args: { loading: true } };

export const Mobile: Story = { globals: mobileGlobals };
