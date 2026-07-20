'use client';
// Live on-chain escrow console — the integration surface between #27's account model
// and the escrow wiring ported from the closed PR #25. Mounted as the "Escrow" tab of
// the client dashboard (DashboardShell). Everything here is ROLE-GATED by the account's
// active hat: the buyer sees agree/fund, the seller sees propose/submit-B/L, the
// platform hat sees the operator view, and release is shown to all (permissionless).
//
// This talks ONLY to app/api/escrow/* (via lib/escrow/client.ts), which drives the
// real local Hardhat chain. It is the genuinely end-to-end piece of this port.
//
// PER-DEAL RECONCILIATION (feat/store-reconciliation) — the console now drives the
// LOGGED-IN ACCOUNT'S ACTIVE DEAL. It reads useDeal() (lib/dealStore), which already
// returns only a deal the current viewer is allowed to see (visibleDealsFor), and
// passes that deal's id to every lifecycle call + the status read. So a buyer acts
// on THEIR active deal, not on one shared global deal — and isolation holds because
// the id we send is always a visible one.
//
// TODO(integration) — the existing buyer/seller wizards (components/buyer/*,
// components/seller/*) still run the MOCK dealStore flow. Wiring those steps to these
// same actions (now that the client takes the active dealId) is the remaining
// integration; seams are marked in Step4ApproveDeposit and Step2UploadDocuments.
// This console is the operator-facing driver in the meantime.
import { useCallback, useEffect, useState } from 'react';
import { useAuth, type ClientHat } from '@/lib/authStore';
import { useDeal, EMPTY_DEAL } from '@/lib/dealStore';
import {
  actorFrom, fetchStatus, propose, agree, fund, submitBol, release, reset,
  type StatusResponse,
} from '@/lib/escrow/client';
import { Card, EyebrowLabel, StatusPill, AddressChip } from './ui';
import type { StatusTone } from './ui';

const STATE_TONE: Record<string, StatusTone> = {
  Draft: 'pending', Agreed: 'accent', Funded: 'accent',
  ReleasePending: 'accent', Released: 'success', Refunded: 'error', Cancelled: 'error',
};

