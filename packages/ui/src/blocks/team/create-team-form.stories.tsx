import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals } from '../../mocks/header';
import { CreateTeamForm } from './create-team-form';

const meta = {
  title: 'Blocks/Team/CreateTeamForm',
  component: CreateTeamForm,
  args: { faceitConnected: true, connectFaceitHref: '/settings', onSubmit: fn() },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateTeamForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoFaceit: Story = { args: { faceitConnected: false } };

export const Pending: Story = { args: { pending: true } };
export const Mobile: Story = { globals: mobileGlobals };
