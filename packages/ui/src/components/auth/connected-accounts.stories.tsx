import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ConnectedAccounts } from './connected-accounts';

const player = { nickname: 's1mple', cs2Level: 10, country: 'UA' };

const meta = {
  title: 'Auth/ConnectedAccounts',
  component: ConnectedAccounts,
  args: {
    faceit: { status: 'not_connected' },
    connectHref: '/api/auth/faceit/start?intent=link',
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectedAccounts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotConnected: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Connect with FACEIT' })).toHaveAttribute(
      'href',
      '/api/auth/faceit/start?intent=link',
    );
  },
};

export const Connected: Story = {
  args: { faceit: { status: 'connected', player } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Connected')).toBeVisible();
    await expect(
      canvas.queryByRole('link', { name: 'Connect with FACEIT' }),
    ).not.toBeInTheDocument();
  },
};

export const JustConnected: Story = {
  args: { faceit: { status: 'connected', player }, justConnected: true },
};

export const IdentityInUse: Story = {
  args: { error: 'identity_in_use' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'That FACEIT account belongs to another user',
    );
  },
};

export const AlreadyConnected: Story = {
  args: { faceit: { status: 'connected', player }, error: 'already_connected' },
};

export const SessionMismatch: Story = { args: { error: 'session_mismatch' } };

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-[360px] px-4">
        <Story />
      </div>
    ),
  ],
};
