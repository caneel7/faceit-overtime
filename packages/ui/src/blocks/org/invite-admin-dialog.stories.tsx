import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { InviteAdminDialog } from './invite-admin-dialog';

const meta = {
  title: 'Blocks/Org/InviteAdminDialog',
  component: InviteAdminDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    orgName: 'Uni Esports Club',
    onSubmit: fn(),
  },
} satisfies Meta<typeof InviteAdminDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Invite an admin',
      }),
    );
    await userEvent.type(dialog.getByLabelText('Email'), 'sam@uni-esports.example');
    await userEvent.click(dialog.getByRole('button', { name: 'Send invite' }));
    await expect(args.onSubmit).toHaveBeenCalledWith('sam@uni-esports.example');
  },
};

export const InvalidOnBlur: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Invite an admin',
      }),
    );
    await userEvent.type(dialog.getByLabelText('Email'), 'sam@');
    await userEvent.tab();
    await expect(dialog.getByText('Enter a valid email address.')).toBeVisible();
  },
};

export const AlreadyMember: Story = { args: { error: 'already_member' } };
export const AlreadyInvited: Story = { args: { error: 'already_invited' } };
export const Pending: Story = { args: { pending: true } };
