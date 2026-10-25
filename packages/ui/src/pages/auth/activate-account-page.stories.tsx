import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { orgInvite } from '../../mocks/invites';
import { MOCK_NOW } from '../../mocks/time';
import { ActivateAccountPage } from './activate-account-page';

const meta = {
  title: 'Pages/Auth/ActivateAccountPage',
  component: ActivateAccountPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ signedIn: false }),
    step: 'set_password',
    email: 'new.helper@mail.example',
    invite: orgInvite,
    now: MOCK_NOW,
    signInHref: '/signin',
    onSubmit: fn(),
    onAccept: fn(),
    onDecline: fn(),
  },
} satisfies Meta<typeof ActivateAccountPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SetPassword: Story = {};
export const AcceptInvite: Story = { args: { step: 'accept', header: mockHeader() } };
export const Expired: Story = { args: { step: 'expired' } };
export const Mobile: Story = { globals: mobileGlobals };