export function EscrowConsole({ hat }: { hat: ClientHat }) {
  const { account, activeHat } = useAuth();
  const actor = actorFrom(account, activeHat);

  // The deal the console acts on = the viewer's ACTIVE, VISIBLE deal (isolation
  // already applied by dealStore). EMPTY_DEAL is the "no visible deal" placeholder.
  const { deal } = useDeal();
  const appDealId = deal.dealId;
  const hasActiveDeal = appDealId !== EMPTY_DEAL.dealId;

  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!hasActiveDeal) { setStatus(null); return; }
    try {
      setStatus(await fetchStatus(appDealId));
    } catch (e) {
      setStatus({ ok: false, error: (e as Error).message });
    }
  }, [appDealId, hasActiveDeal]);

  // Re-read whenever the active deal changes (e.g. the viewer switches deals).
  useEffect(() => { setMsg(null); void refresh(); }, [refresh]);

  // Run a lifecycle action, surface the result, and re-read chain status.
  const run = useCallback(async (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(label); setMsg(null);
    try {
      const r = await fn();
      if (r.ok === false) setMsg({ tone: 'err', text: r.error || 'Action was rejected.' });
      else setMsg({ tone: 'ok', text: `${label} — done.` });
    } catch (e) {
      setMsg({ tone: 'err', text: (e as Error).message });
    } finally {
      setBusy(null);
      void refresh();
    }
  }, [refresh]);

  const chainDown = status && status.ok === false;
  const state = status?.state ?? null;
  const terms = status?.terms ?? null;
  const hasTerms = !!terms;
  const hasDeal = !!status?.dealId;

  // No visible deal for this viewer — nothing to drive. (dealStore returns the
  // EMPTY_DEAL placeholder for an account with no deals it's a party to.)
  if (!hasActiveDeal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <LocalOnlyBanner />
        <Card>
          <EyebrowLabel>NO ACTIVE DEAL</EyebrowLabel>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You have no deal selected to act on. When a deal you’re a party to appears
            in your dashboard, pick it in the deal switcher to drive its escrow here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <LocalOnlyBanner />

      {/* Which deal this console is acting on — the viewer's active, visible deal. */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Driving deal <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{appDealId}</span>
        {deal.dealReference ? ` · ${deal.dealReference}` : ''}
      </div>

      {chainDown && (
        <Card>
          <EyebrowLabel>LIVE CHAIN</EyebrowLabel>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            No local chain detected. Start it, then reload:
          </p>
          <pre style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-deep)', padding: 12, borderRadius: 6, overflowX: 'auto' }}>
{`# in contracts/
npx hardhat node                                   # terminal 1
npx hardhat run scripts/deploy-local.ts --network localhost   # terminal 2`}
          </pre>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{status?.error}</p>
        </Card>
      )}

      {!chainDown && status && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <EyebrowLabel>ON-CHAIN STATE</EyebrowLabel>
            <StatusPill label={state ?? 'No deal yet'} tone={state ? STATE_TONE[state] ?? 'pending' : 'pending'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            <Balance label="Buyer" value={status.balances?.buyer} />
            <Balance label="Seller" value={status.balances?.seller} />
            <Balance label="Escrow (locked)" value={status.balances?.escrow} />
          </div>
          {status.addresses && (
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <AddressChip value={status.addresses.escrow} />
            </div>
          )}
        </Card>
      )}

      {/* The deal's terms — ALWAYS shown to both parties once proposed. The buyer
          must see exactly what they are agreeing to (and later funding) before any
          action card; the seller sees what they proposed. Fix for the agree-blind
          consent gap: the API returned terms but nothing rendered them. */}
      {!chainDown && terms && (
        <TermsCard terms={terms} hasDeal={hasDeal} hat={hat}
          acceptAction={hat === 'buyer' && !hasDeal ? {
            busy: busy === 'Agree',
            onClick: () => run('Agree', () => agree(appDealId, actor)),
          } : undefined} />
      )}

      {msg && (
        <div style={{
          fontSize: 13, padding: '10px 14px', borderRadius: 6,
          color: msg.tone === 'ok' ? 'var(--accent)' : '#f87171',
          border: `1px solid ${msg.tone === 'ok' ? 'var(--accent)' : '#f87171'}`,
          background: 'var(--bg-surface)',
        }}>{msg.text}</div>
      )}

      {/* Role-gated actions, driven by the on-chain state machine. All scoped to
          the active deal id (appDealId). */}
      {hat === 'seller' && !hasTerms && (
        <ProposeForm disabled={!!busy} onSubmit={t => run('Propose terms', () => propose(appDealId, t, actor))} />
      )}
      {hat === 'buyer' && state === 'Agreed' && (
        <ActionCard title="BUYER ACTION"
          label={terms ? `Fund escrow — lock ${terms.amountUsdc} USDC` : 'Fund escrow (approve + deposit)'}
          helper="Locks the exact agreed amount shown above. Two transactions: approve, then deposit."
          busy={busy === 'Fund'} onClick={() => run('Fund', () => fund(appDealId, actor))} />
      )}
      {hat === 'seller' && state === 'Funded' && (
        <SubmitBolForm disabled={!!busy}
          onSubmit={f => run('Submit B/L', async () => {
            const r = await submitBol(appDealId, f, actor);
            if (r.ok && r.verdict) setMsg({ tone: r.verdict === 'Compliant' ? 'ok' : 'err', text: `Verdict: ${r.verdict}` });
            return r;
          })} />
      )}
      {state === 'ReleasePending' && (
        <ActionCard title="SETTLEMENT (PERMISSIONLESS)" label="Release funds to seller"
          helper="Once the verdict is recorded, anyone may trigger settlement."
          busy={busy === 'Release'} onClick={() => run('Release', () => release(appDealId, actor))} />
      )}

      {(hat === 'platform') && (
        <Card>
          <EyebrowLabel>OPERATOR VIEW</EyebrowLabel>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The platform fronts the releaser key. In this local demo the releaser call
            (recordVerdict) fires automatically on a Compliant B/L — see the audit trail.
          </p>
        </Card>
      )}

      {account && (account.type === 'admin' || account.type === 'developer' || hat === 'platform') && (
        <button
          onClick={() => run('Reset', () => reset(appDealId, actor))}
          disabled={busy === 'Reset'}
          style={{
            alignSelf: 'flex-start', fontSize: 12, color: 'var(--text-secondary)',
            background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
            padding: '8px 14px', cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >Reset demo run</button>
      )}
    </div>
  );
}

function LocalOnlyBanner() {
  return (
    <div style={{
      fontSize: 12, color: 'var(--text-muted)', border: '1px dashed var(--border)',
      borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
    }}>
      Local demo only — signs with public Hardhat dev keys against localhost:8545.
      The releaser call is disabled off the local chain (TODO integration: auth Q18).
    </div>
  );
}

type Terms = NonNullable<StatusResponse['terms']>;

function TermsCard({ terms, hasDeal, hat, acceptAction }: {
  terms: Terms; hasDeal: boolean; hat: ClientHat;
  acceptAction?: { busy: boolean; onClick: () => void };
}) {
  const eyebrow = hasDeal
    ? 'AGREED TERMS'
    : hat === 'buyer'
      ? 'PROPOSED TERMS — REVIEW BEFORE AGREEING'
      : 'PROPOSED TERMS — AWAITING BUYER';
  return (
    <Card>
      <EyebrowLabel>{eyebrow}</EyebrowLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>
          {terms.amountUsdc}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>USDC</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <TermsRow label="Goods" value={terms.goods} />
        <TermsRow label="Seller (shipper)" value={terms.sellerName} />
        <TermsRow label="Buyer (consignee)" value={terms.buyerName} />
        <TermsRow label="Ship by" value={terms.shipmentDeadline} mono />
      </div>
      {acceptAction && (
        <div style={{ marginTop: 18 }}>
          <button
            onClick={acceptAction.onClick} disabled={acceptAction.busy}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600,
              background: 'var(--accent)', color: '#0A0A0B', border: 'none',
              cursor: acceptAction.busy ? 'not-allowed' : 'pointer', opacity: acceptAction.busy ? 0.7 : 1,
            }}
          >{acceptAction.busy ? 'Working…' : 'Accept terms & register deal on-chain'}</button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            Accepting registers these exact terms (createDeal → Draft→Agreed). No funds move yet —
            funding is a separate step.
          </p>
        </div>
      )}
    </Card>
  );
}

function TermsRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 4, fontFamily: mono ? 'monospace' : undefined }}>
        {value}
      </div>
    </div>
  );
}

function Balance({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 18, color: 'var(--text-primary)', marginTop: 4 }}>
        {value ?? '—'} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>USDC</span>
      </div>
    </div>
  );
}

function ActionCard({ title, label, helper, busy, onClick }: {
  title: string; label: string; helper: string; busy: boolean; onClick: () => void;
}) {
  return (
    <Card>
      <EyebrowLabel>{title}</EyebrowLabel>
      <button
        onClick={onClick} disabled={busy}
        style={{
          width: '100%', padding: '11px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600,
          background: 'var(--accent)', color: '#0A0A0B', border: 'none',
          cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
        }}
      >{busy ? 'Working…' : label}</button>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{helper}</p>
    </Card>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
  background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border)',
};

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</span>
      <input style={inputStyle} {...rest} />
    </label>
  );
}

function ProposeForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (t: {
  goods: string; amountUsdc: string; sellerName: string; buyerName: string; shipmentDeadline: string;
}) => void }) {
  const [f, setF] = useState({
    goods: 'Cotton textiles', amountUsdc: '2500.00',
    sellerName: 'Solaris Textiles Co.', buyerName: 'Meridian Imports Ltd.', shipmentDeadline: '2026-08-31',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Card>
      <EyebrowLabel>SELLER ACTION — PROPOSE TERMS</EyebrowLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Goods" value={f.goods} onChange={set('goods')} />
        <Field label="Amount (USDC)" value={f.amountUsdc} onChange={set('amountUsdc')} />
        <Field label="Seller name" value={f.sellerName} onChange={set('sellerName')} />
        <Field label="Buyer name" value={f.buyerName} onChange={set('buyerName')} />
        <Field label="Ship by (YYYY-MM-DD)" value={f.shipmentDeadline} onChange={set('shipmentDeadline')} />
        <button
          onClick={() => onSubmit(f)} disabled={disabled}
          style={{ padding: '11px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: '#0A0A0B', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}
        >Propose terms</button>
      </div>
    </Card>
  );
}

function SubmitBolForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (f: {
  blNumber: string; shipperName: string; consigneeName: string; amountUsdc: string; shipmentDate: string;
}) => void }) {
  const [f, setF] = useState({
    blNumber: 'BL-2026-0417', shipperName: 'Solaris Textiles Co.',
    consigneeName: 'Meridian Imports Ltd.', amountUsdc: '2500.00', shipmentDate: '2026-08-20',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Card>
      <EyebrowLabel>SELLER ACTION — SUBMIT BILL OF LADING</EyebrowLabel>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
        The deterministic rules engine grades these against the agreed terms. Compliant →
        the platform records the verdict on-chain; discrepant → no chain write.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="B/L number" value={f.blNumber} onChange={set('blNumber')} />
        <Field label="Shipper (seller)" value={f.shipperName} onChange={set('shipperName')} />
        <Field label="Consignee (buyer)" value={f.consigneeName} onChange={set('consigneeName')} />
        <Field label="Amount on B/L (USDC)" value={f.amountUsdc} onChange={set('amountUsdc')} />
        <Field label="Shipment date (YYYY-MM-DD)" value={f.shipmentDate} onChange={set('shipmentDate')} />
        <button
          onClick={() => onSubmit(f)} disabled={disabled}
          style={{ padding: '11px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: '#0A0A0B', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}
        >Submit B/L for grading</button>
      </div>
    </Card>
  );
}
