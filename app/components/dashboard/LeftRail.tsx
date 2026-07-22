'use client';
import Link from 'next/link';
import { hatLabel, type ClientHat } from '@/lib/authStore';
import { DealSwitcher } from './DealSwitcher';

const tabs = ['Overview', 'Documents', 'Escrow', 'Audit trail', 'Settings'] as const;
export type DashboardTab = (typeof tabs)[number];

// Short labels for the context switcher (full labels are in hatLabel).
const shortHat: Record<ClientHat, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  platform: 'Platform',
};

type RailProps = {
  accountName: string;
  dealId: string;
  hats: ClientHat[];
  activeHat: ClientHat;
  onHatChange: (h: ClientHat) => void;
  activeTab: DashboardTab;
  onTabChange: (t: DashboardTab) => void;
};

export function LeftRail({ accountName, dealId, hats, activeHat, onHatChange, activeTab, onTabChange }: RailProps) {
  // Only a client account holding >1 hat may switch context (dual-hat). A single
  // hat is shown locked — per-account isolation, no cross-party view.
  const canSwitch = hats.length > 1;

  return (
    <aside
      className="dashboard-rail"
      style={{
        width: 240, flexShrink: 0, background: 'var(--bg-mid)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '28px 20px', gap: 32, minHeight: '100vh',
      }}
    >
      <div>
        <Link href="/" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', textDecoration: 'none' }}>
          Blockmediary
        </Link>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>{accountName}</div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{dealId}</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tabs.map(tab => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
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

      {/* Isolation-scoped deal list — only this account's deals. */}
      <DealSwitcher />

      <div style={{ marginTop: 'auto' }}>
        <div className="section-label" style={{ marginBottom: 10, fontSize: 10 }}>
          {canSwitch ? 'YOUR CONTEXT' : 'SIGNED IN AS'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {hats.map(h => {
            const active = h === activeHat;
            return (
              <button
                key={h}
                onClick={() => canSwitch && onHatChange(h)}
                disabled={!canSwitch}
                title={canSwitch ? `Switch to ${hatLabel[h]}` : hatLabel[h]}
                style={{
                  textAlign: 'left', background: active ? 'var(--bg-surface)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6,
                  padding: '8px 12px', fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: canSwitch ? 'pointer' : 'default',
                }}
              >
                {shortHat[h]}
              </button>
            );
          })}
        </div>
        {canSwitch && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
            This account acts as both — switch hats any time.
          </p>
        )}
      </div>
    </aside>
  );
}

export function MobileTopBar({ accountName, dealId, hats, activeHat, onHatChange, activeTab, onTabChange }: RailProps) {
  const canSwitch = hats.length > 1;
  return (
    <div
      className="dashboard-topbar"
      style={{ display: 'none', background: 'var(--bg-mid)', borderBottom: '1px solid var(--border)', padding: '14px 16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>Blockmediary</Link>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{accountName}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{dealId}</div>
        </div>
        {canSwitch ? (
          <select
            value={activeHat}
            onChange={e => onHatChange(e.target.value as ClientHat)}
            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}
          >
            {hats.map(h => <option key={h} value={h}>{shortHat[h]}</option>)}
          </select>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px' }}>
            {shortHat[activeHat]}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
        {tabs.map(tab => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
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

      {/* Isolation-scoped deal list — only this account's deals (compact). */}
      <div style={{ marginTop: 12 }}>
        <DealSwitcher compact />
      </div>
    </div>
  );
}

export { tabs };
