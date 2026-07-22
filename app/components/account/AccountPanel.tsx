'use client';
// Account settings + onboarding. Two jobs:
//   1. Show the account (source of truth for role + hats).
//   2. Host the SECONDARY, OPTIONAL wallet-connect step — the account-first,
//      wallet-second seam. An account works with no wallet (e.g. platform).
//
// The wallet "connect" here is a STUB (TR-6.3): it attaches a fake address. Real
// wallet linking is TODO(integration: wallet) — see lib/authStore.tsx.

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { groupHome, hatLabel, typeLabel, useAuth } from '@/lib/authStore';
import { Card, EyebrowLabel, AddressChip } from '@/components/dashboard/ui';

export function AccountPanel() {
  const { account, activeHat, setActiveHat, connectWallet, disconnectWallet } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const welcome = params.get('welcome') === '1';

  if (!account) return null; // guarded by RequireParty; satisfies types

  const portal = groupHome[account.type];

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>
      <header style={{ marginBottom: 24 }}>
        <EyebrowLabel>Account</EyebrowLabel>
        <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {welcome ? `Welcome, ${account.displayName}` : account.displayName}
        </h1>
        <p className="scene-subline" style={{ marginTop: 6 }}>
          {welcome
            ? 'Your account is ready. Connecting a wallet is optional — you can do it now or later.'
            : 'Your account is the source of truth for your role. Your wallet is optional.'}
        </p>
      </header>

      <Card style={{ marginBottom: 16 }}>
        <EyebrowLabel>Identity</EyebrowLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Row label="Email" value={account.email} mono />
          <Row label="Account type" value={typeLabel[account.type]} />
          {account.type === 'client' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role(s)</span>
              <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {account.hats.map(h => (
                  <span key={h} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 9999, padding: '3px 10px' }}>
                    {hatLabel[h]}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Dual-hat context switch — only for client accounts wearing >1 hat. */}
      {account.type === 'client' && account.hats.length > 1 && (
        <Card style={{ marginBottom: 16 }}>
          <EyebrowLabel>Active context</EyebrowLabel>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 12 }}>
            This account can act as more than one party. Pick which hat you&apos;re wearing right now.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {account.hats.map(h => {
              const on = h === activeHat;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setActiveHat(h)}
                  style={{
                    background: on ? 'var(--accent-dim)' : 'var(--bg-mid)',
                    color: on ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {hatLabel[h]}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── WALLET CONNECT SEAM (secondary, optional) ─────────────────────────
          TODO(integration: wallet, TR-6.3): replace the stub connect with a real
          wallet flow (wagmi / SIWE) and verify ownership before linking. */}
      <Card style={{ marginBottom: 24, borderColor: 'var(--accent-border)' }}>
        <EyebrowLabel>Wallet</EyebrowLabel>
        {account.wallet ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <AddressChip value={account.wallet.address} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Linked {account.wallet.connectedAt}</span>
            </div>
            <button
              type="button"
              onClick={disconnectWallet}
              style={{ marginTop: 14, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Disconnect wallet
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              No wallet linked. This is optional — your account already works without one
              {account.type === 'client' && account.hats.includes('platform') ? ' (platform / intermediary parties may never link a wallet).' : '.'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
              <span className="mono">TODO(integration: wallet, TR-6.3)</span> — this connect is a stub; it attaches a demo address.
            </p>
            <button
              type="button"
              onClick={() => connectWallet()}
              style={{ background: 'var(--accent)', color: '#0A0A0B', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Connect wallet (demo)
            </button>
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => router.push(portal)}
          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          {welcome ? 'Continue to portal →' : 'Back to portal'}
        </button>
        <Link href="/" style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Home
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: mono ? 'monospace' : undefined }}>{value}</span>
    </div>
  );
}
