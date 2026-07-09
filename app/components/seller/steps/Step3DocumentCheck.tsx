'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { checkingSubLabels } from '@/data/sellerDemo';
import { useDeal, type VerificationOutcome } from '@/lib/dealStore';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

type RowStatus = 'pending' | 'active' | 'done' | 'error';
type Phase = 'checking' | 'resolved';

export function Step3DocumentCheck({ onReupload }: { onReupload: () => void }) {
  const { deal, startDocumentCheck, resolveVerification, resetDocumentForReupload } = useDeal();
  const [outcome, setOutcome] = useState<VerificationOutcome>('verified');
  const [phase, setPhase] = useState<Phase>('checking');
  const [subLabelIndex, setSubLabelIndex] = useState(0);

  const outcomeCopy: Record<VerificationOutcome, { headline: string; subline: string }> = {
    verified: {
      headline: 'Payment released.',
      subline: `$${deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC has been sent to your wallet.`,
    },
    failed: {
      headline: "We couldn't verify this document.",
      subline: `Reason: ${deal.discrepancyReason ?? "Invoice amount doesn't match escrow amount."}`,
    },
    manual_review: {
      headline: 'Needs manual review.',
      subline: "A reviewer needs to check this before payment can release. We'll notify you within 24 hours.",
    },
  };

  useEffect(() => {
    // Resets the simulated check whenever the demo outcome selector changes —
    // an intentional re-sync driven by a value change, not a render-time derivation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase('checking');
    setSubLabelIndex(0);
    startDocumentCheck();

    const subInterval = setInterval(() => {
      setSubLabelIndex(i => Math.min(i + 1, checkingSubLabels.length - 1));
    }, 900);

    const resolveTimer = setTimeout(() => {
      clearInterval(subInterval);
      setPhase('resolved');
      resolveVerification(outcome);
    }, 3200);

    return () => { clearInterval(subInterval); clearTimeout(resolveTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const rowDocReceived: RowStatus = 'done';
  const rowChecking: RowStatus = phase === 'checking' ? 'active' : outcome === 'failed' ? 'error' : 'done';
  const rowPayment: RowStatus = phase === 'checking' ? 'pending' : outcome === 'verified' ? 'done' : outcome === 'manual_review' ? 'pending' : 'error';

  const headline = phase === 'checking'
    ? 'Checking your document.'
    : outcomeCopy[outcome].headline;
  const subline = phase === 'checking'
    ? 'This usually takes under 5 minutes.'
    : outcomeCopy[outcome].subline;

  return (
    <div>
      <EyebrowLabel>SELLER</EyebrowLabel>
      <h1
        style={{
          fontSize: 'clamp(24px, 3.5vw, 32px)',
          fontWeight: phase === 'resolved' && outcome === 'verified' ? 800 : 600,
          letterSpacing: '-0.01em',
          color: phase === 'resolved' && outcome === 'verified' ? 'var(--accent)' : 'var(--text-primary)',
          marginBottom: 12,
        }}
      >
        {headline}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        {subline}
      </p>

      <Card>
        <ProgressRow status={rowDocReceived} label="Document received" />
        <ProgressRow
          status={rowChecking}
          label="Checking deal terms"
          sublabel={phase === 'checking' ? checkingSubLabels[subLabelIndex] : undefined}
        />
        <ProgressRow status={rowPayment} label="Payment released" />
      </Card>

      {phase === 'resolved' && outcome === 'failed' && (
        <button
          onClick={() => { resetDocumentForReupload(); onReupload(); }}
          style={{
            width: '100%',
            marginTop: 20,
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
          Re-upload document
        </button>
      )}

      {phase === 'resolved' && outcome === 'verified' && (
        <Link
          href={`/dashboard?deal=${deal.dealId}`}
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 20,
            padding: '14px 20px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#0A0A0B',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go to dashboard
        </Link>
      )}

      {phase === 'checking' && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          Demo only — this check is simulated in the browser. No real AI verification is performed.
        </p>
      )}

      {/* Demo-only control — lets you preview each verification outcome without a backend. */}
      <div style={{ marginTop: 32, padding: '16px 0 0', borderTop: '1px solid var(--border)' }}>
        <div className="section-label" style={{ marginBottom: 10, fontSize: 10 }}>DEMO: SIMULATE OUTCOME</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['verified', 'failed', 'manual_review'] as VerificationOutcome[]).map(o => (
            <button
              key={o}
              onClick={() => setOutcome(o)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: outcome === o ? 'var(--bg-surface)' : 'transparent',
                color: outcome === o ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: `1px solid ${outcome === o ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {o === 'verified' ? 'Verified' : o === 'failed' ? 'Failed' : 'Manual review'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ status, label, sublabel }: { status: RowStatus; label: string; sublabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 4px' }}>
      <Dot status={status} />
      <div>
        <span style={{ fontSize: 15, color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: status === 'active' ? 600 : 400 }}>
          {label}
        </span>
        {sublabel && (
          <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>{sublabel}</div>
        )}
      </div>
    </div>
  );
}

function Dot({ status }: { status: RowStatus }) {
  if (status === 'done') {
    return (
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontSize: 12, color: '#0A0A0B', fontWeight: 700 }}>
        ✕
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', background: 'var(--accent-dim)', flexShrink: 0, marginTop: 1, position: 'relative' }}>
        <span style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: 'var(--accent)', animation: 'seller-pulse-dot 1s ease-in-out infinite' }} />
        <style>{`@keyframes seller-pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </span>
    );
  }
  return <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0, marginTop: 1 }} />;
}
