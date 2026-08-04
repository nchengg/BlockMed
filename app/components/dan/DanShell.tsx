'use client';
// Shared chrome for Dan's Dashboard — the 240px rail, mobile top bar, and the
// company switcher. Extracted so /dan and /dan/deals/[dealId] wear the same
// frame instead of duplicating it.
//
// Layout mirrors components/dashboard/DashboardShell + LeftRail (same tokens,
// same 900px breakpoint) so the two surfaces feel like one product.
import Link from 'next/link';
import { useSession } from '@/lib/auth/useSession';

export type DanTab = 'Dashboard' | 'Deals';
export const DAN_TABS: DanTab[] = ['Dashboard', 'Deals'];

export function DanShell({ activeTab, onTabChange, children }: {
  activeTab: DanTab;
  /** Omit on pages that aren't a tab (e.g. a deal page) — tabs then navigate. */
  onTabChange?: (t: DanTab) => void;
  children: React.ReactNode;
}) {
  const { account, logout } = useSession();

  const tabButton = (tab: DanTab, style: React.CSSProperties) => {
    const active = tab === activeTab;
    const inner = (
      <span style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: active ? 600 : 500 }}>
        {tab}
      </span>
    );
    // On a sub-page there is no tab state to set, so the tabs become links home.
    return onTabChange ? (
      <button key={tab} onClick={() => onTabChange(tab)} style={{ ...style, background: active ? 'var(--accent-dim)' : 'transparent' }}>
        {inner}
      </button>
    ) : (
      <Link key={tab} href={tab === 'Deals' ? '/dan?tab=deals' : '/dan'} style={{ ...style, background: active ? 'var(--accent-dim)' : 'transparent', textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    );
  };

  const railTabStyle: React.CSSProperties = {
    textAlign: 'left', border: 'none', borderRadius: 6,
    padding: '9px 12px', fontSize: 14, cursor: 'pointer', width: '100%',
  };
  const barTabStyle: React.CSSProperties = {
    whiteSpace: 'nowrap', border: '1px solid var(--border)', borderRadius: 6,
    padding: '6px 12px', fontSize: 13, cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <aside
        className="dan-rail"
        style={{
          width: 240, flexShrink: 0, background: 'var(--bg-mid)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: '28px 20px', gap: 32, minHeight: '100vh',
        }}
      >
        <div>
          <Link href="/" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', textDecoration: 'none' }}>
            Blockmediary
          </Link>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>
            Dan&apos;s Dashboard
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DAN_TABS.map(t => tabButton(t, railTabStyle))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="section-label" style={{ marginBottom: 10, fontSize: 10 }}>SIGNED IN AS</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {account?.companyName ?? 'Not signed in'}
          </div>
          {account && (
            <>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{account.email}</div>
              <button
                onClick={() => { void logout(); }}
                style={{
                  width: '100%', marginTop: 10, textAlign: 'left', background: 'transparent',
                  color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 6,
                  padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >Sign out</button>
            </>
          )}
          <Link href="/" style={{ display: 'block', marginTop: 14, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Back to site
          </Link>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="dan-topbar"
          style={{ display: 'none', background: 'var(--bg-mid)', borderBottom: '1px solid var(--border)', padding: '14px 16px' }}
        >
          <div>
            <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
              Blockmediary
            </Link>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Dan&apos;s Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
            {DAN_TABS.map(t => tabButton(t, barTabStyle))}
          </div>
        </div>

        <div className="dan-content" style={{ padding: '28px 32px', maxWidth: 1200 }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dan-rail { display: none !important; }
          .dan-topbar { display: block !important; }
          .dan-content { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
