import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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

export const Default: Story = {};

export const AlreadyMember: Story = { args: { error: 'already_member' } };
export const AlreadyInvited: Story = { args: { error: 'already_invited' } };
export const Pending: Story = { args: { pending: true } };
