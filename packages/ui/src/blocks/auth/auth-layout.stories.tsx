import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { AuthLayout } from './auth-layout';
import { CheckEmailNotice } from './check-email-notice';
import { SignInForm } from './sign-in-form';

const meta = {
  title: 'Blocks/Auth/AuthLayout',
  component: AuthLayout,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Sign in',
    description: 'Organisers can use email. Players sign in with FACEIT.',
    children: (
      <SignInForm
        onSubmit={fn()}
        faceitHref="/api/auth/faceit/start"
        forgotPasswordHref="/forgot-password"
      />
    ),
    footer: (
      <span>
        New here?{' '}
        <a href="/signup" className="text-foreground underline underline-offset-4">
          Create an account
        </a>
      </span>
    ),
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/signup',
    );
  },
};

export const CheckEmail: Story = {
  args: {
    title: 'Check your email',
    description: undefined,
    children: <CheckEmailNotice email="admin@uni-esports.club" kind="verify" onResend={fn()} />,
    footer: undefined,
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};
