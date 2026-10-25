import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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

export const TeamPlayer: Story = {};
export const TeamCoach: Story = { args: { invite: teamCoachInvite } };
export const Org: Story = { args: { invite: orgInvite } };
export const NeedsFaceit: Story = { args: { faceitConnected: false } };
export const CoachWithoutFaceit: Story = {
  args: { invite: teamCoachInvite, faceitConnected: false },
};
export const Accepting: Story = { args: { pending: true } };
export const Expired: Story = { args: { invite: expiredInvite } };
export const Accepted: Story = { args: { invite: acceptedInvite } };
