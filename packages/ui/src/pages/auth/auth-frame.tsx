import type { ComponentProps, ReactNode } from 'react';
import { AuthLayout } from '../../blocks/auth/auth-layout';
import { SiteFooter } from '../../blocks/layout/site-footer';

type AuthFrameProps = ComponentProps<typeof AuthLayout> & { header: ReactNode };

export function AuthFrame({ header, ...layout }: AuthFrameProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <AuthLayout {...layout} />
      <SiteFooter />
    </div>
  );
}
