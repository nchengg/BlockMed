'use client';
// Client-side route guard for the mock role separation. Wrap a protected page's
// content in <RequireParty allow={[...]}> so a party only ever sees its own view:
// if the signed-in role isn't in `allow`, the user is bounced to /login.
//
// This is view separation for a DEMO, not a security boundary — real enforcement
// belongs server-side once auth Q18 is settled. See lib/sessionStore.tsx.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { partyGroup, roleHome, useSession, type PartyGroup } from '@/lib/sessionStore';

export function RequireParty({
  allow,
  children,
}: {
  allow: PartyGroup[];
  children: React.ReactNode;
}) {
  const { session, hydrated } = useSession();
  const router = useRouter();

  const permitted = session ? allow.includes(partyGroup[session.role]) : false;

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace('/login');
    } else if (!permitted) {
      // Signed in as the wrong party — send them to their own portal instead of
      // exposing a view they shouldn't see.
      router.replace(roleHome[session.role]);
    }
  }, [hydrated, session, permitted, router]);

  // Avoid flashing protected content before the redirect runs.
  if (!hydrated || !permitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-deep)',
          color: 'var(--text-secondary)',
          fontSize: 14,
        }}
      >
        {hydrated ? 'Redirecting…' : 'Loading…'}
      </div>
    );
  }

  return <>{children}</>;
}
