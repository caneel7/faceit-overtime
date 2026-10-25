import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { VerifyEmailStatus } from './verify-email-status';

const meta = {
  title: 'Blocks/Auth/VerifyEmailStatus',
  component: VerifyEmailStatus,
  args: { state: 'verifying', signInHref: '/signin' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VerifyEmailStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verifying: Story = {};

export const LinkInvalid: Story = {
  args: { state: 'error' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent("This link doesn't work any more");
    await expect(canvas.getByRole('link', { name: 'Go to sign in' })).toHaveAttribute(
      'href',
      '/signin',
    );
  },
};

export const Mobile: Story = {
  args: { state: 'error' },
  decorators: [
    (Story) => (
      <div className="w-[360px] px-4">
        <Story />
      </div>
    ),
  ],
};
