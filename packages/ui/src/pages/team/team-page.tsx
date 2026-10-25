import type { ReactNode } from 'react';
import { PageShell } from '../../blocks/layout/page-shell';
import { InviteMemberDialog, type InviteMemberError } from '../../blocks/team/invite-member-dialog';
import { MemberList, type TeamViewer } from '../../blocks/team/member-list';
import { PendingInviteList } from '../../blocks/team/pending-invite-list';
import { TeamHeader } from '../../blocks/team/team-header';
import { slotsLeft } from '../../blocks/team/team-slots';
import type { InviteCandidate, TeamDetail, TeamRole } from '../../models/team';
import { Button } from '../../primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../primitives/card';

type TeamPageProps = {
  header: ReactNode;
  team: TeamDetail;
  viewer: TeamViewer;
  viewerUserId?: string;
  now: string;
  inviteDialogOpen: boolean;
  onInviteDialogOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
  searchResults: InviteCandidate[] | null;
  searching?: boolean;
  onInvite: (invite: { userId: string; role: TeamRole }) => void;
  invitePending?: boolean;
  inviteError?: InviteMemberError;
  onRemove: (userId: string) => void;
  onLeave: () => void;
  onRevoke: (inviteId: string) => void;
};

export function TeamPage({
  header,
  team,
  viewer,
  viewerUserId,
  now,
  inviteDialogOpen,
  onInviteDialogOpenChange,
  onSearch,
  searchResults,
  searching,
  onInvite,
  invitePending,
  inviteError,
  onRemove,
  onLeave,
  onRevoke,
}: TeamPageProps) {
  const slots = slotsLeft(team.members, team.pendingInvites);
  const full = slots.players === 0 && slots.coaches === 0;

  return (
    <PageShell header={header}>
      <TeamHeader
        team={team}
        actions={
          viewer === 'captain' ? (
            <Button
              disabled={full}
              onClick={() => onInviteDialogOpenChange(true)}
              aria-describedby={full ? 'team-full-hint' : undefined}
            >
              Invite member
            </Button>
          ) : null
        }
      />
      {viewer === 'captain' && full ? (
        <p id="team-full-hint" className="-mt-3 text-sm text-muted-foreground">
          The team is full. Remove someone or revoke an invite to free a slot.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList
              members={team.members}
              viewer={viewer}
              viewerUserId={viewerUserId}
              onRemove={onRemove}
              onLeave={onLeave}
            />
          </CardContent>
        </Card>

        <aside className="grid gap-4">
          {viewer === 'captain' ? (
            <Card>
              <CardHeader>
                <CardTitle>Pending invites</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingInviteList invites={team.pendingInvites} now={now} onRevoke={onRevoke} />
              </CardContent>
            </Card>
          ) : null}
          <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            Teams have up to 6 players (5 + 1 sub) and 1 coach. Coaches don't need FACEIT and are
            never on an event roster.
          </p>
        </aside>
      </div>

      {viewer === 'captain' ? (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={onInviteDialogOpenChange}
          teamName={team.name}
          slots={slots}
          onSearch={onSearch}
          results={searchResults}
          searching={searching}
          onInvite={onInvite}
          pending={invitePending}
          error={inviteError}
        />
      ) : null}
    </PageShell>
  );
}
