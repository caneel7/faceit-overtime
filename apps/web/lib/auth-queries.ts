import {
  EmailAvailabilityResponse,
  FaceitLinkResponse,
  ForgotPasswordResponse,
  LoginResponse,
  MeResponse,
  RegisterResponse,
  ResendVerificationResponse,
  ResetPasswordResponse,
  VerifyEmailResponse,
  type ForgotPasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResendVerificationRequest,
  type ResetPasswordRequest,
  type SessionResponse,
} from '@overtime/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, request, send } from './api-client';
import { useSessionStore } from './session-store';

export const queryKeys = {
  me: ['me'] as const,
  emailAvailable: (email: string) => ['email-available', email] as const,
};

function useSignInOnSuccess() {
  const signIn = useSessionStore((s) => s.signIn);
  const queryClient = useQueryClient();
  return (session: SessionResponse) => {
    signIn(session);
    queryClient.setQueryData<MeResponse>(queryKeys.me, {
      user: session.user,
      identities: session.identities,
      player: session.player,
    });
  };
}

export function useMe() {
  const setMe = useSessionStore((s) => s.setMe);
  const signedIn = useSessionStore((s) => s.status === 'signed_in');
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const me = await request(api.api.me.$get(), MeResponse);
      setMe(me);
      return me;
    },
    enabled: signedIn,
  });
}

export function useEmailAvailability(email: string | null) {
  return useQuery({
    queryKey: queryKeys.emailAvailable(email ?? ''),
    queryFn: () =>
      request(
        api.api.auth['email-available'].$get({ query: { email: email ?? '' } }),
        EmailAvailabilityResponse,
      ),
    enabled: email !== null,
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const onSuccess = useSignInOnSuccess();
  return useMutation({
    mutationFn: (json: LoginRequest) => request(api.api.auth.login.$post({ json }), LoginResponse),
    onSuccess,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (json: RegisterRequest) =>
      request(api.api.auth.register.$post({ json }), RegisterResponse),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (json: ResendVerificationRequest) =>
      request(api.api.auth['verify-email'].resend.$post({ json }), ResendVerificationResponse),
  });
}

export function useVerifyEmail() {
  const onSuccess = useSignInOnSuccess();
  return useMutation({
    mutationFn: (token: string) =>
      request(api.api.auth['verify-email'].$post({ json: { token } }), VerifyEmailResponse),
    onSuccess,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (json: ForgotPasswordRequest) =>
      request(api.api.auth.password.forgot.$post({ json }), ForgotPasswordResponse),
  });
}

export function useResetPassword() {
  const onSuccess = useSignInOnSuccess();
  return useMutation({
    mutationFn: (json: ResetPasswordRequest) =>
      request(api.api.auth.password.reset.$post({ json }), ResetPasswordResponse),
    onSuccess,
  });
}

export function useFaceitLink() {
  return useMutation({
    mutationFn: () => request(api.api.auth.faceit.link.$post(), FaceitLinkResponse),
    onSuccess: ({ url }) => window.location.assign(url),
  });
}

export function useSignOut() {
  const signOut = useSessionStore((s) => s.signOut);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => send(api.api.auth.logout.$post()),
    onSettled: () => {
      signOut();
      queryClient.clear();
    },
  });
}
