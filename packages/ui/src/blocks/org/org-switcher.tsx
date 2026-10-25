'use client';

import type { MyOrg, OrgSummary } from '../../models/org';
import { Avatar, AvatarFallback } from '../../primitives/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { CheckIcon, ChevronDownIcon } from '../../primitives/icons';
import { initials } from '../player/player-identity';

type OrgSwitcherProps = {
  current: OrgSummary;
  orgs: MyOrg[];
  orgHref: (slug: string) => string;
  allOrgsHref: string;
  registerOrgHref: string;
};

export function OrgSwitcher({
  current,
  orgs,
  orgHref,
  allOrgsHref,
  registerOrgHref,
}: OrgSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex max-w-full min-w-0 items-center gap-3 rounded-lg p-1 pr-2 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={`${current.name}, switch organization`}
      >
        <Avatar className="size-10 rounded-lg" aria-hidden>
          <AvatarFallback className="rounded-lg font-semibold">
            {initials(current.name)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {current.name}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch organization
        </DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem key={org.id} asChild>
            <a
              href={orgHref(org.slug)}
              aria-current={org.id === current.id ? 'page' : undefined}
              className="flex items-center justify-between gap-2"
            >
              <span className="grid min-w-0">
                <span className="truncate">{org.name}</span>
                <span className="text-xs text-muted-foreground">
                  {org.role === 'owner' ? 'Owner' : 'Admin'}
                </span>
              </span>
              {org.id === current.id ? <CheckIcon className="size-4 text-primary" /> : null}
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={allOrgsHref}>All organizations</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={registerOrgHref}>Register an organization</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
