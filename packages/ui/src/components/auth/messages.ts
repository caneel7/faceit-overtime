export type Message = { title: string; description: string };

export type SignInError =
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'rate_limited'
  | 'state_mismatch'
  | 'access_denied'
  | 'faceit_unavailable';

export const SIGN_IN_ERRORS: Record<SignInError, Message> = {
  invalid_credentials: {
    title: 'Email or password is incorrect',
    description: 'Check both and try again.',
  },
  email_not_verified: {
    title: 'Verify your email first',
    description: 'Open the link we emailed you, or send a new one.',
  },
  rate_limited: {
    title: 'Too many attempts',
    description: 'Wait a minute, then try again.',
  },
  state_mismatch: {
    title: 'Sign-in expired',
    description: 'The FACEIT sign-in took too long or was started in another tab. Try again.',
  },
  access_denied: {
    title: 'FACEIT sign-in cancelled',
    description: 'You can sign in with FACEIT or with your email and password.',
  },
  faceit_unavailable: {
    title: 'FACEIT is not responding',
    description: 'Try again in a moment, or sign in with your email and password.',
  },
};

export type ConnectError =
  'identity_in_use' | 'already_connected' | 'session_mismatch' | 'faceit_unavailable';

export const CONNECT_ERRORS: Record<ConnectError, Message> = {
  identity_in_use: {
    title: 'That FACEIT account belongs to another user',
    description: 'Sign in with FACEIT to use that account instead.',
  },
  already_connected: {
    title: 'FACEIT is already connected',
    description: 'Your account can have one FACEIT account.',
  },
  session_mismatch: {
    title: 'Connection not completed',
    description: 'You were signed out or switched accounts during the FACEIT step. Try again.',
  },
  faceit_unavailable: {
    title: 'FACEIT is not responding',
    description: 'Try again in a moment.',
  },
};

export const RATE_LIMITED: Message = SIGN_IN_ERRORS.rate_limited;
