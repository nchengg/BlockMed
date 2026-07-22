'use client';
import { useEffect, useState } from 'react';
import { useDeal } from '@/lib/dealStore';
import { AddressChip, Card, EyebrowLabel, StatusPill } from '@/components/dashboard/ui';

export function Step1FundsLocked({ onContinue }: { onContinue: () => void }) {
  const { deal, hydrated } = useDeal();
  const alreadyLocked = deal.paymentStatus !== 'awaiting_deposit';
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Brief "detecting" beat before showing the real state, even when the
    // deposit already happened — mirrors how an on-chain read would feel.
    const t = setTimeout(() => setChecking(false), 900);
    return () => clearTimeout(t);
  }, []);

  const detected = hydrated && !checking && alreadyLocked;
  const waiting = hydrated && !checking && !alreadyLocked;

  return (
    <div>
      <EyebrowLabel>SELLER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        ${deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC is locked and waiting for you.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        The buyer has funded escrow. The funds cannot release until the required document matches the deal terms.
      </p>

      <Card>
        <div style={{ textAlign: 'center', padding: '8px 0 24px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
            <span style={{ fontSize: '0.5em', color: 'var(--text-secondary)' }}>{deal.currency}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            {detected ? (
              <StatusPill label="Locked" tone="accent" />
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pending)', animation: 'seller-pulse 1s ease-in-out infinite' }} />
                Waiting for buyer to deposit…
              </span>
            )}
          </div>
        </div>

        <Row label="Buyer payment address">
          <AddressChip value={deal.buyer.address} />
        </Row>
        <Row label="Deal ID">
          <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-primary)' }}>{deal.dealId}</span>
        </Row>
        <Row label="Required document">
          <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{deal.requiredDocument} for this MVP</span>
        </Row>

        <button
          onClick={() => detected && onContinue()}
          disabled={!detected}
          style={{
            width: '100%',
            marginTop: 24,
            padding: '14px 20px',
            borderRadius: 8,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: detected ? 'pointer' : 'not-allowed',
            background: detected ? 'var(--accent)' : 'var(--bg-mid)',
            color: detected ? '#0A0A0B' : 'var(--text-muted)',
            opacity: detected ? 1 : 0.7,
            transition: 'opacity 0.3s',
          }}
        >
          Continue to upload
        </button>

        {waiting && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
            No deposit yet — the buyer needs to complete their flow first.
          </p>
        )}
      </Card>

      <style>{`@keyframes seller-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  );
}
