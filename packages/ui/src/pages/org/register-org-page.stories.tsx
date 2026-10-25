import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { RegisterOrgPage } from './register-org-page';

const meta = {
  title: 'Pages/Org/RegisterOrgPage',
  component: RegisterOrgPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ signedIn: false }),
    mode: 'signed_out',
    appOrigin: 'https://overtime.caneel.dev',
    onSubmit: fn(),
    onSlugBlur: fn(),
    signInHref: '/signin?next=%2Forganizations%2Fnew',
  },
} satisfies Meta<typeof RegisterOrgPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};
export const SignedIn: Story = {
  args: { mode: 'signed_in', header: mockHeader() },
};
export const SlugTaken: Story = {
  args: { mode: 'signed_in', header: mockHeader(), slugStatus: 'taken' },
};
export const Mobile: Story = { globals: mobileGlobals };
