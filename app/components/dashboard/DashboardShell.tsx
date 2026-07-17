'use client';
import { useState } from 'react';
import type { Role } from '@/data/dashboardDemo';
import { useDeal } from '@/lib/dealStore';
import { useAuth, hatToLens, type ClientHat } from '@/lib/authStore';
import { LeftRail, MobileTopBar, type DashboardTab } from './LeftRail';
import { DealSummaryBand } from './DealSummaryBand';
import { NextActionBand } from './NextActionBand';
import { OverviewTab } from './tabs/OverviewTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { AuditTrailTab } from './tabs/AuditTrailTab';
import { SettingsTab } from './tabs/SettingsTab';
import { EscrowConsole } from './EscrowConsole';

// The logged-in CLIENT portal — the #26 dashboard, now scoped to the signed-in
// account. Per-account isolation runs at TWO levels:
//   • VIEW/ACTION — the visible lens + actions are limited to the account's own
//     hat(s). A single client account may hold BOTH buyer and seller hats and
//     switch between them (the dual-hat exception); a buyer-only account is
//     locked to the buyer view, and so on.
//   • DATA — the deal list and the active deal are filtered by the viewer's
//     participation (buyer/seller/operator) via lib/dealStore. An account only
//     ever sees ITS OWN deals; a deal shared with a counterparty shows in both.
//
// The account here is the VIEWER (authStore.viewerAccount) so a developer using
// "view as" previews this dashboard exactly as the target party would see it,
// data included. When not impersonating, viewerAccount === the logged-in account.
export function DashboardShell() {
  const { deal, visibleDeals } = useDeal();
  const { viewerAccount, activeHat, setActiveHat, impersonating } = useAuth();
  const account = viewerAccount;
  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview');
  // When a developer previews a dual-hat account, hat switching is LOCAL to the
  // preview — it must not write to the developer's own session. Off-preview this
  // stays null and the real session hat is used.
  const [previewHat, setPreviewHat] = useState<ClientHat | null>(null);

  // Client accounts only ever wear their own hats; default to the first one.
  const hats = account?.hats ?? [];
  const sessionHat = impersonating ? previewHat : activeHat;
  const rawHat = sessionHat ?? hats[0] ?? 'buyer';
  // Clamp to a hat this account actually holds (guards target switches in preview).
  const currentHat: ClientHat = hats.includes(rawHat) ? rawHat : (hats[0] ?? 'buyer');
  const changeHat = impersonating ? setPreviewHat : setActiveHat;
  const role: Role = hatToLens(currentHat);

  // Freshly-registered client with no deals yet — nothing to isolate into view.
  const hasDeals = visibleDeals.length > 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <LeftRail
        accountName={account?.displayName ?? 'Account'}
        dealId={deal.dealId}
        hats={hats}
        activeHat={currentHat}
        onHatChange={changeHat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <MobileTopBar
          accountName={account?.displayName ?? 'Account'}
          dealId={deal.dealId}
          hats={hats}
          activeHat={currentHat}
          onHatChange={changeHat}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {hasDeals ? (
          <>
            <DealSummaryBand />
            <NextActionBand role={role} />

            <div className="dashboard-content" style={{ padding: '28px 32px', maxWidth: 1200 }}>
              {activeTab === 'Overview' && <OverviewTab role={role} onViewAuditTrail={() => setActiveTab('Audit trail')} />}
              {activeTab === 'Documents' && <DocumentsTab role={role} />}
              {activeTab === 'Escrow' && <EscrowConsole hat={currentHat} />}
              {activeTab === 'Audit trail' && <AuditTrailTab />}
              {activeTab === 'Settings' && <SettingsTab />}
            </div>
          </>
        ) : (
          <div className="dashboard-content" style={{ padding: '48px 32px', maxWidth: 640 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              No deals yet
            </div>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              This account isn&apos;t a party to any escrow deals yet. New deals you take part in
              — as buyer, seller or operator — will appear here, and nowhere else.
            </p>
          </div>
        )}
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
