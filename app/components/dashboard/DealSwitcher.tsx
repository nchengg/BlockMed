'use client';
// Isolation-aware deal picker. Lists ONLY the deals the current viewer is allowed
// to see (lib/dealStore → visibleDeals) and lets them choose which one is active.
// Shared by the client dashboard, the admin console and the developer view so the
// per-account scoping is visible everywhere. Renders nothing when the viewer has
// a single deal (nothing to switch), and an empty-state hint when they have none.

import { useDeal, paymentStatusLabel } from '@/lib/dealStore';
import { EyebrowLabel } from './ui';

export function DealSwitcher({ compact = false }: { compact?: boolean }) {
  const { visibleDeals, activeDealId, selectDeal } = useDeal();

  if (visibleDeals.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        No deals scoped to this account yet.
      </div>
    );
  }

  return (
    <div>
      {!compact && (
        <EyebrowLabel>Your deals ({visibleDeals.length})</EyebrowLabel>
      )}
      <div
        style={{
          display: 'flex', flexDirection: compact ? 'row' : 'column', gap: 6,
          marginTop: compact ? 0 : 8, flexWrap: 'wrap',
        }}
      >
        {visibleDeals.map(d => {
          const active = d.dealId === activeDealId;
          return (
            <button
              key={d.dealId}
              type="button"
              onClick={() => selectDeal(d.dealId)}
              title={`${d.dealReference} · ${paymentStatusLabel[d.paymentStatus]}`}
              style={{
                textAlign: 'left', cursor: 'pointer', borderRadius: 8,
                background: active ? 'var(--accent-dim)' : 'transparent',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                padding: compact ? '6px 10px' : '10px 12px',
                display: 'flex', flexDirection: 'column', gap: 3, minWidth: compact ? 0 : undefined,
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--accent)' : 'var(--text-primary)' }}
              >
                {d.dealReference}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {d.currency} {d.amount.toLocaleString()} · {paymentStatusLabel[d.paymentStatus]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
