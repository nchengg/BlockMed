'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MOCK REGISTRATION — account-first signup. Creates an account in the mock
// registry (lib/authStore.tsx). DEMO ONLY: no password is stored, nothing is
// verified. A client picks which hat(s) it wears — and may choose BOTH buyer and
// seller (dual-hat). The wallet is linked LATER, inside the account.
//
// Real signup/auth is a pending team decision — TRD Q18.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  hatLabel, typeLabel, useAuth,
  type AccountType, type ClientHat,
} from '@/lib/authStore';

const ACCOUNT_TYPES: { type: AccountType; blurb: string }[] = [
  { type: 'client', blurb: 'Trade as a buyer, seller, or platform. You can be more than one.' },
  { type: 'admin', blurb: 'Blockmediary staff — operate live deals (oversight & verdicts).' },
  { type: 'developer', blurb: 'Technical / debug console with full low-level controls.' },
];

const HATS: ClientHat[] = ['buyer', 'seller', 'platform'];

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [type, setType] = useState<AccountType>('client');
  const [hats, setHats] = useState<ClientHat[]>(['buyer']);
  const [error, setError] = useState<string | null>(null);

  const toggleHat = (h: ClientHat) => {
    setHats(prev => (prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]));
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'client' && hats.length === 0) {
      setError('Pick at least one client role (you can pick both buyer and seller).');
      return;
    }
    const result = register({ email, displayName, type, hats });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Account-first, wallet-second: land in the account (onboarding) so the new
    // user can optionally connect a wallet before entering the portal.
    router.push('/account?welcome=1');
  };

  return (
    <main
      style={{
        minHeight: '100vh', background: 'var(--bg-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Blockmediary
          </Link>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: 16 }}>
            Create an account
          </h1>
          <p className="scene-subline" style={{ marginTop: 8 }}>
            Register first — you can connect a wallet afterwards, from inside your account.
          </p>
        </div>

        <div
          role="note"
          style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)', whiteSpace: 'nowrap', marginTop: 2 }}>
            MOCK SIGNUP
          </span>
          <span>Demo only — no password stored, nothing verified. <span className="mono">TODO(integration: auth Q18)</span></span>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Email
          </label>
          <input
            type="email" required value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            placeholder="you@company.com" autoComplete="off"
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', marginBottom: 16 }}
          />

          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Display name (optional)
          </label>
          <input
            type="text" value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Acme Trading Co."
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', marginBottom: 20 }}
          />

          <p className="section-label" style={{ marginBottom: 10 }}>Account type</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {ACCOUNT_TYPES.map(t => {
              const active = t.type === type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => { setType(t.type); setError(null); }}
                  aria-pressed={active}
                  style={{
                    textAlign: 'left', background: active ? 'var(--accent-dim)' : 'var(--bg-surface)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '12px 14px', cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{typeLabel[t.type]}</span>
                  <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.blurb}</span>
                </button>
              );
            })}
          </div>

          {/* Client hats — multi-select. Both buyer + seller = dual-hat account. */}
          {type === 'client' && (
            <div style={{ marginBottom: 20 }}>
              <p className="section-label" style={{ marginBottom: 4 }}>Client role(s)</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Pick one or more. A single account can be both buyer and seller.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {HATS.map(h => {
                  const active = hats.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHat(h)}
                      aria-pressed={active}
                      style={{
                        background: active ? 'var(--accent-dim)' : 'var(--bg-surface)',
                        color: active ? 'var(--accent)' : 'var(--text-secondary)',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {hatLabel[h]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p style={{ fontSize: 13, color: 'var(--error)', marginBottom: 12 }}>{error}</p>}

          <button
            type="submit"
            disabled={!email.trim()}
            style={{
              width: '100%', background: email.trim() ? 'var(--accent)' : 'var(--bg-card)',
              color: email.trim() ? '#0A0A0B' : 'var(--text-muted)',
              border: 'none', borderRadius: 8, padding: '13px 16px', fontSize: 15, fontWeight: 700,
              cursor: email.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Create account
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
