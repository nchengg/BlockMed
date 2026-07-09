'use client';
import { useState } from 'react';
import type { Role } from '@/data/dashboardDemo';
import { useDeal } from '@/lib/dealStore';
import { useSession, dashboardLensForRole } from '@/lib/sessionStore';
import { LeftRail, MobileTopBar, type DashboardTab } from './LeftRail';
import { DealSummaryBand } from './DealSummaryBand';
import { NextActionBand } from './NextActionBand';
import { OverviewTab } from './tabs/OverviewTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { AuditTrailTab } from './tabs/AuditTrailTab';
import { SettingsTab } from './tabs/SettingsTab';

export function DashboardShell() {
  const { deal } = useDeal();
  const { session } = useSession();
  // Default the dashboard lens to the signed-in party — same system, party's own
  // view. The in-page role switcher can still change it for the demo.
  const [role, setRole] = useState<Role>(session ? dashboardLensForRole(session.role) : 'buyer');
  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <LeftRail
        dealId={deal.dealId}
        role={role}
        onRoleChange={setRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <MobileTopBar
          dealId={deal.dealId}
          role={role}
          onRoleChange={setRole}
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
