import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AccountDetails } from './account-details';

const meta = {
  title: 'Blocks/Auth/AccountDetails',
  component: AccountDetails,
  args: {
    displayName: 'Club Admin',
    email: 'admin@uni-esports.club',
    emailVerified: true,
    hasPassword: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verified: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Verified')).toBeVisible();
  },
};

export const NotVerified: Story = { args: { emailVerified: false } };

export const FaceitOnly: Story = {
  args: { email: null, emailVerified: false, hasPassword: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('None, you sign in with FACEIT')).toBeVisible();
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-[360px] px-4">
        <Story />
      </div>
    ),
  ],
};
