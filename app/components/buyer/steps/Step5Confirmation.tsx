'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDeal } from '@/lib/dealStore';
import { AddressChip, Card, EyebrowLabel } from '@/components/dashboard/ui';

export function Step5Confirmation({ amount, timestamp }: { amount: number; timestamp: string }) {
  const { deal } = useDeal();
  const [drawn, setDrawn] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const t1 = requestAnimationFrame(() => setDrawn(true));
    const t2 = setTimeout(() => setContentVisible(true), 650);
    return () => { cancelAnimationFrame(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="34" stroke="var(--accent)" strokeWidth="2" opacity="0.3" />
          <polyline
            points="22,37 32,47 50,26"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 48,
              strokeDashoffset: drawn ? 0 : 48,
              transition: 'stroke-dashoffset 0.6s ease-out',
            }}
          />
        </svg>
      </div>

      <div style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' }}>
        <EyebrowLabel>BUYER</EyebrowLabel>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Funds are locked.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC is now held in escrow. The seller can see the funded deal and ship with confidence.
        </p>

        <Card style={{ textAlign: 'left' }}>
          <Row label="Deal ID"><span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-primary)' }}>{deal.dealId}</span></Row>
          <Row label="Amount"><span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-primary)' }}>{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span></Row>
          <Row label="Seller payment address"><AddressChip value={deal.seller.address} /></Row>
          <Row label="Timestamp"><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{timestamp}</span></Row>
          <Row label="Visibility"><span style={{ fontSize: 13, color: 'var(--success)' }}>Seller can view this deal</span></Row>

          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{ display: 'inline-block', marginTop: 16, fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}
          >
            View transaction ↗
          </a>
        </Card>

        <Link
          href={`/dashboard?deal=${deal.dealId}`}
          style={{
            display: 'inline-block',
            marginTop: 24,
            width: '100%',
            padding: '14px 20px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#0A0A0B',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          Go to dashboard
        </Link>
      </div>
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
