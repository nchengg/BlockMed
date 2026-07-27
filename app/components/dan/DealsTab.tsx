'use client';
// DEALS TAB (Dan's Dashboard) — the deal list plus "Create new deal".
//
// Role model: an account is NEITHER a buyer nor a seller. Buyer/seller is a
// position in a specific deal, decided when the deal is created and read back
// per deal (lib/escrow/roles.ts). So this list can show "you're the seller" on
// one row and "you're the buyer" on the next, for the same signed-in account.
// There is no hat switcher on this surface, by design.
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/authStore';
import {
  actorFrom, createDeal, fetchDeals, fetchCompanies,
  type DealListItem, type TradingCompany,
} from '@/lib/escrow/client';
import type { DealRole } from '@/lib/escrow/roles';

const STATE_TONE: Record<string, { fg: string; bg: string }> = {
  Proposed: { fg: 'var(--text-secondary)', bg: 'transparent' },
  Agreed: { fg: 'var(--accent)', bg: 'var(--accent-dim)' },
  Funded: { fg: 'var(--accent)', bg: 'var(--accent-dim)' },
  ReleasePending: { fg: 'var(--accent)', bg: 'var(--accent-dim)' },
  Released: { fg: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  Refunded: { fg: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  Cancelled: { fg: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

const plusDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export function DealsTab() {
  const { account, activeHat } = useAuth();
  const actor = actorFrom(account, activeHat);
  const [deals, setDeals] = useState<DealListItem[] | null>(null);
  const [companies, setCompanies] = useState<TradingCompany[]>([]);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetchDeals(account?.id);
      setDeals(r.deals ?? []);
    } catch {
      setDeals([]);
    }
  }, [account?.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  // Counterparties you can address a deal to — real, loggable accounts.
  useEffect(() => {
    void fetchCompanies(account?.id)
      .then(r => setCompanies(r.companies ?? []))
      .catch(() => setCompanies([]));
  }, [account?.id]);

  const submit = async (input: Parameters<typeof createDeal>[0]) => {
    setBusy(true);
    setError(null);
    try {
      const r = await createDeal(input, actor);
      if (r.ok === false) { setError(r.error ?? 'Could not create the deal.'); return; }
      setCreating(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Deals
        </div>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setError(null); }}
            style={{
              marginLeft: 'auto', padding: '10px 18px', borderRadius: 6, fontSize: 14, fontWeight: 600,
              background: 'var(--accent)', color: '#0A0A0B', border: 'none', cursor: 'pointer',
            }}
          >
            Create new deal
          </button>
        )}
      </div>

      {error && (
        <div style={{
          marginBottom: 16, fontSize: 13, padding: '10px 14px', borderRadius: 6,
          color: '#f87171', border: '1px solid #f87171', background: 'var(--bg-surface)',
        }}>{error}</div>
      )}

      {creating && (
        <CreateDealForm
          busy={busy}
          creatorName={account?.displayName ?? 'You'}
          companies={companies}
          onCancel={() => setCreating(false)}
          onSubmit={submit}
        />
      )}

      {deals === null ? (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>
      ) : deals.length === 0 ? (
        !creating && (
          <div style={{
            border: '1px dashed var(--border)', borderRadius: 10, padding: '48px 32px',
            textAlign: 'center', background: 'var(--bg-surface)',
          }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              No deals yet. Create one to get started.
            </p>
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {deals.map(d => <DealRow key={d.dealId} deal={d} />)}
        </div>
      )}
    </>
  );
}

function DealRow({ deal }: { deal: DealListItem }) {
  const tone = STATE_TONE[deal.state ?? ''] ?? STATE_TONE.Proposed;
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px',
      background: 'var(--bg-surface)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
    }}>
      <div style={{ minWidth: 0, flex: '1 1 260px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            {deal.terms?.goods ?? '—'}
          </span>
          {/* The viewer's role ON THIS DEAL — derived, not an account property. */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 7px',
          }}>
            You: {deal.role ?? '—'}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 5 }}>
          with {deal.counterparty}
          {deal.terms?.shipmentDeadline ? ` · ship by ${deal.terms.shipmentDeadline}` : ''}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {deal.dealId}
        </div>
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
        {deal.terms?.amountUsdc ?? '—'} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>USDC</span>
      </div>

      <span style={{
        fontSize: 12, fontWeight: 600, color: tone.fg, background: tone.bg,
        border: `1px solid ${tone.fg === 'var(--text-secondary)' ? 'var(--border)' : tone.fg}`,
        borderRadius: 999, padding: '4px 12px', whiteSpace: 'nowrap',
      }}>
        {deal.state ?? 'Draft'}
      </span>
    </div>
  );
}

