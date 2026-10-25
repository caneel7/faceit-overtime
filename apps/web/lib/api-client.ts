import type { AppType } from '@overtime/api';
import { ErrorBody, RefreshResponse, type ErrorCode } from '@overtime/shared';
import { hc } from 'hono/client';
import { useSessionStore } from './session-store';

export function hasSessionMarker(): boolean {
  return document.cookie.split('; ').includes('ot_s=1');
}

let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    const { signIn, signOut } = useSessionStore.getState();
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) {
        signOut();
        return false;
      }
      signIn(RefreshResponse.parse(await res.json()));
      return true;
    } catch {
      signOut();
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const send = (token: string | null) => {
    const headers = new Headers(init?.headers);
    if (token) headers.set('authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };
  const token = useSessionStore.getState().accessToken;
  const res = await send(token);
  if (res.status !== 401 || !token) return res;
  if (!(await refreshSession())) return res;
  return send(useSessionStore.getState().accessToken);
}

export const api = hc<AppType>('/', { fetch: authFetch });

export async function errorCode(res: Response): Promise<ErrorCode | null> {
  const parsed = ErrorBody.safeParse(await res.json().catch(() => null));
  return parsed.success ? parsed.data.error.code : null;
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  useSessionStore.getState().signOut();
}
