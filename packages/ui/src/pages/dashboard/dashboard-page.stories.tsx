import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { PENDING_INVITES } from '../../mocks/invites';
import { MY_ORGS } from '../../mocks/orgs';
import { MY_TEAMS } from '../../mocks/teams';
import { MOCK_NOW } from '../../mocks/time';
import { DashboardPage } from './dashboard-page';

const meta = {
  title: 'Pages/Dashboard/DashboardPage',
  component: DashboardPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ inviteCount: PENDING_INVITES.length }),
    displayName: 'Club Admin',
    now: MOCK_NOW,
    orgs: MY_ORGS,
    teams: MY_TEAMS,
    invites: PENDING_INVITES,
    faceitConnected: true,
    connectFaceitHref: '/settings',
    orgHref: (slug: string) => `/o/${slug}/manage`,
    teamHref: (id: string) => `/teams/${id}`,
    registerOrgHref: '/organizations/new',
    createTeamHref: '/teams/new',
    invitesHref: '/invites',
    eventsHref: '/events',
    onAcceptInvite: fn(),
    onDeclineInvite: fn(),
  },
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};
export const NoInvites: Story = { args: { invites: [], header: mockHeader() } };
export const NewUser: Story = {
  args: { orgs: [], teams: [], invites: [], faceitConnected: false, header: mockHeader() },
};
export const OrganizerWithoutFaceit: Story = {
  args: { teams: [], invites: [], faceitConnected: false, header: mockHeader() },
};
export const Loading: Story = { args: { loading: true } };
export const Mobile: Story = { globals: mobileGlobals };
