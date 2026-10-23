import { z } from 'zod';
import { Id, IsoDateTime } from './common';

export const Email = z.string().trim().max(254).pipe(z.email());
export const Password = z.string().min(10).max(128);
export const DisplayName = z.string().trim().min(1).max(32);
export const OpaqueToken = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

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

export const MeResponse = z.object({
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
export type MeResponse = z.infer<typeof MeResponse>;

export const SessionResponse = MeResponse.extend({
  accessToken: z.string(),
  expiresAt: IsoDateTime,
});
export type SessionResponse = z.infer<typeof SessionResponse>;

const Accepted = z.object({ status: z.literal('accepted') });

export const RegisterRequest = z.object({
  email: Email,
  password: Password,
  displayName: DisplayName,
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const RegisterResponse = Accepted;
export type RegisterResponse = z.infer<typeof RegisterResponse>;

export const EmailAvailabilityQuery = z.object({ email: Email });
export type EmailAvailabilityQuery = z.infer<typeof EmailAvailabilityQuery>;

export const EmailAvailabilityResponse = z.object({ available: z.boolean() });
export type EmailAvailabilityResponse = z.infer<typeof EmailAvailabilityResponse>;

export const VerifyEmailRequest = z.object({ token: OpaqueToken });
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequest>;

export const VerifyEmailResponse = SessionResponse;
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponse>;

export const ResendVerificationRequest = z.object({ email: Email });
export type ResendVerificationRequest = z.infer<typeof ResendVerificationRequest>;

export const ResendVerificationResponse = Accepted;
export type ResendVerificationResponse = z.infer<typeof ResendVerificationResponse>;

export const LoginRequest = z.object({ email: Email, password: z.string().min(1).max(128) });
export type LoginRequest = z.infer<typeof LoginRequest>;

export const LoginResponse = SessionResponse;
export type LoginResponse = z.infer<typeof LoginResponse>;

export const ForgotPasswordRequest = z.object({ email: Email });
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequest>;

export const ForgotPasswordResponse = Accepted;
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponse>;

export const ResetPasswordRequest = z.object({ token: OpaqueToken, password: Password });
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;

export const ResetPasswordResponse = SessionResponse;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponse>;

export const DevLoginRequest = z.object({ nickname: z.string().trim().min(1).max(64) });
export type DevLoginRequest = z.infer<typeof DevLoginRequest>;

export const DevLoginResponse = SessionResponse;
export type DevLoginResponse = z.infer<typeof DevLoginResponse>;

export const RefreshResponse = SessionResponse;
export type RefreshResponse = z.infer<typeof RefreshResponse>;

export const FaceitLinkResponse = z.object({ url: z.url() });
export type FaceitLinkResponse = z.infer<typeof FaceitLinkResponse>;
