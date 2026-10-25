import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals } from '../../mocks/header';
import { captain, fullTeam, newTeam, partialTeam, viewerAsMember } from '../../mocks/teams';
import { MOCK_NOW } from '../../mocks/time';
import { Button } from '../../primitives/button';
import { MemberList } from './member-list';
import { PendingInviteList } from './pending-invite-list';
import { RoleBadge } from './role-badge';
import { TeamHeader } from './team-header';
import { TeamSlots } from './team-slots';

const meta = {
  title: 'Blocks/Team/Roster',
  component: MemberList,
  parameters: { layout: 'padded' },
  args: {
    members: fullTeam.members,
    viewer: 'captain',
    viewerUserId: captain.userId,
    onRemove: fn(),
    onLeave: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MemberList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CaptainView: Story = {};
export const MemberView: Story = {
  args: { viewer: 'member', viewerUserId: viewerAsMember.userId },
};
export const PublicView: Story = { args: { viewer: 'public', viewerUserId: undefined } };
export const OnlyCaptain: Story = { args: { members: newTeam.members } };
export const Mobile: Story = { globals: mobileGlobals };

export const Header: Story = {
  render: () => (
    <div className="grid gap-8">
      <TeamHeader team={fullTeam} actions={<Button>Invite member</Button>} />
      <TeamHeader team={partialTeam} />
      <TeamHeader team={{ ...newTeam, avgElo: null, members: [] }} />
    </div>
  ),
};

export const Slots: Story = {
  render: () => (
    <div className="grid gap-2">
      <TeamSlots members={newTeam.members} pendingInvites={[]} />
      <TeamSlots members={partialTeam.members} pendingInvites={partialTeam.pendingInvites} />
      <TeamSlots members={fullTeam.members} pendingInvites={[]} />
    </div>
  ),
};

export const RoleBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <RoleBadge role="player" isCaptain />
      <RoleBadge role="player" />
      <RoleBadge role="coach" />
    </div>
  ),
};

export const PendingInvites: Story = {
  render: () => (
    <div className="grid max-w-sm gap-6">
      <PendingInviteList invites={partialTeam.pendingInvites} now={MOCK_NOW} onRevoke={fn()} />
      <PendingInviteList invites={[]} now={MOCK_NOW} onRevoke={fn()} />
    </div>
  ),
};
