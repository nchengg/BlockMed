'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth/useSession';
import { fetchDeals, fetchSummary, type DealListItem, type DealSummary } from '@/lib/escrow/client';

const usdcFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function DashboardTab({ onOpenDeals }: { onOpenDeals: () => void }) {
  const { account } = useSession();
  const accountId = account?.id;
  const [summary, setSummary] = useState<DealSummary | null>(null);
  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [loadedForAccountId, setLoadedForAccountId] = useState<string | undefined>(undefined);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextSummary, nextDeals] = await Promise.all([
        fetchSummary(accountId),
        fetchDeals(accountId),
      ]);
      if (nextSummary.ok === false || nextDeals.ok === false) {
        throw new Error('The dashboard service returned an error.');
      }
      setSummary(nextSummary);
      setDeals(nextDeals.deals ?? []);
      setLoadedForAccountId(accountId);
      setLoadError(null);
      setLoadState('ready');
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Could not load dashboard data.');
      setLoadState('error');
    }
  }, [accountId]);

  useEffect(() => {
    const initial = setTimeout(() => { void refresh(); }, 0);
    const id = setInterval(() => { void refresh(); }, 4000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [refresh]);

  const initialLoad = summary === null || loadedForAccountId !== accountId;
  const demoMode = !initialLoad && deals.length === 0;
  const visibleDeals = useMemo(
    () => (demoMode ? demoDashboardDeals(account?.companyName ?? 'Demo Trading Co') : deals),
    [account?.companyName, deals, demoMode],
  );
  const attentionDeals = useMemo(
    () => visibleDeals.filter(dealNeedsAttention).slice(0, 3),
    [visibleDeals],
  );
  const liveDeal = attentionDeals[0] ?? visibleDeals[0] ?? null;

  if (initialLoad && loadState === 'error') {
    return (
      <>
        <DashboardHeading companyName={account?.companyName} onOpenDeals={onOpenDeals} />
        <DashboardLoadError message={loadError} onRetry={() => { setLoadState('loading'); void refresh(); }} />
      </>
    );
  }

  if (initialLoad || !summary) {
    return (
      <>
        <DashboardHeading companyName={account?.companyName} onOpenDeals={onOpenDeals} />
        <DashboardDataLoading />
      </>
    );
  }

  const metrics = dashboardMetrics(summary, visibleDeals, demoMode);

  return (
    <>
      <DashboardHeading companyName={account?.companyName} onOpenDeals={onOpenDeals} preview={demoMode} />

      {loadState === 'error' && (
        <div className="bm-notice bm-notice-warning" role="status" style={{ marginBottom: 18 }}>
          Live data could not be refreshed. The last successful snapshot is still shown.
          <button type="button" className="bm-link-button" onClick={() => { void refresh(); }}>Retry</button>
        </div>
      )}

      {demoMode && (
        <div className="bm-preview-banner" role="note">
          <div>
            <strong>Example portfolio</strong>
            <p>No live deals exist for this company yet, so the dashboard is showing clearly labelled sample data.</p>
          </div>
          <button type="button" className="bm-button" onClick={onOpenDeals}>Create a live deal</button>
        </div>
      )}

      {/* Name the chain rather than assuming localhost: the app can be pointed at
          Base Sepolia, where "local chain not connected" would be simply wrong. */}
      {!summary.chainOk ? (
        <div className="bm-notice" style={{ marginBottom: 18 }}>
          {summary.network
            ? `Cannot reach ${summary.network.label}. Deal records still load, but on-chain totals are unavailable.`
            : 'No chain connected. Deal records still load, but on-chain totals are unavailable. Start the Hardhat node, or set ESCROW_NETWORK to a deployed network.'}
        </div>
      ) : summary.network && summary.network.chainId !== 31337 && (
        <div className="bm-notice" style={{ marginBottom: 18 }}>
          Live on <strong>{summary.network.label}</strong> with{' '}
          {summary.network.realToken ? 'real USDC' : 'a test token'} —{' '}
          {summary.network.explorer ? (
            <a
              href={`${summary.network.explorer}/address/${summary.network.escrow}`}
              target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)' }}
            >view the escrow contract</a>
          ) : (
            <code>{summary.network.escrow}</code>
          )}.
        </div>
      )}

      <div className="bm-grid-stats">
        {metrics.map(metric => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="bm-dashboard-focus-grid">
        <section className="bm-card">
          <div className="bm-section-head">
            <h2 className="bm-section-title">Attention needed</h2>
            <span className={attentionDeals.length ? 'bm-status bm-status-warning' : 'bm-status bm-status-success'}>
              {attentionDeals.length ? `${attentionDeals.length} open` : 'Clear'}
            </span>
          </div>

          {attentionDeals.length === 0 ? (
            <p className="bm-body">No deal is waiting on your company right now.</p>
          ) : (
            <div className="bm-attention-list">
              {attentionDeals.map(deal => (
                <DealSummaryRow key={deal.dealId} deal={deal} demo={demoMode} />
              ))}
            </div>
          )}
        </section>

        <section className="bm-card">
          <div className="bm-section-head">
            <h2 className="bm-section-title">Live deal state</h2>
            {liveDeal && <span className={stateClass(liveDeal.state)}>{stateLabel(liveDeal.state)}</span>}
          </div>

          {!liveDeal ? (
            <p className="bm-body">Create a deal to track document and release readiness.</p>
          ) : (
            <div>
              <div className="bm-deal-row-title">{liveDeal.terms?.goods ?? 'Trade deal'}</div>
              <p className="bm-body" style={{ marginTop: 6 }}>
                {liveDeal.counterparty} - {formatUsdc(liveDeal.terms?.amountUsdc)} USDC
              </p>
              <div className="bm-progress" style={{ marginTop: 14 }}>
                <div style={{ width: `${dealProgress(liveDeal)}%` }} />
              </div>
              <div className="bm-demo-step-list">
                {dealSteps(liveDeal).map(step => (
                  <div key={step.label} className="bm-demo-step">
                    <span className={step.active ? 'bm-demo-dot bm-demo-dot-current' : 'bm-demo-dot'} />
                    <div>
                      <div className="bm-demo-step-title">{step.label}</div>
                      <p className="bm-body">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="bm-card bm-dashboard-table-card">
        <div className="bm-section-head">
          <div>
            <h2 className="bm-section-title">Active deals</h2>
            <p className="bm-body" style={{ marginTop: 4 }}>
              {demoMode ? 'Example deals are shown until this company has live backend deals.' : 'Live backend deals for this company.'}
            </p>
          </div>
          {demoMode ? <span className="bm-status bm-status-info">Example</span> : <button type="button" className="bm-button" onClick={onOpenDeals}>View all</button>}
        </div>

        <div className="bm-clean-table">
          <div className="bm-clean-table-head">
            <span>Deal</span>
            <span>Counterparty</span>
            <span>Escrow</span>
            <span>Documents</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {visibleDeals.map(deal => (
            <DealTableRow key={deal.dealId} deal={deal} demo={demoMode} />
          ))}
        </div>
      </section>
    </>
  );
}

function DashboardHeading({
  companyName,
  onOpenDeals,
  preview = false,
}: {
  companyName?: string;
  onOpenDeals: () => void;
  preview?: boolean;
}) {
  return (
    <div className="bm-page-head bm-welcome-head">
      <div>
        <div className="bm-kicker">
          Trade escrow control {preview && <span className="bm-status bm-status-info">Preview</span>}
        </div>
        <h1 className="bm-title">Welcome back{companyName ? `, ${shortCompanyName(companyName)}` : ''}.</h1>
        <p className="bm-subtitle">
          Review active trade deals, document gates, and release readiness.
        </p>
      </div>
      <div className="bm-actions">
        <button type="button" className="bm-button bm-button-primary" onClick={onOpenDeals}>
          New escrow
        </button>
      </div>
    </div>
  );
}

function DashboardDataLoading() {
  return (
    <div className="bm-loading-state" role="status" aria-live="polite">
      <div className="bm-grid-stats bm-loading-grid">
        {[0, 1, 2, 3].map(item => <div key={item} className="bm-card bm-loading-card bm-skeleton" />)}
      </div>
      <span className="bm-visually-hidden">Loading dashboard data</span>
    </div>
  );
}

function DashboardLoadError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <section className="bm-card bm-empty-state" role="alert">
      <div className="bm-empty-state-icon" aria-hidden="true">!</div>
      <h2 className="bm-section-title">Dashboard data is unavailable</h2>
      <p className="bm-body">{message ?? 'Check the local app services, then try again.'}</p>
      <button type="button" className="bm-button bm-button-primary" onClick={onRetry}>Try again</button>
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <section className="bm-card bm-metric-card">
      <div className="bm-stat-label">{label}</div>
      <div className={accent ? 'bm-stat-value bm-stat-value-accent' : 'bm-stat-value'}>{value}</div>
      <div className="bm-stat-note">{note}</div>
    </section>
  );
}

function DealSummaryRow({ deal, demo }: { deal: DealListItem; demo: boolean }) {
  const href = demo ? undefined : `/dashboard/deals/${encodeURIComponent(deal.dealId)}`;
  const content = (
    <div className="bm-attention-row">
      <div>
        <div className="bm-deal-row-title">
          {deal.terms?.goods ?? 'Trade deal'} {demo && <span className="bm-status bm-status-info">Example</span>}
        </div>
        <div className="bm-deal-row-meta">{deal.counterparty} - {nextActionLabel(deal)}</div>
      </div>
      <div className="bm-attention-row-side">
        <span className="bm-mono">{formatUsdc(deal.terms?.amountUsdc)} USDC</span>
        <span className={stateClass(deal.state)}>{stateLabel(deal.state)}</span>
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
}

function DealTableRow({ deal, demo }: { deal: DealListItem; demo: boolean }) {
  const href = demo ? undefined : `/dashboard/deals/${encodeURIComponent(deal.dealId)}`;
  const content = (
    <div className="bm-clean-table-row">
      <span>
        <strong>
          {deal.terms?.goods ?? 'Trade deal'} {demo && <span className="bm-status bm-status-info">Example</span>}
        </strong>
        <small>{deal.dealId}</small>
      </span>
      <span>{deal.counterparty}</span>
      <span className="bm-mono">{formatUsdc(deal.terms?.amountUsdc)} USDC</span>
      <span>{documentCount(deal)}</span>
      <span><span className={stateClass(deal.state)}>{stateLabel(deal.state)}</span></span>
      <span className="bm-link">{demo ? nextActionLabel(deal) : 'Open'}</span>
    </div>
  );

  if (!href) return content;
  return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
}

function dashboardMetrics(summary: DealSummary, deals: DealListItem[], demo: boolean) {
  if (!demo) {
    return [
      { label: 'Escrow locked', value: `${formatUsdc(summary.money.locked)} USDC`, note: 'Held by funded deals', accent: true },
      { label: 'Awaiting funding', value: `${formatUsdc(summary.money.awaitingFunding)} USDC`, note: 'Accepted deals not funded' },
      { label: 'Document reviews', value: String(deals.filter(deal => deal.review).length), note: 'Open review windows' },
      { label: 'Needs attention', value: String(summary.counts.needsYou), note: summary.counts.needsYou ? 'Actions ready' : 'No action needed' },
    ];
  }

  const locked = deals
    .filter(deal => deal.state === 'Funded' || deal.state === 'ReleasePending')
    .reduce((sum, deal) => sum + Number(deal.terms?.amountUsdc ?? 0), 0);
  const releaseReady = deals
    .filter(deal => deal.state === 'ReleasePending')
    .reduce((sum, deal) => sum + Number(deal.terms?.amountUsdc ?? 0), 0);

  return [
    { label: 'Escrow locked', value: `${formatUsdc(locked)} USDC`, note: 'Across demo deals', accent: true },
    { label: 'Release ready', value: `${formatUsdc(releaseReady)} USDC`, note: 'One deal cleared' },
    { label: 'Document reviews', value: '7', note: 'Three need buyer action' },
    { label: 'Blocked releases', value: '2', note: 'Missing document checks' },
  ];
}

function demoDashboardDeals(companyName: string): DealListItem[] {
  return [
    {
      dealId: 'DEMO-IZMIR-TEXTILES',
      onChainDealId: null,
      role: 'buyer',
      counterparty: 'Ege Weave Ltd',
      terms: {
        goods: 'Izmir textile shipment, 1x40ft',
        amountUsdc: '42000.00',
        sellerName: 'Ege Weave Ltd',
        buyerName: companyName,
        shipmentDeadline: '2026-08-27',
      },
      state: 'Funded',
      awaitingViewer: false,
      review: null,
      audit: [],
      createdAt: new Date().toISOString(),
    },
    {
      dealId: 'DEMO-SHENZHEN-ELECTRONICS',
      onChainDealId: null,
      role: 'seller',
      counterparty: 'Northline Retail Ltd',
      terms: {
        goods: 'Shenzhen electronics batch',
        amountUsdc: '68500.00',
        sellerName: companyName,
        buyerName: 'Northline Retail Ltd',
        shipmentDeadline: '2026-09-07',
      },
      state: 'ReleasePending',
      awaitingViewer: false,
      review: null,
      audit: [],
      createdAt: new Date().toISOString(),
    },
    {
      dealId: 'DEMO-COLOMBIA-COFFEE',
      onChainDealId: null,
      role: 'seller',
      counterparty: 'BridgeTrade Co',
      terms: {
        goods: 'Colombia coffee containers',
        amountUsdc: '31800.00',
        sellerName: companyName,
        buyerName: 'BridgeTrade Co',
        shipmentDeadline: '2026-09-03',
      },
      state: 'Agreed',
      awaitingViewer: false,
      review: null,
      audit: [],
      createdAt: new Date().toISOString(),
    },
  ];
}

function formatUsdc(value: string | number | null | undefined): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value ? String(value) : '0.00';
  return usdcFormatter.format(amount);
}

function shortCompanyName(companyName: string): string {
  return companyName.replace(/\s+(Ltd|Limited|Co|Company|Demo)$/i, '');
}

function dealNeedsAttention(deal: DealListItem): boolean {
  return Boolean(
    deal.awaitingViewer ||
    (deal.state === 'Agreed' && deal.role === 'buyer') ||
    deal.state === 'Funded' ||
    deal.state === 'ReleasePending',
  );
}

function nextActionLabel(deal: DealListItem): string {
  if (deal.awaitingViewer) return 'Review terms';
  if (deal.state === 'Agreed' && deal.role === 'buyer') return 'Fund escrow';
  if (deal.state === 'Agreed' && deal.role === 'seller') return 'Await funding';
  if (deal.state === 'Funded' && deal.role === 'seller') return 'Submit documents';
  if (deal.state === 'Funded' && deal.role === 'buyer') return deal.review ? 'Review documents' : 'Await documents';
  if (deal.state === 'ReleasePending') return 'Release funds';
  if (deal.state === 'Released') return 'Settled';
  if (deal.state === 'Refunded') return 'Refunded';
  if (deal.state === 'Declined') return 'Declined';
  return 'Open deal';
}

function documentCount(deal: DealListItem): string {
  if (deal.state === 'ReleasePending') return '4 of 5';
  if (deal.state === 'Funded') return '3 of 4';
  if (deal.state === 'Agreed') return '0 of 4';
  if (deal.review) return 'In review';
  return 'Pending';
}

function dealProgress(deal: DealListItem): number {
  if (deal.state === 'ReleasePending') return 86;
  if (deal.state === 'Funded') return 62;
  if (deal.state === 'Agreed') return 34;
  if (deal.state === 'Released') return 100;
  return 18;
}

function dealSteps(deal: DealListItem): Array<{ label: string; note: string; active?: boolean }> {
  return [
    { label: 'Terms agreed', note: 'Buyer and seller accepted the trade terms.' },
    { label: 'Escrow funded', note: deal.state === 'Agreed' ? 'Buyer funding is still pending.' : 'Funds are locked for this deal.' },
    { label: 'Documents checked', note: deal.state === 'ReleasePending' ? 'Documents passed release checks.' : 'Document review is still in progress.', active: deal.state === 'Funded' },
    { label: 'Release decision', note: nextActionLabel(deal), active: deal.state === 'ReleasePending' },
  ];
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
