import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

type AuthLayoutProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
      <p className="text-xl font-semibold tracking-tight">
        Over<span className="text-primary">time</span>
      </p>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="grid gap-4">{children}</CardContent>
        {footer ? (
          <CardFooter className="justify-center text-sm text-muted-foreground">{footer}</CardFooter>
        ) : null}
      </Card>
    </main>
  );
}
