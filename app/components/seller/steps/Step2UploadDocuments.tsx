'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sellerDemo } from '@/data/sellerDemo';
import { useAuth } from '@/lib/authStore';
import { useDeal } from '@/lib/dealStore';
import { actorFrom, fetchStatus, submitBol, type StatusResponse } from '@/lib/escrow/client';
import type { BolFields, RuleResult, Verdict } from '@/lib/escrow/rules';
import type { Step2Result } from '../SellerFlowShell';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

// Local, pre-upload UI states (no file yet / file staged) live only in this
// component. Once an upload attempt actually starts, we mirror progress into
// the shared deal store so /dashboard can reflect the same states.
type ZoneState = 'empty' | 'dragging' | 'wrong_type' | 'added' | 'uploading' | 'upload_failed' | 'received';

// WIRED (integration) — when the shared escrow deal is Funded on the live local chain,
// this step performs the REAL B/L submission via lib/escrow/client → /api/escrow/submit-bol,
// the same action the Escrow tab (components/dashboard/EscrowConsole.tsx, seller hat)
// drives. The route runs the deterministic rules engine (lib/escrow/rules.ts) against the
// on-chain agreed terms and, on a Compliant verdict, records it on-chain — but only on
// localhost (the releaser-signing guard in submit-bol/route.ts is left intact). The B/L
// fields below are prefilled from the REAL on-chain terms (status.terms) so a Compliant
// verdict is reachable, and are editable so a discrepancy can be demonstrated.
//
// Honest seams that remain (see report):
//   1. This submits the seller's ACTIVE per-account deal (deal.dealId, threaded into
//      submitBol by feat/store-reconciliation) and mirrors `markReceived` into the mock
//      dealStore so /dashboard stays consistent.
//   2. The wizard has no propose/agree/fund steps, so the deal must already be Funded
//      (set up via the Escrow tab) for a real submit. When it isn't — or no local chain
//      is running — we degrade gracefully to the original labelled simulation so the
//      demo still completes (same posture as EscrowConsole).
//   3. The authoritative verdict is produced HERE at submit time and threaded up to
//      SellerFlowShell (onSubmitted) so Step3 renders the REAL result: a Compliant
//      verdict advances to Step3; a discrepancy stays here with the real breakdown to
//      fix and resubmit; a simulated / no-chain submit hands Step3 a null verdict and it
//      falls back to its clearly-labelled simulation. We never fabricate a verdict.
export function Step2UploadDocuments({ onSubmitted }: { onSubmitted: (result: Step2Result) => void }) {
  const { account } = useAuth();
  const { deal, startUpload, markUploadFailed, markReceived } = useDeal();

  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState<ZoneState>('empty');
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-path grading state.
  const [grading, setGrading] = useState(false);
  const [verdict, setVerdict] = useState<{ verdict: 'Compliant' | 'Discrepant'; rules: RuleResult[] } | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);

  // Read the live chain once on mount to decide real-vs-simulated.
  const refresh = useCallback(async () => {
    try {
      setStatus(await fetchStatus(deal.dealId));
    } catch (e) {
      setStatus({ ok: false, error: (e as Error).message });
    } finally {
      setLoaded(true);
    }
  }, [deal.dealId]);
  useEffect(() => { void refresh(); }, [refresh]);

  const chainDown = loaded && status?.ok === false;
  const chainState = status?.state ?? null;
  // A real B/L submit is only valid while the shared deal is Funded (mirrors the
  // route's own state guard). Everything else falls back to the simulation.
  const realMode = status?.ok === true && chainState === 'Funded';

  // Prefill the B/L fields from the REAL on-chain terms so a Compliant verdict is
  // reachable; fall back to the mock deal for display when terms aren't loaded yet.
  const terms = status?.terms ?? null;
  const EMPTY_BOL: BolFields = {
    blNumber: '', shipperName: '', consigneeName: '', goodsDescription: '',
    shippedOnBoardDate: '', vessel: '', voyageNumber: '', portOfLoading: '',
    portOfDischarge: '', containerNumber: '', packages: '', grossWeight: '',
  };
  const [fields, setFields] = useState<BolFields>(EMPTY_BOL);
  // Seed the form once the on-chain terms arrive (or from the mock deal as a fallback).
  useEffect(() => {
    if (!loaded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFields(f => ({
      ...f,
      blNumber: `BL-${deal.dealReference}`,
      shipperName: terms?.sellerName ?? deal.seller.businessName,
      consigneeName: terms?.buyerName ?? deal.buyer.businessName,
      goodsDescription: terms?.goods ?? '',
      shippedOnBoardDate: terms?.shipmentDeadline ?? '',
    }));
    // Seed only when the loaded terms change; user edits afterwards are preserved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, terms?.sellerName, terms?.buyerName, terms?.goods, terms?.shipmentDeadline]);

  const setField = (k: keyof BolFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  const isAccepted = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return sellerDemo.acceptedFormats.includes(ext);
  };

  const handleFile = (f: File) => {
    if (!isAccepted(f.name)) {
      setState('wrong_type');
      return;
    }
    setFile({ name: f.name, size: formatSize(f.size) });
    setState('added');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => (prev === 'dragging' ? 'empty' : prev));
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const removeFile = () => {
    setFile(null);
    setState('empty');
  };

  // This page is the seller flow, so we always act with the seller hat regardless
  // of a dual-hat account's active lens — the submit route gates on it.
  const actor = actorFrom(account, 'seller');

  // ── REAL PATH ── grade the B/L against the on-chain terms; Compliant records the
  // verdict on-chain (localhost only) and advances to the release step.
  const submitReal = useCallback(async () => {
    if (!file) return;
    setGrading(true);
    setGradeError(null);
    setVerdict(null);
    startUpload();
    try {
      const r = await submitBol(deal.dealId, fields, actor);
      if (r.ok === false && !r.verdict) {
        setGradeError(r.error || 'Submission was rejected.');
        markUploadFailed();
        return;
      }
      setVerdict({ verdict: r.verdict, rules: r.rules });
      if (r.verdict === 'Compliant') {
        // Mirror the real submission into the isolated mock store so /dashboard
        // reflects it, then advance to the release/check step.
        markReceived();
        setState('received');
        // Surface a non-fatal note (e.g. releaser skipped off localhost) but still proceed.
        if (r.ok === false && r.error) setGradeError(r.error);
        // Thread the REAL verdict up to SellerFlowShell so Step3 renders it.
        setTimeout(() => onSubmitted({ verdict: { verdict: r.verdict, rules: r.rules } }), 900);
      } else {
        setGradeError(null);
        markUploadFailed();
      }
    } catch (e) {
      setGradeError((e as Error).message);
      markUploadFailed();
    } finally {
      setGrading(false);
    }
    // actor derives from account; account is the only real dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, deal.dealId, fields, file, onSubmitted, startUpload, markReceived, markUploadFailed]);

  // ── SIMULATED PATH ── original browser-only upload + first-attempt failure demo.
  const submitSim = () => {
    if (!file) return;
    setState('uploading');
    setProgress(0);
    startUpload();
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 14, 100));
    }, 130);

    setTimeout(() => {
      clearInterval(interval);
      // First submit attempt simulates a failed upload (network blip) so the
      // retry state is demonstrable — this is a frontend-only simulation.
      if (nextAttempt === 1) {
        setState('upload_failed');
        markUploadFailed();
      } else {
        setProgress(100);
        markReceived();
        setState('received');
        // Simulated path — no real on-chain deal was graded, so hand Step3 a null
        // verdict and let it run its clearly-labelled simulation.
        setTimeout(() => onSubmitted({ verdict: null }), 700);
      }
    }, 1150);
  };

  const showFilePanel = state === 'added' || state === 'uploading' || state === 'upload_failed' || state === 'received';

  return (
    <div>
      <EyebrowLabel>SELLER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        Upload your commercial invoice.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        {realMode
          ? 'Blockmediary grades the bill-of-lading details below against the agreed on-chain terms. A compliant result records the verdict on-chain and releases the check.'
          : 'Accepted formats: PDF, PNG, JPG. Blockmediary checks the invoice against the deal terms.'}
      </p>

      {!loaded && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Checking the live chain…</p>
      )}

      {loaded && (
        <ModeBanner mode={realMode ? 'real' : chainDown ? 'chaindown' : 'sim'} state={chainState} />
      )}

      {loaded && (
        <Card>
          {showFilePanel ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 8, background: 'var(--bg-mid)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <FileIcon />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file?.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{file?.size}</div>
                  </div>
                </div>
                {state === 'added' && !grading && (
                  <button onClick={removeFile} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }} aria-label="Remove file">
                    ✕
                  </button>
                )}
                {state === 'received' && (
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, whiteSpace: 'nowrap' }}>Received ✓</span>
                )}
              </div>

              {state === 'uploading' && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-mid)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width 0.13s linear' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Uploading… (simulated)</div>
                </div>
              )}

              {state === 'upload_failed' && !realMode && (
                <div style={{ marginTop: 14, fontSize: 13, color: 'var(--error)' }}>
                  Upload failed — retry
                </div>
              )}

              {state === 'received' && (
                <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Document received. Starting the check…
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setState('dragging'); }}
              onDragLeave={() => setState('empty')}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `1.5px dashed ${state === 'dragging' ? 'var(--accent)' : 'var(--border)'}`,
                background: state === 'dragging' ? 'var(--accent-dim)' : 'transparent',
                borderRadius: 8,
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <UploadIcon active={state === 'dragging'} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                Drop file or click to browse
              </div>
              {state === 'wrong_type' && (
                <div style={{ fontSize: 13, color: 'var(--error)', marginTop: 12 }}>Unsupported file type</div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
            </div>
          )}

          {/* REAL PATH — editable B/L details graded by the rules engine. */}
          {realMode && (state === 'added' || state === 'upload_failed' || (state === 'uploading' && grading)) && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="section-label" style={{ fontSize: 10 }}>BILL OF LADING DETAILS (GRADED ON-CHAIN)</div>
              <Field label="B/L number" value={fields.blNumber} onChange={setField('blNumber')} />
              <Field label="Shipper (seller)" value={fields.shipperName} onChange={setField('shipperName')} />
              <Field label="Consignee (buyer)" value={fields.consigneeName} onChange={setField('consigneeName')} />
              <Field label="Description of goods" value={fields.goodsDescription} onChange={setField('goodsDescription')} />
              <Field label="Shipped on board date (YYYY-MM-DD)" value={fields.shippedOnBoardDate} onChange={setField('shippedOnBoardDate')} />
              <div className="section-label" style={{ fontSize: 10, marginTop: 6 }}>RECORDED ON THE B/L (NOT MACHINE-GRADED)</div>
              <Field label="Vessel" value={fields.vessel} onChange={setField('vessel')} />
              <Field label="Voyage No." value={fields.voyageNumber} onChange={setField('voyageNumber')} />
              <Field label="Port of Loading" value={fields.portOfLoading} onChange={setField('portOfLoading')} />
              <Field label="Port of Discharge" value={fields.portOfDischarge} onChange={setField('portOfDischarge')} />
              <Field label="Container No." value={fields.containerNumber} onChange={setField('containerNumber')} />
              <Field label="Packages" value={fields.packages} onChange={setField('packages')} />
              <Field label="Gross Weight" value={fields.grossWeight} onChange={setField('grossWeight')} />
            </div>
          )}

          {/* Discrepancy breakdown from the real rules engine. */}
          {verdict && verdict.verdict === 'Discrepant' && (
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 6, border: '1px solid var(--error-border)', background: 'var(--error-dim)' }}>
              <div style={{ fontSize: 13, color: 'var(--error)', fontWeight: 600, marginBottom: 8 }}>Discrepancy found — fix and resubmit</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {verdict.rules.filter(r => !r.pass).map(r => (
                  <div key={r.rule} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    ✗ {r.rule} — expected <strong>{r.expected}</strong>, got <strong>{r.actual}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gradeError && (
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--error)', lineHeight: 1.5 }}>{gradeError}</div>
          )}

          <button
            onClick={realMode ? submitReal : submitSim}
            disabled={realMode ? (grading || (state !== 'added' && state !== 'upload_failed')) : (state !== 'added' && state !== 'upload_failed')}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '14px 20px',
              borderRadius: 8,
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              cursor: (state === 'added' || state === 'upload_failed') && !grading ? 'pointer' : 'not-allowed',
              background: (state === 'added' || state === 'upload_failed') && !grading ? 'var(--accent)' : 'var(--bg-mid)',
              color: (state === 'added' || state === 'upload_failed') && !grading ? '#0A0A0B' : 'var(--text-muted)',
              opacity: state === 'uploading' || state === 'received' ? 0.7 : 1,
            }}
          >
            {realMode
              ? (grading ? 'Grading on-chain…' : verdict?.verdict === 'Discrepant' ? 'Resubmit B/L for grading' : 'Submit B/L for grading')
              : (state === 'upload_failed' ? 'Retry' : state === 'received' ? 'Received' : 'Submit for document check')}
          </button>
        </Card>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
        {realMode
          ? 'Live chain — the grading runs the deterministic rules engine against the on-chain terms and, on a compliant result, records the verdict with the local releaser key (localhost only).'
          : 'Demo only — this upload and document check are simulated in the browser. No file leaves your device and no real AI verification runs.'}
      </p>
    </div>
  );
}

