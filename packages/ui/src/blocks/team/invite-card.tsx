import type { ReactNode } from 'react';
import type { Invite } from '../../models/invite';
import { Button } from '../../primitives/button';
import { Card, CardContent } from '../../primitives/card';
import { LocalTime } from '../layout/local-time';

type InviteCardProps = {
  invite: Invite;
  now: string;
  faceitConnected: boolean;
  connectFaceitHref: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  pending?: boolean;
};

const STATUS_TEXT: Record<Invite['status'], string> = {
  pending: 'Waiting for your answer',
  accepted: 'Accepted',
  declined: 'Declined',
  revoked: 'Withdrawn by the sender',
  expired: 'This invite expired',
};

function describe(invite: Invite): { title: ReactNode; body: string } {
  if (invite.kind === 'org') {
    return {
      title: <>Admin of {invite.org.name}</>,
      body: `${invite.invitedBy} invited you to help run events for ${invite.org.name}.`,
    };
  }
  return {
    title: (
      <>
        {invite.team.name} <span className="text-muted-foreground">[{invite.team.tag}]</span>
      </>
    ),
    body: `${invite.invitedBy} invited you to join as ${invite.role === 'player' ? 'a player' : 'the coach'}.`,
  };
}

export function InviteCard({
  invite,
  now,
  faceitConnected,
  connectFaceitHref,
  onAccept,
  onDecline,
  pending = false,
}: InviteCardProps) {
  const { title, body } = describe(invite);
  const needsFaceit = invite.kind === 'team' && invite.role === 'player' && !faceitConnected;
  const open = invite.status === 'pending';

  return (
    <Card className={open ? undefined : 'opacity-70'}>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="grid min-w-0 gap-1">
            <p className="text-xs text-muted-foreground">
              {invite.kind === 'org' ? 'Organization invite' : 'Team invite'}
            </p>
            <h3 className="font-semibold break-words">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
          {open ? (
            <span className="text-xs text-muted-foreground">
              Expires <LocalTime iso={invite.expiresAt} format="relative" now={now} />
            </span>
          ) : null}
        </div>

        {open ? (
          <div className="grid gap-2">
            {needsFaceit ? (
              <p className="text-sm">
                Players need FACEIT for eligibility.{' '}
                <a href={connectFaceitHref} className="text-primary underline underline-offset-4">
                  Connect FACEIT
                </a>{' '}
                to accept.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending || needsFaceit} onClick={() => onAccept(invite.id)}>
                {pending ? 'Joining…' : 'Accept'}
              </Button>
              <Button variant="outline" disabled={pending} onClick={() => onDecline(invite.id)}>
                Decline
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{STATUS_TEXT[invite.status]}</p>
        )}
      </CardContent>
    </Card>
  );
}
