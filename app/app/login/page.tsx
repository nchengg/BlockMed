import { LoginForm } from '@/components/auth/LoginForm';

// Front door for the mock, account-first login. An optional ?email= hint
// prefills the field (the landing role cards deep-link here). Real auth is a
// pending team decision — see LoginForm / lib/authStore.tsx (TRD Q18).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <LoginForm initialEmail={email ?? ''} />;
}
