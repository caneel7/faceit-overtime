import { cn } from '../../lib/utils';
import {
  TEAM_MAX_COACHES,
  TEAM_MAX_PLAYERS,
  type TeamMember,
  type TeamPendingInvite,
} from '../../models/team';

export type SlotsLeft = { players: number; coaches: number };

export function slotsLeft(members: TeamMember[], pending: TeamPendingInvite[]): SlotsLeft {
  const count = (role: TeamMember['role']) =>
    members.filter((m) => m.role === role).length + pending.filter((p) => p.role === role).length;
  return {
    players: Math.max(TEAM_MAX_PLAYERS - count('player'), 0),
    coaches: Math.max(TEAM_MAX_COACHES - count('coach'), 0),
  };
}

type TeamSlotsProps = {
  members: TeamMember[];
  pendingInvites: TeamPendingInvite[];
  className?: string;
};

export function TeamSlots({ members, pendingInvites, className }: TeamSlotsProps) {
  const players = members.filter((m) => m.role === 'player').length;
  const coaches = members.filter((m) => m.role === 'coach').length;
  return (
    <p className={cn('text-sm text-muted-foreground tabular-nums', className)}>
      <span className={players === TEAM_MAX_PLAYERS ? 'text-foreground' : undefined}>
        {players}/{TEAM_MAX_PLAYERS} players
      </span>
      {' · '}
      <span className={coaches === TEAM_MAX_COACHES ? 'text-foreground' : undefined}>
        {coaches}/{TEAM_MAX_COACHES} coach
      </span>
      {pendingInvites.length ? ` · ${pendingInvites.length} invited` : null}
    </p>
  );
}
