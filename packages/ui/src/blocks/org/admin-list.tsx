import type { OrgAdmin, OrgPendingAdmin, OrgRole } from '../../models/org';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../primitives/card';
import { LocalTime } from '../layout/local-time';

type AdminListProps = {
  admins: OrgAdmin[];
  pending: OrgPendingAdmin[];
  viewerRole: OrgRole;
  now: string;
  onInvite: () => void;
  onRemove: (userId: string) => void;
  onRevoke: (inviteId: string) => void;
};

export function AdminList({
  admins,
  pending,
  viewerRole,
  now,
  onInvite,
  onRemove,
  onRevoke,
}: AdminListProps) {
  const canManage = viewerRole === 'owner';
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1.5">
          <CardTitle>Admins</CardTitle>
          <CardDescription>
            {canManage
              ? 'Admins can create and run events. They join once they accept your invite.'
              : 'Only the owner can invite or remove admins.'}
          </CardDescription>
        </div>
        {canManage ? (
          <Button size="sm" onClick={onInvite}>
            Invite admin
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-6">
        <ul className="divide-y">
          {admins.map((admin) => (
            <li
              key={admin.userId}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0"
            >
              <div className="grid min-w-0 gap-0.5">
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  {admin.displayName}
                  <Badge variant={admin.role === 'owner' ? 'default' : 'secondary'}>
                    {admin.role === 'owner' ? 'Owner' : 'Admin'}
                  </Badge>
                </span>
                <span className="text-sm break-all text-muted-foreground">{admin.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Since <LocalTime iso={admin.since} format="date" />
                </span>
                {canManage && admin.role !== 'owner' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-300 hover:text-red-200"
                    onClick={() => onRemove(admin.userId)}
                    aria-label={`Remove ${admin.displayName}`}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {canManage && pending.length > 0 ? (
          <section aria-labelledby="pending-admins-heading" className="grid gap-2">
            <h3 id="pending-admins-heading" className="text-sm font-semibold">
              Pending invites
            </h3>
            <ul className="divide-y rounded-md border">
              {pending.map((invite) => (
                <li
                  key={invite.inviteId}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2"
                >
                  <span className="min-w-0 text-sm break-all">{invite.email}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Expires <LocalTime iso={invite.expiresAt} format="relative" now={now} />
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevoke(invite.inviteId)}
                      aria-label={`Revoke invite for ${invite.email}`}
                    >
                      Revoke
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
