'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MOCK LOGIN screen — pick a party, get routed to its view. DEMO ONLY.
//
// There is NO password field and NO credential check on purpose: this scaffold
// exists to demonstrate view SEPARATION per party, not to authenticate anyone.
// The real mechanism (SIWE vs JWT vs both, incl. a wallet-less platform role) is
// an open team decision — TRD Q18. See the seam below and lib/sessionStore.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  roleHome,
  useSession,
  type PartyRole,
} from '@/lib/sessionStore';

type Tile = {
  role: PartyRole;
  title: string;
  blurb: string;
  tag: string;
};

// Top-level parties. "Client" is expressed as its three sub-roles so buyer,
// seller and platform each get a distinct entry (buyer ≠ seller separation).
const ADMIN_DEV: Tile[] = [
  { role: 'admin', title: 'Administrator', blurb: 'Operator console — oversee deals, parties and releases.', tag: 'Operator' },
  { role: 'developer', title: 'Developer', blurb: 'Technical view — contract state, events, API/webhooks.', tag: 'Internal' },
];

const CLIENTS: Tile[] = [
  { role: 'buyer', title: 'Buyer', blurb: 'Importer — lock funds and start a deal.', tag: 'Client' },
  { role: 'seller', title: 'Seller', blurb: 'Exporter — upload documents and get paid.', tag: 'Client' },
  { role: 'platform', title: 'Platform / intermediary', blurb: 'Wallet-less party that facilitates the deal.', tag: 'Client' },
];

export function LoginForm({ initialRole }: { initialRole: PartyRole | null }) {
  const { login } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<PartyRole | null>(initialRole);
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    // MOCK sign-in — records the picked party, no credential verified.
    // TODO(integration: auth Q18) — swap for real SIWE/JWT verification here.
    login(role, email);
    router.push(roleHome[role]);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-deep)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 620 }}>
        <div style={{ marginBottom: 28 }}>
          <Link
            href="/"
            style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.01em' }}
          >
            Blockmediary
          </Link>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: 16 }}>
            Sign in to your portal
          </h1>
          <p className="scene-subline" style={{ marginTop: 8, maxWidth: 520 }}>
            Choose the party you want to sign in as. Each party sees only its own view.
          </p>
        </div>

        {/* Unmissable mock-auth notice — this is not real authentication. */}
        <div
          role="note"
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 24,
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)', whiteSpace: 'nowrap', marginTop: 2 }}>
            MOCK LOGIN
          </span>
          <span>
            Demo only — no password, no wallet, nothing verified. Just pick a party to preview its view.
            Real auth (SIWE / JWT) is a pending team decision — <span className="mono">TRD Q18</span>.
          </span>
        </div>

        <form onSubmit={submit}>
          <PartyGroupBlock label="Operator side" tiles={ADMIN_DEV} selected={role} onSelect={setRole} />
          <PartyGroupBlock label="Client — buyer, seller & platform" tiles={CLIENTS} selected={role} onSelect={setRole} />

          <label style={{ display: 'block', marginTop: 8, marginBottom: 24 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Email (optional, not checked)
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role ? `${role}@demo.blockmediary` : 'you@company.com'}
              autoComplete="off"
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '11px 14px',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={!role}
            style={{
              width: '100%',
              background: role ? 'var(--accent)' : 'var(--bg-card)',
              color: role ? '#0A0A0B' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 8,
              padding: '13px 16px',
              fontSize: 15,
              fontWeight: 700,
              cursor: role ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {role ? `Enter as ${tileTitle(role)}` : 'Select a party to continue'}
          </button>
        </form>
      </div>
    </main>
  );
}

function tileTitle(role: PartyRole): string {
  return [...ADMIN_DEV, ...CLIENTS].find(t => t.role === role)?.title ?? role;
}

function PartyGroupBlock({
  label,
  tiles,
  selected,
  onSelect,
}: {
  label: string;
  tiles: Tile[];
  selected: PartyRole | null;
  onSelect: (r: PartyRole) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {tiles.map(t => {
          const active = t.role === selected;
          return (
            <button
              key={t.role}
              type="button"
              onClick={() => onSelect(t.role)}
              aria-pressed={active}
              style={{
                textAlign: 'left',
                background: active ? 'var(--accent-dim)' : 'var(--bg-surface)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {t.tag}
                </span>
              </div>
              <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t.blurb}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
