import { useDeal } from '@/lib/dealStore';
import { Card, EyebrowLabel } from './ui';

type StepStatus = 'done' | 'active' | 'pending';
type ProgressStep = { label: string; status: StepStatus };

export function ProgressChecklist() {
  const { deal } = useDeal();
  const steps = buildSteps(deal.paymentStatus, deal.documentStatus);

  return (
    <Card>
      <EyebrowLabel>DEAL PROGRESS</EyebrowLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Dot status={step.status} />
              {i < steps.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 24, background: step.status === 'done' ? 'var(--accent)' : 'var(--border)' }} />
              )}
            </div>
            <div style={{ paddingBottom: 20 }}>
              <span
                style={{
                  fontSize: 14,
                  color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontWeight: step.status === 'active' ? 600 : 400,
                }}
              >
                {step.label}
              </span>
              {step.status === 'active' && (
                <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>In progress</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function buildSteps(
  paymentStatus: ReturnType<typeof useDeal>['deal']['paymentStatus'],
  documentStatus: ReturnType<typeof useDeal>['deal']['documentStatus']
): ProgressStep[] {
  const fundsLocked = paymentStatus !== 'awaiting_deposit';
  const docUploaded = documentStatus !== 'not_uploaded';
  const checkStarted = docUploaded;
  const checkResolved = documentStatus === 'verified' || documentStatus === 'failed' || documentStatus === 'manual_review';
  const released = paymentStatus === 'payment_released';

  const flags = [true, fundsLocked, docUploaded, checkStarted, checkResolved, released];
  const labels = [
    'Escrow created',
    'Funds locked',
    'Document uploaded',
    'Document check started',
    'Document check result',
    'Payment released',
  ];

  const firstPendingIndex = flags.findIndex(f => !f);

  return labels.map((label, i) => {
    let status: StepStatus;
    if (flags[i]) status = 'done';
    else if (i === firstPendingIndex) status = 'active';
    else status = 'pending';
    return { label, status };
  });
}

function Dot({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--accent)', background: 'var(--accent-dim)', flexShrink: 0 }} />
    );
  }
  return <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 }} />;
}
