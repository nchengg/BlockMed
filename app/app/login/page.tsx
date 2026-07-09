import { LoginForm } from '@/components/auth/LoginForm';
import type { PartyRole } from '@/lib/sessionStore';

// Front door for the mock, role-based login. Reads an optional ?party= hint
// (e.g. the landing page deep-links "Continue as Buyer" → /login?party=buyer)
// and preselects it in the client form.
//
// NOTE: this is a MOCK login for view separation only — see LoginForm and
// lib/sessionStore.tsx for the auth Q18 integration seam.
const VALID: PartyRole[] = ['admin', 'developer', 'buyer', 'seller', 'platform'];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string }>;
}) {
  const { party } = await searchParams;
  const initialRole = party && VALID.includes(party as PartyRole) ? (party as PartyRole) : null;
  return <LoginForm initialRole={initialRole} />;
}
