import type { ComponentProps, ReactNode } from 'react';
import { EventForm } from '../../blocks/event/event-form';
import { PageShell } from '../../blocks/layout/page-shell';
import type { OrgSummary } from '../../models/org';

type EventFormPageProps = ComponentProps<typeof EventForm> & {
  header: ReactNode;
  org: OrgSummary;
};

export function EventFormPage({ header, org, ...form }: EventFormPageProps) {
  return (
    <PageShell header={header} width="narrow">
      <div className="grid gap-1">
        <p className="text-sm text-muted-foreground">{org.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {form.mode === 'create' ? 'Create an event' : 'Edit draft'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {form.mode === 'create'
            ? 'It starts as a draft only your admins can see. You can edit it until registration opens.'
            : 'Drafts can be edited until registration opens. After that the event is locked.'}
        </p>
      </div>
      <EventForm {...form} />
    </PageShell>
  );
}
