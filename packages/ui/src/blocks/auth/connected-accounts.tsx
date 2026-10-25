import { PlayerIdentity } from '../player/player-identity';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../primitives/card';
import { CONNECT_ERRORS, type ConnectError } from './messages';

export type ConnectedPlayer = {
  nickname: string;
  avatarUrl?: string | null;
  cs2Level?: number | null;
  country?: string | null;
};

type ConnectedAccountsProps = {
  faceit: { status: 'connected'; player: ConnectedPlayer } | { status: 'not_connected' };
  onConnect: () => void;
  connectPending?: boolean;
  error?: ConnectError;
  justConnected?: boolean;
};

export function ConnectedAccounts({
  faceit,
  onConnect,
  connectPending = false,
  error,
  justConnected = false,
}: ConnectedAccountsProps) {
  const message = error ? CONNECT_ERRORS[error] : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected accounts</CardTitle>
        <CardDescription>
          Connect FACEIT to captain a team or play in tournaments. Organising doesn't need it.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {message ? (
          <Alert variant="destructive">
            <AlertTitle>{message.title}</AlertTitle>
            <AlertDescription>{message.description}</AlertDescription>
          </Alert>
        ) : null}
        {justConnected && faceit.status === 'connected' ? (
          <Alert variant="success">
            <AlertTitle>FACEIT connected</AlertTitle>
          </Alert>
        ) : null}
        <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">FACEIT</span>
              <Badge variant={faceit.status === 'connected' ? 'default' : 'outline'}>
                {faceit.status === 'connected' ? 'Connected' : 'Not connected'}
              </Badge>
            </div>
            {faceit.status === 'connected' ? <PlayerIdentity {...faceit.player} size="sm" /> : null}
          </div>
          {faceit.status === 'not_connected' ? (
            <Button type="button" variant="faceit" onClick={onConnect} disabled={connectPending}>
              {connectPending ? 'Opening FACEIT…' : 'Connect with FACEIT'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
