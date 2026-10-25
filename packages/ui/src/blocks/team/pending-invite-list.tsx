import type { TeamPendingInvite } from '../../models/team';
import { Button } from '../../primitives/button';
import { LocalTime } from '../layout/local-time';
import { RoleBadge } from './role-badge';

type PendingInviteListProps = {
  invites: TeamPendingInvite[];
  now: string;
  onRevoke: (inviteId: string) => void;
};

export function PendingInviteList({ invites, now, onRevoke }: PendingInviteListProps) {
  if (invites.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending invites.</p>;
  }
  return (
    <ul className="divide-y">
      {invites.map((invite) => (
        <li
          key={invite.inviteId}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">{invite.displayName}</span>
            <RoleBadge role={invite.role} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Expires <LocalTime iso={invite.expiresAt} format="relative" now={now} />
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRevoke(invite.inviteId)}
              aria-label={`Revoke invite for ${invite.displayName}`}
            >
              Revoke
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
