'use client';
// Admin (operator-side) portal. A distinct view from the client flows: it looks
// ACROSS the deal — parties, escrow/document state, and operator actions — rather
// than walking one party through their steps. Reads the same shared stores the
// client views use (lib/dealStore.tsx), so it's the same system through an
// operator lens.

import Link from 'next/link';
import { useDeal, paymentStatusLabel, paymentStatusTone, documentStatusLabel } from '@/lib/dealStore';
import { Card, StatusPill, AddressChip, EyebrowLabel } from '@/components/dashboard/ui';

export function AdminPortal() {
  const { deal, resetDemo } = useDeal();

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 64px' }}>
      <header style={{ marginBottom: 28 }}>
        <EyebrowLabel>Admin · operator console</EyebrowLabel>
        <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Deal oversight
        </h1>
        <p className="scene-subline" style={{ marginTop: 6 }}>
          Operator-only view of every party and every deal. Client parties never see this screen.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card>
          <EyebrowLabel>Escrow state</EyebrowLabel>
          <StatusPill label={paymentStatusLabel[deal.paymentStatus]} tone={paymentStatusTone[deal.paymentStatus]} />
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700 }}>
            {deal.currency} {deal.amount.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{deal.network}</div>
        </Card>
        <Card>
          <EyebrowLabel>Document check</EyebrowLabel>
          <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>
            {documentStatusLabel[deal.documentStatus]}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            Required: {deal.requiredDocument}
          </div>
          {deal.discrepancyReason && (
            <div style={{ fontSize: 13, color: 'var(--error)', marginTop: 8 }}>{deal.discrepancyReason}</div>
          )}
        </Card>
        <Card>
          <EyebrowLabel>Deal</EyebrowLabel>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-primary)' }}>{deal.dealId}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Ref {deal.dealReference}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Created {deal.createdDate}</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <EyebrowLabel>Parties</EyebrowLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {[
            { role: 'Buyer', party: deal.buyer },
            { role: 'Seller', party: deal.seller },
            { role: 'Platform / operator', party: deal.operator },
          ].map(row => (
            <div key={row.role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{row.role}</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{row.party.businessName}</div>
              </div>
              <AddressChip value={row.party.address} />
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <EyebrowLabel>Operator actions</EyebrowLabel>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 14 }}>
          Force-release / refund / cancel are operator-only. Wired to the escrow contract in a later pass.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Force release', 'Refund buyer', 'Cancel deal'].map(a => (
            <button
              key={a}
              type="button"
              disabled
              title="TODO(integration): wire to escrow contract — no on-chain calls in this scaffold"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '9px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'not-allowed',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          href="/dashboard"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
        >
          Open full deal dashboard →
        </Link>
        <button
          type="button"
          onClick={resetDemo}
          style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          Reset demo deal
        </button>
      </div>
    </main>
  );
}
