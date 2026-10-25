import { cn } from '../../lib/utils';
import type { EventStatus } from '../../models/event';
import { STATUS_LABEL } from './format';

const STYLES: Record<EventStatus, string> = {
  draft: 'border-dashed text-muted-foreground',
  registration_open: 'border-emerald-400/50 text-emerald-300',
  registration_closed: 'border-yellow-400/50 text-yellow-300',
  in_progress: 'border-red-400/60 text-red-300',
  completed: 'text-muted-foreground',
  cancelled: 'text-muted-foreground',
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[status],
      )}
    >
      {status === 'in_progress' ? (
        <span aria-hidden className="size-1.5 rounded-full bg-red-400" />
      ) : null}
      {STATUS_LABEL[status]}
    </span>
  );
}
