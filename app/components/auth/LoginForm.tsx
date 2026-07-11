'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MOCK LOGIN — account-first. You sign into a REGISTERED ACCOUNT (mock registry
// in lib/authStore.tsx). DEMO ONLY: there is NO password check. The account
// carries the role; the wallet is linked later, inside the account.
//
// Real auth (SIWE vs JWT vs both, incl. a wallet-less platform role) is an open
// team decision — TRD Q18. See the seam in authStore.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEMO_LOGINS, groupHome, typeLabel, useAuth } from '@/lib/authStore';

export function LoginForm({ initialEmail }: { initialEmail: string }) {
  const { login, account } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);

  const signIn = (value: string) => {
    const result = login(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(groupHome[result.account.type]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email);
  };

  return (
    <main
      style={{
        minHeight: '100vh', background: 'var(--bg-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Blockmediary
          </Link>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: 16 }}>
            Sign in
          </h1>
          <p className="scene-subline" style={{ marginTop: 8 }}>
            Log into your account. Your account decides what you see — connect a wallet later, inside.
          </p>
        </div>

        {/* Already-signed-in shortcut. */}
        {account && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Already signed in as <strong style={{ color: 'var(--text-primary)' }}>{account.displayName}</strong> ({typeLabel[account.type]}).{' '}
            <Link href={groupHome[account.type]} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Continue →
            </Link>
          </div>
        )}

        {/* Mock-auth notice. */}
        <div
          role="note"
          style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)', whiteSpace: 'nowrap', marginTop: 2 }}>
            MOCK LOGIN
          </span>
          <span>
            Demo only — no password is checked and no wallet is required. Real auth (SIWE / JWT) is pending —{' '}
            <span className="mono">TRD Q18</span>.
          </span>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Account email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            placeholder="you@company.com"
            autoComplete="off"
            style={{
              width: '100%', background: 'var(--bg-surface)', border: `1px solid ${error ? 'var(--error-border)' : 'var(--border)'}`,
              borderRadius: 8, padding: '11px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none',
            }}
          />

          {/* Password field is intentionally omitted — nothing is verified. A
              labelled placeholder keeps it honest without faking a check. */}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            No password field — this is a mock login. <span className="mono">TODO(integration: auth Q18)</span>
          </p>

          {error && <p style={{ fontSize: 13, color: 'var(--error)', marginTop: 10 }}>{error}</p>}

          <button
            type="submit"
            disabled={!email.trim()}
            style={{
              width: '100%', marginTop: 16,
              background: email.trim() ? 'var(--accent)' : 'var(--bg-card)',
              color: email.trim() ? '#0A0A0B' : 'var(--text-muted)',
              border: 'none', borderRadius: 8, padding: '13px 16px', fontSize: 15, fontWeight: 700,
              cursor: email.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
            }}
          >
            Sign in
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>
          No account yet?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>

        {/* One-click demo accounts — covers every party, incl. dual-hat and the
            wallet-less platform account. */}
        <div style={{ marginTop: 28, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <p className="section-label" style={{ marginBottom: 12 }}>Quick demo login</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {DEMO_LOGINS.map(d => (
              <button
                key={d.email}
                type="button"
                onClick={() => signIn(d.email)}
                style={{
                  textAlign: 'left', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                }}
              >
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.label}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
