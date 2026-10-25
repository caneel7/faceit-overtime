import type { ReactNode } from 'react';
import { EligibilitySummary } from '../../blocks/event/eligibility-summary';
import { EventHeader } from '../../blocks/event/event-header';
import { EventSettingsView } from '../../blocks/event/event-settings-view';
import { isFull } from '../../blocks/event/format';
import { PageShell } from '../../blocks/layout/page-shell';
import type { EventDetail } from '../../models/event';
import { Button } from '../../primitives/button';
import { Card, CardContent } from '../../primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../primitives/tabs';

type EventPageProps = {
  header: ReactNode;
  event: EventDetail;
  viewer: 'public' | 'admin';
  now: string;
  orgHref: string;
  manageHref: string;
  registerHref?: string;
};

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function EntryCard({ event, registerHref }: { event: EventDetail; registerHref?: string }) {
  if (event.status !== 'registration_open') return null;
  return (
    <Card>
      <CardContent className="grid gap-3">
        {isFull(event) ? (
          <p className="text-sm text-muted-foreground">
            Every slot is taken. Registration stays open in case a team withdraws.
          </p>
        ) : (
          <>
            <p className="text-sm">
              Captains register their team with a roster that meets the rules on the left.
            </p>
            <Button asChild className="w-full">
              <a href={registerHref ?? '#register'}>Register a team</a>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function EventPage({
  header,
  event,
  viewer,
  now,
  orgHref,
  manageHref,
  registerHref,
}: EventPageProps) {
  return (
    <PageShell header={header}>
      <EventHeader
        event={event}
        orgHref={orgHref}
        actions={
          viewer === 'admin' ? (
            <Button asChild variant="outline">
              <a href={manageHref}>Manage event</a>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Tabs defaultValue="overview" className="min-w-0">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            {event.description ? (
              <div className="grid gap-3 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            ) : (
              <Placeholder>The organizer hasn't added a description yet.</Placeholder>
            )}
          </TabsContent>
          <TabsContent value="format">
            <EventSettingsView settings={event.settings} />
          </TabsContent>
          <TabsContent value="teams">
            <Placeholder>
              {event.registeredTeams} of {event.maxTeams} teams registered. The team list arrives
              with registration.
            </Placeholder>
          </TabsContent>
          <TabsContent value="matches">
            <Placeholder>Pairings and standings appear here once the event starts.</Placeholder>
          </TabsContent>
        </Tabs>

        <aside className="grid gap-4">
          <EligibilitySummary event={event} now={now} />
          <EntryCard event={event} registerHref={registerHref} />
        </aside>
      </div>
    </PageShell>
  );
}
