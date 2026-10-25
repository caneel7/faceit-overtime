'use client';

import { cn } from '../../lib/utils';
import { Button } from '../../primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { MenuIcon } from '../../primitives/icons';
import { UserMenu, type UserMenuUser } from '../auth/user-menu';

export type NavItem = { label: string; href: string; active?: boolean };

type AppHeaderProps = {
  homeHref?: string;
  nav: NavItem[];
  userState: 'loading' | 'signed_out' | 'signed_in';
  user?: UserMenuUser;
  inviteCount?: number;
  invitesHref?: string;
  signInHref: string;
  onSignOut: () => void;
};

export function AppHeader({
  homeHref = '/',
  nav,
  userState,
  user,
  inviteCount = 0,
  invitesHref = '/invites',
  signInHref,
  onSignOut,
}: AppHeaderProps) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open navigation">
              <MenuIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {nav.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <a href={item.href} aria-current={item.active ? 'page' : undefined}>
                  {item.label}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <a href={homeHref} className="text-lg font-semibold tracking-tight">
          Over<span className="text-primary">time</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                item.active && 'bg-muted text-foreground',
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {userState === 'signed_in' && inviteCount > 0 ? (
            <a
              href={invitesHref}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              aria-label={`Invites, ${inviteCount} pending`}
            >
              <span aria-hidden>Invites</span>
              <span
                aria-hidden
                className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground"
              >
                {inviteCount > 9 ? '9+' : inviteCount}
              </span>
            </a>
          ) : null}
          <UserMenu state={userState} user={user} signInHref={signInHref} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
