import { Badge } from '../../primitives/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../primitives/card';

type AccountDetailsProps = {
  displayName: string;
  email: string | null;
  emailVerified: boolean;
  hasPassword: boolean;
};

export function AccountDetails({
  displayName,
  email,
  emailVerified,
  hasPassword,
}: AccountDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted-foreground">Display name</dt>
          <dd>{displayName}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="flex flex-wrap items-center gap-2">
            {email ? (
              <>
                <span className="break-all">{email}</span>
                <Badge variant={emailVerified ? 'secondary' : 'outline'}>
                  {emailVerified ? 'Verified' : 'Not verified'}
                </Badge>
              </>
            ) : (
              <span className="text-muted-foreground">None, you sign in with FACEIT</span>
            )}
          </dd>
          <dt className="text-muted-foreground">Password</dt>
          <dd>{hasPassword ? 'Set' : 'Not set'}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
