import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { ResetPasswordForm } from './reset-password-form';

const meta = {
  title: 'Auth/ResetPasswordForm',
  component: ResetPasswordForm,
  args: { onSubmit: fn(), forgotPasswordHref: '/forgot-password' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('New password'), 'short');
    await userEvent.click(canvas.getByRole('button', { name: 'Set new password' }));
    await expect(canvas.getByText('Use 10 to 128 characters.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.clear(canvas.getByLabelText('New password'));
    await userEvent.type(canvas.getByLabelText('New password'), 'a much longer passphrase');
    await userEvent.click(canvas.getByRole('button', { name: 'Set new password' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ password: 'a much longer passphrase' });
  },
};

export const Pending: Story = { args: { pending: true } };

export const InvalidToken: Story = {
  args: { error: 'invalid_token' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Get a new link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
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
