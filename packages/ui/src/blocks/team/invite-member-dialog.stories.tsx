import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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

export const Default: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Invite to Night Shift',
      }),
    );
    await userEvent.type(dialog.getByLabelText('FACEIT nickname or email'), 'ashfall');
    await userEvent.click(dialog.getByRole('button', { name: 'Search' }));
    await expect(args.onSearch).toHaveBeenCalledWith('ashfall');
  },
};

export const Searching: Story = { args: { searching: true } };

export const Results: Story = {
  args: { results: CANDIDATES },
  play: async ({ args, canvasElement, userEvent }) => {
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Invite to Night Shift',
      }),
    );
    await expect(
      dialog.getByRole('button', { name: 'Invite Sam Referee as player' }),
    ).toBeDisabled();
    await userEvent.click(dialog.getByRole('button', { name: 'Invite Ashfall as player' }));
    await expect(args.onInvite).toHaveBeenCalledWith({
      userId: CANDIDATES[0]!.userId,
      role: 'player',
    });
  },
};

export const NoResults: Story = { args: { results: [] } };
export const PlayerSlotsFull: Story = {
  args: { slots: { players: 0, coaches: 1 }, results: CANDIDATES },
};
export const TeamFull: Story = { args: { results: CANDIDATES, error: 'team_full' } };
export const AlreadyInvited: Story = { args: { results: CANDIDATES, error: 'already_invited' } };
export const Pending: Story = { args: { results: CANDIDATES, pending: true } };
