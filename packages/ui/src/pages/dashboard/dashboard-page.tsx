import type { ReactNode } from 'react';
import { PageShell } from '../../blocks/layout/page-shell';
import { InviteCard } from '../../blocks/team/invite-card';
import { RoleBadge } from '../../blocks/team/role-badge';
import type { Invite } from '../../models/invite';
import type { MyOrg } from '../../models/org';
import { TEAM_MAX_COACHES, TEAM_MAX_PLAYERS, type TeamSummary } from '../../models/team';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../primitives/card';
import { Skeleton } from '../../primitives/skeleton';

type DashboardPageProps = {
  header: ReactNode;
  displayName: string;
  now: string;
  loading?: boolean;
  orgs: MyOrg[];
  teams: TeamSummary[];
  invites: Invite[];
  faceitConnected: boolean;
  connectFaceitHref: string;
  orgHref: (slug: string) => string;
  teamHref: (id: string) => string;
  registerOrgHref: string;
  createTeamHref: string;
  invitesHref: string;
  eventsHref: string;
  onAcceptInvite: (id: string) => void;
  onDeclineInvite: (id: string) => void;
};

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Empty({ text, action }: { text: string; action: ReactNode }) {
  return (
    <div className="grid justify-items-start gap-3">
      <p className="text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}

export function DashboardPage({
  header,
  displayName,
  now,
  loading = false,
  orgs,
  teams,
  invites,
  faceitConnected,
  connectFaceitHref,
  orgHref,
  teamHref,
  registerOrgHref,
  createTeamHref,
  invitesHref,
  eventsHref,
  onAcceptInvite,
  onDeclineInvite,
}: DashboardPageProps) {
  const pending = invites.filter((i) => i.status === 'pending');

  return (
    <PageShell header={header}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Hi, {displayName}</h1>
          <p className="text-muted-foreground">Your organizations, teams and invites.</p>
        </div>
        <Button asChild variant="outline">
          <a href={eventsHref}>Browse events</a>
        </Button>
      </div>

      {!faceitConnected ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              Want to play? Connect FACEIT so your level and region count for eligibility.
            </p>
            <Button asChild variant="faceit" size="sm">
              <a href={connectFaceitHref}>Connect with FACEIT</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading dashboard">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <>
          {pending.length > 0 ? (
            <section aria-labelledby="dashboard-invites" className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 id="dashboard-invites" className="text-sm font-semibold">
                  Invites waiting for you{' '}
                  <span className="text-muted-foreground tabular-nums">({pending.length})</span>
                </h2>
                <a
                  href={invitesHref}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  All invites
                </a>
              </div>
              <ul className="grid gap-3 md:grid-cols-2">
                {pending.slice(0, 2).map((invite) => (
                  <li key={invite.id}>
                    <InviteCard
                      invite={invite}
                      now={now}
                      faceitConnected={faceitConnected}
                      connectFaceitHref={connectFaceitHref}
                      onAccept={onAcceptInvite}
                      onDecline={onDeclineInvite}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <Section
              title="Organizations"
              action={
                orgs.length ? (
                  <Button asChild variant="ghost" size="sm">
                    <a href={registerOrgHref}>Register another</a>
                  </Button>
                ) : null
              }
            >
              {orgs.length === 0 ? (
                <Empty
                  text="Organizations host events. Register one to run your own tournaments."
                  action={
                    <Button asChild size="sm">
                      <a href={registerOrgHref}>Register your organization</a>
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y">
                  {orgs.map((org) => (
                    <li key={org.id}>
                      <a
                        href={orgHref(org.slug)}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 hover:text-primary"
                      >
                        <span className="truncate font-medium">{org.name}</span>
                        <Badge variant={org.role === 'owner' ? 'default' : 'secondary'}>
                          {org.role === 'owner' ? 'Owner' : 'Admin'}
                        </Badge>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section
              title="Teams"
              action={
                teams.length ? (
                  <Button asChild variant="ghost" size="sm">
                    <a href={createTeamHref}>Create team</a>
                  </Button>
                ) : null
              }
            >
              {teams.length === 0 ? (
                <Empty
                  text="Create a team and invite your teammates, or wait for a captain's invite."
                  action={
                    <Button asChild size="sm">
                      <a href={createTeamHref}>Create a team</a>
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y">
                  {teams.map((team) => (
                    <li key={team.id}>
                      <a
                        href={teamHref(team.id)}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 hover:text-primary"
                      >
                        <span className="min-w-0 truncate font-medium">
                          {team.name} <span className="text-muted-foreground">[{team.tag}]</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {team.memberCount}/{TEAM_MAX_PLAYERS + TEAM_MAX_COACHES}
                          </span>
                          <RoleBadge role={team.myRole} isCaptain={team.isCaptain} />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </>
      )}
    </PageShell>
  );
}
