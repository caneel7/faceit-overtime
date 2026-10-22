import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { UserMenu } from './user-menu';

const meta = {
  title: 'Auth/UserMenu',
  component: UserMenu,
  args: {
    state: 'signed_in',
    user: { displayName: 'Club Admin', cs2Level: 8 },
    signInHref: '/signin?next=%2F',
    onSignOut: fn(),
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Account menu for Club Admin' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const page = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(page.getByRole('menu')).toBeVisible());
    await expect(page.getByRole('menuitem', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
    await userEvent.click(page.getByRole('menuitem', { name: 'Sign out' }));
    await expect(args.onSignOut).toHaveBeenCalledOnce();
  },
};

export const SignedInNoFaceit: Story = {
  args: { user: { displayName: 'Club Admin' } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Lvl/)).not.toBeInTheDocument();
  },
};

export const SignedOut: Story = {
  args: { state: 'signed_out', user: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/signin?next=%2F',
    );
  },
};

export const Loading: Story = {
  args: { state: 'loading', user: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Loading account' })).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="flex w-[360px] justify-end px-4">
        <Story />
      </div>
    ),
  ],
};
