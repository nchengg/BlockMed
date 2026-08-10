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

const usdcFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

      <section className="bm-deal-detail-hero">
        <div className="bm-deal-detail-main">
          <div className="bm-kicker">Deal record</div>
          <div className="bm-deal-title-row">
            <h1 className="bm-title">{deal.terms?.goods ?? 'Trade deal'}</h1>
            <span className={stateClass(deal.state)}>{stateLabel(deal.state)}</span>
          </div>
          <p className="bm-subtitle">
            {deal.counterparty} is the counterparty. You are the {deal.role ?? 'pending party'} on this deal.
          </p>
          <div className="bm-deal-hero-meta">
            <Detail label="Seller" value={deal.terms?.sellerName ?? '-'} />
            <Detail label="Buyer" value={deal.terms?.buyerName ?? '-'} />
            <Detail label="Ship by" value={deal.terms?.shipmentDeadline ?? '-'} mono />
          </div>
        </div>
        <aside className="bm-deal-value-panel">
          <div className="bm-stat-label">Escrow amount</div>
          <div className="bm-stat-value">
            {formatUsdc(deal.terms?.amountUsdc)} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>USDC</span>
          </div>
          <div className="bm-progress" style={{ marginTop: 16 }}>
            <div style={{ width: `${dealProgress(deal)}%` }} />
          </div>
          <div className="bm-deal-stage-list">
            {dealStages(deal).map(stage => (
              <div key={stage.label} className="bm-deal-stage" data-active={stage.active}>
                <span />
                <p>{stage.label}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {error && <div className="bm-alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="bm-grid-two">
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title={deal.onChainDealId ? 'Agreed terms' : 'Proposed terms'}>
            <div className="bm-detail-grid">
              <Detail label="Goods" value={deal.terms?.goods ?? '-'} />
              <Detail label="Amount" value={`${formatUsdc(deal.terms?.amountUsdc)} USDC`} mono />
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
          Both sides accepted the terms. Lock {formatUsdc(deal.terms?.amountUsdc)} USDC so the seller can ship
          with funds held in escrow.
        </p>
        <button type="button" className="bm-button bm-button-primary" disabled={busy} onClick={() => onAction('fund')}>
          {busy ? 'Working' : `Lock ${formatUsdc(deal.terms?.amountUsdc)} USDC`}
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

function formatUsdc(value: string | number | null | undefined): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value ? String(value) : '0.00';
  return usdcFormatter.format(amount);
}

function dealProgress(deal: DealListItem): number {
  if (deal.state === 'Released') return 100;
  if (deal.state === 'ReleasePending') return 86;
  if (deal.state === 'Funded') return 62;
  if (deal.state === 'Agreed') return 38;
  if (deal.awaitingViewer) return 18;
  return 12;
}

function dealStages(deal: DealListItem): Array<{ label: string; active: boolean }> {
  const state = deal.state;
  return [
    { label: deal.awaitingViewer ? 'Awaiting acceptance' : 'Terms accepted', active: Boolean(deal.awaitingViewer || state) },
    { label: 'Escrow funded', active: state === 'Funded' || state === 'ReleasePending' || state === 'Released' },
    { label: 'Documents checked', active: state === 'ReleasePending' || state === 'Released' },
    { label: 'Settlement complete', active: state === 'Released' },
  ];
}
