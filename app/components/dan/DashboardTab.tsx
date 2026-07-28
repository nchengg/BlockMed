'use client';
// Dashboard tab — summary stats for the signed-in company.
//
// Money is derived from THIS account's deals (each deal's own amount, summed by
// state), not from a wallet balance: in this demo every buyer signs from one
// shared dev wallet and every seller from another, so a raw balance would be the
// whole chain's rather than this company's. The shared wallets are still shown
// at the bottom, clearly labelled, because they are what actually moves on-chain.
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/authStore';
import { fetchSummary, type DealSummary } from '@/lib/escrow/client';

export function DashboardTab({ onOpenDeals }: { onOpenDeals: () => void }) {
  const { account } = useAuth();
  const [s, setS] = useState<DealSummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      setS(await fetchSummary(account?.id));
    } catch {
      setS(null);
    }
  }, [account?.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (!s) {
    return (
      <>
        <Heading />
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
      </>
    );
  }

  const { money, counts } = s;
  const nothingYet = counts.total === 0;

  return (
    <>
      <Heading />

      {!s.chainOk && (
        <div style={{
          marginBottom: 20, fontSize: 13, padding: '10px 14px', borderRadius: 6,
          color: '#f87171', border: '1px solid #f87171', background: 'var(--bg-surface)',
        }}>
          No local chain detected — on-chain figures are unavailable. Start it with{' '}
          <code>npx hardhat node</code> in <code>contracts/</code>.
        </div>
      )}

      {nothingYet ? (
        <div style={{
          border: '1px dashed var(--border)', borderRadius: 10, padding: '48px 32px',
          textAlign: 'center', background: 'var(--bg-surface)',
        }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            No deals yet. Create one to see your escrow position here.
          </p>
          <button
            onClick={onOpenDeals}
            style={{
              padding: '10px 18px', borderRadius: 6, fontSize: 14, fontWeight: 600,
              background: 'var(--accent)', color: '#0A0A0B', border: 'none', cursor: 'pointer',
            }}
          >Go to Deals</button>
        </div>
      ) : (
        <>
          {/* Money — the headline. Locked is the number that matters most: it is
              what the contract is holding on this company's deals right now. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <Stat
              label="Locked in escrow"
              value={money.locked}
              unit="USDC"
              hint="Held by the contract on your funded deals"
              accent
            />
            <Stat
              label="Awaiting funding"
              value={money.awaitingFunding}
              unit="USDC"
              hint="Agreed, not yet deposited"
            />
            <Stat
              label="Settled"
              value={money.released}
              unit="USDC"
              hint="Released on completed deals"
            />
          </div>

          {/* Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginTop: 14 }}>
            <Mini label="Deals" value={counts.total} />
            <Mini label="Active" value={counts.active} />
            <Mini label="Completed" value={counts.settled} />
            <Mini label="As buyer" value={counts.asBuyer} />
            <Mini label="As seller" value={counts.asSeller} />
          </div>

          {/* The one actionable number. */}
          <div
            onClick={counts.needsYou ? onOpenDeals : undefined}
            style={{
              marginTop: 18, padding: '16px 18px', borderRadius: 10,
              border: `1px solid ${counts.needsYou ? 'var(--accent)' : 'var(--border)'}`,
              background: 'var(--bg-surface)',
              cursor: counts.needsYou ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}
          >
            <span style={{
              fontFamily: 'monospace', fontSize: 26, fontWeight: 700,
              color: counts.needsYou ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {counts.needsYou}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {counts.needsYou === 0
                ? 'Nothing needs your attention.'
                : `deal${counts.needsYou === 1 ? '' : 's'} waiting on you — accept, fund, submit documents or release.`}
            </span>
            {counts.needsYou > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                View →
              </span>
            )}
          </div>

          {money.demoWallets && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 18 }}>
              Demo chain: the escrow contract holds {money.escrowTotalAllAccounts} USDC across all
              companies. Every buyer signs from one shared test wallet ({money.demoWallets.buyer} USDC)
              and every seller from another ({money.demoWallets.seller} USDC) — real per-company
              wallets arrive with wallet sign-in.
            </p>
          )}
        </>
      )}
    </>
  );
}

function Heading() {
  return (
    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 20 }}>
      Dashboard
    </div>
  );
}

function Stat({ label, value, unit, hint, accent }: {
  label: string; value: string; unit: string; hint: string; accent?: boolean;
}) {
  return (
    <div style={{
      border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10,
      padding: '18px 20px', background: 'var(--bg-surface)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 26, fontWeight: 700,
          color: accent ? 'var(--accent)' : 'var(--text-primary)',
        }}>{value}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{hint}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', background: 'var(--bg-surface)' }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}
