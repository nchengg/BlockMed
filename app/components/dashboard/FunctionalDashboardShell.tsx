'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthForms } from '@/components/dan/AuthForms';
import { DashboardTab } from '@/components/dan/DashboardTab';
import { DemoAccountSwitcher } from '@/components/dan/DemoAccountSwitcher';
import { DealsTab } from '@/components/dan/DealsTab';
import { useSession } from '@/lib/auth/useSession';
import { ThemeToggle } from './ThemeToggle';

export type FunctionalDashboardTab = 'Dashboard' | 'Deals';

const tabs: FunctionalDashboardTab[] = ['Dashboard', 'Deals'];

export function FunctionalDashboardShell() {
  const search = useSearchParams();
  const [activeTab, setActiveTab] = useState<FunctionalDashboardTab>(
    search.get('tab') === 'deals' ? 'Deals' : 'Dashboard',
  );
  const { account, ready } = useSession();

  return (
    <FunctionalDashboardFrame activeTab={activeTab} onTabChange={setActiveTab}>
      {!ready ? (
        <p className="bm-body">Loading dashboard.</p>
      ) : !account ? (
        <AuthForms />
      ) : activeTab === 'Dashboard' ? (
        <DashboardTab onOpenDeals={() => setActiveTab('Deals')} />
      ) : (
        <DealsTab dealBasePath="/dashboard/deals" />
      )}
    </FunctionalDashboardFrame>
  );
}

export function FunctionalDashboardFrame({ activeTab, onTabChange, children }: {
  activeTab: FunctionalDashboardTab;
  onTabChange?: (tab: FunctionalDashboardTab) => void;
  children: React.ReactNode;
}) {
  const { account, logout } = useSession();

  const tabControl = (tab: FunctionalDashboardTab) => {
    const active = tab === activeTab;
    const className = 'bm-top-nav-item';
    const shared = { className, 'data-active': active };

    if (onTabChange) {
      return (
        <button key={tab} type="button" onClick={() => onTabChange(tab)} {...shared}>
          {tab}
        </button>
      );
    }

    return (
      <Link key={tab} href={tab === 'Deals' ? '/dashboard?tab=deals' : '/dashboard'} {...shared}>
        {tab}
      </Link>
    );
  };

  return (
    <div className="bm-dashboard-root bm-dashboard-root-top">
      <header className="bm-topbar">
        <div className="bm-topbar-inner">
          <div className="bm-brand">
            <span className="bm-brand-mark">B</span>
            <span className="bm-brand-name">Blockmediary</span>
          </div>

          <nav className="bm-top-nav" aria-label="Dashboard navigation">
            {tabs.map(tab => tabControl(tab))}
          </nav>

          <div className="bm-top-actions">
            <ThemeToggle />
            {account && <DemoAccountSwitcher compact />}
            {account && (
              <button type="button" className="bm-button" onClick={() => { void logout(); }}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="bm-dashboard-main">
        <main className="bm-dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
