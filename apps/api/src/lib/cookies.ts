import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { OAUTH_STATE_TTL_SECONDS } from './jwt';

export const COOKIE = {
  refresh: 'ot_rt',
  signedIn: 'ot_s',
  oauth: 'ot_oauth',
} as const;

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

const authPath = {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  path: '/api/auth',
} as const satisfies CookieOptions;
const marker = { secure: true, sameSite: 'Lax', path: '/' } as const satisfies CookieOptions;

export function readCookie(c: Context, name: (typeof COOKIE)[keyof typeof COOKIE]) {
  return getCookie(c, name);
}

export function setSessionCookies(c: Context, refreshToken: string) {
  setCookie(c, COOKIE.refresh, refreshToken, { ...authPath, maxAge: SESSION_TTL_SECONDS });
  setCookie(c, COOKIE.signedIn, '1', { ...marker, maxAge: SESSION_TTL_SECONDS });
}

export function clearSessionCookies(c: Context) {
  deleteCookie(c, COOKIE.refresh, authPath);
  deleteCookie(c, COOKIE.signedIn, marker);
}

export function setOAuthCookie(c: Context, state: string) {
  setCookie(c, COOKIE.oauth, state, { ...authPath, maxAge: OAUTH_STATE_TTL_SECONDS });
}

export function clearOAuthCookie(c: Context) {
  deleteCookie(c, COOKIE.oauth, authPath);
}
