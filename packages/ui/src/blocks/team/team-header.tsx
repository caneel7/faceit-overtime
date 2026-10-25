import type { ReactNode } from 'react';
import type { TeamDetail } from '../../models/team';
import { EloStat } from '../player/elo-stat';
import { TeamSlots } from './team-slots';

type TeamHeaderProps = { team: TeamDetail; actions?: ReactNode };

export function TeamHeader({ team, actions }: TeamHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold tracking-wide"
        >
          {team.tag}
        </span>
        <div className="grid min-w-0 gap-1">
          <h1 className="text-2xl font-semibold tracking-tight break-words">
            {team.name} <span className="text-muted-foreground">[{team.tag}]</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <EloStat elo={team.avgElo} label="avg ELO" />
            <TeamSlots members={team.members} pendingInvites={team.pendingInvites} />
          </div>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
