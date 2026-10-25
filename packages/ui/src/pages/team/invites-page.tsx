import type { ReactNode } from 'react';
import { PageShell } from '../../blocks/layout/page-shell';
import { InviteCard } from '../../blocks/team/invite-card';
import type { Invite } from '../../models/invite';

type InvitesPageProps = {
  header: ReactNode;
  invites: Invite[];
  now: string;
  faceitConnected: boolean;
  connectFaceitHref: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  pendingId?: string;
};

export function InvitesPage({
  header,
  invites,
  now,
  faceitConnected,
  connectFaceitHref,
  onAccept,
  onDecline,
  pendingId,
}: InvitesPageProps) {
  const open = invites.filter((i) => i.status === 'pending');
  const past = invites.filter((i) => i.status !== 'pending');

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
    <PageShell header={header} width="narrow">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Invites</h1>
        <p className="text-muted-foreground">Team and organization invites sent to you.</p>
      </div>

      {open.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No invites waiting. When a captain or an organization invites you, it shows up here.
        </p>
      ) : (
        <ul className="grid gap-3">{open.map(card)}</ul>
      )}

      {past.length ? (
        <section aria-labelledby="past-invites" className="grid gap-3">
          <h2 id="past-invites" className="text-sm font-semibold text-muted-foreground">
            Earlier
          </h2>
          <ul className="grid gap-3">{past.map(card)}</ul>
        </section>
      ) : null}
    </PageShell>
  );
}
