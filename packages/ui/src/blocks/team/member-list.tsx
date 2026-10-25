import type { TeamMember } from '../../models/team';
import { Avatar, AvatarFallback } from '../../primitives/avatar';
import { Button } from '../../primitives/button';
import { EloStat } from '../player/elo-stat';
import { LevelBadge } from '../player/level-badge';
import { initials, PlayerIdentity } from '../player/player-identity';
import { RoleBadge } from './role-badge';

export type TeamViewer = 'captain' | 'member' | 'public';

type MemberListProps = {
  members: TeamMember[];
  viewer: TeamViewer;
  viewerUserId?: string;
  onRemove: (userId: string) => void;
  onLeave: () => void;
};

const ORDER = (m: TeamMember) => (m.isCaptain ? 0 : m.role === 'player' ? 1 : 2);

function Identity({ member }: { member: TeamMember }) {
  if (member.player) {
    return (
      <PlayerIdentity
        nickname={member.player.nickname}
        avatarUrl={member.player.avatarUrl}
        country={member.player.country}
      />
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9" aria-hidden>
        <AvatarFallback>{initials(member.displayName)}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0">
        <span className="truncate font-medium">{member.displayName}</span>
        <span className="text-xs text-muted-foreground">No FACEIT connected</span>
      </div>
    </div>
  );
}

export function MemberList({ members, viewer, viewerUserId, onRemove, onLeave }: MemberListProps) {
  const sorted = [...members].sort((a, b) => ORDER(a) - ORDER(b));
  return (
    <ul className="divide-y">
      {sorted.map((member) => {
        const isViewer = member.userId === viewerUserId;
        return (
          <li
            key={member.userId}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Identity member={member} />
              <RoleBadge role={member.role} isCaptain={member.isCaptain} />
            </div>
            <div className="flex items-center gap-3">
              {member.role === 'player' ? (
                <>
                  <LevelBadge level={member.player?.cs2Level ?? null} />
                  <EloStat elo={member.player?.cs2Elo ?? null} className="w-20 justify-end" />
                </>
              ) : null}
              {viewer === 'captain' && !member.isCaptain ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-200"
                  onClick={() => onRemove(member.userId)}
                  aria-label={`Remove ${member.displayName}`}
                >
                  Remove
                </Button>
              ) : null}
              {viewer === 'member' && isViewer && !member.isCaptain ? (
                <Button variant="ghost" size="sm" onClick={onLeave}>
                  Leave team
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
