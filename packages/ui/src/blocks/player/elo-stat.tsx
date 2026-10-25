import { cn } from '../../lib/utils';

type EloStatProps = { elo: number | null; label?: string; className?: string };

const eloFormat = new Intl.NumberFormat('en-GB');

export function EloStat({ elo, label = 'ELO', className }: EloStatProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1 text-sm tabular-nums', className)}>
      {elo === null ? (
        <>
          <span className="text-muted-foreground" aria-hidden>
            —
          </span>
          <span className="sr-only">No {label}</span>
        </>
      ) : (
        <span className="font-semibold">{eloFormat.format(elo)}</span>
      )}
      <span className="text-xs text-muted-foreground" aria-hidden={elo === null}>
        {label}
      </span>
    </span>
  );
}
