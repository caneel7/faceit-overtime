import { safeNext } from '@overtime/shared';
import { SIGN_IN_ERRORS, type SignInError } from '@overtime/ui';
import { SignIn } from './sign-in';

function signInError(value: unknown): SignInError | undefined {
  return typeof value === 'string' && value in SIGN_IN_ERRORS ? (value as SignInError) : undefined;
}

export default async function SignInPage({ searchParams }: PageProps<'/signin'>) {
  const { next, error } = await searchParams;
  return (
    <SignIn
      next={safeNext(typeof next === 'string' ? next : null)}
      initialError={signInError(error)}
    />
  );
}
