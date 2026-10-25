import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { kestrel } from '../../mocks/players';
import {
  AddEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  SettingsPage,
  SignInPage,
  SignUpPage,
  VerifyEmailPage,
} from './auth-pages';

const signedOut = mockHeader({ signedIn: false });

const meta = {
  title: 'Pages/Auth/AuthPages',
  component: SignInPage,
  parameters: pageParameters,
  args: {
    header: signedOut,
    onSubmit: fn(),
    faceitHref: '/api/auth/faceit/start?next=%2Fdashboard',
    forgotPasswordHref: '/forgot-password',
    signUpHref: '/signup',
  },
} satisfies Meta<typeof SignInPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {};
export const SignInError: Story = { args: { error: 'invalid_credentials' } };
export const SignInMobile: Story = { globals: mobileGlobals };

export const SignUp: Story = {
  render: () => (
    <SignUpPage
      header={signedOut}
      onSubmit={fn()}
      onEmailBlur={fn()}
      signInHref="/signin"
      registerOrgHref="/organizations/new"
    />
  ),
};

export const SignUpSent: Story = {
  render: () => (
    <SignUpPage
      header={signedOut}
      onSubmit={fn()}
      signInHref="/signin"
      registerOrgHref="/organizations/new"
      sentTo="admin@uni-esports.example"
      onResend={fn()}
    />
  ),
};

export const VerifyingEmail: Story = {
  render: () => <VerifyEmailPage header={signedOut} state="verifying" signInHref="/signin" />,
};

export const VerifyLinkInvalid: Story = {
  render: () => <VerifyEmailPage header={signedOut} state="error" signInHref="/signin" />,
};

export const ForgotPassword: Story = {
  render: () => <ForgotPasswordPage header={signedOut} onSubmit={fn()} signInHref="/signin" />,
};

export const ResetPassword: Story = {
  render: () => (
    <ResetPasswordPage header={signedOut} onSubmit={fn()} forgotPasswordHref="/forgot-password" />
  ),
};

export const AddEmail: Story = {
  render: () => (
    <AddEmailPage
      header={mockHeader()}
      suggestedEmail="kestrel.plays@mail.example"
      onSubmit={fn()}
      signInHref="/signin"
    />
  ),
};

export const AddEmailMobile: Story = { ...AddEmail, globals: mobileGlobals };

export const Settings: Story = {
  render: () => (
    <SettingsPage
      header={mockHeader()}
      account={{
        displayName: 'Club Admin',
        email: 'admin@uni-esports.example',
        emailVerified: true,
        hasPassword: true,
      }}
      connected={{ faceit: { status: 'not_connected' }, onConnect: fn() }}
    />
  ),
};

export const SettingsFaceitOnly: Story = {
  render: () => (
    <SettingsPage
      header={mockHeader()}
      account={{ displayName: 'Kestrel', email: null, emailVerified: false, hasPassword: false }}
      connected={{
        faceit: {
          status: 'connected',
          player: {
            nickname: kestrel.nickname,
            cs2Level: kestrel.cs2Level,
            country: kestrel.country,
          },
        },
        onConnect: fn(),
      }}
      addEmailHref="/settings/email"
    />
  ),
};
