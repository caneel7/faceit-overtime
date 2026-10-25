import type { ReactNode } from 'react';
import { EventList } from '../../blocks/event/event-list';
import { PageShell } from '../../blocks/layout/page-shell';
import { AdminList } from '../../blocks/org/admin-list';
import { InviteAdminDialog, type InviteAdminError } from '../../blocks/org/invite-admin-dialog';
import { OrgSwitcher } from '../../blocks/org/org-switcher';
import type { EventStatus, EventSummary } from '../../models/event';
import type { MyOrg, OrgAdmin, OrgPendingAdmin, OrgRole, OrgSummary } from '../../models/org';
import { Button } from '../../primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../primitives/tabs';

type OrgDashboardPageProps = {
  header: ReactNode;
  org: OrgSummary;
  viewerRole: OrgRole;
  myOrgs: MyOrg[];
  orgHref: (slug: string) => string;
  allOrgsHref: string;
  registerOrgHref: string;
  now: string;
  events: EventSummary[];
  eventsLoading?: boolean;
  eventManageHref: (slug: string) => string;
  createEventHref: string;
  publicHref: string;
  admins: OrgAdmin[];
  pendingAdmins: OrgPendingAdmin[];
  inviteDialogOpen: boolean;
  onInviteDialogOpenChange: (open: boolean) => void;
  onInviteAdmin: (email: string) => void;
  inviteAdminPending?: boolean;
  inviteAdminError?: InviteAdminError;
  onRemoveAdmin: (userId: string) => void;
  onRevokeInvite: (inviteId: string) => void;
  defaultTab?: 'admins';
};

type Group = { value: string; title: string; statuses: EventStatus[]; empty: string };

const GROUPS: Group[] = [
  { value: 'drafts', title: 'Drafts', statuses: ['draft'], empty: 'No drafts.' },
  {
    value: 'registration',
    title: 'Registration',
    statuses: ['registration_open', 'registration_closed'],
    empty: 'No events taking or closing registration.',
  },
  { value: 'live', title: 'Live', statuses: ['in_progress'], empty: 'Nothing being played.' },
  {
    value: 'past',
    title: 'Past',
    statuses: ['completed', 'cancelled'],
    empty: 'No finished or cancelled events yet.',
  },
];

export function OrgDashboardPage({
  header,
  org,
  viewerRole,
  myOrgs,
  orgHref,
  allOrgsHref,
  registerOrgHref,
  now,
  events,
  eventsLoading,
  eventManageHref,
  createEventHref,
  publicHref,
  admins,
  pendingAdmins,
  inviteDialogOpen,
  onInviteDialogOpenChange,
  onInviteAdmin,
  inviteAdminPending,
  inviteAdminError,
  onRemoveAdmin,
  onRevokeInvite,
  defaultTab,
}: OrgDashboardPageProps) {
  const createButton = (
    <Button asChild>
      <a href={createEventHref}>Create event</a>
    </Button>
  );

  const byGroup = (group: Group) => events.filter((e) => group.statuses.includes(e.status));
  const initialTab =
    defaultTab ?? GROUPS.find((group) => byGroup(group).length > 0)?.value ?? 'drafts';

  return (
    <PageShell header={header}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          <h1 className="sr-only">{org.name}</h1>
          <OrgSwitcher
            current={org}
            orgs={myOrgs}
            orgHref={orgHref}
            allOrgsHref={allOrgsHref}
            registerOrgHref={registerOrgHref}
          />
          <p className="pl-1 text-sm text-muted-foreground">
            {viewerRole === 'owner' ? 'You own this organization' : 'You are an admin'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={publicHref}>View public page</a>
          </Button>
          {createButton}
        </div>
      </div>

      {eventsLoading || events.length === 0 ? (
        <EventList
          events={[]}
          loading={eventsLoading}
          hrefFor={eventManageHref}
          now={now}
          emptyTitle="No events yet"
          emptyDescription="Create your first event. It starts as a draft only your admins can see, and you can edit it until registration opens."
          emptyAction={createButton}
        />
      ) : null}

      <Tabs defaultValue={initialTab}>
        <TabsList>
          {GROUPS.map((group) => (
            <TabsTrigger key={group.value} value={group.value}>
              {group.title}
              <span className="text-xs text-muted-foreground tabular-nums">
                {byGroup(group).length}
              </span>
            </TabsTrigger>
          ))}
          <TabsTrigger value="admins">
            Admins
            <span className="text-xs text-muted-foreground tabular-nums">{admins.length}</span>
          </TabsTrigger>
        </TabsList>

        {GROUPS.map((group) => (
          <TabsContent key={group.value} value={group.value}>
            <EventList
              events={byGroup(group)}
              hrefFor={eventManageHref}
              now={now}
              emptyTitle={group.empty}
            />
          </TabsContent>
        ))}

        <TabsContent value="admins">
          <AdminList
            admins={admins}
            pending={pendingAdmins}
            viewerRole={viewerRole}
            now={now}
            onInvite={() => onInviteDialogOpenChange(true)}
            onRemove={onRemoveAdmin}
            onRevoke={onRevokeInvite}
          />
        </TabsContent>
      </Tabs>

      <InviteAdminDialog
        open={inviteDialogOpen}
        onOpenChange={onInviteDialogOpenChange}
        orgName={org.name}
        onSubmit={onInviteAdmin}
        pending={inviteAdminPending}
        error={inviteAdminError}
      />
    </PageShell>
  );
}
