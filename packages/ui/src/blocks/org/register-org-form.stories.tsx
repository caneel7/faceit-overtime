import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
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

export const SignedOut: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Your display name'), 'Club Admin');
    await userEvent.type(canvas.getByLabelText('Email'), 'admin@uni-esports.example');
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse battery');
    await userEvent.type(canvas.getByLabelText('Organization name'), 'Uni Esports Club');
    await expect(canvas.getByLabelText('Address')).toHaveValue('uni-esports-club');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account and organization' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      org: { name: 'Uni Esports Club', slug: 'uni-esports-club' },
      account: {
        displayName: 'Club Admin',
        email: 'admin@uni-esports.example',
        password: 'correct horse battery',
      },
    });
  },
};

export const SignedIn: Story = {
  args: { mode: 'signed_in' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Organization name'), 'Night Owls League');
    await userEvent.click(canvas.getByRole('button', { name: 'Register organization' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      org: { name: 'Night Owls League', slug: 'night-owls-league' },
      account: null,
    });
  },
};

export const SlugInvalidOnBlur: Story = {
  args: { mode: 'signed_in' },
  play: async ({ args, canvas, userEvent }) => {
    const slug = canvas.getByLabelText('Address');
    await userEvent.type(slug, 'ab');
    await userEvent.tab();
    await expect(
      canvas.getByText('Use 3 to 40 lowercase letters, numbers or dashes.'),
    ).toBeVisible();
    await expect(args.onSlugBlur).not.toHaveBeenCalled();
  },
};

export const SlugChecking: Story = { args: { mode: 'signed_in', slugStatus: 'checking' } };
export const SlugAvailable: Story = { args: { mode: 'signed_in', slugStatus: 'available' } };
export const SlugTaken: Story = { args: { mode: 'signed_in', slugStatus: 'taken' } };
export const EmailTaken: Story = { args: { error: 'email_taken' } };
export const RateLimited: Story = { args: { error: 'rate_limited' } };
export const Pending: Story = { args: { pending: true } };
export const Mobile: Story = { globals: mobileGlobals };
