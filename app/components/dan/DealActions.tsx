'use client';
// The post-funding half of the lifecycle, rendered inside an expanded deal row:
//
//   Funded          → SELLER submits the bill of lading (graded in code)
//   notice open     → BUYER approves or objects; SELLER waits
//   ReleasePending  → anyone releases (the contract makes it permissionless)
//   Released        → done
//
// Every panel is chosen by the viewer's role IN THIS DEAL plus the on-chain state.
// The heavy lifting (grading, the objection window, recordVerdict) already lives in
// app/api/escrow/* — this is the surface for it.
import { useState } from 'react';
import { RECORDED_FIELDS, type BolFields } from '@/lib/escrow/rules';
import { reviewStatus, OBJECTION_GROUNDS, groundLabel, type Review, type ObjectionGround } from '@/lib/escrow/review';
import type { DealListItem } from '@/lib/escrow/client';
import type { DealRole } from '@/lib/escrow/roles';

const usdcFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type PostFundAction =
  | { kind: 'submit-bol'; fields: BolFields }
  | { kind: 'approve-release' }
  | { kind: 'object'; ground: ObjectionGround; detail: string }
  | { kind: 'finalise-release' }
  | { kind: 'release' }
  | { kind: 'refund'; reason: string }
  | { kind: 'withdraw-objection'; reason: string };

export function DealActions({ deal, busy, onAction }: {
  deal: DealListItem;
  busy: boolean;
  onAction: (a: PostFundAction) => void;
}) {
  const role = deal.role as DealRole | null;
  const review: Review | null = deal.review ?? null;
  const rStatus = review ? reviewStatus(review) : null;

  // ── Funded: seller submits documents, unless a notice is already open ──
  if (deal.state === 'Funded') {
    if (!review || rStatus === 'objected') {
      return role === 'seller'
        ? (
          <>
            {review?.objection && <ObjectionNotice review={review} viewer="seller" />}
            <BolForm deal={deal} busy={busy} onSubmit={fields => onAction({ kind: 'submit-bol', fields })} />
            <RefundPanel deal={deal} role="seller" busy={busy} onAction={onAction} />
          </>
        )
        : (
          <>
            {review?.objection && (
              <ObjectionNotice review={review} viewer="buyer" busy={busy} onAction={onAction} />
            )}
            <Note>
              Funds are locked. Waiting for {deal.counterparty} to ship and submit the bill of lading.
            </Note>
            <RefundPanel deal={deal} role="buyer" busy={busy} onAction={onAction} />
          </>
        );
    }

    // A notice of release is open (or the window has expired quietly).
    if (role === 'buyer') {
      return <BuyerReview deal={deal} review={review} rStatus={rStatus!} busy={busy} onAction={onAction} />;
    }
    return (
      <>
        <Note>
          {rStatus === 'pending'
            ? `Documents passed the checks. ${deal.counterparty} has until ${new Date(review.windowEndsAt).toLocaleString()} to approve or object.`
            : 'The objection window closed with no objection. You can finalise the release.'}
        </Note>
        {rStatus === 'expired' && (
          <Primary busy={busy} onClick={() => onAction({ kind: 'finalise-release' })}>
            Finalise release
          </Primary>
        )}
      </>
    );
  }

  // ── ReleasePending: settlement is permissionless by design ──
  if (deal.state === 'ReleasePending') {
    return (
      <>
        <Note>
          The verdict is recorded on-chain. Either party can trigger
          settlement, and nobody can block it. The contract pays {formatUsdc(deal.terms?.amountUsdc)} USDC to{' '}
          {role === 'seller' ? 'you' : deal.counterparty}.
        </Note>
        <Primary busy={busy} onClick={() => onAction({ kind: 'release' })}>
          Release {formatUsdc(deal.terms?.amountUsdc)} USDC to the seller
        </Primary>
      </>
    );
  }

  if (deal.state === 'Released') {
    return (
      <Note>
        Settled. {formatUsdc(deal.terms?.amountUsdc)} USDC was released from escrow to{' '}
        {role === 'seller' ? 'you' : deal.counterparty}.
      </Note>
    );
  }

  if (deal.state === 'Refunded') {
    return (
      <Note>
        Refunded. {formatUsdc(deal.terms?.amountUsdc)} USDC was returned from escrow to{' '}
        {role === 'buyer' ? 'you' : deal.counterparty}. This deal is closed.
      </Note>
    );
  }

  return null;
}

