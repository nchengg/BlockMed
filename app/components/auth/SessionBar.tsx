'use client';
// Slim "you are signed in as X" bar with a sign-out action, shown on portal
// pages so the current lens is always visible during the demo. Reads the shared
// mock session (lib/sessionStore.tsx).

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { roleLabel, useSession } from '@/lib/sessionStore';

export function SessionBar() {
  const { session, logout } = useSession();
  const router = useRouter();

  const signOut = () => {
    logout();
    router.replace('/login');
  };

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
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Link
          href="/"
          style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.01em' }}
        >
          Blockmediary
        </Link>
        <span
          title="Mock session — no real authentication"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
            background: 'var(--accent-dim)',
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          MOCK LOGIN
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {session && (
          <span style={{ color: 'var(--text-secondary)' }}>
            Signed in as{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{roleLabel[session.role]}</span>
            <span style={{ color: 'var(--text-muted)' }}> · {session.email}</span>
          </span>
        )}
        <button
          type="button"
          onClick={signOut}
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Switch party / sign out
        </button>
      </div>
    </div>
  );
}
