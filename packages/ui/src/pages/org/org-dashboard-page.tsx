import type { ReactNode } from 'react';
import { EventList } from '../../blocks/event/event-list';
import { PageShell } from '../../blocks/layout/page-shell';
import { AdminList } from '../../blocks/org/admin-list';
import { InviteAdminDialog, type InviteAdminError } from '../../blocks/org/invite-admin-dialog';
import { OrgHeader } from '../../blocks/org/org-header';
import type { EventStatus, EventSummary } from '../../models/event';
import type { OrgAdmin, OrgPendingAdmin, OrgRole, OrgSummary } from '../../models/org';
import { Button } from '../../primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../primitives/tabs';

type OrgDashboardPageProps = {
  header: ReactNode;
  org: OrgSummary;
  viewerRole: OrgRole;
  now: string;
  events: EventSummary[];
  eventsLoading?: boolean;
  eventManageHref: (id: string) => string;
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
  defaultTab?: 'events' | 'admins';
};

const GROUPS: { title: string; statuses: EventStatus[] }[] = [
  { title: 'Drafts', statuses: ['draft'] },
  { title: 'Registration', statuses: ['registration_open', 'registration_closed'] },
  { title: 'Live', statuses: ['in_progress'] },
  { title: 'Past', statuses: ['completed', 'cancelled'] },
];

export function OrgDashboardPage({
  header,
  org,
  viewerRole,
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
  defaultTab = 'events',
}: OrgDashboardPageProps) {
  const createButton = (
    <Button asChild>
      <a href={createEventHref}>Create event</a>
    </Button>
  );

  return (
    <PageShell header={header}>
      <OrgHeader
        org={org}
        subtitle={viewerRole === 'owner' ? 'You own this organization' : 'You are an admin'}
        actions={
          <>
            <Button asChild variant="outline">
              <a href={publicHref}>View public page</a>
            </Button>
            {createButton}
          </>
        }
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="admins">
            Admins
            <span className="text-xs text-muted-foreground tabular-nums">{admins.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="grid gap-8">
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
          ) : (
            GROUPS.map((group) => {
              const inGroup = events.filter((e) => group.statuses.includes(e.status));
              if (inGroup.length === 0) return null;
              return (
                <section key={group.title} className="grid gap-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {group.title} <span className="tabular-nums">({inGroup.length})</span>
                  </h2>
                  <EventList events={inGroup} hrefFor={eventManageHref} now={now} />
                </section>
              );
            })
          )}
        </TabsContent>

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
