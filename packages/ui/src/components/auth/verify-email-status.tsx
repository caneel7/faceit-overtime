import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

type VerifyEmailStatusProps = {
  state: 'verifying' | 'error';
  signInHref: string;
};

export function VerifyEmailStatus({ state, signInHref }: VerifyEmailStatusProps) {
  if (state === 'verifying') {
    return (
      <div className="grid gap-3" role="status" aria-live="polite">
        <p className="text-sm">Verifying your email…</p>
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <Alert variant="destructive">
        <AlertTitle>This link doesn't work any more</AlertTitle>
        <AlertDescription>
          <p>
            Links work once and expire after 24 hours. Sign in to get a new one, or use the newest
            email we sent you.
          </p>
        </AlertDescription>
      </Alert>
      <Button asChild className="w-full">
        <a href={signInHref}>Go to sign in</a>
      </Button>
    </div>
  );
}
