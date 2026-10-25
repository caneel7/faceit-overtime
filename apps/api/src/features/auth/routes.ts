import {
  EmailAvailabilityQuery,
  EmailAvailabilityResponse,
  FaceitLinkResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  safeNext,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@overtime/shared';
import {
  describeRoute,
  errorResponses,
  jsonContent,
  respond,
  validator,
} from '@overtime/shared/hono';
import { Hono, type Context } from 'hono';
import type { AppEnv } from '../../env';
import {
  clearOAuthCookie,
  clearSessionCookies,
  COOKIE,
  readCookie,
  setOAuthCookie,
  setSessionCookies,
} from '../../lib/cookies';
import { currentAuth, requireLiveSession } from '../../middleware/auth';
import { clientIp, limit } from '../../middleware/rate-limit';
import { QueueService } from '../../queues/queue-service';
import { unauthenticated } from '../me/service';
import { completeFaceit, startFaceit } from './faceit-service';
import {
  emailHmac,
  forgotPassword,
  isEmailAvailable,
  login,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from './password-service';
import { revokeByRefreshToken, rotateSession, sessionResponse } from './sessions';

function client(c: Context<AppEnv>) {
  return { userAgent: c.req.header('user-agent') ?? null, ip: clientIp(c) };
}

function limitIp(c: Context<AppEnv>) {
  return limit(c, c.env.IP_LIMITER, `ip:${clientIp(c) ?? 'unknown'}`);
}

async function limitEmail(c: Context<AppEnv>, email: string) {
  await limit(c, c.env.EMAIL_LIMITER, `email:${await emailHmac(c.env, email)}`);
}

function link(c: Context<AppEnv>, path: string, token: string) {
  return `${c.env.APP_URL}${path}?token=${token}`;
}

const accepted = { status: 'accepted' } as const;

export const auth = new Hono<AppEnv>()
  .get(
    '/email-available',
    describeRoute({
      tags: ['auth'],
      summary: 'Is this email free to register?',
      responses: {
        200: jsonContent(EmailAvailabilityResponse, 'Whether the email can be used'),
        ...errorResponses('VALIDATION_FAILED', 'RATE_LIMITED'),
      },
    }),
    validator('query', EmailAvailabilityQuery),
    async (c) => {
      await limitIp(c);
      const available = await isEmailAvailable(c.var.db, c.env, c.req.valid('query').email);
      return respond(c, EmailAvailabilityResponse, { available });
    },
  )
  .post(
    '/register',
    describeRoute({
      tags: ['auth'],
      summary: 'Create an account with email and password',
      description: 'Sends a verification link. The account can sign in once the email is verified.',
      responses: {
        202: jsonContent(RegisterResponse, 'Account created; verification email sent'),
        ...errorResponses('VALIDATION_FAILED', 'EMAIL_TAKEN', 'RATE_LIMITED'),
      },
    }),
    validator('json', RegisterRequest),
    async (c) => {
      const body = c.req.valid('json');
      await limitIp(c);
      await limitEmail(c, body.email);
      const { email, token } = await register(c.var.db, c.env, body);
      QueueService.auth.send('verification-email', {
        to: email,
        link: link(c, '/verify-email', token),
      });
      return respond(c, RegisterResponse, accepted, 202);
    },
  )
  .post(
    '/verify-email',
    describeRoute({
      tags: ['auth'],
      summary: 'Verify an email with the link token and sign in',
      responses: {
        200: jsonContent(VerifyEmailResponse, 'Verified and signed in'),
        ...errorResponses('VALIDATION_FAILED', 'INVALID_TOKEN'),
      },
    }),
    validator('json', VerifyEmailRequest),
    async (c) => {
      const session = await verifyEmail(c.var.db, c.env, c.req.valid('json').token, client(c));
      setSessionCookies(c, session.refreshToken);
      return respond(c, VerifyEmailResponse, session.body);
    },
  )
  .post(
    '/verify-email/resend',
    describeRoute({
      tags: ['auth'],
      summary: 'Send a new verification link',
      description: 'Always 202, whether or not the email has an unverified account.',
      responses: {
        202: jsonContent(ResendVerificationResponse, 'Sent if the account exists'),
        ...errorResponses('VALIDATION_FAILED', 'RATE_LIMITED'),
      },
    }),
    validator('json', ResendVerificationRequest),
    async (c) => {
      const { email } = c.req.valid('json');
      await limitIp(c);
      await limitEmail(c, email);
      const sent = await resendVerification(c.var.db, c.env, email);
      if (sent) {
        QueueService.auth.send('verification-email', {
          to: sent.email,
          link: link(c, '/verify-email', sent.token),
        });
      }
      return respond(c, ResendVerificationResponse, accepted, 202);
    },
  )
  .post(
    '/login',
    describeRoute({
      tags: ['auth'],
      summary: 'Sign in with email and password',
      description:
        'Returns a 10-minute access token in the body and sets the `ot_rt` refresh-token cookie.',
      responses: {
        200: jsonContent(LoginResponse, 'Signed in'),
        ...errorResponses(
          'VALIDATION_FAILED',
          'INVALID_CREDENTIALS',
          'EMAIL_NOT_VERIFIED',
          'RATE_LIMITED',
        ),
      },
    }),
    validator('json', LoginRequest),
    async (c) => {
      const body = c.req.valid('json');
      await limitIp(c);
      await limit(c, c.env.SIGNIN_LIMITER, `login:${await emailHmac(c.env, body.email)}`);
      const session = await login(c.var.db, c.env, body, client(c));
      setSessionCookies(c, session.refreshToken);
      return respond(c, LoginResponse, session.body);
    },
  )
  .post(
    '/password/forgot',
    describeRoute({
      tags: ['auth'],
      summary: 'Send a password reset link',
      description: 'Always 202, whether or not the email has an account.',
      responses: {
        202: jsonContent(ForgotPasswordResponse, 'Sent if the account exists'),
        ...errorResponses('VALIDATION_FAILED', 'RATE_LIMITED'),
      },
    }),
    validator('json', ForgotPasswordRequest),
    async (c) => {
      const { email } = c.req.valid('json');
      await limitIp(c);
      await limitEmail(c, email);
      const sent = await forgotPassword(c.var.db, c.env, email);
      if (sent) {
        QueueService.auth.send('password-reset-email', {
          to: sent.email,
          link: link(c, '/reset-password', sent.token),
        });
      }
      return respond(c, ForgotPasswordResponse, accepted, 202);
    },
  )
  .post(
    '/password/reset',
    describeRoute({
      tags: ['auth'],
      summary: 'Set a new password with the link token',
      description: 'Signs out every other session of the account, then signs this browser in.',
      responses: {
        200: jsonContent(ResetPasswordResponse, 'Password changed and signed in'),
        ...errorResponses('VALIDATION_FAILED', 'INVALID_TOKEN'),
      },
    }),
    validator('json', ResetPasswordRequest),
    async (c) => {
      const session = await resetPassword(c.var.db, c.env, c.req.valid('json'), client(c));
      setSessionCookies(c, session.refreshToken);
      return respond(c, ResetPasswordResponse, session.body);
    },
  )
  .post(
    '/refresh',
    describeRoute({
      tags: ['auth'],
      summary: 'Get a new access token',
      description:
        'Uses the `ot_rt` refresh-token cookie, rotates it, and returns a 10-minute access token with the signed-in user. Reusing an already-rotated refresh token revokes the session.',
      responses: {
        200: jsonContent(RefreshResponse, 'New access token and the signed-in user'),
        ...errorResponses('UNAUTHENTICATED'),
      },
    }),
    async (c) => {
      const token = readCookie(c, COOKIE.refresh);
      const result = token
        ? await rotateSession(c.var.db, c.env, token)
        : { kind: 'invalid' as const };
      if (result.kind === 'invalid') {
        clearSessionCookies(c);
        throw unauthenticated();
      }
      if (result.kind === 'rotated') setSessionCookies(c, result.refreshToken);
      return respond(c, RefreshResponse, await sessionResponse(c.var.db, c.env, result));
    },
  )
  .post(
    '/logout',
    describeRoute({
      tags: ['auth'],
      summary: 'Sign out',
      description:
        'Revokes the session behind the `ot_rt` cookie and clears the cookies. Always 204.',
      responses: { 204: { description: 'Signed out' } },
    }),
    async (c) => {
      const token = readCookie(c, COOKIE.refresh);
      if (token) await revokeByRefreshToken(c.var.db, token, 'logout');
      clearSessionCookies(c);
      return c.body(null, 204);
    },
  )
  .get(
    '/faceit/start',
    describeRoute({
      tags: ['auth'],
      summary: 'Start FACEIT sign-in',
      description:
        'Redirects to FACEIT with PKCE and a signed `ot_oauth` state cookie. `next` must be a same-origin path.',
      responses: { 302: { description: 'Redirect to FACEIT' } },
    }),
    async (c) => {
      const { url, stateCookie } = await startFaceit(c.env, {
        next: safeNext(c.req.query('next')),
        intent: 'sign_in',
      });
      setOAuthCookie(c, stateCookie);
      return c.redirect(url, 302);
    },
  )
  .post(
    '/faceit/link',
    describeRoute({
      tags: ['auth'],
      summary: 'Start connecting FACEIT to the signed-in account',
      description:
        'Returns the FACEIT URL to navigate to and sets the `ot_oauth` state cookie bound to this user.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: jsonContent(FaceitLinkResponse, 'FACEIT authorize URL'),
        ...errorResponses('UNAUTHENTICATED'),
      },
    }),
    requireLiveSession,
    async (c) => {
      const { url, stateCookie } = await startFaceit(c.env, {
        next: '/settings',
        intent: 'link',
        sub: currentAuth(c).userId,
      });
      setOAuthCookie(c, stateCookie);
      return respond(c, FaceitLinkResponse, { url });
    },
  )
  .get(
    '/faceit/callback',
    describeRoute({
      tags: ['auth'],
      summary: 'FACEIT OAuth callback',
      description:
        'Signs in (sets session cookies) or connects FACEIT, then redirects into the app. Errors redirect with `?error=`.',
      responses: { 302: { description: 'Redirect into the app' } },
    }),
    async (c) => {
      const result = await completeFaceit(c.var.db, c.env, {
        query: {
          code: c.req.query('code'),
          state: c.req.query('state'),
          error: c.req.query('error'),
        },
        stateCookie: readCookie(c, COOKIE.oauth),
        refreshToken: readCookie(c, COOKIE.refresh),
        client: client(c),
      });
      clearOAuthCookie(c);
      if (result.refreshToken) setSessionCookies(c, result.refreshToken);
      return c.redirect(result.location, 302);
    },
  );
