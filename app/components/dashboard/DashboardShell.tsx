'use client';
import { useState } from 'react';
import type { Role } from '@/data/dashboardDemo';
import { useDeal } from '@/lib/dealStore';
import { useAuth, hatToLens } from '@/lib/authStore';
import { LeftRail, MobileTopBar, type DashboardTab } from './LeftRail';
import { DealSummaryBand } from './DealSummaryBand';
import { NextActionBand } from './NextActionBand';
import { OverviewTab } from './tabs/OverviewTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { AuditTrailTab } from './tabs/AuditTrailTab';
import { SettingsTab } from './tabs/SettingsTab';

// The logged-in CLIENT portal — the #26 dashboard, now scoped to the signed-in
// account. Per-account isolation: the visible lens + actions are limited to the
// account's own hat(s). A single client account may hold BOTH buyer and seller
// hats and switch between them (the dual-hat exception); a buyer-only account is
// locked to the buyer view, and so on.
//
// TODO(follow-up: per-account data isolation) — isolation today is at the
// view/action level only. There is still a single shared demo deal (dealStore),
// so every account sees the same deal data. Real isolation must filter deals by
// the account's participation (buyer/seller/operator address) so an account only
// sees ITS OWN deals. Tracked as a known gap in the PR.
export function DashboardShell() {
  const { deal } = useDeal();
  const { account, activeHat, setActiveHat } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview');

  // Client accounts only ever wear their own hats; default to the first one.
  const hats = account?.hats ?? [];
  const currentHat = activeHat ?? hats[0] ?? 'buyer';
  const role: Role = hatToLens(currentHat);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <LeftRail
        accountName={account?.displayName ?? 'Account'}
        dealId={deal.dealId}
        hats={hats}
        activeHat={currentHat}
        onHatChange={setActiveHat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <MobileTopBar
          accountName={account?.displayName ?? 'Account'}
          dealId={deal.dealId}
          hats={hats}
          activeHat={currentHat}
          onHatChange={setActiveHat}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <DealSummaryBand />
        <NextActionBand role={role} />

        <div className="dashboard-content" style={{ padding: '28px 32px', maxWidth: 1200 }}>
          {activeTab === 'Overview' && <OverviewTab role={role} onViewAuditTrail={() => setActiveTab('Audit trail')} />}
          {activeTab === 'Documents' && <DocumentsTab role={role} />}
          {activeTab === 'Audit trail' && <AuditTrailTab />}
          {activeTab === 'Settings' && <SettingsTab />}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-rail { display: none !important; }
          .dashboard-topbar { display: block !important; }
          .dashboard-content { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
