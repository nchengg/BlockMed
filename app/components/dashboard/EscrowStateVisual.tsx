import { useDeal, paymentStatusLabel } from '@/lib/dealStore';

// BUYER — ESCROW — SELLER, 3-node diagram. Left segment (buyer→escrow) is lit
// once funds are locked; right segment (escrow→seller) lights only on release.
export function EscrowStateVisual() {
  const { deal } = useDeal();
  const leftLit = deal.paymentStatus !== 'awaiting_deposit';
  const rightLit = deal.paymentStatus === 'payment_released';

  let centerLabel = paymentStatusLabel[deal.paymentStatus];
  if (deal.documentStatus === 'failed') centerLabel = 'Discrepancy flagged';
  if (deal.documentStatus === 'manual_review') centerLabel = 'Under manual review';

  return (
    // overflow-x acts as a safety net on very narrow screens — the row keeps
    // its natural size and scrolls instead of clipping or overlapping.
    <div style={{ overflowX: 'auto', padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '8px 0', minWidth: 280 }}>
        <Node label="BUYER" sub={deal.buyer.businessName} />
        <Segment lit={leftLit} />
        <Node label="ESCROW" sub={centerLabel} center />
        <Segment lit={rightLit} />
        <Node label="SELLER" sub={deal.seller.businessName} />
      </div>
    </div>
  );
}

function Node({ label, sub, center }: { label: string; sub: string; center?: boolean }) {
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div
        style={{
          width: center ? 72 : 56,
          height: center ? 72 : 56,
          borderRadius: '50%',
          background: center ? 'var(--accent-dim)' : 'var(--bg-mid)',
          border: `1px solid ${center ? 'var(--accent)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          boxShadow: center ? '0 0 24px var(--accent-glow)' : 'none',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: center ? 'var(--accent)' : 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, maxWidth: 96 }}>{sub}</div>
    </div>
  );
}

function Segment({ lit }: { lit: boolean }) {
  return (
    <div style={{ flex: 1, height: 2, background: 'var(--border)', position: 'relative', minWidth: 24 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--accent)',
          transform: `scaleX(${lit ? 1 : 0})`,
          transformOrigin: 'left center',
          transition: 'transform 0.6s ease',
        }}
      />
    </div>
  );
}
