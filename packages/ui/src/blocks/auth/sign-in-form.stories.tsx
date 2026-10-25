import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SignInForm } from './sign-in-form';

const meta = {
  title: 'Blocks/Auth/SignInForm',
  component: SignInForm,
  args: {
    onSubmit: fn(),
    onResendVerification: fn(),
    faceitHref: '/api/auth/faceit/start?next=%2Fdashboard',
    forgotPasswordHref: '/forgot-password',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('link', { name: 'Sign in with FACEIT' })).toHaveAttribute(
      'href',
      '/api/auth/faceit/start?next=%2Fdashboard',
    );
    await userEvent.type(canvas.getByLabelText('Email'), '  admin@uni-esports.club ');
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse battery');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: 'admin@uni-esports.club',
      password: 'correct horse battery',
    });
  },
};

export const EmptySubmit: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await expect(canvas.getByText('Enter a valid email address.')).toBeVisible();
    await expect(canvas.getByText('Enter your password.')).toBeVisible();
    await expect(canvas.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const InvalidEmailOnBlur: Story = {
  play: async ({ canvas, userEvent }) => {
    const email = canvas.getByLabelText('Email');
    await userEvent.type(email, 'admin@');
    await userEvent.tab();
    await expect(canvas.getByText('Enter a valid email address.')).toBeVisible();
    await userEvent.type(email, 'uni-esports.club');
    await expect(canvas.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
  },
};

export const InvalidCredentials: Story = {
  args: { error: 'invalid_credentials' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Email or password is incorrect');
    await expect(
      canvas.queryByRole('button', { name: 'Send a new verification link' }),
    ).not.toBeInTheDocument();
  },
};

export const EmailNotVerified: Story = {
  args: { error: 'email_not_verified' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send a new verification link' }));
    await expect(args.onResendVerification).toHaveBeenCalledOnce();
  },
};

export const ResendingVerification: Story = {
  args: { error: 'email_not_verified', resendPending: true },
};

export const RateLimited: Story = { args: { error: 'rate_limited' } };
export const FaceitUnavailable: Story = { args: { error: 'faceit_unavailable' } };
export const FaceitCancelled: Story = { args: { error: 'access_denied' } };
export const StateMismatch: Story = { args: { error: 'state_mismatch' } };

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-[360px] px-4">
        <Story />
      </div>
    ),
  ],
};
