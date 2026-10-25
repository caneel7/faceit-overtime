import { cn } from '../../lib/utils';
import type { MatchSummary, MatchTeam } from '../../models/match';

function Side({
  team,
  winner,
  align,
}: {
  team: MatchTeam;
  winner: boolean;
  align: 'start' | 'end';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex min-w-0 items-center gap-2',
        align === 'end' && 'flex-row-reverse text-right',
      )}
    >
      <span className="hidden w-9 shrink-0 rounded bg-muted px-1 py-0.5 text-center text-[10px] font-bold sm:block">
        {team.tag}
      </span>
      <span className={cn('truncate text-sm', winner ? 'font-semibold' : 'text-muted-foreground')}>
        {team.name}
      </span>
    </span>
  );
}

export function MatchRow({ match }: { match: MatchSummary }) {
  const done = match.state !== 'pending' && match.score;
  const aWon = done ? match.score!.a > match.score!.b : false;
  const bWon = done ? match.score!.b > match.score!.a : false;
  const pending = match.state === 'pending';

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
      <Side team={match.a} winner={!done || aWon} align="end" />
      <span aria-hidden className="grid min-w-16 justify-items-center text-center">
        {done ? (
          <span className="text-sm font-semibold tabular-nums">
            {match.state === 'forfeited' ? 'FF' : `${match.score!.a} – ${match.score!.b}`}
          </span>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">vs</span>
        )}
        <span
          className={cn(
            'text-[10px] tracking-wide uppercase',
            pending ? 'text-red-300' : 'text-muted-foreground',
          )}
        >
          {pending
            ? `Playing · Bo${match.bestOf}`
            : match.state === 'forfeited'
              ? 'Forfeit'
              : 'Final'}
        </span>
      </span>
      <Side team={match.b} winner={!done || bWon} align="start" />
      <span className="sr-only">
        {`${match.a.name} versus ${match.b.name}, ${
          pending
            ? 'in progress'
            : match.state === 'forfeited'
              ? `won by ${aWon ? match.a.name : match.b.name} by forfeit`
              : `final score ${match.score!.a} to ${match.score!.b}`
        }`}
      </span>
    </div>
  );
}
