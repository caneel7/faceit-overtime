import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { CheckEmailNotice } from './check-email-notice';

const meta = {
  title: 'Blocks/Auth/CheckEmailNotice',
  component: CheckEmailNotice,
  args: { email: 'admin@uni-esports.club', kind: 'verify', onResend: fn() },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckEmailNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verify: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText(/admin@uni-esports\.club/)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Send it again' }));
    await expect(args.onResend).toHaveBeenCalledOnce();
  },
};

export const Resending: Story = {
  args: { resendPending: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  },
};

export const Resent: Story = { args: { resent: true } };

export const Reset: Story = {
  args: { kind: 'reset', onResend: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/If an account exists/)).toBeVisible();
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
