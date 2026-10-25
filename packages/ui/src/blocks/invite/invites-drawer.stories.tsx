import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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

export const Mixed: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const drawer = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Invites' }),
    );
    await userEvent.click(drawer.getAllByRole('button', { name: 'Accept' })[0]!);
    await expect(args.onAccept).toHaveBeenCalledWith(teamPlayerInvite.id);
  },
};
export const NeedsFaceit: Story = { args: { faceitConnected: false } };
export const Accepting: Story = { args: { pendingId: teamPlayerInvite.id } };
export const Empty: Story = { args: { invites: [] } };
export const Mobile: Story = { globals: mobileGlobals };
