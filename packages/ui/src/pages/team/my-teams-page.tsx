import type { ReactNode } from 'react';
import { PageShell } from '../../blocks/layout/page-shell';
import { CreateTeamCard, TeamCard } from '../../blocks/team/team-card';
import type { TeamSummary } from '../../models/team';
import { Skeleton } from '../../primitives/skeleton';

type MyTeamsPageProps = {
  header: ReactNode;
  teams: TeamSummary[];
  loading?: boolean;
  teamHref: (id: string) => string;
  createTeamHref: string;
};

export function MyTeamsPage({
  header,
  teams,
  loading = false,
  teamHref,
  createTeamHref,
}: MyTeamsPageProps) {
  return (
    <PageShell header={header}>
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My teams</h1>
        <p className="text-muted-foreground">
          Teams you captain, play for or coach. Invites to new teams arrive in the bell at the top.
        </p>
      </div>
      {loading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-label="Loading teams"
        >
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <li key={team.id} className="grid">
              <TeamCard team={team} href={teamHref(team.id)} />
            </li>
          ))}
          <li className="grid">
            <CreateTeamCard href={createTeamHref} />
          </li>
        </ul>
      )}
      {!loading && teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You're not on a team yet. Create one, or accept an invite from a captain.
        </p>
      ) : null}
    </PageShell>
  );
}
