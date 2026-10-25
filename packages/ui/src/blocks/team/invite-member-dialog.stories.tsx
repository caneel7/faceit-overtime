import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CANDIDATES } from '../../mocks/teams';
import { InviteMemberDialog } from './invite-member-dialog';

const meta = {
  title: 'Blocks/Team/InviteMemberDialog',
  component: InviteMemberDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    teamName: 'Night Shift',
    slots: { players: 2, coaches: 1 },
    onSearch: fn(),
    results: null,
    onInvite: fn(),
  },
} satisfies Meta<typeof InviteMemberDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searching: Story = { args: { searching: true } };

export const Results: Story = { args: { results: CANDIDATES } };

export const NoResults: Story = { args: { results: [] } };
export const PlayerSlotsFull: Story = {
  args: { slots: { players: 0, coaches: 1 }, results: CANDIDATES },
};
export const TeamFull: Story = { args: { results: CANDIDATES, error: 'team_full' } };
export const AlreadyInvited: Story = { args: { results: CANDIDATES, error: 'already_invited' } };
export const Pending: Story = { args: { results: CANDIDATES, pending: true } };
