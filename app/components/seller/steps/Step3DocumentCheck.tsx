'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { checkingSubLabels } from '@/data/sellerDemo';
import { useDeal, type VerificationOutcome } from '@/lib/dealStore';
import type { RuleResult, Verdict } from '@/lib/escrow/rules';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

type RowStatus = 'pending' | 'active' | 'done' | 'error';
type Phase = 'checking' | 'resolved';

// Step3 no longer decides the outcome. It renders the verdict Step2 produced:
//   • a real Verdict (from the deterministic rules engine via submitBol) → show
//     THAT authoritative Compliant/Discrepant result + the real rule breakdown;
//   • null (Step2 ran in simulated / no-chain mode) → the clearly-labelled
//     simulation, which keeps the manual outcome control ONLY as a demo fallback.
export function Step3DocumentCheck({ verdict, onReupload }: { verdict: Verdict | null; onReupload: () => void }) {
  if (verdict) return <RealVerdictView verdict={verdict} onReupload={onReupload} />;
  return <SimulatedCheckView onReupload={onReupload} />;
}

// ── Authoritative path — render the REAL rules-engine verdict ─────────────────
function RealVerdictView({ verdict, onReupload }: { verdict: Verdict; onReupload: () => void }) {
  const { deal, startDocumentCheck, resolveVerification, resetDocumentForReupload } = useDeal();
  const compliant = verdict.verdict === 'Compliant';
  const firstFail = verdict.rules.find(r => !r.pass);

  // Mirror the authoritative verdict into the shared store ONCE so /dashboard and
  // the audit trail reflect the same real result. The rules engine only returns
  // Compliant / Discrepant, so there is no "manual review" branch here.
  useEffect(() => {
    startDocumentCheck();
    if (compliant) {
      resolveVerification('verified');
    } else {
      resolveVerification(
        'failed',
        firstFail ? `${firstFail.rule}: expected ${firstFail.expected}, got ${firstFail.actual}` : undefined,
      );
    }
    // Runs once for this verdict — an intentional external-store sync, not a
    // render-time derivation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headline = compliant ? 'Documents verified.' : 'We found a discrepancy.';
  const subline = compliant
    ? `The deterministic rules engine found no discrepancies. $${deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC is being released to your wallet.`
    : "This document doesn't match the agreed terms. The failing checks are below — fix the document and re-upload.";

  return (
    <div>
      <EyebrowLabel>SELLER</EyebrowLabel>
      <h1
        style={{
          fontSize: 'clamp(24px, 3.5vw, 32px)',
          fontWeight: compliant ? 800 : 600,
          letterSpacing: '-0.01em',
          color: compliant ? 'var(--accent)' : 'var(--text-primary)',
          marginBottom: 12,
        }}
      >
        {headline}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        {subline}
      </p>

      <Card>
        <ProgressRow status="done" label="Document received" />
        <ProgressRow status={compliant ? 'done' : 'error'} label="Checking deal terms" />
        <ProgressRow status={compliant ? 'done' : 'error'} label="Payment released" />
      </Card>

      {/* Real rule-by-rule breakdown, straight from the rules engine verdict. */}
      <div style={{ marginTop: 20 }}>
        <Card>
          <div className="section-label" style={{ marginBottom: 12, fontSize: 10 }}>
            RULES ENGINE — {verdict.verdict.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {verdict.rules.map((r, i) => <RuleLine key={i} rule={r} />)}
          </div>
        </Card>
      </div>

      {!compliant && (
        <button
          onClick={() => { resetDocumentForReupload(); onReupload(); }}
          style={primaryButtonStyle}
        >
          Re-upload document
        </button>
      )}

      {compliant && (
        <Link href={`/dashboard?deal=${deal.dealId}`} style={primaryLinkStyle}>
          Go to dashboard
        </Link>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
        Checked by the deterministic rules engine (lib/escrow/rules.ts) against the agreed
        on-chain terms — this is a real verdict, not a simulation.
      </p>
    </div>
  );
}

function RuleLine({ rule }: { rule: RuleResult }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: rule.pass ? 'var(--success)' : 'var(--error)', fontSize: 13, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>
        {rule.pass ? '✓' : '✕'}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{rule.rule}</div>
        {!rule.pass && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, wordBreak: 'break-word' }}>
            expected <span style={{ color: 'var(--text-secondary)' }}>{rule.expected}</span>
            {' · '}got <span style={{ color: 'var(--text-secondary)' }}>{rule.actual}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fallback path — the SIMULATED check (no authoritative verdict available) ──
// Used only when Step2 could not obtain a real verdict (no funded on-chain deal /
// no local chain). Everything here is clearly labelled as simulated, and the
// manual outcome control is a demo-only fallback — it never overrides a real
// verdict, because a real verdict routes to RealVerdictView above instead.
function SimulatedCheckView({ onReupload }: { onReupload: () => void }) {
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
          style={primaryButtonStyle}
        >
          Re-upload document
        </button>
      )}

      {phase === 'resolved' && outcome === 'verified' && (
        <Link href={`/dashboard?deal=${deal.dealId}`} style={primaryLinkStyle}>
          Go to dashboard
        </Link>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
        Simulated check — Step 2 had no funded on-chain deal to grade, so no real verdict was
        produced. No real AI or rules-engine verification is running here.
      </p>

      {/* Demo-only fallback control — only reachable when there is NO authoritative
          verdict. A real verdict renders in RealVerdictView and cannot be overridden.
          TODO(integration) — remove once the wizard always drives a funded on-chain
          deal, so Step2 always yields a real verdict. */}
      <div style={{ marginTop: 32, padding: '16px 0 0', borderTop: '1px solid var(--border)' }}>
        <div className="section-label" style={{ marginBottom: 10, fontSize: 10 }}>DEMO FALLBACK: SIMULATE OUTCOME</div>
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

const primaryButtonStyle: React.CSSProperties = {
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
};

const primaryLinkStyle: React.CSSProperties = {
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
};

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
