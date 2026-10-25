import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import {
  acceptedInvite,
  expiredInvite,
  orgInvite,
  teamCoachInvite,
  teamPlayerInvite,
} from '../../mocks/invites';
import { MOCK_NOW } from '../../mocks/time';
import { InviteCard } from './invite-card';

const meta = {
  title: 'Blocks/Invite/InviteCard',
  component: InviteCard,
  args: {
    invite: teamPlayerInvite,
    now: MOCK_NOW,
    faceitConnected: true,
    connectFaceitHref: '/settings',
    onAccept: fn(),
    onDecline: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InviteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TeamPlayer: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Accept' }));
    await expect(args.onAccept).toHaveBeenCalledWith(teamPlayerInvite.id);
  },
};
export const TeamCoach: Story = { args: { invite: teamCoachInvite } };
export const Org: Story = { args: { invite: orgInvite } };
export const NeedsFaceit: Story = {
  args: { faceitConnected: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Accept' })).toBeDisabled();
  },
};
export const CoachWithoutFaceit: Story = {
  args: { invite: teamCoachInvite, faceitConnected: false },
};
export const Accepting: Story = { args: { pending: true } };
export const Expired: Story = { args: { invite: expiredInvite } };
export const Accepted: Story = { args: { invite: acceptedInvite } };
