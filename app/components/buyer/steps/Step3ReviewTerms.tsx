import { useDeal } from '@/lib/dealStore';
import { AddressChip, Card, EyebrowLabel } from '@/components/dashboard/ui';

const releaseChecks = [
  'Invoice total matches escrow amount',
  'Seller details match',
  'Deal reference matches',
];

export function Step3ReviewTerms({ amount, onContinue }: { amount: number; onContinue: () => void }) {
  const { deal } = useDeal();
  return (
    <div>
      <EyebrowLabel>BUYER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        Review when payment will release.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        Funds release only when the uploaded invoice matches the deal terms below.
      </p>

      <Card>
        <Row label="Amount">
          <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
          </span>
        </Row>
        <Row label="Seller payment address">
          <AddressChip value={deal.seller.address} />
        </Row>
        <Row label="Required document">
          <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{deal.requiredDocument}</span>
        </Row>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
            Release checks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {releaseChecks.map(check => (
              <div key={check} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{check}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onContinue}
          style={{
            width: '100%',
            marginTop: 24,
            padding: '14px 20px',
            borderRadius: 8,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            background: 'var(--accent)',
            color: '#0A0A0B',
          }}
        >
          I understand — continue
        </button>
      </Card>
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