/* ───────────────────────── seller: bill of lading ───────────────────────── */

// A stable, plausible-looking B/L number derived from the deal id, so the demo
// value differs per deal instead of every deal quoting the same document.
function demoBlNumber(dealId: string): string {
  const suffix = dealId.replace(/[^A-Z0-9]/gi, '').slice(-7).toUpperCase();
  return `MAEU-${suffix || '2260714'}`;
}

// Today, unless the agreed deadline has already passed — then use the deadline
// itself, so the prefilled B/L always satisfies shipment_by (date ≤ deadline).
function compliantShipDate(deadline: string | undefined): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return today;
  return today <= deadline ? today : deadline;
}

function BolForm({ deal, busy, onSubmit }: {
  deal: DealListItem;
  busy: boolean;
  onSubmit: (f: BolFields) => void;
}) {
  // DEMO PREFILL — the form arrives ready to submit and pass, so the happy path is
  // one click. Graded fields come from the agreed terms (so they match by
  // construction); the shipped-on-board date is today, or the deadline if that has
  // already passed, so shipment_by always passes. Carrier particulars are plausible
  // placeholders — they are recorded, not machine-graded. Every field stays
  // editable: change the goods or a party name to demo a Discrepant verdict.
  const [f, setF] = useState<BolFields>({
    blNumber: demoBlNumber(deal.dealId),
    shipperName: deal.terms?.sellerName ?? '',
    consigneeName: deal.terms?.buyerName ?? '',
    goodsDescription: deal.terms?.goods ?? '',
    shippedOnBoardDate: compliantShipDate(deal.terms?.shipmentDeadline),
    vessel: 'MAERSK ATLANTIC',
    voyageNumber: '421W',
    portOfLoading: 'Jebel Ali, AE',
    portOfDischarge: 'Felixstowe, GB',
    containerNumber: 'MSKU-1234567',
    packages: '480 cartons',
    grossWeight: '8,640 kg',
  });
  const set = (k: keyof BolFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div style={{ marginTop: 18 }}>
      <div className="section-label" style={{ fontSize: 10, marginBottom: 6 }}>
        SUBMIT THE BILL OF LADING
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
        Prefilled with demo values that match the agreed terms — submit as-is to see a compliant
        verdict, or edit any field (try the goods or a party name) to see a discrepancy caught. The
        first five are graded against the terms in code; the rest are recorded for the documentary
        review. A real B/L carries no invoice amount — the escrow amount is fixed by the deposit.
      </p>

      <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Graded against terms
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <Field label="B/L number" value={f.blNumber} onChange={set('blNumber')} />
        <Field label="Shipper (seller)" value={f.shipperName} onChange={set('shipperName')} />
        <Field label="Consignee (buyer)" value={f.consigneeName} onChange={set('consigneeName')} />
        <Field label="Description of goods" value={f.goodsDescription} onChange={set('goodsDescription')} />
        <Field label="Shipped on board date" type="date" value={f.shippedOnBoardDate} onChange={set('shippedOnBoardDate')} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 8px' }}>
        Recorded on the B/L (not machine-graded)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {RECORDED_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label} value={f[key]} onChange={set(key)} />
        ))}
      </div>

      <Primary busy={busy} onClick={() => onSubmit(f)} full>
        Submit for verification
      </Primary>
    </div>
  );
}

/* ───────────────────────── buyer: review before release ───────────────────────── */

