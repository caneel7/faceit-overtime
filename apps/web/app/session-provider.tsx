'use client';

import { useEffect, type ReactNode } from 'react';
import { hasSessionMarker, refreshSession } from '../lib/api-client';
import { useSessionStore } from '../lib/session-store';

const REFRESH_BEFORE_EXPIRY_MS = 60_000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const expiresAt = useSessionStore((s) => s.expiresAt);

  useEffect(() => {
    if (hasSessionMarker()) void refreshSession();
    else useSessionStore.getState().signOut();
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now() - REFRESH_BEFORE_EXPIRY_MS, 0);
    const timer = setTimeout(() => void refreshSession(), delay);
    return () => clearTimeout(timer);
  }, [expiresAt]);

  return children;
}
