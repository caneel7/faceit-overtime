import type { ReactNode } from 'react';
import type { EventDetail } from '../../models/event';
import { LocalTime } from '../layout/local-time';
import { isFull, levelRange, regionList } from './format';

type EligibilitySummaryProps = { event: EventDetail; now: string };

function registration(event: EventDetail, now: string): ReactNode {
  if (event.status === 'registration_open') {
    if (isFull(event)) return 'Full';
    return event.registrationClosesAt ? (
      <>
        Closes <LocalTime iso={event.registrationClosesAt} format="relative" now={now} />
      </>
    ) : (
      'Open'
    );
  }
  if (event.status === 'draft') {
    const opensAt = event.settings.registrationOpensAt;
    return opensAt ? (
      <>
        Opens <LocalTime iso={opensAt} format="relative" now={now} />
      </>
    ) : (
      'Not open yet'
    );
  }
  return 'Closed';
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 rounded-md bg-muted/50 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

export function EligibilitySummary({ event, now }: EligibilitySummaryProps) {
  const slotsLeft = Math.max(event.maxTeams - event.registeredTeams, 0);
  const percent = Math.min(100, Math.round((event.registeredTeams / event.maxTeams) * 100));

  return (
    <section aria-labelledby="eligibility-heading" className="grid gap-3">
      <h2 id="eligibility-heading" className="text-sm font-semibold">
        Who can enter
      </h2>
      <dl className="grid grid-cols-2 gap-2">
        <Stat label="FACEIT level">{levelRange(event.minLevel, event.maxLevel)}</Stat>
        <Stat label="Regions">{regionList(event.regions)}</Stat>
        <Stat label="Teams">
          <span className="tabular-nums">
            {event.registeredTeams} / {event.maxTeams}
          </span>
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <span className="block h-full bg-primary" style={{ width: `${percent}%` }} />
          </span>
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {slotsLeft === 0 ? 'No slots left' : `${slotsLeft} slots left`}
          </span>
        </Stat>
        <Stat label="Registration">{registration(event, now)}</Stat>
      </dl>
    </section>
  );
}
