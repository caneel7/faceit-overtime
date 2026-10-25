'use client';

import { cn } from '../../lib/utils';
import { Button } from '../../primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { BellIcon, MenuIcon } from '../../primitives/icons';
import { UserMenu, type UserMenuUser } from '../auth/user-menu';

export type NavItem = { label: string; href: string; active?: boolean };

type AppHeaderProps = {
  homeHref?: string;
  nav: NavItem[];
  userState: 'loading' | 'signed_out' | 'signed_in';
  user?: UserMenuUser;
  inviteCount?: number;
  onInvitesClick?: () => void;
  signInHref: string;
  onSignOut: () => void;
};

export function AppHeader({
  homeHref = '/',
  nav,
  userState,
  user,
  inviteCount = 0,
  onInvitesClick,
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
          {userState === 'signed_in' && onInvitesClick ? (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onInvitesClick}
              aria-label={inviteCount > 0 ? `Invites, ${inviteCount} pending` : 'Invites'}
            >
              <BellIcon className="size-5" />
              {inviteCount > 0 ? (
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 inline-flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4.5 font-semibold text-primary-foreground"
                >
                  {inviteCount > 9 ? '9+' : inviteCount}
                </span>
              ) : null}
            </Button>
          ) : null}
          <UserMenu state={userState} user={user} signInHref={signInHref} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
