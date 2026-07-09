'use client';
// Developer view — technical lens on the same deal: raw escrow state, the event
// log, and the integration seams that are still open (auth Q18, on-chain wiring,
// webhooks). Reads the shared deal store like every other view.
//
// PRODUCT NOTE: the DEVELOPER party is an instructor-requested addition and is
// NOT in the current BRD/TRD role model (BUYER / SELLER / PLATFORM / ADMIN).
// Flagged for team confirmation before it's treated as a settled role.

import { useDeal } from '@/lib/dealStore';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

// Mirrors the on-chain state enum the escrow contract will expose (see
// contracts/ — NOT touched here). Presentational only.
const CONTRACT_STATES = ['Created', 'Funded', 'DocsSubmitted', 'Checking', 'Released', 'Refunded', 'Cancelled'] as const;

function currentContractState(paymentStatus: string, documentStatus: string): string {
  if (paymentStatus === 'payment_released') return 'Released';
  if (paymentStatus === 'refunded') return 'Refunded';
  if (documentStatus === 'checking' || paymentStatus === 'checking_documents') return 'Checking';
  if (documentStatus === 'received') return 'DocsSubmitted';
  if (paymentStatus === 'funds_locked') return 'Funded';
  return 'Created';
}

export function DeveloperView() {
  const { deal } = useDeal();
  const active = currentContractState(deal.paymentStatus, deal.documentStatus);

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 64px' }}>
      <header style={{ marginBottom: 12 }}>
        <EyebrowLabel>Developer · technical view</EyebrowLabel>
        <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Deal internals
        </h1>
      </header>

      <div
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          border: '1px dashed var(--accent-border)',
          background: 'var(--accent-dim)',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 24,
        }}
      >
        <strong style={{ color: 'var(--accent)' }}>Product note:</strong> the Developer role is a new
        addition (instructor request) and is not yet in the BRD/TRD role model — pending team confirmation.
      </div>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Escrow contract state</EyebrowLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {CONTRACT_STATES.map(s => {
            const on = s === active;
            return (
              <span
                key={s}
                className="mono"
                style={{
                  fontSize: 12,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                  background: on ? 'var(--accent-dim)' : 'transparent',
                  color: on ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: on ? 700 : 500,
                }}
              >
                {s}
              </span>
            );
          })}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
          Derived from demo store state. Read-only mirror of the on-chain enum — no RPC calls in this scaffold.
        </p>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Deal object (shared store)</EyebrowLabel>
        <pre
          className="mono"
          style={{
            marginTop: 8,
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            background: 'var(--bg-deep)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 14,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {JSON.stringify(
            {
              dealId: deal.dealId,
              dealReference: deal.dealReference,
              network: deal.network,
              currency: deal.currency,
              amount: deal.amount,
              paymentStatus: deal.paymentStatus,
              documentStatus: deal.documentStatus,
              buyer: deal.buyer.address,
              seller: deal.seller.address,
              operator: deal.operator.address,
            },
            null,
            2
          )}
        </pre>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <EyebrowLabel>Event log</EyebrowLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {deal.auditTrail.map((e, i) => (
            <div key={i} className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)' }}>{e.timestamp}</span>
              <span style={{ color: 'var(--accent)' }}>[{e.actor}]</span>
              <span>{e.event}</span>
              {e.txId && <span style={{ color: 'var(--text-muted)' }}>{e.txId}</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <EyebrowLabel>Integration seams</EyebrowLabel>
        <ul style={{ marginTop: 8, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: auth Q18)</span> — real auth (SIWE vs JWT vs both; wallet-less platform role). Currently mock login.</li>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: on-chain)</span> — wire escrow reads/writes to the contract in <span className="mono">contracts/</span>. No RPC/wallet here.</li>
          <li><span className="mono" style={{ color: 'var(--text-primary)' }}>TODO(integration: webhooks)</span> — document-verification callbacks + event indexing.</li>
        </ul>
      </Card>
    </main>
  );
}
