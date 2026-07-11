'use client';
// ADMIN — the Blockmediary STAFF operator console. This is the OPERATIONAL
// AUTHORITY view: oversight of live deals plus the business verdicts staff are
// empowered to make (release / reject / escalate / compliance). It is
// deliberately CURATED — no raw state, no low-level toggles, no debug tooling.
// That fuller "every button" surface is the Developer console (/dev).
//
// The verdict actions drive the shared deal state (lib/dealStore.tsx). On-chain
// settlement (release/refund on the escrow contract) is a seam:
// TODO(integration: on-chain) — no Solidity is touched here.

import {
  useDeal, paymentStatusLabel, paymentStatusTone, documentStatusLabel,
} from '@/lib/dealStore';
import { Card, StatusPill, AddressChip, EyebrowLabel } from '@/components/dashboard/ui';

export function AdminPortal() {
  const { deal, resolveVerification } = useDeal();

  const settled = deal.paymentStatus === 'payment_released' || deal.paymentStatus === 'refunded';
  // Verdicts are only meaningful once documents are in and before settlement.
  const awaitingVerdict = !settled && ['received', 'checking', 'failed', 'manual_review'].includes(deal.documentStatus);

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 64px' }}>
      <header style={{ marginBottom: 8 }}>
        <EyebrowLabel>Admin · staff operator console</EyebrowLabel>
        <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Deal oversight
        </h1>
        <p className="scene-subline" style={{ marginTop: 6 }}>
          Operational authority for Blockmediary staff. Curated to live business actions — not a debug console.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, margin: '24px 0' }}>
        <Card>
          <EyebrowLabel>Escrow state</EyebrowLabel>
          <StatusPill label={paymentStatusLabel[deal.paymentStatus]} tone={paymentStatusTone[deal.paymentStatus]} />
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700 }}>{deal.currency} {deal.amount.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{deal.network}</div>
        </Card>
        <Card>
          <EyebrowLabel>Document check</EyebrowLabel>
          <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>{documentStatusLabel[deal.documentStatus]}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Required: {deal.requiredDocument}</div>
          {deal.discrepancyReason && <div style={{ fontSize: 13, color: 'var(--error)', marginTop: 8 }}>{deal.discrepancyReason}</div>}
        </Card>
        <Card>
          <EyebrowLabel>Deal</EyebrowLabel>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-primary)' }}>{deal.dealId}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Ref {deal.dealReference}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Created {deal.createdDate}</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
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

      {/* Operator verdicts — the authority. Live business decisions, not debug. */}
      <Card style={{ marginBottom: 16 }}>
        <EyebrowLabel>Operator verdict</EyebrowLabel>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 14 }}>
          {settled
            ? 'This deal is settled. No further verdict is required.'
            : awaitingVerdict
              ? 'Documents are in. Record the business decision — this updates the deal for all parties.'
              : 'Waiting on the seller to submit documents before a verdict can be made.'}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <VerdictButton
            label="Approve & release"
            tone="success"
            disabled={!awaitingVerdict}
            onClick={() => resolveVerification('verified')}
          />
          <VerdictButton
            label="Reject — flag discrepancy"
            tone="error"
            disabled={!awaitingVerdict}
            onClick={() => resolveVerification('failed', 'Rejected by operator — documents do not match deal terms.')}
          />
          <VerdictButton
            label="Escalate to compliance review"
            tone="neutral"
            disabled={!awaitingVerdict}
            onClick={() => resolveVerification('manual_review')}
          />
        </div>
      </Card>

      {/* Higher-authority settlement actions that require the escrow contract —
          shown as scoped staff powers, wired later. */}
      <Card style={{ marginBottom: 16 }}>
        <EyebrowLabel>Settlement (contract)</EyebrowLabel>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 14 }}>
          Force-refund and cancel are staff powers that settle on-chain. Wired to the escrow contract in a later pass.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Refund buyer', 'Cancel deal'].map(a => (
            <button
              key={a}
              type="button"
              disabled
              title="TODO(integration: on-chain) — settles via the escrow contract; not wired in this scaffold"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'not-allowed' }}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <EyebrowLabel>Compliance review</EyebrowLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {[
            { item: 'KYC — buyer', state: 'Cleared' },
            { item: 'KYC — seller', state: 'Cleared' },
            { item: 'Sanctions screening', state: 'Cleared' },
            { item: 'Document authenticity', state: deal.documentStatus === 'verified' ? 'Cleared' : 'Pending' },
          ].map(row => (
            <div key={row.item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{row.item}</span>
              <span style={{ color: row.state === 'Cleared' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>{row.state}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Read-only summary for staff. Full KYC/sanctions tooling is out of scope for this scaffold.
        </p>
      </Card>
    </main>
  );
}

function VerdictButton({
  label, tone, disabled, onClick,
}: {
  label: string;
  tone: 'success' | 'error' | 'neutral';
  disabled: boolean;
  onClick: () => void;
}) {
  const color = tone === 'success' ? 'var(--success)' : tone === 'error' ? 'var(--error)' : 'var(--text-secondary)';
  const border = tone === 'success' ? 'var(--success-border)' : tone === 'error' ? 'var(--error-border)' : 'var(--border)';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'var(--bg-card)' : 'transparent',
        color: disabled ? 'var(--text-muted)' : color,
        border: `1px solid ${disabled ? 'var(--border)' : border}`,
        borderRadius: 6, padding: '9px 14px', fontSize: 13, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}
