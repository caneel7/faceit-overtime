import type { ComponentProps, ReactNode } from 'react';
import { PageShell } from '../../blocks/layout/page-shell';
import { RegisterOrgForm } from '../../blocks/org/register-org-form';
import { Card, CardContent } from '../../primitives/card';

type RegisterOrgPageProps = ComponentProps<typeof RegisterOrgForm> & { header: ReactNode };

export function RegisterOrgPage({ header, ...form }: RegisterOrgPageProps) {
  return (
    <PageShell header={header} width="narrow">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Register your organization
        </h1>
        <p className="text-muted-foreground">
          Organizations host events on Overtime: university clubs, Discord communities, leagues.
          You'll be the owner and can invite admins to help run things.
        </p>
        {form.mode === 'signed_out' ? (
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href={form.signInHref} className="text-foreground underline underline-offset-4">
              Sign in first
            </a>
            , then register the organization.
          </p>
        ) : null}
      </div>
      <Card>
        <CardContent>
          <RegisterOrgForm {...form} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
