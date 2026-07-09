import Link from 'next/link';
import type { Role } from '@/data/dashboardDemo';
import { useDeal } from '@/lib/dealStore';
import { Card, EyebrowLabel } from './ui';

type Action = { label: string; variant: 'filled' | 'outlined'; helper?: string; href?: string };

export function RoleActionsPanel({ role }: { role: Role }) {
  const { deal } = useDeal();
  const { title, actions } = buildActions(role, deal.paymentStatus, deal.documentStatus);

  if (actions.length === 0) {
    return (
      <Card>
        <EyebrowLabel>{title}</EyebrowLabel>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No actions available right now.</p>
      </Card>
    );
  }

  return (
    <Card>
      <EyebrowLabel>{title}</EyebrowLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {actions.map(action => (
          <div key={action.label}>
            {action.href ? (
              <Link
                href={action.href}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                  ...(action.variant === 'filled'
                    ? { background: 'var(--accent)', color: '#0A0A0B', border: 'none' }
                    : { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' }),
                }}
              >
                {action.label}
              </Link>
            ) : (
              <button
                disabled
                title="Demo only — not wired to a backend"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'not-allowed',
                  opacity: 0.85,
                  ...(action.variant === 'filled'
                    ? { background: 'var(--accent)', color: '#0A0A0B', border: 'none' }
                    : { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' }),
                }}
              >
                {action.label}
              </button>
            )}
            {action.helper && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>{action.helper}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function buildActions(
  role: Role,
  paymentStatus: ReturnType<typeof useDeal>['deal']['paymentStatus'],
  documentStatus: ReturnType<typeof useDeal>['deal']['documentStatus']
): { title: string; actions: Action[] } {
  if (role === 'buyer') {
    const actions: Action[] = [];
    if (paymentStatus === 'funds_locked' || (paymentStatus === 'checking_documents' && documentStatus !== 'verified')) {
      actions.push({
        label: 'Request refund',
        variant: 'outlined',
        helper: 'Available while the dispute window is open and no valid documents have been verified.',
      });
    }
    return { title: 'BUYER ACTIONS', actions };
  }

  if (role === 'seller') {
    const actions: Action[] = [];
    if (documentStatus === 'failed') {
      actions.push({
        label: 'Re-upload document',
        variant: 'filled',
        helper: 'A discrepancy was confirmed — upload a corrected invoice.',
        href: '/seller',
      });
    }
    return { title: 'SELLER ACTIONS', actions };
  }

  // operator
  const actions: Action[] = [];
  if (documentStatus === 'failed') {
    actions.push({ label: 'Approve release', variant: 'filled', helper: 'Manually approve payment release once the discrepancy is resolved.' });
  }
  if (documentStatus === 'checking' || documentStatus === 'failed') {
    actions.push({ label: 'Escalate to manual review', variant: 'outlined', helper: 'Flag this deal for a human reviewer within 24 hours.' });
  }
  return { title: 'BLOCKMEDIARY ACTIONS', actions };
}
