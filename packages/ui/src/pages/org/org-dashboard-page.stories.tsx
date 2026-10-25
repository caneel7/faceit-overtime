import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { fn } from 'storybook/test';
import { ADMINS, owner, PENDING_ADMINS } from '../../mocks/admins';
import { ORG_EVENTS } from '../../mocks/events';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { MY_ORGS, uniEsportsClub } from '../../mocks/orgs';
import { MOCK_NOW } from '../../mocks/time';
import { OrgDashboardPage } from './org-dashboard-page';

type Props = ComponentProps<typeof OrgDashboardPage>;

function Interactive(props: Props) {
  const [open, setOpen] = useState(props.inviteDialogOpen);
  return (
    <OrgDashboardPage
      {...props}
      inviteDialogOpen={open}
      onInviteDialogOpenChange={setOpen}
      onInviteAdmin={(email) => {
        props.onInviteAdmin(email);
        setOpen(false);
      }}
    />
  );
}

const meta = {
  title: 'Pages/Org/OrgDashboardPage',
  component: OrgDashboardPage,
  parameters: pageParameters,
  render: (args) => <Interactive {...args} />,
  args: {
    header: mockHeader(),
    org: uniEsportsClub,
    viewerRole: 'owner',
    myOrgs: MY_ORGS,
    orgHref: (slug: string) => `/o/${slug}/manage`,
    allOrgsHref: '/orgs',
    registerOrgHref: '/organizations/new',
    now: MOCK_NOW,
    events: ORG_EVENTS,
    eventManageHref: (slug: string) => `/event/${slug}/manage`,
    createEventHref: '/o/uni-esports-club/events/new',
    publicHref: '/o/uni-esports-club',
    admins: ADMINS,
    pendingAdmins: PENDING_ADMINS,
    inviteDialogOpen: false,
    onInviteDialogOpenChange: fn(),
    onInviteAdmin: fn(),
    onRemoveAdmin: fn(),
    onRevokeInvite: fn(),
  },
} satisfies Meta<typeof OrgDashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEvents: Story = {};
export const NewOrg: Story = { args: { events: [], admins: [owner], pendingAdmins: [] } };
export const LoadingEvents: Story = { args: { events: [], eventsLoading: true } };
export const AdminsTab: Story = { args: { defaultTab: 'admins' } };
export const InviteDialogOpen: Story = { args: { defaultTab: 'admins', inviteDialogOpen: true } };
export const InviteAlreadyInvited: Story = {
  args: { defaultTab: 'admins', inviteDialogOpen: true, inviteAdminError: 'already_invited' },
};
export const AdminView: Story = { args: { viewerRole: 'admin', defaultTab: 'admins' } };
export const Mobile: Story = { globals: mobileGlobals };
