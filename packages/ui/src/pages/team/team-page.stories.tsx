import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { fn } from 'storybook/test';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import {
  CANDIDATES,
  captain,
  fullTeam,
  newTeam,
  partialTeam,
  viewerAsMember,
} from '../../mocks/teams';
import { MOCK_NOW } from '../../mocks/time';
import { TeamPage } from './team-page';

type Props = ComponentProps<typeof TeamPage>;

function Interactive(props: Props) {
  const [open, setOpen] = useState(props.inviteDialogOpen);
  const [results, setResults] = useState(props.searchResults);
  return (
    <TeamPage
      {...props}
      inviteDialogOpen={open}
      onInviteDialogOpenChange={(next) => {
        setOpen(next);
        if (!next) setResults(null);
      }}
      searchResults={results}
      onSearch={(query) => {
        props.onSearch(query);
        setResults(CANDIDATES);
      }}
      onInvite={(invite) => {
        props.onInvite(invite);
        setOpen(false);
      }}
    />
  );
}

const meta = {
  title: 'Pages/Team/TeamPage',
  component: TeamPage,
  parameters: pageParameters,
  render: (args) => <Interactive {...args} />,
  args: {
    header: mockHeader(),
    team: partialTeam,
    viewer: 'captain',
    viewerUserId: captain.userId,
    now: MOCK_NOW,
    inviteDialogOpen: false,
    onInviteDialogOpenChange: fn(),
    onSearch: fn(),
    searchResults: null,
    onInvite: fn(),
    onRemove: fn(),
    onLeave: fn(),
    onRevoke: fn(),
  },
} satisfies Meta<typeof TeamPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CaptainView: Story = {};
export const JustCreated: Story = { args: { team: newTeam } };
export const Full: Story = { args: { team: fullTeam } };
export const InviteOpen: Story = { args: { inviteDialogOpen: true, searchResults: CANDIDATES } };
export const MemberView: Story = {
  args: { team: fullTeam, viewer: 'member', viewerUserId: viewerAsMember.userId },
};
export const PublicView: Story = {
  args: {
    team: fullTeam,
    viewer: 'public',
    viewerUserId: undefined,
    header: mockHeader({ signedIn: false }),
  },
};
export const Mobile: Story = { globals: mobileGlobals };
