import type { Meta, StoryObj } from '@storybook/react-vite';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { MY_TEAMS } from '../../mocks/teams';
import { MyTeamsPage } from './my-teams-page';

const meta = {
  title: 'Pages/Team/MyTeamsPage',
  component: MyTeamsPage,
  parameters: pageParameters,
  args: {
    header: mockHeader(),
    teams: MY_TEAMS,
    teamHref: (id: string) => `/teams/${id}`,
    createTeamHref: '/teams/new',
  },
} satisfies Meta<typeof MyTeamsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoTeams: Story = { args: { teams: [] } };
export const Loading: Story = { args: { loading: true } };
export const Mobile: Story = { globals: mobileGlobals };
