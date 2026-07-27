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
// Layout deliberately mirrors DashboardShell/LeftRail (same tokens, 240px rail,
// mobile top bar under 900px) so the two surfaces feel like one product.
//
// Both tabs are intentionally empty for now — the flow gets built in step by step.
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authStore';
import { DealsTab } from '@/components/dan/DealsTab';
import { CompanySignIn } from '@/components/dan/CompanySignIn';

const TABS = ['Dashboard', 'Deals'] as const;
type DanTab = (typeof TABS)[number];

export default function DanDashboard() {
  const [activeTab, setActiveTab] = useState<DanTab>('Dashboard');
  const { account } = useAuth();
  const [switching, setSwitching] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Desktop rail — mirrors components/dashboard/LeftRail.tsx */}
      <aside
        className="dan-rail"
        style={{
          width: 240, flexShrink: 0, background: 'var(--bg-mid)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: '28px 20px', gap: 32, minHeight: '100vh',
        }}
      >
        <div>
          <Link
            href="/"
            style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', textDecoration: 'none' }}
          >
            Blockmediary
          </Link>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>
            Dan&apos;s Dashboard
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(tab => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  textAlign: 'left', background: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)', border: 'none', borderRadius: 6,
                  padding: '9px 12px', fontSize: 14, fontWeight: active ? 600 : 500, cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Who you are acting as. Switching company is the whole point of this
            surface: be the seller in one window, the buyer in another. */}
        <div style={{ marginTop: 'auto' }}>
          <div className="section-label" style={{ marginBottom: 10, fontSize: 10 }}>SIGNED IN AS</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            {account?.displayName ?? 'Not signed in'}
          </div>

          {switching ? (
            <CompanySignIn variant="compact" />
          ) : (
            <button
              onClick={() => setSwitching(true)}
              style={{
                width: '100%', textAlign: 'left', background: 'transparent',
                color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 6,
                padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {account ? 'Switch company' : 'Sign in'}
            </button>
          )}

          <Link
            href="/"
            style={{ display: 'block', marginTop: 14, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Back to site
          </Link>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile top bar — mirrors LeftRail's MobileTopBar */}
        <div
          className="dan-topbar"
          style={{ display: 'none', background: 'var(--bg-mid)', borderBottom: '1px solid var(--border)', padding: '14px 16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
                Blockmediary
              </Link>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Dan&apos;s Dashboard</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
            {TABS.map(tab => {
              const active = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    whiteSpace: 'nowrap', background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6,
                    padding: '6px 12px', fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="dan-content" style={{ padding: '28px 32px', maxWidth: 1200 }}>
          {!account ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Sign in as a company
              </div>
              <p style={{ margin: '10px 0 22px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 560 }}>
                Deals are addressed between companies. Pick one to act as — you choose which
                side you are on when you create each deal.
              </p>
              <CompanySignIn />
            </>
          ) : (
            <>
              {activeTab === 'Dashboard' && <EmptyTab title="Dashboard" />}
              {activeTab === 'Deals' && <DealsTab />}
            </>
          )}
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

// Placeholder shown by both tabs until the flow is built in.
function EmptyTab({ title }: { title: string }) {
  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {title}
      </div>
      <div
        style={{
          marginTop: 20, border: '1px dashed var(--border)', borderRadius: 10,
          padding: '48px 32px', textAlign: 'center', background: 'var(--bg-surface)',
        }}
      >
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Nothing here yet.</p>
      </div>
    </>
  );
}