function ModeBanner({ mode, state }: { mode: 'real' | 'sim' | 'chaindown'; state: string | null }) {
  if (mode === 'real') {
    return (
      <div style={bannerStyle('accent')}>
        Live chain detected — submitting grades the B/L on-chain. Deal state: <strong>{state}</strong>.
      </div>
    );
  }
  const text = mode === 'chaindown'
    ? 'No local chain detected — showing a local simulation so the demo still completes. Start the Hardhat node and deploy to grade a real B/L.'
    : `Deal is not Funded on-chain yet${state ? ` (state: ${state})` : ''} — showing a local simulation. Fund the deal on the Escrow tab first to grade a real B/L.`;
  return <div style={bannerStyle('muted')}>{text}</div>;
}

function bannerStyle(tone: 'accent' | 'muted'): React.CSSProperties {
  return {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 16,
    padding: '8px 12px',
    borderRadius: 6,
    color: tone === 'accent' ? 'var(--accent)' : 'var(--text-muted)',
    border: `1px dashed ${tone === 'accent' ? 'var(--accent-border)' : 'var(--border)'}`,
    background: tone === 'accent' ? 'var(--accent-dim)' : 'transparent',
  };
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
  background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border)',
};

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</span>
      <input style={inputStyle} {...rest} />
    </label>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function UploadIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.6">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
