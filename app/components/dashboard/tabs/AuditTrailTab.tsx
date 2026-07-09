import { useDeal } from '@/lib/dealStore';
import { Card, EyebrowLabel } from '../ui';

export function AuditTrailTab() {
  const { deal } = useDeal();
  const entries = [...deal.auditTrail].reverse();

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '24px 24px 4px' }}>
        <EyebrowLabel>AUDIT TRAIL</EyebrowLabel>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          Full chronological record. Read-only — nothing here can be edited or deleted.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr>
              <Th>Timestamp</Th>
              <Th>Event</Th>
              <Th>Actor</Th>
              <Th>Transaction</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i}>
                <Td mono muted>{entry.timestamp}</Td>
                <Td>{entry.event}</Td>
                <Td muted>{entry.actor}</Td>
                <Td mono muted>{entry.txId ?? '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        padding: '12px 24px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, mono, muted }: { children: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return (
    <td
      style={{
        padding: '14px 24px',
        fontSize: 13,
        color: muted ? 'var(--text-secondary)' : 'var(--text-primary)',
        fontFamily: mono ? 'monospace' : undefined,
        borderBottom: '1px solid var(--border)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </td>
  );
}
