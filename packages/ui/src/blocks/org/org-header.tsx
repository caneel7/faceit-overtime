import type { ReactNode } from 'react';
import type { OrgSummary } from '../../models/org';
import { Avatar, AvatarFallback } from '../../primitives/avatar';
import { initials } from '../player/player-identity';

type OrgHeaderProps = {
  org: OrgSummary;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

export function OrgHeader({ org, subtitle, actions }: OrgHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="size-14 rounded-lg" aria-hidden>
          <AvatarFallback className="rounded-lg text-lg font-semibold">
            {initials(org.name)}
          </AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 gap-1">
          <h1 className="text-2xl font-semibold tracking-tight break-words">{org.name}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
