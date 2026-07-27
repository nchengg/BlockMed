'use client';
// Sign in AS A COMPANY, straight into Dan's Dashboard.
//
// The landing page's "Continue as Buyer/Seller" buttons sign in but land on the
// main dashboard, and the plain /dan link doesn't sign you in at all — so testing
// the two-sided flow meant a scavenger hunt. This picks a company, signs in, and
// goes to /dan in one click.
//
// Companies, not roles: an account is neither buyer nor seller. Which side you are
// on is chosen per deal (lib/escrow/roles.ts).
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authStore';

// Mirrors the seeded client accounts (lib/authStore.tsx) and the counterparty
// options in /api/escrow/companies.
export const DAN_COMPANIES = [
  { email: 'seller@solaris.demo', name: 'Solaris Textiles Co.', blurb: 'Exporter · textiles' },
  { email: 'buyer@meridian.demo', name: 'Meridian Imports Ltd.', blurb: 'Importer · UK' },
  { email: 'trader@bridgetrade.demo', name: 'BridgeTrade Co.', blurb: 'Trades both ways' },
  { email: 'ops@tradebridge.demo', name: 'TradeBridge Platform', blurb: 'Intermediary' },
] as const;

export function CompanySignIn({ variant = 'landing' }: { variant?: 'landing' | 'compact' }) {
  const { login } = useAuth();
  const router = useRouter();

  const go = (email: string) => {
    login(email);
    router.push('/dan');
  };

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DAN_COMPANIES.map(c => (
          <button
            key={c.email}
            onClick={() => go(c.email)}
            style={{
              textAlign: 'left', background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {DAN_COMPANIES.map(c => (
        <button
          key={c.email}
          onClick={() => go(c.email)}
          style={{
            textAlign: 'left', padding: '18px 20px', borderRadius: 8,
            background: 'var(--bg-surface)', border: '1px solid var(--border, #27272A)',
            color: 'var(--text-primary)', cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #27272A)'; }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, display: 'block' }}>{c.name}</span>
          <span style={{ display: 'block', marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
            {c.blurb}
          </span>
        </button>
      ))}
    </div>
  );
}
