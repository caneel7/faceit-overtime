import type { ReactNode } from 'react';
import { EventList } from '../../blocks/event/event-list';
import { LiveEventCard } from '../../blocks/event/live-event-card';
import { PageShell } from '../../blocks/layout/page-shell';
import { LevelBadge } from '../../blocks/player/level-badge';
import type { EventSummary } from '../../models/event';
import type { LiveEvent } from '../../models/match';
import type { Region } from '../../models/player';
import { Button } from '../../primitives/button';
import { Card, CardContent } from '../../primitives/card';
import { Skeleton } from '../../primitives/skeleton';

export type HomeViewer =
  | { kind: 'signed_out' }
  | { kind: 'no_faceit' }
  | { kind: 'player'; level: number; region: Region | null; elo: number | null };

type HomePageProps = {
  header: ReactNode;
  viewer: HomeViewer;
  now: string;
  openEvents: EventSummary[];
  live: LiveEvent[];
  loading?: boolean;
  eventHref: (id: string) => string;
  allEventsHref: string;
  registerOrgHref: string;
  connectFaceitHref: string;
  signUpHref: string;
};

function SectionHeading({
  id,
  title,
  subtitle,
  action,
}: {
  id: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="grid gap-1">
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
        {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
      </div>
      {action}
    </div>
  );
}

const eloFormat = new Intl.NumberFormat('en-GB');

export function HomePage({
  header,
  viewer,
  now,
  openEvents,
  live,
  loading = false,
  eventHref,
  allEventsHref,
  registerOrgHref,
  connectFaceitHref,
  signUpHref,
}: HomePageProps) {
  const seeAll = (
    <a
      href={allEventsHref}
      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      See all events
    </a>
  );

  return (
    <PageShell header={header}>
      {viewer.kind === 'signed_out' ? (
        <section className="grid gap-4 py-6 sm:py-10">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Community CS2 tournaments, <span className="text-primary">run properly</span>.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Swiss-format events with FACEIT-verified rosters, fair pairings and live standings. Find
            one your team can enter, or run your own.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={allEventsHref}>Browse events</a>
            </Button>
            <Button asChild variant="outline">
              <a href={registerOrgHref}>Register your organization</a>
            </Button>
            <Button asChild variant="ghost">
              <a href={signUpHref}>Create an account</a>
            </Button>
          </div>
        </section>
      ) : (
        <h1 className="sr-only">Home</h1>
      )}

      <section aria-labelledby="home-open" className="grid gap-4">
        <SectionHeading
          id="home-open"
          title={viewer.kind === 'player' ? 'Open for you' : 'Open for registration'}
          subtitle={
            viewer.kind === 'player' ? (
              <span className="flex flex-wrap items-center gap-2">
                Matches your level and region:
                <LevelBadge level={viewer.level} />
                {viewer.region ? <span>{viewer.region}</span> : null}
                {viewer.elo !== null ? <span>· {eloFormat.format(viewer.elo)} ELO</span> : null}
              </span>
            ) : (
              'Events taking teams right now.'
            )
          }
          action={seeAll}
        />
        {viewer.kind === 'no_faceit' ? (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                Connect FACEIT to see the events your level and region can enter.
              </p>
              <Button asChild variant="faceit" size="sm">
                <a href={connectFaceitHref}>Connect with FACEIT</a>
              </Button>
            </CardContent>
          </Card>
        ) : null}
        <EventList
          events={openEvents.slice(0, 6)}
          loading={loading}
          hrefFor={eventHref}
          now={now}
          emptyTitle={
            viewer.kind === 'player'
              ? 'Nothing open at your level right now'
              : 'Nothing open right now'
          }
          emptyDescription="New events appear as organizations open registration."
          emptyAction={
            <Button asChild variant="outline" size="sm">
              <a href={allEventsHref}>Browse all events</a>
            </Button>
          }
        />
      </section>

      <section aria-labelledby="home-live" className="grid gap-4">
        <SectionHeading
          id="home-live"
          title="Live now"
          subtitle="Current round of every event being played."
        />
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading live events">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : live.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No events are being played right now.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {live.map((item) => (
              <li key={item.event.id} className="grid">
                <LiveEventCard live={item} href={eventHref(item.event.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
