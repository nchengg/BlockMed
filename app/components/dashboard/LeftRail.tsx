'use client';
import Link from 'next/link';
import type { Role } from '@/data/dashboardDemo';

const roleLabels: Record<Role, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  operator: 'Blockmediary',
};

const roleOptions: Role[] = ['buyer', 'seller', 'operator'];

const tabs = ['Overview', 'Documents', 'Audit trail', 'Settings'] as const;
export type DashboardTab = (typeof tabs)[number];

export function LeftRail({
  dealId,
  role,
  onRoleChange,
  activeTab,
  onTabChange,
}: {
  dealId: string;
  role: Role;
  onRoleChange: (r: Role) => void;
  activeTab: DashboardTab;
  onTabChange: (t: DashboardTab) => void;
}) {
  return (
    <aside
      className="dashboard-rail"
      style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--bg-mid)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 20px',
        gap: 32,
        minHeight: '100vh',
      }}
    >
      <div>
        <Link href="/" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', textDecoration: 'none' }}>
          Blockmediary
        </Link>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          {dealId}
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tabs.map(tab => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                textAlign: 'left',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 6,
                padding: '9px 12px',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div className="section-label" style={{ marginBottom: 10, fontSize: 10 }}>
          DEMO ROLE VIEW
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roleOptions.map(r => {
            const active = r === role;
            return (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                style={{
                  textAlign: 'left',
                  background: active ? 'var(--bg-surface)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                {roleLabels[r]}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar({
  dealId,
  role,
  onRoleChange,
  activeTab,
  onTabChange,
}: {
  dealId: string;
  role: Role;
  onRoleChange: (r: Role) => void;
  activeTab: DashboardTab;
  onTabChange: (t: DashboardTab) => void;
}) {
  return (
    <div
      className="dashboard-topbar"
      style={{
        display: 'none',
        background: 'var(--bg-mid)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>Blockmediary</Link>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{dealId}</div>
        </div>
        <select
          value={role}
          onChange={e => onRoleChange(e.target.value as Role)}
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 13,
          }}
        >
          {roleOptions.map(r => (
            <option key={r} value={r}>{roleLabels[r]}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
        {tabs.map(tab => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                whiteSpace: 'nowrap',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { tabs };
