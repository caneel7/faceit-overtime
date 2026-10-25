import { cn } from '../../lib/utils';
import type { EventStatus } from '../../models/event';
import { CheckIcon } from '../../primitives/icons';
import { STATUS_LABEL } from './format';

const STEPS: EventStatus[] = [
  'draft',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
];

export function EventStatusStepper({ status }: { status: EventStatus }) {
  const current = STEPS.indexOf(status);
  const cancelled = status === 'cancelled';

  return (
    <div className="grid gap-3">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="Event status">
        {STEPS.map((step, index) => {
          const done = !cancelled && index < current;
          const active = !cancelled && index === current;
          return (
            <li
              key={step}
              aria-current={active ? 'step' : undefined}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && 'border-primary text-primary',
                  !done && !active && 'text-muted-foreground',
                )}
              >
                {done ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm',
                  active ? 'font-semibold' : 'text-muted-foreground',
                  done && 'text-foreground',
                )}
              >
                {STATUS_LABEL[step]}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
              {index < STEPS.length - 1 ? (
                <span aria-hidden className="hidden h-px w-6 bg-border sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>
      {cancelled ? (
        <p className="text-sm text-red-300">
          This event was cancelled. Nothing more can happen to it.
        </p>
      ) : null}
    </div>
  );
}
