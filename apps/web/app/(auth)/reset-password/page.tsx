import { ResetPassword } from './reset-password';

export default async function ResetPasswordPage({ searchParams }: PageProps<'/reset-password'>) {
  const { token } = await searchParams;
  return <ResetPassword token={typeof token === 'string' ? token : null} />;
}
