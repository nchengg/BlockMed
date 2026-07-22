import type { Role } from '@/data/dashboardDemo';
import { useDeal } from '@/lib/dealStore';
import { AddressChip, Card, EyebrowLabel } from './ui';

export function ParticipantsPanel({ role }: { role: Role }) {
  const { deal } = useDeal();

  const rows = [
    { key: 'buyer' as const, roleLabel: 'Buyer', ...deal.buyer },
    { key: 'seller' as const, roleLabel: 'Seller', ...deal.seller },
    { key: 'operator' as const, roleLabel: 'Blockmediary / Escrow Operator', ...deal.operator },
  ];

  return (
    <Card>
      <EyebrowLabel>PARTICIPANTS</EyebrowLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {rows.map(row => (
          <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{row.roleLabel}</span>
                {row.key === role && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 9999, padding: '1px 6px' }}>
                    YOU
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{row.businessName}</div>
            </div>
            <AddressChip value={row.address} />
          </div>
        ))}
      </div>
    </Card>
  );
}
