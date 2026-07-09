import { useDeal } from '@/lib/dealStore';
import { Card, EyebrowLabel } from './ui';

export function AuditPreview({ onViewAll }: { onViewAll: () => void }) {
  const { deal } = useDeal();
  const recent = [...deal.auditTrail].slice(-4).reverse();

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <EyebrowLabel>RECENT ACTIVITY</EyebrowLabel>
        <button
          onClick={onViewAll}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          View full audit trail →
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        {recent.map((entry, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{entry.event}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{entry.actor}</div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {entry.timestamp}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
