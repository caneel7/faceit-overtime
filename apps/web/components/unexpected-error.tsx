import { Alert, AlertDescription, AlertTitle } from '@overtime/ui';

export function UnexpectedError() {
  return (
    <Alert variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>Try again in a moment.</AlertDescription>
    </Alert>
  );
}
