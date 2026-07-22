import { demoSettings } from '@/data/dashboardDemo';
import { useDeal } from '@/lib/dealStore';
import { AddressChip, Card, EyebrowLabel } from '../ui';

export function SettingsTab() {
  const { deal } = useDeal();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <EyebrowLabel>DEAL TERMS</EyebrowLabel>
        <Row label="Amount">
          <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {deal.currency}
          </span>
        </Row>
        <Row label="Required document">{deal.requiredDocument}</Row>
        <Row label="Network">{deal.network}</Row>
      </Card>

      <Card>
        <EyebrowLabel>RELEASE RULES</EyebrowLabel>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{demoSettings.releaseRule}</p>
        <div style={{ marginTop: 16 }}>
          <Row label="Dispute window">{demoSettings.disputeWindow}</Row>
        </div>
      </Card>

      <Card>
        <EyebrowLabel>PAYMENT DETAILS</EyebrowLabel>
        <Row label="Buyer payment address"><AddressChip value={deal.buyer.address} /></Row>
        <Row label="Seller payment address"><AddressChip value={deal.seller.address} /></Row>
      </Card>

      <Card>
        <EyebrowLabel>VISIBILITY</EyebrowLabel>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{demoSettings.visibility}</p>
      </Card>

      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        All fields on this page are read-only in the current build.
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13 }}>{children}</span>
    </div>
  );
}
