import type { MeResponse, SessionResponse } from '@overtime/shared';
import { create } from 'zustand';

export type SessionStatus = 'unknown' | 'signed_in' | 'signed_out';

type SessionState = {
  status: SessionStatus;
  accessToken: string | null;
  expiresAt: number | null;
  me: MeResponse | null;
  signIn: (session: SessionResponse) => void;
  setMe: (me: MeResponse) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  accessToken: null,
  expiresAt: null,
  me: null,
  signIn: ({ accessToken, expiresAt, ...me }) =>
    set({ status: 'signed_in', accessToken, expiresAt: Date.parse(expiresAt), me }),
  setMe: (me) => set({ me }),
  signOut: () => set({ status: 'signed_out', accessToken: null, expiresAt: null, me: null }),
}));
