import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { CreateTeamPage } from './create-team-page';

const meta = {
  title: 'Pages/Team/CreateTeamPage',
  component: CreateTeamPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ active: 'teams' }),
    faceitConnected: true,
    connectFaceitHref: '/settings',
    onSubmit: fn(),
  },
} satisfies Meta<typeof CreateTeamPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoFaceit: Story = { args: { faceitConnected: false } };
export const Mobile: Story = { globals: mobileGlobals };
