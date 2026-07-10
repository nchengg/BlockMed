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
import { groupHome, useAuth, type ClientHat, type PartyGroup } from '@/lib/authStore';

export function RequireParty({
  allow,
  requireHat,
  children,
}: {
  allow: PartyGroup[];
  // HAT-LEVEL gate (clients only). When set, a client account must actually hold
  // this hat to view the page — e.g. /buyer requires 'buyer', /seller requires
  // 'seller'. A dual-hat account holds both and passes either. Group membership
  // (allow) alone is NOT enough: a seller-only client is in the `client` group
  // but must still be bounced off /buyer. Admin/developer are governed by `allow`
  // only (they carry no hats), so this never applies to them.
  requireHat?: ClientHat;
  children: React.ReactNode;
}) {
  const { account, hydrated } = useAuth();
  const router = useRouter();

  const permitted = account
    ? allow.includes(account.type) && (!requireHat || account.hats.includes(requireHat))
    : false;

  useEffect(() => {
    if (!hydrated) return;
    if (!account) {
      router.replace('/login');
    } else if (!permitted) {
      // Wrong party (group) OR a client missing the required hat — send them to
      // their own portal rather than exposing a view they shouldn't see. A
      // seller-only client hitting /buyer lands back on their dashboard.
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
