import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../primitives/card';

type AuthLayoutProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
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
