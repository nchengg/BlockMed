'use client';
// One deal, in full. Replaces the expanding row: terms, parties, on-chain
// identity, the action for whoever is looking, and the complete audit trail —
// all laid out rather than crammed into a list item.
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/useSession';
import { DanShell } from '@/components/dan/DanShell';
import { DealActions } from '@/components/dan/DealActions';
import { AuditTrail } from '@/components/dan/AuditTrail';
import { AuthForms } from '@/components/dan/AuthForms';
import { runDealAction, type DealAction } from '@/components/dan/dealActionRunner';
import { actorFromSession, fetchDeal, type DealListItem } from '@/lib/escrow/client';

const STATE_TONE: Record<string, { fg: string; bg: string }> = {
  Agreed: { fg: 'var(--accent)', bg: 'var(--accent-dim)' },
  Funded: { fg: 'var(--accent)', bg: 'var(--accent-dim)' },
  ReleasePending: { fg: 'var(--accent)', bg: 'var(--accent-dim)' },
  Released: { fg: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  Refunded: { fg: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  Declined: { fg: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

export default function DealPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = use(params);
  const { account } = useSession();
  const router = useRouter();
  const actor = actorFromSession(account);

  const [deal, setDeal] = useState<DealListItem | null>(null);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    try {
      const r = await fetchDeal(dealId, account.id);
      if (r.ok === false) { setLoadError(r.error ?? 'Could not load this deal.'); setDeal(null); return; }
      setLoadError(null);
      setDeal(r.deal ?? null);
      setChainId(r.chainId ?? undefined);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, [dealId, account]);

  useEffect(() => { void refresh(); }, [refresh]);

  const act = async (action: DealAction) => {
    setBusy(true);
    setError(null);
    try {
      const r = await runDealAction(dealId, action, actor);
      if (r.ok === false) setError(r.error ?? 'Action failed.');
      else if ('verdict' in r && r.verdict === 'Discrepant') {
        setError(
          'Discrepant — the documents do not match the agreed terms. ' +
          (r.rules ?? []).filter(x => !x.pass).map(x => x.rule).join('; '),
        );
      }
      // A declined deal disappears from this viewer's actionable set; go back.
      if (r.ok !== false && action === 'decline') { router.push('/dan?tab=deals'); return; }
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!account) {
    return (
      <DanShell activeTab="Deals">
        <AuthForms />
      </DanShell>
    );
  }

  if (loadError) {
    return (
      <DanShell activeTab="Deals">
        <BackLink />
        <H1>Deal unavailable</H1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10 }}>{loadError}</p>
      </DanShell>
    );
  }

  if (!deal) {
    return (
      <DanShell activeTab="Deals">
        <BackLink />
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
      </DanShell>
    );
  }

  const tone = STATE_TONE[deal.state ?? ''] ?? { fg: 'var(--text-secondary)', bg: 'transparent' };

  return (
    <DanShell activeTab="Deals">
      <BackLink />

      {/* Header: what, how much, and where it stands. */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
        <div style={{ minWidth: 0 }}>
          <H1>{deal.terms?.goods ?? 'Deal'}</H1>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            with {deal.counterparty} · you are the{' '}
            <strong style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{deal.role ?? '—'}</strong>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {deal.terms?.amountUsdc ?? '—'}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 6 }}>USDC</span>
          </div>
          <span style={{
            display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 600,
            color: tone.fg, background: tone.bg,
            border: `1px solid ${tone.fg === 'var(--text-secondary)' ? 'var(--border)' : tone.fg}`,
            borderRadius: 999, padding: '4px 12px',
          }}>
            {deal.state ?? 'Draft'}
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          margin: '16px 0', fontSize: 13, padding: '10px 14px', borderRadius: 6,
          color: '#f87171', border: '1px solid #f87171', background: 'var(--bg-surface)',
        }}>{error}</div>
      )}

      {/* Terms */}
      <Card title={deal.onChainDealId ? 'AGREED TERMS' : 'PROPOSED TERMS'}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <Detail label="Goods" value={deal.terms?.goods ?? '—'} />
          <Detail label="Amount" value={`${deal.terms?.amountUsdc ?? '—'} USDC`} mono />
          <Detail label="Seller (shipper)" value={deal.terms?.sellerName ?? '—'} />
          <Detail label="Buyer (consignee)" value={deal.terms?.buyerName ?? '—'} />
          <Detail label="Ship by" value={deal.terms?.shipmentDeadline ?? '—'} mono />
          <Detail label="Your role" value={deal.role ?? '—'} capitalize />
        </div>
      </Card>

      {/* Whatever this viewer can do next, at this state. */}
      <Card title="NEXT STEP">
        <DealActionsForPage deal={deal} busy={busy} onAction={act} />
      </Card>

      {/* Identity on-chain and off. */}
      <Card title="REFERENCES">
        <Detail label="Deal reference" value={deal.dealId} mono />
        {deal.onChainDealId && (
          <div style={{ marginTop: 12 }}>
            <Detail label="On-chain deal id" value={deal.onChainDealId} mono wrap />
          </div>
        )}
      </Card>

      <Card title={null}>
        <AuditTrail audit={deal.audit ?? []} chainId={chainId} />
      </Card>
    </DanShell>
  );
}

