'use client';

import { initials } from '../player/player-identity';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';

export type UserMenuUser = {
  displayName: string;
  avatarUrl?: string | null;
  cs2Level?: number | null;
};

type UserMenuProps = {
  state: 'loading' | 'signed_out' | 'signed_in';
  user?: UserMenuUser;
  signInHref: string;
  dashboardHref?: string;
  settingsHref?: string;
  onSignOut: () => void;
};

export function UserMenu({
  state,
  user,
  signInHref,
  dashboardHref = '/dashboard',
  settingsHref = '/settings',
  onSignOut,
}: UserMenuProps) {
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2" role="status" aria-label="Loading account">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="hidden h-4 w-20 sm:block" />
      </div>
    );
  }

  if (state === 'signed_out' || !user) {
    return (
      <Button asChild size="sm">
        <a href={signInHref}>Sign in</a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="size-7" aria-hidden>
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Account menu for </span>
          <span className="sr-only sm:not-sr-only sm:max-w-32 sm:truncate">{user.displayName}</span>
          {user.cs2Level ? (
            <Badge variant="secondary" className="hidden sm:inline-flex" aria-hidden>
              Lvl {user.cs2Level}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="truncate">{user.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={dashboardHref}>Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={settingsHref}>Settings</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
