'use client';

import { useState, type ReactNode } from 'react';
import { PageShell } from '../../blocks/layout/page-shell';
import { initials } from '../../blocks/player/player-identity';
import type { MyOrg } from '../../models/org';
import { Avatar, AvatarFallback } from '../../primitives/avatar';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';

type MyOrgsPageProps = {
  header: ReactNode;
  orgs: MyOrg[];
  orgHref: (slug: string) => string;
  registerOrgHref: string;
};

export function MyOrgsPage({ header, orgs, orgHref, registerOrgHref }: MyOrgsPageProps) {
  const [query, setQuery] = useState('');
  const shown = orgs.filter((org) => org.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <PageShell header={header}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">My organizations</h1>
          <p className="text-muted-foreground">
            Pick an organization to manage its events and admins.
          </p>
        </div>
        <Button asChild>
          <a href={registerOrgHref}>Register an organization</a>
        </Button>
      </div>

      {orgs.length === 0 ? (
        <div className="grid justify-items-center gap-2 rounded-lg border border-dashed px-4 py-12 text-center">
          <p className="font-medium">You're not part of any organization yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Register one to host events, or ask an organization's owner to invite you as an admin.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {orgs.length > 0 ? (
            <div className="grid max-w-sm gap-1.5">
              <Label htmlFor="org-search" className="sr-only">
                Search organizations
              </Label>
              <Input
                id="org-search"
                type="search"
                placeholder="Search organizations"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          ) : null}
          <ul className="divide-y rounded-lg border">
            {shown.map((org) => (
              <li key={org.id}>
                <a
                  href={orgHref(org.slug)}
                  className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  <Avatar className="size-9 rounded-md" aria-hidden>
                    <AvatarFallback className="rounded-md text-xs font-semibold">
                      {initials(org.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate font-medium">{org.name}</span>
                    <span className="truncate text-xs text-muted-foreground">/o/{org.slug}</span>
                  </span>
                  <Badge variant={org.role === 'owner' ? 'default' : 'secondary'}>
                    {org.role === 'owner' ? 'Owner' : 'Admin'}
                  </Badge>
                  <span aria-hidden className="text-muted-foreground">
                    ›
                  </span>
                </a>
              </li>
            ))}
            {shown.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No organization matches "{query}".
              </li>
            ) : null}
          </ul>
        </div>
      )}
    </PageShell>
  );
}
