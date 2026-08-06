'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/useSession';
import { DanShell } from '@/components/dan/DanShell';
import { FunctionalDashboardFrame } from '@/components/dashboard/FunctionalDashboardShell';
import { DealActions } from '@/components/dan/DealActions';
import { AuditTrail } from '@/components/dan/AuditTrail';
import { AuthForms } from '@/components/dan/AuthForms';
import { runDealAction, type DealAction } from '@/components/dan/dealActionRunner';
import { actorFromSession, fetchDeal, type DealListItem } from '@/lib/escrow/client';

export default function DealPage({ params }: { params: Promise<{ dealId: string }> }) {
  return <DealDetailPage params={params} />;
}

export function DealDetailPage({
  params,
  surface = 'dan',
}: {
  params: Promise<{ dealId: string }>;
  surface?: 'dan' | 'dashboard';
}) {
  const { dealId } = use(params);
  const { account } = useSession();
  const router = useRouter();
  const actor = actorFromSession(account);
  const backHref = surface === 'dashboard' ? '/dashboard?tab=deals' : '/dan?tab=deals';
  const SurfaceShell = surface === 'dashboard' ? FunctionalDashboardFrame : DanShell;

  const [deal, setDeal] = useState<DealListItem | null>(null);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    try {
      const r = await fetchDeal(dealId, account.id);
      if (r.ok === false) {
        setLoadError(r.error ?? 'Could not load this deal.');
        setDeal(null);
        return;
      }
      setLoadError(null);
      setDeal(r.deal ?? null);
      setChainId(r.chainId ?? undefined);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, [dealId, account]);

  useEffect(() => {
    const initial = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(initial);
  }, [refresh]);

  const act = async (action: DealAction) => {
    setBusy(true);
    setError(null);
    try {
      const r = await runDealAction(dealId, action, actor);
      if (r.ok === false) {
        setError(r.error ?? 'Action failed.');
      } else if (r.verdict === 'Discrepant') {
        const failed = (r.rules ?? []).filter(x => !x.pass).map(x => x.rule).join('; ');
        setError(`Discrepant. The documents do not match the agreed terms. ${failed}`);
      }
      if (r.ok !== false && action === 'decline') {
        router.push(backHref);
        return;
      }
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!account) {
    return (
      <SurfaceShell activeTab="Deals">
        <AuthForms />
      </SurfaceShell>
    );
  }

  if (loadError) {
    return (
      <SurfaceShell activeTab="Deals">
        <BackLink href={backHref} />
        <div className="bm-card">
          <h1 className="bm-section-title">Deal unavailable</h1>
          <p className="bm-body" style={{ marginTop: 10 }}>{loadError}</p>
        </div>
      </SurfaceShell>
    );
  }

  if (!deal) {
    return (
      <SurfaceShell activeTab="Deals">
        <BackLink href={backHref} />
        <p className="bm-body">Loading deal.</p>
      </SurfaceShell>
    );
  }

  return (
    <SurfaceShell activeTab="Deals">
      <BackLink href={backHref} />

      <div className="bm-page-head">
        <div>
          <div className="bm-kicker">Deal record</div>
          <h1 className="bm-title">{deal.terms?.goods ?? 'Trade deal'}</h1>
          <p className="bm-subtitle">
            with {deal.counterparty}. You are the {deal.role ?? 'pending party'} on this deal.
          </p>
        </div>
        <div className="bm-card" style={{ minWidth: 220 }}>
          <div className="bm-stat-label">Escrow amount</div>
          <div className="bm-stat-value">
            {deal.terms?.amountUsdc ?? '0'} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>USDC</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <span className={stateClass(deal.state)}>{stateLabel(deal.state)}</span>
          </div>
        </div>
      </div>

      {error && <div className="bm-alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="bm-grid-two">
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title={deal.onChainDealId ? 'Agreed terms' : 'Proposed terms'}>
            <div className="bm-detail-grid">
              <Detail label="Goods" value={deal.terms?.goods ?? '-'} />
              <Detail label="Amount" value={`${deal.terms?.amountUsdc ?? '-'} USDC`} mono />
              <Detail label="Seller" value={deal.terms?.sellerName ?? '-'} />
              <Detail label="Buyer" value={deal.terms?.buyerName ?? '-'} />
              <Detail label="Ship by" value={deal.terms?.shipmentDeadline ?? '-'} mono />
              <Detail label="Your role" value={deal.role ?? '-'} />
            </div>
          </Card>

          <Card title="Next step">
            <DealActionsForPage deal={deal} busy={busy} onAction={act} />
          </Card>
        </div>

        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <Card title="References">
            <Detail label="Deal reference" value={deal.dealId} mono wrap />
            {deal.onChainDealId && (
              <div style={{ marginTop: 14 }}>
                <Detail label="On-chain deal id" value={deal.onChainDealId} mono wrap />
              </div>
            )}
          </Card>

          <Card title={null}>
            <AuditTrail audit={deal.audit ?? []} chainId={chainId} />
          </Card>
        </div>
      </div>
    </SurfaceShell>
  );
}

function DealActionsForPage({
  deal,
  busy,
  onAction,
}: {
  deal: DealListItem;
  busy: boolean;
  onAction: (a: DealAction) => void;
}) {
  if (deal.awaitingViewer) {
    return (
      <>
        <p className="bm-body" style={{ marginBottom: 14 }}>
          {deal.counterparty} proposed these terms. Accepting registers the deal on-chain and
          binds both sides to this rulebook.
        </p>
        <div className="bm-actions">
          <button type="button" className="bm-button bm-button-primary" disabled={busy} onClick={() => onAction('accept')}>
            {busy ? 'Working' : 'Accept and register'}
          </button>
          <button type="button" className="bm-button bm-button-danger" disabled={busy} onClick={() => onAction('decline')}>
            Decline
          </button>
        </div>
      </>
    );
  }

  if (deal.state === 'Agreed' && deal.role === 'buyer') {
    return (
      <>
        <p className="bm-body" style={{ marginBottom: 14 }}>
          Both sides accepted the terms. Lock {deal.terms?.amountUsdc} USDC so the seller can ship
          with funds held in escrow.
        </p>
        <button type="button" className="bm-button bm-button-primary" disabled={busy} onClick={() => onAction('fund')}>
          {busy ? 'Working' : `Lock ${deal.terms?.amountUsdc ?? ''} USDC`}
        </button>
      </>
    );
  }

  if (deal.state === 'Agreed' && deal.role === 'seller') {
    return (
      <p className="bm-body">
        Waiting for {deal.counterparty} to lock the funds. Do not ship until escrow is funded.
      </p>
    );
  }

  if (deal.state === 'Declined') {
    return <p className="bm-body">This proposal was declined. No on-chain deal was created.</p>;
  }

  return <DealActions deal={deal} busy={busy} onAction={onAction} />;
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="bm-link" style={{ display: 'inline-block', marginBottom: 18, fontSize: 13 }}>
      Back to deals
    </Link>
  );
}

function Card({ title, children }: { title: string | null; children: ReactNode }) {
  return (
    <section className="bm-card">
      {title && <div className="bm-kicker" style={{ marginBottom: 14 }}>{title}</div>}
      {children}
    </section>
  );
}

function Detail({
  label,
  value,
  mono,
  wrap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <div>
      <div className="bm-stat-label">{label}</div>
      <div
        className={mono ? 'bm-mono' : undefined}
        style={{
          marginTop: 4,
          color: 'var(--text-primary)',
          fontSize: 14,
          wordBreak: wrap ? 'break-all' : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function stateLabel(state: string | null): string {
  if (!state) return 'Draft';
  if (state === 'ReleasePending') return 'Release pending';
  return state;
}

function stateClass(state: string | null): string {
  if (state === 'Released') return 'bm-status bm-status-success';
  if (state === 'Refunded' || state === 'Declined') return 'bm-status bm-status-danger';
  if (state === 'ReleasePending') return 'bm-status bm-status-info';
  if (state === 'Agreed' || state === 'Funded') return 'bm-status bm-status-warning';
  return 'bm-status';
}
