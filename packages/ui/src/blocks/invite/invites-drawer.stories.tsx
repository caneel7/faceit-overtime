import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals } from '../../mocks/header';
import { ALL_INVITES, teamPlayerInvite } from '../../mocks/invites';
import { MOCK_NOW } from '../../mocks/time';
import { InvitesDrawer } from './invites-drawer';

const meta = {
  title: 'Blocks/Invite/InvitesDrawer',
  component: InvitesDrawer,
  args: {
    open: true,
    onOpenChange: fn(),
    invites: ALL_INVITES,
    now: MOCK_NOW,
    faceitConnected: true,
    connectFaceitHref: '/settings',
    onAccept: fn(),
    onDecline: fn(),
  },
} satisfies Meta<typeof InvitesDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mixed: Story = {};
export const NeedsFaceit: Story = { args: { faceitConnected: false } };
export const Accepting: Story = { args: { pendingId: teamPlayerInvite.id } };
export const Empty: Story = { args: { invites: [] } };
export const Mobile: Story = { globals: mobileGlobals };
