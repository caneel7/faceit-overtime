import type { ReactNode } from 'react';
import { EventSettingsView } from '../../blocks/event/event-settings-view';
import { EventStatusBadge } from '../../blocks/event/event-status-badge';
import { EventStatusStepper } from '../../blocks/event/event-status-stepper';
import { TransitionActions, type TransitionTarget } from '../../blocks/event/transition-actions';
import { PageShell } from '../../blocks/layout/page-shell';
import type { EventDetail } from '../../models/event';
import { Button } from '../../primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../primitives/card';

type EventAdminPageProps = {
  header: ReactNode;
  event: EventDetail;
  orgManageHref: string;
  publicHref: string;
  editHref: string;
  onTransition: (to: TransitionTarget) => void;
  pending?: boolean;
  error?: 'invalid_transition';
};

export function EventAdminPage({
  header,
  event,
  orgManageHref,
  publicHref,
  editHref,
  onTransition,
  pending,
  error,
}: EventAdminPageProps) {
  const editable = event.status === 'draft';
  return (
    <PageShell header={header}>
      <div className="grid gap-2">
        <a
          href={orgManageHref}
          className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← {event.org.name}
        </a>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight break-words">{event.name}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={publicHref}>{editable ? 'Preview event page' : 'View event page'}</a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <EventStatusStepper status={event.status} />
          <TransitionActions
            status={event.status}
            onTransition={onTransition}
            pending={pending}
            error={error}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Settings</CardTitle>
          {editable ? (
            <Button asChild size="sm">
              <a href={editHref}>Edit draft</a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Locked since registration opened</span>
          )}
        </CardHeader>
        <CardContent>
          <EventSettingsView settings={event.settings} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
