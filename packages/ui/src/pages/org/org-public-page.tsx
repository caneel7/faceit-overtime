import type { ReactNode } from 'react';
import { EventList } from '../../blocks/event/event-list';
import { PageShell } from '../../blocks/layout/page-shell';
import { OrgHeader } from '../../blocks/org/org-header';
import type { EventStatus, EventSummary } from '../../models/event';
import type { OrgSummary } from '../../models/org';
import { Button } from '../../primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../primitives/tabs';

type OrgPublicPageProps = {
  header: ReactNode;
  org: OrgSummary;
  events: EventSummary[];
  now: string;
  eventHref: (id: string) => string;
  manageHref?: string;
};

const TABS: { value: string; label: string; statuses: EventStatus[]; empty: string }[] = [
  {
    value: 'upcoming',
    label: 'Upcoming',
    statuses: ['registration_open', 'registration_closed'],
    empty: 'Nothing open right now. Check back soon.',
  },
  {
    value: 'live',
    label: 'Live',
    statuses: ['in_progress'],
    empty: 'Nothing is being played right now.',
  },
  {
    value: 'finished',
    label: 'Finished',
    statuses: ['completed', 'cancelled'],
    empty: 'No past events yet.',
  },
];

export function OrgPublicPage({
  header,
  org,
  events,
  now,
  eventHref,
  manageHref,
}: OrgPublicPageProps) {
  const visible = events.filter((e) => e.status !== 'draft');
  return (
    <PageShell header={header}>
      <OrgHeader
        org={org}
        subtitle={`${visible.length} ${visible.length === 1 ? 'event' : 'events'} on Overtime`}
        actions={
          manageHref ? (
            <Button asChild variant="outline">
              <a href={manageHref}>Manage</a>
            </Button>
          ) : null
        }
      />
      <Tabs defaultValue="upcoming">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="text-xs text-muted-foreground tabular-nums">
                {visible.filter((e) => tab.statuses.includes(e.status)).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <EventList
              events={visible.filter((e) => tab.statuses.includes(e.status))}
              hrefFor={eventHref}
              now={now}
              emptyTitle={tab.empty}
            />
          </TabsContent>
        ))}
      </Tabs>
    </PageShell>
  );
}
