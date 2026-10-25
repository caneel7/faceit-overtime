import type { ComponentProps, ReactNode } from 'react';
import { PageShell } from '../../blocks/layout/page-shell';
import { CreateTeamForm } from '../../blocks/team/create-team-form';
import { Card, CardContent } from '../../primitives/card';

type CreateTeamPageProps = ComponentProps<typeof CreateTeamForm> & { header: ReactNode };

export function CreateTeamPage({ header, ...form }: CreateTeamPageProps) {
  return (
    <PageShell header={header} width="narrow">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create a team</h1>
        <p className="text-muted-foreground">
          Teams can enter events from any organization. Your teammates join by accepting your
          invite.
        </p>
      </div>
      <Card>
        <CardContent>
          <CreateTeamForm {...form} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
