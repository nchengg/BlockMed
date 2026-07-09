'use client';
// Client-side route guard for the mock role separation. Wrap a protected page's
// content in <RequireParty allow={[...]}> so an account only ever sees the views
// its type permits: if the logged-in account's type isn't in `allow`, the user
// is bounced to /login (signed out) or to their own portal (wrong party).
//
// The ACCOUNT is the source of truth for role (lib/authStore.tsx). This is view
// separation for a DEMO, not a security boundary — real enforcement belongs
// server-side once auth Q18 is settled.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { groupHome, useAuth, type PartyGroup } from '@/lib/authStore';

export function RequireParty({
  allow,
  children,
}: {
  allow: PartyGroup[];
  children: React.ReactNode;
}) {
  const { account, hydrated } = useAuth();
  const router = useRouter();

  const permitted = account ? allow.includes(account.type) : false;

  useEffect(() => {
    if (!hydrated) return;
    if (!account) {
      router.replace('/login');
    } else if (!permitted) {
      // Signed in as the wrong party — send them to their own portal rather than
      // exposing a view they shouldn't see (per-account separation).
      router.replace(groupHome[account.type]);
    }
  }, [hydrated, account, permitted, router]);

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
