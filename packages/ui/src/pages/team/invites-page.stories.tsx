import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { ALL_INVITES, teamPlayerInvite } from '../../mocks/invites';
import { MOCK_NOW } from '../../mocks/time';
import { InvitesPage } from './invites-page';

const meta = {
  title: 'Pages/Team/InvitesPage',
  component: InvitesPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ inviteCount: 3 }),
    invites: ALL_INVITES,
    now: MOCK_NOW,
    faceitConnected: true,
    connectFaceitHref: '/settings',
    onAccept: fn(),
    onDecline: fn(),
  },
} satisfies Meta<typeof InvitesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mixed: Story = {};
export const NeedsFaceit: Story = { args: { faceitConnected: false } };
export const Accepting: Story = { args: { pendingId: teamPlayerInvite.id } };
export const Empty: Story = { args: { invites: [], header: mockHeader() } };
export const Mobile: Story = { globals: mobileGlobals };
