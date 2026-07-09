'use client';
import { useState } from 'react';
import { walletOptions, type WalletId } from '@/data/buyerDemo';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

type RowState = 'idle' | 'connecting' | 'connected' | 'rejected' | 'not_detected';

const initialStates: Record<WalletId, RowState> = {
  metamask: 'idle',
  coinbase: 'idle',
  walletconnect: 'not_detected',
};

export function Step1ConnectWallet({ onConnected }: { onConnected: () => void }) {
  const [states, setStates] = useState<Record<WalletId, RowState>>(initialStates);
  const [attempts, setAttempts] = useState<Record<WalletId, number>>({ metamask: 0, coinbase: 0, walletconnect: 0 });
  const [busy, setBusy] = useState(false);

  const handleClick = (id: WalletId) => {
    if (busy || states[id] === 'not_detected' || states[id] === 'connecting' || states[id] === 'connected') return;

    setBusy(true);
    setStates(s => ({ ...s, [id]: 'connecting' }));

    const attemptNumber = attempts[id] + 1;
    setAttempts(a => ({ ...a, [id]: attemptNumber }));

    // Coinbase Wallet's first attempt simulates a declined connection so the
    // rejected state is demonstrable; second attempt succeeds.
    const willReject = id === 'coinbase' && attemptNumber === 1;

    setTimeout(() => {
      if (willReject) {
        setStates(s => ({ ...s, [id]: 'rejected' }));
        setBusy(false);
        return;
      }
      setStates(s => ({ ...s, [id]: 'connected' }));
      setTimeout(onConnected, 700);
    }, 1100);
  };

  return (
    <div>
      <EyebrowLabel>BUYER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        Connect your wallet to begin.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        You&apos;ll use a wallet to approve the escrow payment, like confirming a bank transfer. Blockmediary never takes custody of your funds.
      </p>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {walletOptions.map(wallet => {
            const state = states[wallet.id];
            const disabled = state === 'not_detected' || state === 'connecting' || (busy && state !== 'rejected');
            return (
              <button
                key={wallet.id}
                onClick={() => handleClick(wallet.id)}
                disabled={disabled}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '16px 18px',
                  borderRadius: 8,
                  background: 'var(--bg-mid)',
                  border: '1px solid var(--border)',
                  cursor: disabled && state !== 'not_detected' ? 'default' : state === 'not_detected' ? 'not-allowed' : 'pointer',
                  opacity: state === 'not_detected' ? 0.6 : 1,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <WalletIcon id={wallet.id} />
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{wallet.name}</span>
                </div>
                <StateLabel state={state} />
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StateLabel({ state }: { state: RowState }) {
  switch (state) {
    case 'connecting':
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent)' }}>
          <Spinner /> Connecting…
        </span>
      );
    case 'connected':
      return <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>Connected</span>;
    case 'rejected':
      return <span style={{ fontSize: 13, color: 'var(--error)' }}>Connection declined — try again</span>;
    case 'not_detected':
      return <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not installed</span>;
    default:
      return <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>›</span>;
  }
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2px solid var(--accent)',
        borderTopColor: 'transparent',
        animation: 'buyer-spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes buyer-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

function WalletIcon({ id }: { id: WalletId }) {
  const colors: Record<WalletId, string> = {
    metamask: '#F59E0B',
    coinbase: '#3F3F46',
    walletconnect: '#71717A',
  };
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        background: colors[id],
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}
