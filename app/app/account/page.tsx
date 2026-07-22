import { Suspense } from 'react';
import { RequireParty } from '@/components/auth/RequireParty';
import { SessionBar } from '@/components/auth/SessionBar';
import { AccountPanel } from '@/components/account/AccountPanel';

// Account settings / onboarding — available to any signed-in account. This is
// where the SECONDARY wallet-connect step lives (account-first, wallet-second).
export default function AccountPage() {
  return (
    <RequireParty allow={['admin', 'developer', 'client']}>
      <SessionBar />
      <Suspense fallback={null}>
        <AccountPanel />
      </Suspense>
    </RequireParty>
  );
}
