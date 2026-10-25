import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals } from '../../mocks/header';
import { RegisterOrgForm } from './register-org-form';

const meta = {
  title: 'Blocks/Org/RegisterOrgForm',
  component: RegisterOrgForm,
  args: {
    mode: 'signed_out',
    appOrigin: 'https://overtime.caneel.dev',
    onSubmit: fn(),
    onSlugBlur: fn(),
    signInHref: '/signin?next=%2Forganizations%2Fnew',
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegisterOrgForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const SignedIn: Story = { args: { mode: 'signed_in' } };

export const SlugChecking: Story = { args: { mode: 'signed_in', slugStatus: 'checking' } };
export const SlugAvailable: Story = { args: { mode: 'signed_in', slugStatus: 'available' } };
export const SlugTaken: Story = { args: { mode: 'signed_in', slugStatus: 'taken' } };
export const EmailTaken: Story = { args: { error: 'email_taken' } };
export const RateLimited: Story = { args: { error: 'rate_limited' } };
export const Pending: Story = { args: { pending: true } };
export const Mobile: Story = { globals: mobileGlobals };
