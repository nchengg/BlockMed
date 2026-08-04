'use client';
// Slim "you are signed in as X" bar shown on portal pages so the active account,
// its current hat and wallet status are always visible during the demo. Reads
// the shared mock auth store (lib/authStore.tsx).

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hatLabel, typeLabel, useAuth } from '@/lib/authStore';

export function SessionBar() {
  const { account, activeHat, setActiveHat, logout } = useAuth();
  const router = useRouter();

  const signOut = () => {
    logout();
    router.replace('/login');
  };

  const dualHat = account && account.type === 'client' && account.hats.length > 1;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 20px',
        background: 'var(--bg-mid)',
        borderBottom: '1px solid var(--border)',
        fontSize: 13,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Link href="/" style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Blockmediary
        </Link>
        <span
          title="Mock session — no real authentication"
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)',
            border: '1px solid var(--accent-border)', background: 'var(--accent-dim)',
            borderRadius: 4, padding: '2px 6px',
          }}
        >
          MOCK LOGIN
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {account && (
          <span style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{account.displayName}</span>
            <span style={{ color: 'var(--text-muted)' }}> · {typeLabel[account.type]}</span>
          </span>
        )}

        {/* Dual-hat switcher — a client account that is BOTH buyer and seller can
            switch its active context here (per-account exception). */}
        {dualHat && (
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            {account!.hats.map(h => {
              const on = h === activeHat;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setActiveHat(h)}
                  style={{
                    background: on ? 'var(--accent-dim)' : 'transparent',
                    color: on ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {hatLabel[h].split(' ')[0]}
                </button>
              );
            })}
          </span>
        )}

        {/* Wallet status — secondary attribute; may be unlinked. */}
        {account && (
          <Link
            href="/account"
            title={account.wallet ? account.wallet.address : 'No wallet linked — optional'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
              fontFamily: 'monospace', fontSize: 12,
              color: account.wallet ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${account.wallet ? 'var(--success-border)' : 'var(--border)'}`,
              borderRadius: 6, padding: '4px 8px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: account.wallet ? 'var(--success)' : 'var(--text-muted)' }} />
            {account.wallet ? `${account.wallet.address.slice(0, 6)}…${account.wallet.address.slice(-4)}` : 'No wallet'}
          </Link>
        )}

        <Link href="/account" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
          Account
        </Link>
        <button
          type="button"
          onClick={signOut}
          style={{
            background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
