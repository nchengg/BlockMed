'use client';
import { useState } from 'react';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

type RowState = 'waiting' | 'awaiting_signature' | 'confirmed' | 'failed';

export function Step4ApproveDeposit({ onComplete }: { onComplete: () => void }) {
  const [approve, setApprove] = useState<RowState>('waiting');
  const [deposit, setDeposit] = useState<RowState>('waiting');

  const runApprove = () => {
    setApprove('awaiting_signature');
    setTimeout(() => setApprove('confirmed'), 1200);
  };

  const runDeposit = () => {
    setDeposit('awaiting_signature');
    setTimeout(() => {
      setDeposit('confirmed');
      setTimeout(onComplete, 800);
    }, 1400);
  };

  return (
    <div>
      <EyebrowLabel>BUYER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        Approve and lock your funds.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        You&apos;ll confirm two wallet prompts: first to allow USDC digital dollars, then to lock them in escrow.
      </p>

      <Card>
        <TaskRow number={1} label="Approve USDC" state={approve} onAction={runApprove} actionLabel="Approve" />
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        <TaskRow number={2} label="Deposit to escrow" state={deposit} onAction={runDeposit} actionLabel="Deposit" disabled={approve !== 'confirmed'} />
      </Card>
    </div>
  );
}

function TaskRow({
  number,
  label,
  state,
  onAction,
  actionLabel,
  disabled,
}: {
  number: number;
  label: string;
  state: RowState;
  onAction: () => void;
  actionLabel: string;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 4px', opacity: disabled ? 0.45 : 1 }}>
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

      {state === 'waiting' && !disabled && (
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
      {state === 'awaiting_signature' && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--accent)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'buyer-pulse 1s ease-in-out infinite' }} />
          Confirm in wallet…
        </span>
      )}
      {state === 'confirmed' && (
        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Confirmed</span>
      )}
      {state === 'failed' && (
        <span style={{ fontSize: 12, color: 'var(--error)' }}>Transaction failed — retry</span>
      )}

      <style>{`@keyframes buyer-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
