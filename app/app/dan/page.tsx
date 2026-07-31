'use client';
// DAN'S DASHBOARD — a parallel, independent surface.
//
// Why it exists: the main dashboard (components/dashboard/*) grew the escrow flow
// on top of a pre-seeded mock deal store, so "propose terms" happens INSIDE a deal
// that already exists and there is no way to start a genuinely new deal (BRD FR-1).
// This surface rebuilds the journey in the order the product actually works —
// create a deal first, everything else follows — without touching Nick's dashboard.
//
// It reuses the SAME backend: app/api/escrow/* → lib/escrow/* → the local chain.
// No new contract, no new lifecycle logic; only a different front door.
//
// Chrome (rail, mobile bar, company switcher) lives in DanShell so this page and
// /dan/deals/[dealId] wear the same frame.
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth/useSession';
import { DanShell, type DanTab } from '@/components/dan/DanShell';
import { DealsTab } from '@/components/dan/DealsTab';
import { DashboardTab } from '@/components/dan/DashboardTab';
import { AuthForms } from '@/components/dan/AuthForms';

export default function DanDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DanDashboard />
    </Suspense>
  );
}

function DanDashboard() {
  // ?tab=deals lets the deal page's "All deals" link land on the right tab.
  const search = useSearchParams();
  const [activeTab, setActiveTab] = useState<DanTab>(
    search.get('tab') === 'deals' ? 'Deals' : 'Dashboard',
  );
  const { account, ready } = useSession();

  return (
    <DanShell activeTab={activeTab} onTabChange={setActiveTab}>
      {!ready ? null : !account ? (
        <AuthForms />
      ) : (
        <>
          {activeTab === 'Dashboard' && <DashboardTab onOpenDeals={() => setActiveTab('Deals')} />}
          {activeTab === 'Deals' && <DealsTab />}
        </>
      )}
    </DanShell>
  );
}