function BuyerReview({ deal, review, rStatus, busy, onAction }: {
  deal: DealListItem;
  review: Review;
  rStatus: ReturnType<typeof reviewStatus>;
  busy: boolean;
  onAction: (a: PostFundAction) => void;
}) {
  const [objecting, setObjecting] = useState(false);
  const [ground, setGround] = useState<ObjectionGround>('field_mismatch');
  const [detail, setDetail] = useState('');
  const f = review.fields;

  const rows: [string, string][] = [
    ['B/L number', f.blNumber],
    ['Shipper', f.shipperName],
    ['Consignee', f.consigneeName],
    ['Goods', f.goodsDescription],
    ['Shipped on board', f.shippedOnBoardDate],
    ...RECORDED_FIELDS.map(({ key, label }) => [label, f[key] || '-'] as [string, string]),
  ];

  return (
    <div style={{ marginTop: 18 }}>
      <div className="section-label" style={{ fontSize: 10, marginBottom: 6 }}>
        REVIEW DOCUMENTS BEFORE RELEASE
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
        {deal.counterparty} submitted this bill of lading and the checks passed. Approving releases{' '}
        {formatUsdc(deal.terms?.amountUsdc)} USDC from escrow.{' '}
        {rStatus === 'pending'
          ? `You may object on valid grounds until ${new Date(review.windowEndsAt).toLocaleString()}.`
          : 'The objection window has expired; you can still approve.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 12 }}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
        {review.verdict.rules.map(r => `${r.pass ? 'Pass' : 'Fail'}: ${r.rule}`).join(' | ')}
      </div>

      {!objecting ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Primary busy={busy} onClick={() => onAction({ kind: 'approve-release' })}>
            Approve release
          </Primary>
          {rStatus === 'pending' && (
            <button
              onClick={e => { e.stopPropagation(); setObjecting(true); }}
              disabled={busy}
              style={{
                padding: '11px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600,
                background: 'transparent', color: '#f87171', border: '1px solid #f87171',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >Object</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
              Ground (only these are valid)
            </span>
            <select
              value={ground}
              onChange={e => setGround(e.target.value as ObjectionGround)}
              onClick={e => e.stopPropagation()}
              style={inputStyle}
            >
              {OBJECTION_GROUNDS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </label>
          <Field label="Detail (optional)" value={detail} onChange={e => setDetail(e.target.value)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={e => { e.stopPropagation(); onAction({ kind: 'object', ground, detail }); }}
              disabled={busy}
              style={{
                flex: 1, padding: '11px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600,
                background: '#f87171', color: '#0A0A0B', border: 'none',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >{busy ? 'Working' : 'Raise objection'}</button>
            <button
              onClick={e => { e.stopPropagation(); setObjecting(false); }}
              disabled={busy}
              style={{
                padding: '11px 20px', borderRadius: 6, fontSize: 14, background: 'transparent',
                color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// FR-13 escape hatch: return the locked funds to the buyer when a deal will not
// complete (seller never shipped, deadline passed, mutual unwind). Only legal
// while Funded, and the route blocks it while a clean notice of release stands.
function RefundPanel({ deal, role, busy, onAction }: {
  deal: DealListItem;
  role: DealRole;
  busy: boolean;
  onAction: (a: PostFundAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16 }}>
        {role === 'buyer'
          ? 'Shipment not coming? '
          : 'Cannot fulfil this shipment? '}
        <button
          onClick={e => { e.stopPropagation(); setOpen(true); }}
          style={{
            background: 'none', border: 'none', padding: 0, font: 'inherit',
            color: '#f87171', textDecoration: 'underline', cursor: 'pointer',
          }}
        >Request a refund</button>
        {' '}to return the {formatUsdc(deal.terms?.amountUsdc)} USDC to the buyer.
      </p>
    );
  }

  return (
    <div style={{
      marginTop: 16, padding: '14px 16px', borderRadius: 8,
      border: '1px solid #f87171', background: 'rgba(248,113,113,0.06)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#f87171', marginBottom: 6 }}>
        Refund the escrow
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
        The contract returns {formatUsdc(deal.terms?.amountUsdc)} USDC to the buyer and closes the deal. This is
        final. A refunded deal cannot be reopened. In production this needs a reviewer&apos;s sign-off.
      </p>
      <Field label="Reason (recorded on the audit trail)" value={reason} onChange={e => setReason(e.target.value)} />
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          onClick={e => { e.stopPropagation(); onAction({ kind: 'refund', reason }); }}
          disabled={busy}
          style={{
            padding: '10px 18px', borderRadius: 6, fontSize: 14, fontWeight: 600,
            background: '#f87171', color: '#0A0A0B', border: 'none',
            cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
          }}
        >{busy ? 'Working' : 'Confirm refund'}</button>
        <button
          onClick={e => { e.stopPropagation(); setOpen(false); }}
          disabled={busy}
          style={{
            padding: '10px 18px', borderRadius: 6, fontSize: 14, background: 'transparent',
            color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer',
          }}
        >Cancel</button>
      </div>
    </div>
  );
}

function ObjectionNotice({ review, viewer, busy, onAction }: {
  review: Review;
  viewer: DealRole;
  busy?: boolean;
  onAction?: (a: PostFundAction) => void;
}) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [reason, setReason] = useState('');
  const o = review.objection!;
  const canWithdraw = viewer === 'buyer' && !!onAction;

  return (
    <div style={{
      marginTop: 16, padding: '12px 14px', borderRadius: 6,
      border: '1px solid #f87171', background: 'rgba(248,113,113,0.08)',
    }}>
      <div style={{ fontSize: 13, color: '#f87171', fontWeight: 600, marginBottom: 4 }}>
        Objection standing: {groundLabel(o.ground)}
      </div>
      {o.detail && (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 4px' }}>{o.detail}</p>
      )}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
        {viewer === 'seller'
          ? 'Release is blocked. Correct the documents and resubmit below. That opens a fresh notice.'
          : 'Release is blocked. If you raised this in error, or it has been settled with the seller, withdraw it to restore the notice.'}
      </p>

      {canWithdraw && (withdrawing ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Why are you withdrawing? (recorded on the audit trail)" value={reason} onChange={e => setReason(e.target.value)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={e => { e.stopPropagation(); onAction!({ kind: 'withdraw-objection', reason }); }}
              disabled={busy}
              style={{
                padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: 'var(--accent)', color: '#0A0A0B', border: 'none',
                cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
              }}
            >{busy ? 'Working' : 'Withdraw objection'}</button>
            <button
              onClick={e => { e.stopPropagation(); setWithdrawing(false); }}
              disabled={busy}
              style={{
                padding: '10px 18px', borderRadius: 6, fontSize: 13, background: 'transparent',
                color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={e => { e.stopPropagation(); setWithdrawing(true); }}
          style={{
            marginTop: 10, background: 'none', border: 'none', padding: 0, font: 'inherit',
            fontSize: 12, color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer',
          }}
        >Withdraw this objection</button>
      ))}
    </div>
  );
}

/* ───────────────────────── shared bits ───────────────────────── */

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
  background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border)',
};

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</span>
      <input style={inputStyle} onClick={e => e.stopPropagation()} {...rest} />
    </label>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: '16px 0 0' }}>
      {children}
    </p>
  );
}

function Primary({ busy, onClick, children, full }: {
  busy: boolean; onClick: () => void; children: React.ReactNode; full?: boolean;
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      disabled={busy}
      style={{
        marginTop: 16, width: full ? '100%' : undefined,
        padding: '11px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600,
        background: 'var(--accent)', color: '#0A0A0B', border: 'none',
        cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
      }}
    >{busy ? 'Working' : children}</button>
  );
}

function formatUsdc(value: string | number | null | undefined): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value ? String(value) : '0.00';
  return usdcFormatter.format(amount);
}
