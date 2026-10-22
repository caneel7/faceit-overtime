import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';

type CheckEmailNoticeProps = {
  email: string;
  kind: 'verify' | 'reset';
  onResend?: () => void;
  resendPending?: boolean;
  resent?: boolean;
};

const COPY = {
  verify: {
    title: 'Check your email',
    body: (email: string) =>
      `We've sent a link to ${email}. Open it within 24 hours to verify your email and sign in.`,
  },
  reset: {
    title: 'Check your email',
    body: (email: string) =>
      `If an account exists for ${email}, we've sent a link to reset your password. It works for 30 minutes.`,
  },
};

export function CheckEmailNotice({
  email,
  kind,
  onResend,
  resendPending = false,
  resent = false,
}: CheckEmailNoticeProps) {
  return (
    <div className="grid gap-4">
      <Alert variant="success">
        <AlertTitle>{COPY[kind].title}</AlertTitle>
        <AlertDescription>
          <p>{COPY[kind].body(email)}</p>
        </AlertDescription>
      </Alert>
      {onResend ? (
        <div className="grid gap-1 text-sm text-muted-foreground">
          <span>Nothing arrived? Check spam, or</span>
          <Button
            type="button"
            variant="outline"
            onClick={onResend}
            disabled={resendPending || resent}
          >
            {resendPending ? 'Sending…' : resent ? 'Sent again' : 'Send it again'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
