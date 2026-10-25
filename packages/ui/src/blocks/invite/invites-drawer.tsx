'use client';

import type { Invite } from '../../models/invite';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../primitives/sheet';
import { InviteCard } from './invite-card';

type InvitesDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invites: Invite[];
  now: string;
  faceitConnected: boolean;
  connectFaceitHref: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  pendingId?: string;
};

export function InvitesDrawer({
  open,
  onOpenChange,
  invites,
  now,
  faceitConnected,
  connectFaceitHref,
  onAccept,
  onDecline,
  pendingId,
}: InvitesDrawerProps) {
  const waiting = invites.filter((i) => i.status === 'pending');
  const earlier = invites.filter((i) => i.status !== 'pending');

  const card = (invite: Invite) => (
    <li key={invite.id}>
      <InviteCard
        invite={invite}
        now={now}
        faceitConnected={faceitConnected}
        connectFaceitHref={connectFaceitHref}
        onAccept={onAccept}
        onDecline={onDecline}
        pending={pendingId === invite.id}
      />
    </li>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Invites</SheetTitle>
          <SheetDescription>
            {waiting.length
              ? `${waiting.length} waiting for your answer.`
              : 'Team and organization invites show up here.'}
          </SheetDescription>
        </SheetHeader>

        {waiting.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            You're all caught up.
          </p>
        ) : (
          <ul className="grid gap-3">{waiting.map(card)}</ul>
        )}

        {earlier.length ? (
          <section aria-labelledby="invites-earlier" className="grid gap-3">
            <h3 id="invites-earlier" className="text-xs font-semibold text-muted-foreground">
              Earlier
            </h3>
            <ul className="grid gap-3">{earlier.map(card)}</ul>
          </section>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
