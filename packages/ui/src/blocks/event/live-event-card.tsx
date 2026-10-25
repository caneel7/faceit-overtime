import type { LiveEvent } from '../../models/match';
import { Card, CardContent, CardHeader } from '../../primitives/card';
import { MatchRow } from '../match/match-row';

type LiveEventCardProps = {
  live: LiveEvent;
  href: string;
  maxMatches?: number;
};

export function LiveEventCard({ live, href, maxMatches = 4 }: LiveEventCardProps) {
  const playing = live.matches.filter((m) => m.state === 'pending');
  const shown = [...playing, ...live.matches.filter((m) => m.state !== 'pending')].slice(
    0,
    maxMatches,
  );
  const hidden = live.matches.length - shown.length;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div className="grid min-w-0 gap-0.5">
          <p className="truncate text-xs text-muted-foreground">{live.event.org.name}</p>
          <a
            href={href}
            className="truncate font-semibold underline-offset-4 hover:text-primary hover:underline"
          >
            {live.event.name}
          </a>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-red-400/60 px-2 py-0.5 text-xs font-medium text-red-300">
          <span aria-hidden className="size-1.5 rounded-full bg-red-400" />
          Round {live.round}
        </span>
      </CardHeader>
      <CardContent className="grid gap-1">
        <p className="text-xs text-muted-foreground">
          {playing.length} of {live.matches.length} matches still playing
        </p>
        <ul className="divide-y">
          {shown.map((match) => (
            <li key={match.id}>
              <MatchRow match={match} />
            </li>
          ))}
        </ul>
        {hidden > 0 ? (
          <a
            href={href}
            className="pt-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            +{hidden} more {hidden === 1 ? 'match' : 'matches'} this round
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}
