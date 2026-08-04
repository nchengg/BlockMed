import { useDeal, paymentStatusLabel, paymentStatusTone } from '@/lib/dealStore';
import { StatusPill } from './ui';

export function DealSummaryBand() {
  const { deal } = useDeal();
  return (
    <div
      className="dashboard-summary-band"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '28px 32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 32,
      }}
    >
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
          {deal.dealId}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.5em', color: 'var(--text-secondary)' }}>{deal.currency}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginLeft: 'auto', alignItems: 'center' }}>
        <Field label="Status">
          <StatusPill label={paymentStatusLabel[deal.paymentStatus]} tone={paymentStatusTone[deal.paymentStatus]} />
        </Field>
        <Field label="Created">
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{deal.createdDate}</span>
        </Field>
        <Field label="Network">
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{deal.network}</span>
        </Field>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-summary-band { padding: 20px 16px !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
