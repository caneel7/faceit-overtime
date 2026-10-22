import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { ForgotPasswordForm } from './forgot-password-form';

const meta = {
  title: 'Auth/ForgotPasswordForm',
  component: ForgotPasswordForm,
  args: { onSubmit: fn() },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send reset link' }));
    await expect(canvas.getByText('Enter a valid email address.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.type(canvas.getByLabelText('Email'), 'admin@uni-esports.club');
    await userEvent.click(canvas.getByRole('button', { name: 'Send reset link' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: 'admin@uni-esports.club' });
  },
};

export const Pending: Story = { args: { pending: true } };

export const Sent: Story = {
  args: { sentTo: 'admin@uni-esports.club' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(/If an account exists for admin@uni-esports\.club/),
    ).toBeVisible();
  },
};

export const RateLimited: Story = { args: { error: 'rate_limited' } };

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-[360px] px-4">
        <Story />
      </div>
    ),
  ],
};