function CreateDealForm({ busy, creatorName, companies, onCancel, onSubmit }: {
  busy: boolean;
  creatorName: string;
  companies: TradingCompany[];
  onCancel: () => void;
  onSubmit: (input: {
    creatorRole: DealRole; counterpartyAccountId: string;
    goods: string; amountUsdc: string; shipmentDeadline: string;
    sellerName: string; buyerName: string;
  }) => void;
}) {
  const [role, setRole] = useState<DealRole>('seller');
  const [counterpartyAccountId, setCounterpartyAccountId] = useState('');
  const [goods, setGoods] = useState('');
  const [amountUsdc, setAmountUsdc] = useState('');
  const [shipmentDeadline, setShipmentDeadline] = useState(plusDays(30));

  const counterpartyName =
    companies.find(c => c.accountId === counterpartyAccountId)?.displayName ?? '';

  const submit = () => onSubmit({
    creatorRole: role,
    counterpartyAccountId,
    goods,
    amountUsdc,
    shipmentDeadline,
    // Server recomputes these from creatorRole + the picked company.
    sellerName: role === 'seller' ? creatorName : counterpartyName,
    buyerName: role === 'buyer' ? creatorName : counterpartyName,
  });

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 10, padding: '22px 24px',
      background: 'var(--bg-surface)', marginBottom: 20,
    }}>
      <div className="section-label" style={{ fontSize: 10, marginBottom: 14 }}>CREATE NEW DEAL</div>

      {/* Roles belong to the deal: the creator declares their side here. */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>
          On this deal, I am the…
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['seller', 'buyer'] as DealRole[]).map(r => {
            const active = r === role;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: '1 1 0', padding: '12px 16px', borderRadius: 6, fontSize: 14,
                  fontWeight: active ? 600 : 500, cursor: 'pointer', textTransform: 'capitalize',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {r}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 400, marginTop: 3, color: 'var(--text-muted)' }}>
                  {r === 'seller' ? 'You ship and get paid' : 'You pay and receive goods'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {/* A real account, not free text — so the deal is genuinely addressed and
            appears in the counterparty's own Deals list. */}
        <label style={{ display: 'block' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
            {role === 'seller' ? 'Buyer (counterparty)' : 'Seller (counterparty)'}
          </span>
          <select
            value={counterpartyAccountId}
            onChange={e => setCounterpartyAccountId(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
              background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border)',
            }}
          >
            <option value="">Select a company…</option>
            {companies.map(c => (
              <option key={c.accountId} value={c.accountId}>{c.displayName}</option>
            ))}
          </select>
        </label>
        <Field label="Goods" value={goods} placeholder="e.g. Cotton textiles, 1x40ft" onChange={e => setGoods(e.target.value)} />
        <Field label="Amount (USDC)" value={amountUsdc} placeholder="2500.00" onChange={e => setAmountUsdc(e.target.value)} />
        <Field label="Shipment deadline" type="date" value={shipmentDeadline} onChange={e => setShipmentDeadline(e.target.value)} />
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '14px 0 0' }}>
        You are <strong style={{ color: 'var(--text-secondary)' }}>{creatorName}</strong>, the{' '}
        <strong style={{ color: 'var(--accent)' }}>{role}</strong> on this deal
        {counterpartyName && (
          <> — it will appear in <strong style={{ color: 'var(--text-secondary)' }}>{counterpartyName}</strong>&apos;s
          dashboard for them to agree</>
        )}. These terms become the rulebook the bill of lading is checked against. Nothing goes on-chain
        until the counterparty agrees.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          onClick={submit} disabled={busy}
          style={{
            padding: '11px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600,
            background: 'var(--accent)', color: '#0A0A0B', border: 'none',
            cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
          }}
        >{busy ? 'Creating…' : 'Create deal'}</button>
        <button
          onClick={onCancel} disabled={busy}
          style={{
            padding: '11px 20px', borderRadius: 6, fontSize: 14, background: 'transparent',
            color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer',
          }}
        >Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</span>
      <input
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
          background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border)',
        }}
        {...rest}
      />
    </label>
  );
}
