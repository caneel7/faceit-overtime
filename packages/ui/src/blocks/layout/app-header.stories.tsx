import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { AppHeader } from './app-header';

const nav = [
  { label: 'Events', href: '/events', active: true },
  { label: 'Teams', href: '/teams' },
  { label: 'Organizations', href: '/organizations' },
];

const meta = {
  title: 'Blocks/Layout/AppHeader',
  component: AppHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    nav,
    userState: 'signed_in',
    user: { displayName: 'Club Admin', cs2Level: 8 },
    signInHref: '/signin',
    onSignOut: fn(),
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};

export const SignedOut: Story = { args: { userState: 'signed_out', user: undefined } };

export const Loading: Story = { args: { userState: 'loading', user: undefined } };

export const WithInvites: Story = {
  args: { inviteCount: 3 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Invites, 3 pending' })).toHaveAttribute(
      'href',
      '/invites',
    );
  },
};

export const ManyInvites: Story = { args: { inviteCount: 14 } };

export const Mobile: Story = {
  args: { inviteCount: 2 },
  globals: { viewport: { value: 'mobile360', isRotated: false } },
};
