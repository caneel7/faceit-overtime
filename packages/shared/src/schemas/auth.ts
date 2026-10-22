import { z } from 'zod';
import { Id, IsoDateTime } from './common';

export const Email = z.string().trim().max(254).pipe(z.email());
export const Password = z.string().min(10).max(128);
export const DisplayName = z.string().trim().min(1).max(32);
export const OpaqueToken = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export const SignUpBody = z.object({ email: Email, password: Password, displayName: DisplayName });
export type SignUpBody = z.infer<typeof SignUpBody>;

export const SignInBody = z.object({ email: Email, password: z.string().min(1).max(128) });
export type SignInBody = z.infer<typeof SignInBody>;

export const EmailBody = z.object({ email: Email });
export type EmailBody = z.infer<typeof EmailBody>;

export const EmailAvailable = z.object({ available: z.boolean() });
export type EmailAvailable = z.infer<typeof EmailAvailable>;

export const TokenBody = z.object({ token: OpaqueToken });
export type TokenBody = z.infer<typeof TokenBody>;

export const ResetPasswordBody = z.object({ token: OpaqueToken, password: Password });
export type ResetPasswordBody = z.infer<typeof ResetPasswordBody>;

export const DevLoginBody = z.object({ nickname: z.string().trim().min(1).max(64) });
export type DevLoginBody = z.infer<typeof DevLoginBody>;

export const Accepted = z.object({ status: z.literal('accepted') });
export type Accepted = z.infer<typeof Accepted>;

export const IdentityProvider = z.enum(['faceit']);
export type IdentityProvider = z.infer<typeof IdentityProvider>;

export const Identity = z.object({
  provider: IdentityProvider,
  providerUserId: z.string(),
  linkedAt: IsoDateTime,
});
export type Identity = z.infer<typeof Identity>;

export const Player = z.object({
  id: Id,
  faceitPlayerId: z.string(),
  nickname: z.string(),
  avatarUrl: z.string().nullable(),
  country: z.string().nullable(),
  cs2Level: z.number().int().min(1).max(10).nullable(),
  cs2Elo: z.number().int().nullable(),
  cs2Region: z.string().nullable(),
  syncedAt: IsoDateTime,
});
export type Player = z.infer<typeof Player>;

export const Me = z.object({
  user: z.object({
    id: Id,
    displayName: z.string(),
    email: z.string().nullable(),
    emailVerified: z.boolean(),
    hasPassword: z.boolean(),
    createdAt: IsoDateTime,
  }),
  identities: z.array(Identity),
  player: Player.nullable(),
});
export type Me = z.infer<typeof Me>;
