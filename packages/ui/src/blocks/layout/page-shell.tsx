import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { SiteFooter } from './site-footer';

type PageShellProps = {
  header: ReactNode;
  children: ReactNode;
  width?: 'narrow' | 'wide';
};

export function PageShell({ header, children, width = 'wide' }: PageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main
        className={cn(
          'mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:py-8',
          width === 'narrow' ? 'max-w-xl' : 'max-w-6xl',
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
