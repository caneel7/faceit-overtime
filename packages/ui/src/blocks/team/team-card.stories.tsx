import type { Meta, StoryObj } from '@storybook/react-vite';
import { MY_TEAMS } from '../../mocks/teams';
import { CreateTeamCard, TeamCard } from './team-card';

const meta = {
  title: 'Blocks/Team/TeamCard',
  component: TeamCard,
  args: { team: MY_TEAMS[0]!, href: '/teams/1' },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TeamCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Captain: Story = {};
export const Coach: Story = { args: { team: MY_TEAMS[1]! } };
export const NoElo: Story = { args: { team: MY_TEAMS[2]! } };
export const CreateCard: Story = { render: () => <CreateTeamCard href="/teams/new" /> };
