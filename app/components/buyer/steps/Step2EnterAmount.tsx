'use client';
import { useState } from 'react';
import { buyerDemo } from '@/data/buyerDemo';
import { useDeal } from '@/lib/dealStore';
import { AddressChip, Card, EyebrowLabel } from '@/components/dashboard/ui';

export function Step2EnterAmount({ initialAmount, onContinue }: { initialAmount: string; onContinue: (amount: number) => void }) {
  const { deal } = useDeal();
  const [raw, setRaw] = useState(initialAmount);

  const amount = parseFloat(raw);
  const isEmpty = raw.trim() === '';
  const isValid = !isEmpty && !Number.isNaN(amount) && amount > 0 && amount <= buyerDemo.buyerBalance;
  const exceedsBalance = !isEmpty && !Number.isNaN(amount) && amount > buyerDemo.buyerBalance;

  return (
    <div>
      <EyebrowLabel>BUYER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        How much do you want to lock?
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        Enter the exact invoice amount in USDC digital dollars.
      </p>

      <Card>
        <div style={{ textAlign: 'center', padding: '12px 0 24px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, maxWidth: '100%' }}>
            <input
              value={raw}
              onChange={e => {
                const v = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(v)) setRaw(v);
              }}
              placeholder={deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              inputMode="decimal"
              autoFocus
              style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(28px, 8vw, 52px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                textAlign: 'right',
                width: 'min(260px, 62vw)',
                minWidth: 0,
                caretColor: 'var(--accent)',
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>USDC</span>
          </div>
          {exceedsBalance && (
            <div style={{ fontSize: 13, color: 'var(--error)', marginTop: 12 }}>Insufficient USDC balance</div>
          )}
        </div>

        <Row label="Seller payment address">
          <AddressChip value={deal.seller.address} />
        </Row>
        <Row label="Your USDC balance">
          <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-primary)' }}>
            {buyerDemo.buyerBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
          </span>
        </Row>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          Seller details come from the invite or deal link.
        </p>

        <button
          onClick={() => isValid && onContinue(amount)}
          disabled={!isValid}
          style={{
            width: '100%',
            marginTop: 24,
            padding: '14px 20px',
            borderRadius: 8,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed',
            background: isValid ? 'var(--accent)' : 'var(--bg-mid)',
            color: isValid ? '#0A0A0B' : 'var(--text-muted)',
            transition: 'opacity 0.2s',
            opacity: isValid ? 1 : 0.7,
          }}
        >
          Continue
        </button>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  );
}
