import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SignUpForm } from './sign-up-form';

const meta = {
  title: 'Auth/SignUpForm',
  component: SignUpForm,
  args: { onSubmit: fn(), onEmailBlur: fn(), signInHref: '/signin' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Display name'), 'Club Admin');
    await userEvent.type(canvas.getByLabelText('Email'), 'admin@uni-esports.club');
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse battery');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(args.onEmailBlur).toHaveBeenCalledWith('admin@uni-esports.club');
    await expect(args.onSubmit).toHaveBeenCalledWith({
      displayName: 'Club Admin',
      email: 'admin@uni-esports.club',
      password: 'correct horse battery',
    });
  },
};

export const ShortPasswordOnBlur: Story = {
  play: async ({ canvas, userEvent }) => {
    const password = canvas.getByLabelText('Password');
    await userEvent.type(password, 'short');
    await userEvent.tab();
    await expect(canvas.getByText('Use 10 to 128 characters.')).toBeVisible();
    await userEvent.type(password, ' and longer');
    await expect(canvas.queryByText('Use 10 to 128 characters.')).not.toBeInTheDocument();
  },
};

export const ShortPassword: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Display name'), 'Club Admin');
    await userEvent.type(canvas.getByLabelText('Email'), 'admin@uni-esports.club');
    await userEvent.type(canvas.getByLabelText('Password'), 'short');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(canvas.getByText('Use 10 to 128 characters.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Creating account…' })).toBeDisabled();
  },
};

export const ServerFieldErrors: Story = {
  args: { fieldErrors: { email: 'Enter a valid email address.' } },
};

export const CheckingEmail: Story = { args: { emailStatus: 'checking' } };

export const EmailTaken: Story = {
  args: { emailStatus: 'taken' },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('link', { name: 'Sign in instead' })).toHaveAttribute(
      'href',
      '/signin',
    );
    await expect(canvas.getByRole('button', { name: 'Create account' })).toBeDisabled();
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse battery');
    await expect(args.onSubmit).not.toHaveBeenCalled();
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
