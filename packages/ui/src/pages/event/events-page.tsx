import type { ReactNode } from 'react';
import {
  EventFilters,
  hasFilters,
  NO_FILTERS,
  type EventFilterValue,
} from '../../blocks/event/event-filters';
import { EventList } from '../../blocks/event/event-list';
import { PageShell } from '../../blocks/layout/page-shell';
import type { EventSummary } from '../../models/event';
import { Button } from '../../primitives/button';

type EventsPageProps = {
  header: ReactNode;
  events: EventSummary[];
  filters: EventFilterValue;
  onFiltersChange: (filters: EventFilterValue) => void;
  eventHref: (id: string) => string;
  now: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

export function EventsPage({
  header,
  events,
  filters,
  onFiltersChange,
  eventHref,
  now,
  loading,
  error,
  onRetry,
}: EventsPageProps) {
  const filtered = hasFilters(filters);
  return (
    <PageShell header={header}>
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Events</h1>
        <p className="text-muted-foreground">
          Community CS2 tournaments. Find one your team can enter.
        </p>
      </div>
      <EventFilters value={filters} onChange={onFiltersChange} />
      <EventList
        events={events}
        hrefFor={eventHref}
        now={now}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyTitle={filtered ? 'No events match these filters' : 'No events yet'}
        emptyDescription={
          filtered
            ? 'Try another region or level, or clear the filters.'
            : 'Events appear here once an organization opens registration.'
        }
        emptyAction={
          filtered ? (
            <Button variant="outline" size="sm" onClick={() => onFiltersChange(NO_FILTERS)}>
              Clear filters
            </Button>
          ) : null
        }
      />
    </PageShell>
  );
}
