import type { ReactNode } from 'react';
import type { EventSummary } from '../../models/event';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import { Skeleton } from '../../primitives/skeleton';
import { EventCard } from './event-card';

type EventListProps = {
  events: EventSummary[];
  hrefFor: (id: string) => string;
  now: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
};

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

export function EventList({
  events,
  hrefFor,
  now,
  loading = false,
  error = false,
  onRetry,
  emptyTitle = 'No events yet',
  emptyDescription,
  emptyAction,
}: EventListProps) {
  if (loading) {
    return (
      <div className={GRID} role="status" aria-label="Loading events">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Events couldn't be loaded</AlertTitle>
        <AlertDescription>
          <p>Check your connection and try again.</p>
          {onRetry ? (
            <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <div className="grid justify-items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
        <p className="font-medium">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        ) : null}
        {emptyAction ? <div className="mt-2">{emptyAction}</div> : null}
      </div>
    );
  }

  return (
    <ul className={GRID}>
      {events.map((event) => (
        <li key={event.id} className="grid">
          <EventCard event={event} href={hrefFor(event.id)} now={now} />
        </li>
      ))}
    </ul>
  );
}
