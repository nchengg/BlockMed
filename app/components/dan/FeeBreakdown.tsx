'use client';
// The fee breakdown, shown twice: before a buyer accepts terms, and again
// before they sign the funding transaction. Nobody should discover what they
// are paying only when MetaMask opens.
//
// The line that matters most is the last one — the seller receives the full
// escrow amount. Fees are the buyer's, added on top, and are never taken out of
// the seller's proceeds (lib/pricing/quote.ts).
import type { FeeQuote } from '@/lib/pricing/quote';

export function FeeBreakdown({ quote, treasuryIsPlaceholder, compact }: {
  quote: FeeQuote;
  /** True while fees route to a personal wallet rather than a company treasury. */
  treasuryIsPlaceholder?: boolean | null;
  compact?: boolean;
}) {
  const row = (label: string, value: string, opts: { strong?: boolean; muted?: boolean } = {}) => (
    <div
      key={label}
      style={{
        display: 'flex', justifyContent: 'space-between', gap: 16,
        padding: compact ? '4px 0' : '6px 0',
        fontSize: compact ? 12 : 13,
        color: opts.muted ? 'var(--text-muted)' : 'var(--text-secondary)',
        fontWeight: opts.strong ? 600 : 400,
      }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: 'monospace', color: opts.strong ? 'var(--text-primary)' : undefined }}>
        {value} USDC
      </span>
    </div>
  );

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 8,
      padding: compact ? '12px 14px' : '16px 18px', background: 'var(--bg-surface)',
    }}>
      <div className="section-label" style={{ fontSize: 10, marginBottom: 10 }}>
        WHAT THE BUYER PAYS
      </div>

      {quote.lines.map(l => row(l.label, l.amountUsdc, { muted: l.code === 'tax' && l.amountUsdc === '0.00' }))}

      <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
        {row('Total', quote.totalCustomerPaysUsdc, { strong: true })}
      </div>

      {/* The invariant, stated to the user rather than only enforced in code. */}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: '10px 0 0' }}>
        The seller receives <strong style={{ color: 'var(--accent)' }}>{quote.sellerReceivesUsdc} USDC</strong> in
        full — platform fees are added for the buyer, never deducted from the seller&apos;s proceeds.
        Network gas is paid separately by your wallet and is not a platform charge.
      </p>

      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '8px 0 0' }}>
        Price book {quote.pricingVersion} · quoted {new Date(quote.quotedAt).toLocaleDateString()} ·
        {' '}valid until {new Date(quote.quoteExpiresAt).toLocaleDateString()}
        {quote.taxStatus === 'not_assessed' && ' · tax not yet assessed'}
      </p>

      {treasuryIsPlaceholder && (
        <p style={{
          fontSize: 11, color: 'var(--accent)', lineHeight: 1.5,
          margin: '10px 0 0', paddingTop: 8, borderTop: '1px solid var(--border)',
        }}>
          Demo: fees route to a placeholder wallet, not a company treasury.
        </p>
      )}
    </div>
  );
}
