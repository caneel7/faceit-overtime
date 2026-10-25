import { TEAM_MAX_COACHES, TEAM_MAX_PLAYERS, type TeamSummary } from '../../models/team';
import { EloStat } from '../player/elo-stat';
import { RoleBadge } from './role-badge';

type TeamCardProps = { team: TeamSummary; href: string };

export function TeamCard({ team, href }: TeamCardProps) {
  return (
    <a
      href={href}
      className="group grid gap-4 rounded-lg border bg-card p-4 transition-colors outline-none hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold tracking-wide"
        >
          {team.tag}
        </span>
        <div className="grid min-w-0 gap-1">
          <h3 className="truncate font-semibold group-hover:text-primary">{team.name}</h3>
          <RoleBadge role={team.myRole} isCaptain={team.isCaptain} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground tabular-nums">
          {team.memberCount}/{TEAM_MAX_PLAYERS + TEAM_MAX_COACHES} members
        </span>
        <EloStat elo={team.avgElo} label="avg ELO" />
      </div>
    </a>
  );
}

export function CreateTeamCard({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="grid min-h-32 place-items-center rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground transition-colors outline-none hover:border-primary/60 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="grid gap-1">
        <span className="text-2xl leading-none" aria-hidden>
          +
        </span>
        Create a team
      </span>
    </a>
  );
}
