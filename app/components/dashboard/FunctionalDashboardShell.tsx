'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForms } from '@/components/dan/AuthForms';
import { DashboardTab } from '@/components/dan/DashboardTab';
import { DemoAccountSwitcher } from '@/components/dan/DemoAccountSwitcher';
import { DealsTab } from '@/components/dan/DealsTab';
import { KybForm } from '@/components/dan/KybForm';
import { useSession } from '@/lib/auth/useSession';
import { ThemeToggle } from './ThemeToggle';

export type FunctionalDashboardTab = 'Dashboard' | 'Deals' | 'Company';

const tabs: FunctionalDashboardTab[] = ['Dashboard', 'Deals', 'Company'];

function tabFromSearch(value: string | null): FunctionalDashboardTab {
  if (value === 'deals') return 'Deals';
  if (value === 'company') return 'Company';
  return 'Dashboard';
}

export function FunctionalDashboardShell() {
  const search = useSearchParams();
  const router = useRouter();
  const activeTab = tabFromSearch(search.get('tab'));
  const { account, ready } = useSession();

  const changeTab = (tab: FunctionalDashboardTab) => {
    const href = tab === 'Deals' ? '/dashboard?tab=deals' : tab === 'Company' ? '/dashboard?tab=company' : '/dashboard';
    router.push(href, { scroll: false });
  };

  return (
    <FunctionalDashboardFrame activeTab={activeTab} onTabChange={changeTab}>
      {!ready ? (
        <DashboardLoadingState />
      ) : !account ? (
        <AuthForms />
      ) : activeTab === 'Dashboard' ? (
        <DashboardTab onOpenDeals={() => changeTab('Deals')} />
      ) : activeTab === 'Company' ? (
        <KybForm />
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
    const shared = { className, 'data-active': active, 'aria-current': active ? 'page' as const : undefined };

    if (onTabChange) {
      return (
        <button key={tab} type="button" onClick={() => onTabChange(tab)} {...shared}>
          {tab}
        </button>
      );
    }

    return (
      <Link
        key={tab}
        href={tab === 'Deals' ? '/dashboard?tab=deals' : tab === 'Company' ? '/dashboard?tab=company' : '/dashboard'}
        {...shared}
      >
        {tab}
      </Link>
    );
  };

  return (
    <div className="bm-dashboard-root bm-dashboard-root-top">
      <header className="bm-topbar">
        <div className="bm-topbar-inner">
          <Link href="/" className="bm-brand" aria-label="Blockmediary home">
            <span className="bm-brand-mark">B</span>
            <span className="bm-brand-name">Blockmediary</span>
          </Link>

          {account ? (
            <nav className="bm-top-nav" aria-label="Dashboard navigation">
              {tabs.map(tab => tabControl(tab))}
            </nav>
          ) : <div className="bm-top-nav" />}

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

export function DashboardLoadingState() {
  return (
    <div className="bm-loading-state" role="status" aria-live="polite" aria-label="Loading dashboard">
      <div className="bm-loading-heading bm-skeleton" />
      <div className="bm-loading-copy bm-skeleton" />
      <div className="bm-grid-stats bm-loading-grid">
        {[0, 1, 2, 3].map(item => <div key={item} className="bm-card bm-loading-card bm-skeleton" />)}
      </div>
      <span className="bm-visually-hidden">Loading dashboard</span>
    </div>
  );
}
