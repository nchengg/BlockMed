import type { Role } from '@/data/dashboardDemo';
import { Card, EyebrowLabel } from '../ui';
import { EscrowStateVisual } from '../EscrowStateVisual';
import { ProgressChecklist } from '../ProgressChecklist';
import { AuditPreview } from '../AuditPreview';
import { ParticipantsPanel } from '../ParticipantsPanel';
import { RoleActionsPanel } from '../RoleActionsPanel';

export function OverviewTab({ role, onViewAuditTrail }: { role: Role; onViewAuditTrail: () => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20 }} className="dashboard-overview-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <EyebrowLabel>ESCROW STATE</EyebrowLabel>
          <EscrowStateVisual />
        </Card>
        <ProgressChecklist />
        <AuditPreview onViewAll={onViewAuditTrail} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ParticipantsPanel role={role} />
        <RoleActionsPanel role={role} />
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-overview-grid {
            grid-template-columns: 2fr 1fr !important;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
