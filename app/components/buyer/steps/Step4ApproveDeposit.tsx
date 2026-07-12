'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/authStore';
import { useDeal } from '@/lib/dealStore';
import { actorFrom, fetchStatus, fund, type StatusResponse } from '@/lib/escrow/client';
import { AddressChip, Card, EyebrowLabel } from '@/components/dashboard/ui';

type RowState = 'waiting' | 'awaiting_signature' | 'confirmed' | 'failed';

// On-chain states of the shared escrow deal in which a deposit has already happened.
const FUNDED_STATES = ['Funded', 'ReleasePending', 'Released', 'Refunded'];

// WIRED (integration) — this step now performs the REAL approve + deposit against the
// live local Hardhat chain via lib/escrow/client → /api/escrow/fund, the same action
// the Escrow tab (components/dashboard/EscrowConsole.tsx) drives. One server call signs
// both transactions (approve, then deposit) with the local buyer dev key; we reflect
// each real tx hash and the pending/confirmed/failed state instead of an instant mock
// advance. See the report notes for the two honest seams that remain:
//   1. The on-chain escrow store is still a SINGLE global deal (lib/escrow/store.ts),
//      not keyed by the per-account dealStore id — so this deposits the one shared
//      escrow deal, and the wizard's active deal (deal.dealId) is UI context only. The
//      buyer's completion still mirrors into the mock dealStore (onComplete → lockFunds)
//      so /dashboard stays consistent.
//   2. The wizard has no propose/agree steps, so the shared deal must already be in the
//      'Agreed' state (set up via the Escrow tab) for a real deposit to fire. When it
//      isn't — or no local chain is running — we degrade gracefully to a clearly
//      labelled simulation so the demo still completes (same posture as EscrowConsole).
export function Step4ApproveDeposit({ onComplete }: { onComplete: () => void }) {
  const { account } = useAuth();
  const { deal } = useDeal();

  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [approve, setApprove] = useState<RowState>('waiting');
  const [deposit, setDeposit] = useState<RowState>('waiting');
  const [error, setError] = useState<string | null>(null);
  const [hashes, setHashes] = useState<{ approve?: string; deposit?: string }>({});

  // Read the live chain once on mount to decide real-vs-simulated (same as the
  // Escrow console). No party gate on the read.
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
  const state = status?.state ?? null;
  const agreedOnChain = status?.ok === true && state === 'Agreed';
  const alreadyFunded = status?.ok === true && !!state && FUNDED_STATES.includes(state);
  // A real deposit is only meaningful from the Agreed state; anything else falls
  // back to the simulation (chain down, no deal yet, still Draft, etc.).
  const realMode = agreedOnChain;

  // This page is the buyer flow, so we always act with the buyer hat regardless of
  // which lens a dual-hat account currently has active — the fund route gates on it.
  const actor = actorFrom(account, 'buyer');

  // ── REAL PATH ──────────────────────────────────────────────────────────────
  // One POST signs approve + deposit server-side; we surface each real tx hash.
  const runFundReal = useCallback(async () => {
    setError(null);
    setApprove('awaiting_signature');
    setDeposit('waiting');
    try {
      const r = await fund(deal.dealId, actor);
      if (r.ok === false) {
        setApprove('failed');
        setError(r.error || 'Deposit was rejected on-chain.');
        return;
      }
      setHashes({ approve: r.approveHash, deposit: r.depositHash });
      setApprove('confirmed');
      setDeposit('awaiting_signature');
      // Brief beat so the two real transactions read as sequential (which they are).
      setTimeout(() => {
        setDeposit('confirmed');
        setTimeout(onComplete, 700);
      }, 600);
    } catch (e) {
      setApprove('failed');
      setError((e as Error).message);
    }
    // actor is derived from account each render; account is the only real dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, deal.dealId, onComplete]);

  // ── SIMULATED PATH ─────────────────────────────────────────────────────────
  // No agreed on-chain deal / no local chain: keep the original two-prompt
  // simulation so the wizard still completes, clearly labelled as simulated.
  const runApproveSim = () => {
    setApprove('awaiting_signature');
    setTimeout(() => setApprove('confirmed'), 1000);
  };
  const runDepositSim = () => {
    setDeposit('awaiting_signature');
    setTimeout(() => {
      setDeposit('confirmed');
      setTimeout(onComplete, 700);
    }, 1100);
  };

  const amountLabel = deal.amount > 0
    ? `${deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${deal.currency}`
    : 'your funds';

  return (
    <div>
      <EyebrowLabel>BUYER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        Approve and lock {amountLabel}.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        {realMode
          ? 'Two on-chain transactions run against the live escrow: first USDC is approved for the exact amount, then it is deposited and locked.'
          : "You'll confirm two steps: first to allow USDC digital dollars, then to lock them in escrow."}
      </p>

      {!loaded && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Checking the live chain…</p>
      )}

      {loaded && (
        <>
          <ModeBanner mode={alreadyFunded ? 'already' : realMode ? 'real' : chainDown ? 'chaindown' : 'sim'} state={state} />

          {alreadyFunded ? (
            <Card>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 16 }}>
                This escrow deal is already funded on-chain (state: <strong>{state}</strong>). Nothing more to deposit.
              </p>
              <button
                onClick={onComplete}
                style={primaryBtn}
              >
                Continue
              </button>
            </Card>
          ) : (
            <Card>
              <TaskRow
                number={1}
                label="Approve USDC"
                state={approve}
                onAction={realMode ? undefined : runApproveSim}
                actionLabel="Approve"
                hash={hashes.approve}
              />
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <TaskRow
                number={2}
                label="Deposit to escrow"
                state={deposit}
                onAction={realMode ? undefined : runDepositSim}
                actionLabel="Deposit"
                disabled={approve !== 'confirmed'}
                hash={hashes.deposit}
              />

              {realMode && (
                <button
                  onClick={runFundReal}
                  disabled={approve !== 'waiting' && approve !== 'failed'}
                  style={{
                    ...primaryBtn,
                    marginTop: 20,
                    opacity: approve !== 'waiting' && approve !== 'failed' ? 0.6 : 1,
                    cursor: approve !== 'waiting' && approve !== 'failed' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {approve === 'failed' ? 'Retry approve + deposit' : approve === 'waiting' ? 'Approve + deposit on-chain' : 'Working…'}
                </button>
              )}

              {error && (
                <div style={{ marginTop: 14, fontSize: 13, color: 'var(--error)', lineHeight: 1.5 }}>{error}</div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  borderRadius: 8,
  border: 'none',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  background: 'var(--accent)',
  color: '#0A0A0B',
};

function ModeBanner({ mode, state }: { mode: 'real' | 'sim' | 'chaindown' | 'already'; state: string | null }) {
  if (mode === 'real') {
    return (
      <div style={bannerStyle('accent')}>
        Live chain detected — this signs the real approve + deposit on localhost. On-chain state: <strong>{state}</strong>.
      </div>
    );
  }
  if (mode === 'already') return null;
  const text = mode === 'chaindown'
    ? 'No local chain detected — showing a local simulation so the demo still completes. Start the Hardhat node and deploy to run the real deposit.'
    : `No agreed deal on-chain yet${state ? ` (state: ${state})` : ''} — showing a local simulation. Propose + agree on the Escrow tab first to run the real deposit.`;
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

function TaskRow({
  number,
  label,
  state,
  onAction,
  actionLabel,
  disabled,
  hash,
}: {
  number: number;
  label: string;
  state: RowState;
  onAction?: () => void;
  actionLabel: string;
  disabled?: boolean;
  hash?: string;
}) {
  return (
    <div style={{ padding: '12px 4px', opacity: disabled && state === 'waiting' ? 0.45 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontFamily: 'monospace',
              fontWeight: 700,
              flexShrink: 0,
              background: state === 'confirmed' ? 'var(--success)' : 'var(--bg-mid)',
              border: `1px solid ${state === 'confirmed' ? 'var(--success)' : 'var(--border)'}`,
              color: state === 'confirmed' ? '#0A0A0B' : 'var(--text-secondary)',
            }}
          >
            {state === 'confirmed' ? '✓' : number}
          </span>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        </div>

        {/* The per-row button only exists in the simulated path (onAction set). */}
        {onAction && state === 'waiting' && !disabled && (
          <button
            onClick={onAction}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--accent)',
              color: '#0A0A0B',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {actionLabel}
          </button>
        )}
        {state === 'waiting' && disabled && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting</span>
        )}
        {state === 'waiting' && !disabled && !onAction && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ready</span>
        )}
        {state === 'awaiting_signature' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--accent)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'buyer-pulse 1s ease-in-out infinite' }} />
            Confirming…
          </span>
        )}
        {state === 'confirmed' && (
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Confirmed</span>
        )}
        {state === 'failed' && (
          <span style={{ fontSize: 12, color: 'var(--error)' }}>Transaction failed — retry</span>
        )}
      </div>

      {hash && state === 'confirmed' && (
        <div style={{ marginTop: 8, marginLeft: 40 }}>
          <AddressChip value={hash} />
        </div>
      )}

      <style>{`@keyframes buyer-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
