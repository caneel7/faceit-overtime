import type { ReactNode } from 'react';
import type { EventSummary } from '../../models/event';
import { LocalTime } from '../layout/local-time';
import { EventStatusBadge } from './event-status-badge';
import { isFull, levelRange, regionList } from './format';

type EventCardProps = { event: EventSummary; href: string; now: string };

function footnote(event: EventSummary, now: string): ReactNode {
  switch (event.status) {
    case 'registration_open':
      if (isFull(event)) return 'Full';
      if (event.registrationClosesAt)
        return (
          <>
            Registration closes{' '}
            <LocalTime iso={event.registrationClosesAt} format="relative" now={now} />
          </>
        );
      return 'Registration open';
    case 'registration_closed':
      return event.startsAt ? (
        <>
          Starts <LocalTime iso={event.startsAt} format="relative" now={now} />
        </>
      ) : (
        'Registration closed'
      );
    case 'in_progress':
      return 'Live now';
    case 'completed':
      return event.startsAt ? (
        <>
          Played <LocalTime iso={event.startsAt} format="date" />
        </>
      ) : (
        'Finished'
      );
    case 'cancelled':
      return 'Cancelled by the organizer';
    case 'draft':
      return 'Draft · only admins can see this';
  }
}

export function EventCard({ event, href, now }: EventCardProps) {
  return (
    <a
      href={href}
      className="group grid gap-4 rounded-lg border bg-card p-4 transition-colors outline-none hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{event.org.name}</p>
          <h3 className="truncate font-semibold group-hover:text-primary">{event.name}</h3>
        </div>
        <EventStatusBadge status={event.status} />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Level</dt>
          <dd className="truncate">{levelRange(event.minLevel, event.maxLevel)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Regions</dt>
          <dd className="truncate">{regionList(event.regions)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Teams</dt>
          <dd className="tabular-nums">
            {event.registeredTeams}/{event.maxTeams}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">{footnote(event, now)}</p>
    </a>
  );
}