// The accept/decline pair only exists pre-registration; everything after funding
// lives in DealActions. Keeping both here means the page has one "next step" box.
function DealActionsForPage({ deal, busy, onAction }: {
  deal: DealListItem; busy: boolean; onAction: (a: DealAction) => void;
}) {
  if (deal.awaitingViewer) {
    return (
      <>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px' }}>
          {deal.counterparty} proposed these terms. Accepting registers the deal on-chain and binds
          both sides to this rulebook — the bill of lading is checked against it later.
          {deal.role === 'buyer' && ' You will then be asked to fund the escrow.'}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onAction('accept')} disabled={busy}
            style={{
              padding: '11px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600,
              background: 'var(--accent)', color: '#0A0A0B', border: 'none',
              cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
            }}
          >{busy ? 'Working…' : 'Accept & register on-chain'}</button>
          <button
            onClick={() => onAction('decline')} disabled={busy}
            style={{
              padding: '11px 20px', borderRadius: 6, fontSize: 14, background: 'transparent',
              color: '#f87171', border: '1px solid #f87171', cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >Decline</button>
        </div>
      </>
    );
  }

  if (deal.state === 'Agreed' && deal.role === 'buyer') {
    return (
      <>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px' }}>
          Both sides are bound to these terms. Locking {deal.terms?.amountUsdc} USDC lets{' '}
          {deal.counterparty} ship, knowing the money is held. Two transactions: an exact-amount
          approve, then the deposit.
        </p>
        <button
          onClick={() => onAction('fund')} disabled={busy}
          style={{
            padding: '11px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600,
            background: 'var(--accent)', color: '#0A0A0B', border: 'none',
            cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
          }}
        >{busy ? 'Working…' : `Lock ${deal.terms?.amountUsdc ?? ''} USDC in escrow`}</button>
      </>
    );
  }

  if (deal.state === 'Agreed' && deal.role === 'seller') {
    return (
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        Waiting for {deal.counterparty} to lock the funds. Do not ship until the escrow is funded —
        the status will change to <strong style={{ color: 'var(--text-primary)' }}>Funded</strong>.
      </p>
    );
  }

  if (deal.state === 'Declined') {
    return <Muted>This proposal was declined. No on-chain deal was created.</Muted>;
  }

  const post = <DealActions deal={deal} busy={busy} onAction={onAction} />;
  return post ?? <Muted>Nothing to do on this deal right now.</Muted>;
}

/* ── small bits ── */

function BackLink() {
  return (
    <Link
      href="/dan?tab=deals"
      style={{ display: 'inline-block', marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
    >
      ← All deals
    </Link>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
      {children}
    </h1>
  );
}

function Card({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <section style={{
      marginTop: 20, border: '1px solid var(--border)', borderRadius: 10,
      padding: '20px 22px', background: 'var(--bg-surface)',
    }}>
      {title && <div className="section-label" style={{ fontSize: 10, marginBottom: 14 }}>{title}</div>}
      {children}
    </section>
  );
}

function Detail({ label, value, mono, wrap, capitalize }: {
  label: string; value: string; mono?: boolean; wrap?: boolean; capitalize?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, color: 'var(--text-primary)', marginTop: 4,
        fontFamily: mono ? 'monospace' : undefined,
        wordBreak: wrap ? 'break-all' : undefined,
        textTransform: capitalize ? 'capitalize' : undefined,
      }}>{value}</div>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{children}</p>;
}
