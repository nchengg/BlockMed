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
import type { BolFields, DocumentPack, InvoiceFields, PackingListFields } from '@/lib/escrow/rules';
import { reviewStatus, OBJECTION_GROUNDS, groundLabel, type Review, type ObjectionGround } from '@/lib/escrow/review';
import type { DealListItem } from '@/lib/escrow/client';
import type { DealRole } from '@/lib/escrow/roles';

const usdcFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type PostFundAction =
  | { kind: 'submit-documents'; pack: DocumentPack }
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
            <DocumentPackForm deal={deal} busy={busy} onSubmit={pack => onAction({ kind: 'submit-documents', pack })} />
            <RefundPanel deal={deal} role="seller" busy={busy} onAction={onAction} />
          </>
        )
        : (
          <>
            {review?.objection && (
              <ObjectionNotice review={review} viewer="buyer" busy={busy} onAction={onAction} />
            )}
            <Note>
              Funds are locked. Waiting for {deal.counterparty} to ship and submit the document pack (invoice, packing list, bill of lading).
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
          {review.verdict.verdict === 'Held'
            ? `Documents are HELD for review — a flag (${review.verdict.rules.filter(r => r.kind === 'flag' && !r.pass).map(r => r.rule.split(' ')[0]).join(', ')}) requires ${deal.counterparty}'s explicit approval. The window will not auto-release. You may also submit corrected documents below.`
            : rStatus === 'pending'
              ? `Documents passed the checks. ${deal.counterparty} has until ${new Date(review.windowEndsAt).toLocaleString()} to approve or object.`
              : 'The objection window closed with no objection. You can finalise the release.'}
        </Note>
        {review.verdict.verdict === 'Held' && (
          <DocumentPackForm deal={deal} busy={busy} onSubmit={pack => onAction({ kind: 'submit-documents', pack })} />
        )}
        {rStatus === 'expired' && review.verdict.verdict !== 'Held' && (
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

function DocumentPackForm({ deal, busy, onSubmit }: {
  deal: DealListItem;
  busy: boolean;
  onSubmit: (pack: DocumentPack) => void;
}) {
  // DEMO PREFILL — all three documents arrive filled in, mutually consistent, and
  // matching the agreed terms, so the happy path is one click (the user asked for
  // exactly this on the single-B/L version). The cross-checked values (invoice
  // number, B/L number, vessel, weights, counts) are shared state entered once
  // and written into every document that carries them — which is also how the
  // demo teaches the point: edit the B/L's weight afterwards and the cross-check
  // catches the disagreement. Flags default clean; set "clean on board" to
  // anything else, or add hazardous goods, to demo a Held verdict.
  const t = deal.terms;
  const suffix = deal.dealId.replace(/[^A-Z0-9]/gi, '').slice(-7).toUpperCase() || '2260714';
  const ship = compliantShipDate(t?.shipmentDeadline);
  const shared = {
    invoiceNumber: `INV-${suffix}`,
    blNumber: `MAEU-${suffix}`,
    vessel: 'MAERSK ATLANTIC',
    voyageNumber: '421W',
    portOfLoading: t?.portOfLoading || 'Jebel Ali, AE',
    portOfDischarge: t?.portOfDischarge || 'Felixstowe, GB',
    quantity: '480',
    packages: '480 cartons',
    grossWeight: '8,640 kg',
  };

  const [invoice, setInvoice] = useState<InvoiceFields>({
    invoiceNumber: shared.invoiceNumber,
    sellerName: t?.sellerName ?? '',
    buyerName: t?.buyerName ?? '',
    goodsDescription: t?.goods ?? '',
    currency: 'USDC',
    totalValue: t?.amountUsdc ?? '',
    invoiceDate: ship,
    incoterm: t?.incoterm || 'CIF',
    quantity: shared.quantity,
    packages: shared.packages,
    grossWeight: shared.grossWeight,
    hsCode: '5208.52',
    hazardousGoods: '',
    signatoryName: t?.sellerName ? `Authorised signatory, ${t.sellerName}` : '',
  });
  const [pl, setPl] = useState<PackingListFields>({
    exporterName: t?.sellerName ?? '',
    consigneeName: t?.buyerName ?? '',
    invoiceNumber: shared.invoiceNumber,
    blNumber: shared.blNumber,
    vessel: shared.vessel,
    voyageNumber: shared.voyageNumber,
    portOfLoading: shared.portOfLoading,
    portOfDischarge: shared.portOfDischarge,
    departureDate: ship,
    goodsDescription: t?.goods ?? '',
    quantity: shared.quantity,
    packages: shared.packages,
    grossWeight: shared.grossWeight,
    signatoryName: t?.sellerName ? `Authorised signatory, ${t.sellerName}` : '',
  });
  const [bol, setBol] = useState<BolFields>({
    blNumber: shared.blNumber,
    shipperName: t?.sellerName ?? '',
    consigneeName: t?.buyerName ?? '',
    goodsDescription: t?.goods ?? '',
    shippedOnBoardDate: ship,
    portOfLoading: shared.portOfLoading,
    portOfDischarge: shared.portOfDischarge,
    vessel: shared.vessel,
    voyageNumber: shared.voyageNumber,
    packages: shared.packages,
    grossWeight: shared.grossWeight,
    containerNumber: 'MSKU-1234567',
    signedBy: 'As agent for the Carrier',
    cleanOnBoard: 'clean',
    onDeckNotation: '',
    freightPayment: 'prepaid',
  });

  const setI = (k: keyof InvoiceFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInvoice(prev => ({ ...prev, [k]: e.target.value }));
  const setP = (k: keyof PackingListFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPl(prev => ({ ...prev, [k]: e.target.value }));
  const setB = (k: keyof BolFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBol(prev => ({ ...prev, [k]: e.target.value }));

  const section = (title: string): React.CSSProperties => ({ marginTop: 16 });
  const heading = (text: string, hint: string) => (
    <>
      <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 2px' }}>
        {text}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 8px' }}>{hint}</p>
    </>
  );
  const grid: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
  };

  return (
    <div style={{ marginTop: 18 }}>
      <div className="section-label" style={{ fontSize: 10, marginBottom: 6 }}>
        SUBMIT THE DOCUMENT PACK
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>
        Three documents, per the document register: commercial invoice, packing list, bill of
        lading. Fields are graded against the agreed terms AND cross-checked between documents —
        the same fact stated twice must agree, which is what makes a forged document hard to
        slip through. Prefilled consistently; submit as-is for a compliant verdict, edit one
        side of a cross-checked pair (say, the B/L weight) to see it caught, or set
        &ldquo;clean on board&rdquo; to &ldquo;claused&rdquo; to see an automatic hold.
      </p>

      {heading('Commercial invoice (DOC-01)', 'The only document carrying the value — its total must equal the escrow amount exactly.')}
      <div style={grid}>
        <Field label="Invoice number" value={invoice.invoiceNumber} onChange={setI('invoiceNumber')} />
        <Field label="Seller" value={invoice.sellerName} onChange={setI('sellerName')} />
        <Field label="Buyer" value={invoice.buyerName} onChange={setI('buyerName')} />
        <Field label="Goods description" value={invoice.goodsDescription} onChange={setI('goodsDescription')} />
        <Field label="Total value" value={invoice.totalValue} onChange={setI('totalValue')} />
        <Field label="Currency" value={invoice.currency} onChange={setI('currency')} />
        <Field label="Invoice date" type="date" value={invoice.invoiceDate} onChange={setI('invoiceDate')} />
        <Field label="Incoterm" value={invoice.incoterm} onChange={setI('incoterm')} />
        <Field label="Quantity" value={invoice.quantity} onChange={setI('quantity')} />
        <Field label="Packages" value={invoice.packages} onChange={setI('packages')} />
        <Field label="Gross weight" value={invoice.grossWeight} onChange={setI('grossWeight')} />
        <Field label="HS code" value={invoice.hsCode} onChange={setI('hsCode')} />
        <Field label="Hazardous goods (flag)" value={invoice.hazardousGoods} onChange={setI('hazardousGoods')} placeholder="leave empty unless hazardous" />
        <Field label="Signatory" value={invoice.signatoryName} onChange={setI('signatoryName')} />
      </div>

      {heading('Packing list (DOC-02)', 'The third leg that makes cross-checking work: counts, weights and route must agree with both other documents.')}
      <div style={grid}>
        <Field label="Exporter (seller)" value={pl.exporterName} onChange={setP('exporterName')} />
        <Field label="Consignee (buyer)" value={pl.consigneeName} onChange={setP('consigneeName')} />
        <Field label="Invoice number" value={pl.invoiceNumber} onChange={setP('invoiceNumber')} />
        <Field label="B/L number" value={pl.blNumber} onChange={setP('blNumber')} />
        <Field label="Vessel" value={pl.vessel} onChange={setP('vessel')} />
        <Field label="Voyage No." value={pl.voyageNumber} onChange={setP('voyageNumber')} />
        <Field label="Port of loading" value={pl.portOfLoading} onChange={setP('portOfLoading')} />
        <Field label="Port of discharge" value={pl.portOfDischarge} onChange={setP('portOfDischarge')} />
        <Field label="Departure date" type="date" value={pl.departureDate} onChange={setP('departureDate')} />
        <Field label="Goods description" value={pl.goodsDescription} onChange={setP('goodsDescription')} />
        <Field label="Quantity" value={pl.quantity} onChange={setP('quantity')} />
        <Field label="Packages" value={pl.packages} onChange={setP('packages')} />
        <Field label="Gross weight" value={pl.grossWeight} onChange={setP('grossWeight')} />
        <Field label="Signatory" value={pl.signatoryName} onChange={setP('signatoryName')} />
      </div>

      {heading('Bill of lading (DOC-03)', 'The carrier\u2019s document. "Clean on board" is UCP 600 Art. 27: any damage clause holds the release for human review.')}
      <div style={grid}>
        <Field label="B/L number" value={bol.blNumber} onChange={setB('blNumber')} />
        <Field label="Shipper (seller)" value={bol.shipperName} onChange={setB('shipperName')} />
        <Field label="Consignee (buyer)" value={bol.consigneeName} onChange={setB('consigneeName')} />
        <Field label="Goods description" value={bol.goodsDescription} onChange={setB('goodsDescription')} />
        <Field label="Shipped on board" type="date" value={bol.shippedOnBoardDate} onChange={setB('shippedOnBoardDate')} />
        <Field label="Port of loading" value={bol.portOfLoading} onChange={setB('portOfLoading')} />
        <Field label="Port of discharge" value={bol.portOfDischarge} onChange={setB('portOfDischarge')} />
        <Field label="Vessel" value={bol.vessel} onChange={setB('vessel')} />
        <Field label="Voyage No." value={bol.voyageNumber} onChange={setB('voyageNumber')} />
        <Field label="Packages" value={bol.packages} onChange={setB('packages')} />
        <Field label="Gross weight" value={bol.grossWeight} onChange={setB('grossWeight')} />
        <Field label="Container No." value={bol.containerNumber} onChange={setB('containerNumber')} />
        <Field label="Signed by (carrier/master/agent)" value={bol.signedBy} onChange={setB('signedBy')} />
        <Field label="Clean on board (flag)" value={bol.cleanOnBoard} onChange={setB('cleanOnBoard')} placeholder='"clean", or the clause text' />
        <Field label="On-deck notation (flag)" value={bol.onDeckNotation} onChange={setB('onDeckNotation')} placeholder="leave empty unless on deck" />
        <Field label="Freight payment" value={bol.freightPayment} onChange={setB('freightPayment')} placeholder="prepaid / collect" />
      </div>

      <Primary busy={busy} onClick={() => onSubmit({ invoice, packingList: pl, bol })} full>
        Submit documents for verification
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
  // Reviews created before the three-document pack stored a flat B/L; tolerate
  // both shapes so old deals still render their history.
  const pack = review.fields as Partial<DocumentPack> & Record<string, string>;
  const bol = (pack.bol ?? pack) as Record<string, string>;
  const held = review.verdict.verdict === 'Held';

  const group = (title: string, rows: [string, string | undefined][]) => ({ title, rows });
  const groups = [
    ...(pack.invoice ? [group('Commercial invoice', [
      ['Invoice no.', pack.invoice.invoiceNumber],
      ['Total value', pack.invoice.totalValue],
      ['Currency', pack.invoice.currency],
      ['Incoterm', pack.invoice.incoterm],
      ['HS code', pack.invoice.hsCode],
    ])] : []),
    ...(pack.packingList ? [group('Packing list', [
      ['Quantity', pack.packingList.quantity],
      ['Packages', pack.packingList.packages],
      ['Gross weight', pack.packingList.grossWeight],
      ['Departure', pack.packingList.departureDate],
    ])] : []),
    group('Bill of lading', [
      ['B/L number', bol.blNumber],
      ['Shipper', bol.shipperName],
      ['Consignee', bol.consigneeName],
      ['Goods', bol.goodsDescription],
      ['Shipped on board', bol.shippedOnBoardDate],
      ['Vessel', bol.vessel],
      ['Port of loading', bol.portOfLoading],
      ['Port of discharge', bol.portOfDischarge],
      ['Clean on board', bol.cleanOnBoard],
      ['Signed by', bol.signedBy],
    ]),
  ];

  return (
    <div style={{ marginTop: 18 }}>
      <div className="section-label" style={{ fontSize: 10, marginBottom: 6 }}>
        REVIEW DOCUMENTS BEFORE RELEASE
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
        {deal.counterparty} submitted the document pack
        {held ? ' and a flag requires your review' : ' and every check passed'}. Approving releases{' '}
        {formatUsdc(deal.terms?.amountUsdc)} USDC from escrow.{' '}
        {held
          ? 'Because a hold stands, the window will NOT release on expiry — only your explicit approval will.'
          : rStatus === 'pending'
            ? `You may object on valid grounds until ${new Date(review.windowEndsAt).toLocaleString()}.`
            : 'The objection window has expired; you can still approve.'}
      </p>

      {held && (
        <div style={{
          marginBottom: 14, padding: '10px 14px', borderRadius: 6,
          border: '1px solid var(--accent)', background: 'rgba(245,158,11,0.08)',
          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--accent)' }}>Held for review:</strong>{' '}
          {review.verdict.rules.filter(r => r.kind === 'flag' && !r.pass)
            .map(r => `${r.rule} — got ${r.actual}`).join('; ')}
        </div>
      )}

      {groups.map(({ title, rows }) => (
        <div key={title} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {rows.map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>{value || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
        {review.verdict.rules.map(r => `${r.pass ? '✓' : r.kind === 'flag' ? '🚩' : '✗'} ${r.rule}`).join(' · ')}
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
