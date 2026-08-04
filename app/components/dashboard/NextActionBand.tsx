import Link from 'next/link';
import type { Role } from '@/data/dashboardDemo';
import { useDeal } from '@/lib/dealStore';

type Action = { text: string; ctaLabel?: string; ctaHref?: string };
// ctaHref is only set for real, routable actions (/buyer, /seller). Demo-only
// operator actions have a ctaLabel but no ctaHref and render as a disabled button.

export function NextActionBand({ role }: { role: Role }) {
  const { deal } = useDeal();
  const { paymentStatus, documentStatus } = deal;
  const action = resolveAction(role, paymentStatus, documentStatus);

  return (
    <div
      className="dashboard-action-band"
      style={{
        background: 'var(--accent-dim)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{action.text}</span>
      {action.ctaLabel && action.ctaHref && (
        <Link
          href={action.ctaHref}
          style={{
            background: 'var(--accent)',
            color: '#0A0A0B',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textDecoration: 'none',
          }}
        >
          {action.ctaLabel}
        </Link>
      )}
      {action.ctaLabel && !action.ctaHref && (
        <button
          disabled
          title="Demo only — not wired to a backend"
          style={{
            background: 'var(--accent)',
            color: '#0A0A0B',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            cursor: 'not-allowed',
            opacity: 0.85,
          }}
        >
          {action.ctaLabel}
        </button>
      )}

      <style>{`
        @media (max-width: 900px) {
          .dashboard-action-band { padding: 12px 16px !important; }
        }
      `}</style>
    </div>
  );
}

function resolveAction(
  role: Role,
  paymentStatus: ReturnType<typeof useDeal>['deal']['paymentStatus'],
  documentStatus: ReturnType<typeof useDeal>['deal']['documentStatus']
): Action {
  if (paymentStatus === 'payment_released') {
    return { text: 'Deal closed — payment has been released to the seller.' };
  }
  if (paymentStatus === 'refunded') {
    return { text: 'Deal closed — funds were refunded to the buyer.' };
  }

  if (role === 'buyer') {
    if (paymentStatus === 'awaiting_deposit') {
      return { text: 'Lock funds to start this deal.', ctaLabel: 'Continue buyer flow', ctaHref: '/buyer' };
    }
    if (documentStatus === 'failed') {
      return { text: 'A discrepancy was found — the seller has been asked to re-upload.' };
    }
    if (documentStatus === 'manual_review') {
      return { text: "This deal is under manual review. We'll notify you within 24 hours." };
    }
    if (documentStatus === 'checking') {
      return { text: 'Document check in progress (simulated) — no action needed right now.' };
    }
    if (documentStatus === 'received') {
      return { text: 'The seller just uploaded the invoice — the check is about to start.' };
    }
    if (documentStatus === 'uploading') {
      return { text: 'The seller is uploading the required document now.' };
    }
    return { text: 'Waiting for the seller to upload the required document.' };
  }

  if (role === 'seller') {
    if (paymentStatus === 'awaiting_deposit') {
      return { text: 'Waiting for the buyer to deposit funds.' };
    }
    if (documentStatus === 'failed') {
      return { text: 'Your document was rejected — re-upload is required.', ctaLabel: 'Continue seller flow', ctaHref: '/seller' };
    }
    if (documentStatus === 'manual_review') {
      return { text: "This deal is under manual review. We'll notify you within 24 hours." };
    }
    if (documentStatus === 'checking') {
      return { text: "Document check in progress (simulated) — we'll notify you when it resolves." };
    }
    if (documentStatus === 'received' || documentStatus === 'uploading') {
      return { text: 'Continue in the seller flow to finish your upload.', ctaLabel: 'Continue seller flow', ctaHref: '/seller' };
    }
    return { text: 'Upload the required invoice.', ctaLabel: 'Continue seller flow', ctaHref: '/seller' };
  }

  // operator
  if (paymentStatus === 'awaiting_deposit') {
    return { text: 'No action required yet — waiting on the buyer deposit.' };
  }
  if (documentStatus === 'failed') {
    return { text: 'A discrepancy was flagged on the commercial invoice. Review the extracted fields before this can proceed.', ctaLabel: 'Review discrepancy' };
  }
  if (documentStatus === 'manual_review') {
    return { text: 'Escalated for manual review.', ctaLabel: 'Open manual review' };
  }
  if (documentStatus === 'checking') {
    return { text: 'Reviewing submitted documents (simulated check).' };
  }
  if (documentStatus === 'received') {
    return { text: 'Document received — the simulated check is about to start.' };
  }
  if (documentStatus === 'uploading') {
    return { text: 'Seller is uploading the required document.' };
  }
  return { text: 'Waiting for the seller to upload the required document.' };
}
