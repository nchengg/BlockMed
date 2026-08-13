'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/useSession';
import { previewDocuments, savePreviewDocumentStatus, type PreviewDocument, type PreviewDocumentStatus } from '@/lib/preview/documents';
import {
  actorFromSession,
  createDeal,
  fetchCompanies,
  fetchDeals,
  resetMyDeals,
  type DealListItem,
  type TradingCompany,
} from '@/lib/escrow/client';
import type { DealRole } from '@/lib/escrow/roles';
import { DealActions } from './DealActions';
import { runDealAction, type DealAction } from './dealActionRunner';

const plusDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const usdcFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatUsdc(value: string | number | null | undefined): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value ? String(value) : '-';
  return usdcFormatter.format(amount);
}

export function DealsTab({ dealBasePath = '/dashboard/deals' }: { dealBasePath?: string }) {
  const { account, isUiPreview, uiPreviewRole } = useSession();
  const accountId = account?.id;
  const actor = actorFromSession(account);
  const [deals, setDeals] = useState<DealListItem[] | null>(null);
  const [companies, setCompanies] = useState<TradingCompany[]>([]);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demoDeals = demoDealRows(account?.companyName ?? 'Demo Trading Co');

  const refreshBackendDeals = async () => {
    if (isUiPreview) {
      setDeals([]);
      return;
    }
    try {
      const r = await fetchDeals(accountId);
      setDeals(r.deals ?? []);
    } catch {
      setDeals([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (isUiPreview) {
        setDeals([]);
        return;
      }
      try {
        const r = await fetchDeals(accountId);
        setDeals(r.deals ?? []);
      } catch {
        setDeals([]);
      }
    };
    const initial = setTimeout(() => { void load(); }, 0);
    if (busy || creating) return () => clearTimeout(initial);
    const id = setInterval(() => { void load(); }, 4000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [accountId, busy, creating, isUiPreview]);

  useEffect(() => {
    if (isUiPreview) {
      return;
    }
    void fetchCompanies(account?.id)
      .then(r => setCompanies(r.companies ?? []))
      .catch(() => setCompanies([]));
  }, [account?.id, isUiPreview]);

  const submit = async (input: Parameters<typeof createDeal>[0]) => {
    setBusy(true);
    setError(null);
    try {
      const r = await createDeal(input, actor);
      if (r.ok === false) {
        setError(r.error ?? 'Could not create the deal.');
        return;
      }
      setCreating(false);
      await refreshBackendDeals();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const action = async (deal: DealListItem, dealAction: DealAction) => {
    setBusy(true);
    setError(null);
    try {
      const r = await runDealAction(deal.dealId, dealAction, actor);
      if (r.ok === false) {
        setError(r.error ?? 'Action failed.');
      } else if (r.verdict === 'Discrepant') {
        const failed = (r.rules ?? []).filter(x => !x.pass).map(x => x.rule).join('; ');
        setError(`Discrepant. The documents do not match the agreed terms. ${failed}`);
      }
      await refreshBackendDeals();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="bm-page-head">
        <div>
          <div className="bm-kicker">Trade deals</div>
          <h1 className="bm-title">Deals</h1>
          <p className="bm-subtitle">
            Create escrow terms, track counterparty actions, and open each deal record.
          </p>
        </div>
        {!creating && !isUiPreview && (
          <button
            type="button"
            className="bm-button bm-button-primary"
            onClick={() => { setCreating(true); setError(null); }}
          >
            Create new deal
          </button>
        )}
      </div>

      {error && <div className="bm-alert" style={{ marginBottom: 16 }}>{error}</div>}

      {creating && (
        <CreateDealForm
          busy={busy}
          creatorName={account?.companyName ?? 'You'}
          companies={companies}
          onCancel={() => setCreating(false)}
          onSubmit={submit}
        />
      )}

      {deals === null ? (
        <p className="bm-body">Loading deals.</p>
      ) : deals.length === 0 ? (
        !creating && <DemoDealsWorkspace deals={demoDeals} previewRole={isUiPreview ? uiPreviewRole : null} />
      ) : (
        <div className="bm-demo-shell">
          <section>
            <div className="bm-section-head">
              <div>
                <div className="bm-kicker">Live deals</div>
                <h2 className="bm-section-title" style={{ marginTop: 8 }}>Your company deals</h2>
              </div>
              <span className="bm-status">{deals.length} live</span>
            </div>
            <div className="bm-row-list">
              {deals.map(deal => (
                <DealRow
                  key={deal.dealId}
                  deal={deal}
                  busy={busy}
                  dealBasePath={dealBasePath}
                  demoOnly={false}
                  onAction={dealAction => { void action(deal, dealAction); }}
                />
              ))}
            </div>
          </section>
          <DemoDealsWorkspace deals={demoDeals} previewRole={isUiPreview ? uiPreviewRole : null} />
        </div>
      )}

      {deals && deals.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {confirmReset ? (
            <div className="bm-alert">
              <div style={{ marginBottom: 12 }}>
                Clear all {deals.length} deals for this company? This removes off-chain demo records.
              </div>
              <div className="bm-actions">
                <button
                  type="button"
                  className="bm-button bm-button-danger"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    try {
                      const r = await resetMyDeals(actor);
                      if (r.ok === false) setError(r.error ?? 'Could not clear your deals.');
                      else await refreshBackendDeals();
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                      setConfirmReset(false);
                    }
                  }}
              >
                  {busy ? 'Clearing' : 'Yes, clear them'}
                </button>
                <button type="button" className="bm-button" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="bm-button" onClick={() => setConfirmReset(true)}>
              Clear my deals
            </button>
          )}
        </div>
      )}
    </>
  );
}

function DemoDealsWorkspace({ deals, previewRole }: { deals: DealListItem[]; previewRole: 'buyer' | 'seller' | 'platform' | null }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? deals.find(deal => deal.dealId === selectedId) ?? null : null;

  const totalEscrow = deals
    .reduce((sum, deal) => sum + Number(deal.terms?.amountUsdc ?? 0), 0);
  const releaseReady = deals
    .filter(deal => deal.state === 'ReleasePending')
    .reduce((sum, deal) => sum + Number(deal.terms?.amountUsdc ?? 0), 0);
  const docsInReview = deals.flatMap(deal => previewDocuments(deal.dealId)).filter(document => document.status !== 'Received').length;
  const blockedRules = deals
    .flatMap(deal => demoRules(deal.dealId))
    .filter(rule => rule.status === 'Blocked').length;

  if (!selected) {
    return (
      <DemoDealsOverview
        deals={deals}
        totalEscrow={totalEscrow}
        releaseReady={releaseReady}
        docsInReview={docsInReview}
        blockedRules={blockedRules}
        onOpenDeal={setSelectedId}
      />
    );
  }

  const progress = demoProgress(selected);
  const selectedRules = demoRules(selected.dealId);
  const selectedTimeline = demoTimeline(selected.dealId);
  const selectedAudit = demoAudit(selected.dealId);

  return (
    <div className="bm-demo-shell">
      <section className="bm-card bm-demo-hero">
        <div className="bm-demo-hero-main">
          <div className="bm-demo-hero-top">
            <div>
              <div className="bm-kicker">Current assignment</div>
              <h2 className="bm-demo-hero-title">{selected.terms?.goods ?? 'Selected deal'}</h2>
            </div>
            <div className="bm-actions">
              <button type="button" className="bm-button" onClick={() => setSelectedId(null)}>
                Back to deals
              </button>
              <span className="bm-status bm-status-info">Example</span>
            </div>
          </div>
          <p className="bm-demo-hero-copy">{progress.label}</p>
          <div className="bm-demo-hero-meta">
            <Detail label="Counterparty" value={selected.counterparty} />
            <Detail label="Your role" value={selected.role ?? '-'} />
            <Detail label="Value" value={`${formatUsdc(selected.terms?.amountUsdc)} USDC`} mono />
            <Detail label="Ship by" value={selected.terms?.shipmentDeadline ?? '-'} mono />
          </div>
          <div className="bm-demo-metrics">
            <DemoStat label="Escrow value" value={`${formatUsdc(totalEscrow)} USDC`} note="Loaded demo portfolio" />
            <DemoStat label="Release ready" value={`${formatUsdc(releaseReady)} USDC`} note="Ready for approval" accent />
            <DemoStat label="Documents active" value={String(docsInReview)} note="Pending review" />
            <DemoStat label="Blocked rules" value={String(blockedRules)} note="Needs action" />
          </div>
        </div>

        <aside className="bm-demo-readiness">
          <div className="bm-section-head">
            <div>
              <div className="bm-kicker">Release readiness</div>
              <div className="bm-section-title" style={{ marginTop: 8 }}>{progress.phase}</div>
            </div>
            <span className="bm-mono bm-muted" style={{ fontSize: 12 }}>{progress.percent}%</span>
          </div>
          <div className="bm-progress">
            <div style={{ width: `${progress.percent}%` }} />
          </div>
          <div className="bm-demo-step-list">
            {selectedTimeline.map((item, index) => (
              <div key={item.label} className="bm-demo-step">
                <span className={index === selectedTimeline.length - 1 ? 'bm-demo-dot bm-demo-dot-current' : 'bm-demo-dot'} />
                <div>
                  <div className="bm-demo-step-title">{item.label}</div>
                  <p className="bm-body">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="bm-card">
        <div className="bm-section-head">
          <div>
            <div className="bm-kicker">Selected deal record</div>
            <h2 className="bm-section-title" style={{ marginTop: 8 }}>{selected.terms?.goods}</h2>
          </div>
          <span className={stateClass(selected.state)}>{stateLabel(selected.state)}</span>
        </div>
        <div className="bm-demo-record-grid">
          <div>
            <div className="bm-demo-record-title">Documents</div>
            <div className="bm-demo-compact-list">
              <PreviewDocumentChecklist key={selected.dealId} dealId={selected.dealId} previewRole={previewRole} />
            </div>
          </div>

          <div>
            <div className="bm-demo-record-title">Rules</div>
            <div className="bm-demo-compact-list">
              {selectedRules.map(rule => (
                <div key={rule.name} className="bm-demo-compact-row">
                  <div>
                    <strong>{rule.name}</strong>
                    <small>{rule.note}</small>
                  </div>
                  <span className={demoStatusClass(rule.status)}>{rule.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bm-demo-record-title">Timeline</div>
            <div className="bm-demo-compact-list">
              {selectedTimeline.map(item => (
                <div key={item.label} className="bm-demo-compact-row">
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.date} | {item.note}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bm-demo-record-title">Audit</div>
            <div className="bm-demo-compact-list">
              {selectedAudit.map(item => (
                <div key={`${item.actor}-${item.action}`} className="bm-demo-compact-row">
                  <div>
                    <strong>{item.action}</strong>
                    <small>{item.actor} | {item.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DemoDealsOverview({
  deals,
  totalEscrow,
  releaseReady,
  docsInReview,
  blockedRules,
  onOpenDeal,
}: {
  deals: DealListItem[];
  totalEscrow: number;
  releaseReady: number;
  docsInReview: number;
  blockedRules: number;
  onOpenDeal: (dealId: string) => void;
}) {
  return (
    <div className="bm-demo-shell">
      <section className="bm-card bm-demo-index">
        <div className="bm-section-head">
          <div>
            <div className="bm-kicker">Deals</div>
            <h2 className="bm-demo-index-title">Demo trade pipeline</h2>
            <p className="bm-body" style={{ marginTop: 8 }}>
              Select a deal to open documents, release status, timeline, and audit history.
            </p>
          </div>
          <span className="bm-status">{deals.length} active</span>
        </div>

        <div className="bm-demo-index-metrics">
          <DemoStat label="Escrow value" value={`${formatUsdc(totalEscrow)} USDC`} note="Loaded demo portfolio" />
          <DemoStat label="Release ready" value={`${formatUsdc(releaseReady)} USDC`} note="Ready for approval" accent />
          <DemoStat label="Documents active" value={String(docsInReview)} note="Pending review" />
          <DemoStat label="Blocked rules" value={String(blockedRules)} note="Needs action" />
        </div>

        <div className="bm-demo-table">
          <div className="bm-demo-table-head">
            <span>Deal</span>
            <span>Counterparty</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {deals.map(deal => (
            <button
              key={deal.dealId}
              type="button"
              className="bm-demo-table-row"
              onClick={() => onOpenDeal(deal.dealId)}
            >
              <span>
                <strong>
                  {deal.terms?.goods}
                  <span className="bm-status bm-status-info" style={{ marginLeft: 8 }}>Example</span>
                </strong>
                <small>{deal.dealId}</small>
              </span>
              <span>{deal.counterparty}</span>
              <span className="bm-mono">{formatUsdc(deal.terms?.amountUsdc)} USDC</span>
              <span><span className={stateClass(deal.state)}>{stateLabel(deal.state)}</span></span>
              <span><span className={dealNeedsAttention(deal) ? 'bm-status bm-status-warning' : 'bm-status'}>{nextActionLabel(deal)}</span></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function DemoStat({
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
    <div className="bm-demo-metric">
      <div className="bm-stat-label">{label}</div>
      <div className={accent ? 'bm-stat-value bm-stat-value-accent' : 'bm-stat-value'}>{value}</div>
      <div className="bm-stat-note">{note}</div>
    </div>
  );
}

function DealRow({
  deal,
  busy,
  dealBasePath,
  demoOnly,
  onAction,
}: {
  deal: DealListItem;
  busy: boolean;
  dealBasePath: string;
  demoOnly: boolean;
  onAction: (action: DealAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const needsAction = dealNeedsAttention(deal);

  return (
    <article className="bm-deal-row" data-needs-action={needsAction}>
      <button type="button" className="bm-deal-row-button" onClick={() => setOpen(o => !o)}>
        <div className="bm-deal-row-main">
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="bm-deal-row-title">{deal.terms?.goods ?? 'Trade deal'}</span>
              <span className="bm-status bm-status-info">You: {deal.role ?? 'pending'}</span>
            </div>
            <div className="bm-deal-row-meta">
              with {deal.counterparty}
              {deal.terms?.shipmentDeadline ? ` - ship by ${deal.terms.shipmentDeadline}` : ''}
            </div>
            <div className="bm-mono bm-muted" style={{ marginTop: 5, fontSize: 11 }}>
              {deal.dealId}
            </div>
          </div>

          <div className="bm-mono" style={{ fontSize: 17, fontWeight: 800 }}>
            {formatUsdc(deal.terms?.amountUsdc)} <span className="bm-muted" style={{ fontSize: 12 }}>USDC</span>
          </div>

          <span className={stateClass(deal.state)}>{stateLabel(deal.state)}</span>
          <span className={needsAction ? 'bm-status bm-status-warning' : 'bm-status'}>
            {nextActionLabel(deal)}
          </span>
          <span className="bm-muted" style={{ width: 16, textAlign: 'center' }}>
            {open ? 'v' : '>'}
          </span>
        </div>
      </button>

      {open && (
        <div className="bm-panel-open">
          {demoOnly ? (
            <DemoDealPreview deal={deal} />
          ) : (
            <>
              <RowActions deal={deal} busy={busy} onAction={onAction} />
              <Link
                href={`${dealBasePath}/${encodeURIComponent(deal.dealId)}`}
                className="bm-link"
                style={{ display: 'inline-block', marginTop: 18, fontSize: 13 }}
              >
                View full deal
              </Link>
            </>
          )}
        </div>
      )}
    </article>
  );
}

function RowActions({
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
        <div className="bm-kicker" style={{ marginBottom: 12 }}>Review proposed terms</div>
        <div className="bm-detail-grid" style={{ marginBottom: 14 }}>
          <Detail label="Goods" value={deal.terms?.goods ?? '-'} />
          <Detail label="Amount" value={`${formatUsdc(deal.terms?.amountUsdc)} USDC`} mono />
          <Detail label="Seller" value={deal.terms?.sellerName ?? '-'} />
          <Detail label="Buyer" value={deal.terms?.buyerName ?? '-'} />
          <Detail label="Ship by" value={deal.terms?.shipmentDeadline ?? '-'} mono />
        </div>
        <p className="bm-body" style={{ marginBottom: 14 }}>
          {deal.counterparty} proposed these terms. Accepting registers the deal on-chain and
          binds both sides to the document rulebook.
        </p>
        <div className="bm-actions">
          <button
            type="button"
            className="bm-button bm-button-primary"
            disabled={busy}
            onClick={() => onAction('accept')}
          >
            {busy ? 'Working' : 'Accept and register'}
          </button>
          <button
            type="button"
            className="bm-button bm-button-danger"
            disabled={busy}
            onClick={() => onAction('decline')}
          >
            Decline
          </button>
        </div>
      </>
    );
  }

  if (deal.state === 'Agreed' && deal.role === 'buyer') {
    return (
      <>
        <div className="bm-kicker" style={{ marginBottom: 10 }}>Ready to fund</div>
        <p className="bm-body" style={{ marginBottom: 14 }}>
          Both sides accepted the terms. Lock {formatUsdc(deal.terms?.amountUsdc)} USDC so the
          seller can ship with funds held in escrow.
        </p>
        <button
          type="button"
          className="bm-button bm-button-primary"
          disabled={busy}
          onClick={() => onAction('fund')}
        >
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

function CreateDealForm({
  busy,
  creatorName,
  companies,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  creatorName: string;
  companies: TradingCompany[];
  onCancel: () => void;
  onSubmit: (input: {
    creatorRole: DealRole;
    counterpartyAccountId: string;
    goods: string;
    amountUsdc: string;
    shipmentDeadline: string;
    sellerName: string;
    buyerName: string;
    portOfLoading?: string;
    portOfDischarge?: string;
    incoterm?: string;
  }) => void;
}) {
  const [role, setRole] = useState<DealRole>('seller');
  const [counterpartyAccountId, setCounterpartyAccountId] = useState('');
  const [goods, setGoods] = useState('');
  const [amountUsdc, setAmountUsdc] = useState('');
  const [shipmentDeadline, setShipmentDeadline] = useState(plusDays(30));
  // Optional: agreeing the route and Incoterm here lets the document checks
  // grade ports and freight payment against the terms, not just cross-document.
  const [portOfLoading, setPortOfLoading] = useState('');
  const [portOfDischarge, setPortOfDischarge] = useState('');
  const [incoterm, setIncoterm] = useState('');

  const counterpartyName =
    companies.find(c => c.accountId === counterpartyAccountId)?.displayName ?? '';

  const submit = () => onSubmit({
    creatorRole: role,
    counterpartyAccountId,
    goods,
    amountUsdc,
    shipmentDeadline,
    sellerName: role === 'seller' ? creatorName : counterpartyName,
    buyerName: role === 'buyer' ? creatorName : counterpartyName,
    portOfLoading,
    portOfDischarge,
    incoterm,
  });

  return (
    <section className="bm-card" style={{ marginBottom: 20 }}>
      <div className="bm-section-head">
        <div>
          <div className="bm-kicker">Create new deal</div>
          <h2 className="bm-section-title" style={{ marginTop: 8 }}>Set the documentary escrow terms</h2>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <span className="bm-body" style={{ display: 'block', marginBottom: 8 }}>
          On this deal, I am the
        </span>
        <div className="bm-grid-mini">
          {(['seller', 'buyer'] as DealRole[]).map(nextRole => {
            const active = nextRole === role;
            return (
              <button
                key={nextRole}
                type="button"
                className={active ? 'bm-button bm-button-primary' : 'bm-button'}
                onClick={() => setRole(nextRole)}
                style={{ textTransform: 'capitalize' }}
              >
                {nextRole}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bm-field-grid">
        <label className="bm-field">
          <span>{role === 'seller' ? 'Buyer counterparty' : 'Seller counterparty'}</span>
          <select
            className="bm-input"
            value={counterpartyAccountId}
            onChange={e => setCounterpartyAccountId(e.target.value)}
          >
            <option value="">Select a company</option>
            {companies.map(c => (
              <option key={c.accountId} value={c.accountId}>{c.displayName}</option>
            ))}
          </select>
        </label>
        <Field label="Goods" value={goods} placeholder="Cotton textiles, 1x40ft" onChange={e => setGoods(e.target.value)} />
        <Field label="Amount (USDC)" value={amountUsdc} placeholder="2500.00" onChange={e => setAmountUsdc(e.target.value)} />
        <Field label="Shipment deadline" type="date" value={shipmentDeadline} onChange={e => setShipmentDeadline(e.target.value)} />
        <Field label="Port of loading (optional)" value={portOfLoading} placeholder="Jebel Ali, AE" onChange={e => setPortOfLoading(e.target.value)} />
        <Field label="Port of discharge (optional)" value={portOfDischarge} placeholder="Felixstowe, GB" onChange={e => setPortOfDischarge(e.target.value)} />
        <Field label="Incoterm (optional)" value={incoterm} placeholder="CIF" onChange={e => setIncoterm(e.target.value)} />
      </div>

      <p className="bm-body" style={{ marginTop: 14 }}>
        You are {creatorName}, the {role} on this deal. The counterparty sees the proposal in
        their dashboard and accepts before anything is registered on-chain.
      </p>

      <div className="bm-actions" style={{ marginTop: 18 }}>
        <button type="button" className="bm-button bm-button-primary" disabled={busy} onClick={submit}>
          {busy ? 'Creating' : 'Create deal'}
        </button>
        <button type="button" className="bm-button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="bm-stat-label">{label}</div>
      <div className={mono ? 'bm-mono' : undefined} style={{ marginTop: 4, color: 'var(--text-primary)', fontSize: 14 }}>
        {value}
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="bm-field">
      <span>{label}</span>
      <input className="bm-input" {...rest} />
    </label>
  );
}

function DemoDealPreview({ deal }: { deal: DealListItem }) {
  return (
    <div>
      <div className="bm-kicker" style={{ marginBottom: 12 }}>Demo preview</div>
      <div className="bm-detail-grid" style={{ marginBottom: 14 }}>
        <Detail label="Goods" value={deal.terms?.goods ?? '-'} />
        <Detail label="Amount" value={`${formatUsdc(deal.terms?.amountUsdc)} USDC`} mono />
        <Detail label="Seller" value={deal.terms?.sellerName ?? '-'} />
        <Detail label="Buyer" value={deal.terms?.buyerName ?? '-'} />
        <Detail label="Ship by" value={deal.terms?.shipmentDeadline ?? '-'} mono />
      </div>
      <p className="bm-body">
        Example deals show trade status, document gates, and next actions. Use Create manually
        for a real backend deal.
      </p>
    </div>
  );
}

type DemoItemStatus = 'Passed' | 'Review' | 'Pending' | 'Missing' | 'Blocked' | 'Ready' | 'Not due';

function PreviewDocumentChecklist({ dealId, previewRole }: { dealId: string; previewRole: 'buyer' | 'seller' | 'platform' | null }) {
  const [documents, setDocuments] = useState<PreviewDocument[]>(() => previewDocuments(dealId));
  const move = (id: string, status: PreviewDocumentStatus) => {
    savePreviewDocumentStatus(dealId, id, status);
    setDocuments(current => current.map(document => document.id === id ? { ...document, status } : document));
  };
  return documents.map(document => {
    const canSend = previewRole === 'seller' && document.status === 'Pending';
    const canReceive = previewRole === 'buyer' && document.status === 'Sent';
    return (
      <div key={document.id} className="bm-demo-compact-row bm-preview-document-row">
        <div>
          <strong>{document.name}</strong>
          <small>{document.status === 'Pending' ? 'Waiting for seller to send.' : document.status === 'Sent' ? 'Sent by seller; awaiting buyer confirmation.' : 'Received by buyer; ready for review.'}</small>
        </div>
        <div className="bm-preview-document-action">
          <span className={previewDocumentStatusClass(document.status)}>{document.status}</span>
          {canSend && <button type="button" className="bm-button" onClick={() => move(document.id, 'Sent')}>Mark sent</button>}
          {canReceive && <button type="button" className="bm-button" onClick={() => move(document.id, 'Received')}>Confirm receipt</button>}
        </div>
      </div>
    );
  });
}

function previewDocumentStatusClass(status: PreviewDocumentStatus): string {
  if (status === 'Received') return 'bm-status bm-status-success';
  if (status === 'Sent') return 'bm-status bm-status-info';
  return 'bm-status bm-status-warning';
}

function demoProgress(deal: DealListItem): { percent: number; phase: string; label: string } {
  if (deal.state === 'ReleasePending') {
    return {
      percent: 88,
      phase: 'Release review',
      label: 'Documents passed the rule check. Buyer approval is the final release step.',
    };
  }
  if (deal.state === 'Funded') {
    return {
      percent: 62,
      phase: 'Documents due',
      label: 'Escrow is funded. The seller is preparing the shipment document pack.',
    };
  }
  if (deal.state === 'Agreed') {
    return {
      percent: 34,
      phase: 'Funding pending',
      label: 'Terms are agreed. Funds need to be locked before shipment starts.',
    };
  }
  return {
    percent: 18,
    phase: 'Proposal',
    label: 'The deal is waiting for both sides to accept the proposed terms.',
  };
}

function demoRules(dealId: string): Array<{
  name: string;
  status: DemoItemStatus;
  note: string;
}> {
  if (dealId.includes('SHENZHEN')) {
    return [
      { name: 'Escrow funded', status: 'Passed', note: '68,500.00 USDC is locked for this shipment.' },
      { name: 'Document match', status: 'Passed', note: 'Invoice, packing list, and bill of lading satisfy the release rules.' },
      { name: 'Buyer approval', status: 'Ready', note: 'The buyer can approve release from this state.' },
    ];
  }
  if (dealId.includes('COLOMBIA')) {
    return [
      { name: 'Terms accepted', status: 'Passed', note: 'Both sides accepted goods, value, and deadline.' },
      { name: 'Escrow funded', status: 'Pending', note: 'Buyer has not locked the 31,800.00 USDC yet.' },
      { name: 'Document match', status: 'Not due', note: 'Documents are checked after escrow funding.' },
    ];
  }
  return [
    { name: 'Escrow funded', status: 'Passed', note: '42,000.00 USDC is locked and visible to the seller.' },
    { name: 'Required documents', status: 'Blocked', note: 'Certificate of origin is missing.' },
    { name: 'Shipment deadline', status: 'Review', note: 'Bill of lading date needs final confirmation.' },
  ];
}

function demoTimeline(dealId: string): Array<{ date: string; label: string; note: string }> {
  if (dealId.includes('SHENZHEN')) {
    return [
      { date: 'Aug 06', label: 'Terms accepted', note: 'Buyer and seller agreed the electronics shipment terms.' },
      { date: 'Aug 07', label: 'Escrow funded', note: 'Buyer locked 68,500.00 USDC.' },
      { date: 'Aug 11', label: 'Documents uploaded', note: 'Seller submitted the invoice, packing list, and bill of lading.' },
      { date: 'Now', label: 'Release pending', note: 'Document checks passed. Funds are waiting for buyer release.' },
    ];
  }
  if (dealId.includes('COLOMBIA')) {
    return [
      { date: 'Aug 06', label: 'Proposal created', note: 'Seller proposed the coffee container deal.' },
      { date: 'Aug 06', label: 'Terms accepted', note: 'Buyer accepted the core terms.' },
      { date: 'Next', label: 'Escrow funding', note: 'Buyer needs to lock funds before shipment.' },
    ];
  }
  return [
    { date: 'Aug 06', label: 'Terms accepted', note: 'Buyer and seller agreed the textile shipment terms.' },
    { date: 'Aug 08', label: 'Escrow funded', note: 'Buyer locked 42,000.00 USDC.' },
    { date: 'Aug 10', label: 'Partial document pack', note: 'Invoice and packing list passed automated checks.' },
    { date: 'Now', label: 'Document follow-up', note: 'Origin certificate and bill of lading review are outstanding.' },
  ];
}

function demoAudit(dealId: string): Array<{ time: string; actor: string; action: string }> {
  if (dealId.includes('SHENZHEN')) {
    return [
      { time: '09:12', actor: 'Northline Retail Ltd', action: 'Funded escrow' },
      { time: '11:45', actor: 'Demo Trading Co', action: 'Uploaded document pack' },
      { time: '11:47', actor: 'Rules engine', action: 'Marked documents as passed' },
      { time: '12:03', actor: 'Escrow contract', action: 'Set release pending' },
    ];
  }
  if (dealId.includes('COLOMBIA')) {
    return [
      { time: '08:32', actor: 'Demo Trading Co', action: 'Created proposal' },
      { time: '09:10', actor: 'BridgeTrade Co', action: 'Accepted terms' },
      { time: '09:11', actor: 'Escrow contract', action: 'Waiting for funding' },
    ];
  }
  return [
    { time: '10:04', actor: 'Ege Weave Ltd', action: 'Accepted terms' },
    { time: '10:29', actor: 'Demo Trading Co', action: 'Funded escrow' },
    { time: '14:18', actor: 'Ege Weave Ltd', action: 'Uploaded invoice and packing list' },
    { time: '14:19', actor: 'Rules engine', action: 'Requested missing certificate' },
  ];
}

function demoStatusClass(status: DemoItemStatus): string {
  if (status === 'Passed' || status === 'Ready') return 'bm-status bm-status-success';
  if (status === 'Review' || status === 'Pending' || status === 'Not due') return 'bm-status bm-status-warning';
  if (status === 'Missing' || status === 'Blocked') return 'bm-status bm-status-danger';
  return 'bm-status';
}

function demoDealRows(companyName: string): DealListItem[] {
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
        shipmentDeadline: plusDays(21),
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
        shipmentDeadline: plusDays(32),
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
        shipmentDeadline: plusDays(28),
      },
      state: 'Agreed',
      awaitingViewer: false,
      review: null,
      audit: [],
      createdAt: new Date().toISOString(),
    },
  ];
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
  if (deal.state === 'Funded' && deal.role === 'seller') return 'Submit B/L';
  if (deal.state === 'Funded' && deal.role === 'buyer') return deal.review ? 'Review documents' : 'Await documents';
  if (deal.state === 'ReleasePending') return 'Release funds';
  if (deal.state === 'Released') return 'Settled';
  if (deal.state === 'Refunded') return 'Refunded';
  if (deal.state === 'Declined') return 'Declined';
  return 'Open deal';
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
