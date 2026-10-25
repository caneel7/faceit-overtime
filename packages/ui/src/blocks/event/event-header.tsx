import type { ReactNode } from 'react';
import type { EventDetail } from '../../models/event';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { LocalTime } from '../layout/local-time';
import { EventStatusBadge } from './event-status-badge';

type EventHeaderProps = {
  event: EventDetail;
  orgHref: string;
  actions?: ReactNode;
};

function when(event: EventDetail): ReactNode {
  if (event.status === 'in_progress') return 'Live now';
  if (event.startsAt) {
    return (
      <>
        {event.status === 'completed' ? 'Played' : 'Starts'}{' '}
        <LocalTime iso={event.startsAt} format="datetime" />
      </>
    );
  }
  return 'Start date to be announced';
}

export function EventHeader({ event, orgHref, actions }: EventHeaderProps) {
  return (
    <div className="grid gap-4">
      {event.status === 'draft' ? (
        <Alert>
          <AlertTitle>Draft preview</AlertTitle>
          <AlertDescription>Only admins of {event.org.name} can see this page.</AlertDescription>
        </Alert>
      ) : null}
      {event.status === 'cancelled' ? (
        <Alert variant="destructive">
          <AlertTitle>This event was cancelled</AlertTitle>
          <AlertDescription>The organizer cancelled it. It won't be played.</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          <a
            href={orgHref}
            className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {event.org.name}
          </a>
          <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <EventStatusBadge status={event.status} />
            <span>{when(event)}</span>
            <span>CS2 · Swiss · 5v5</span>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
