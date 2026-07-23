// Deterministic bill-of-lading rules engine (AP-5: all money math in code, never in
// AI free-text). Compares the seller-submitted BoL fields against the agreed terms.
// AI extraction can replace the manual form later — this grading layer stays the same:
// the BolFields schema below IS the extraction target (autofill contract).
//
// Field set mirrors a real ocean B/L (Maersk form): graded fields are the ones the
// agreed terms can deterministically check; the rest are RECORDED on the audit trail
// for the documentary examiner but not machine-graded (honest about what's checked).
//
// NOTE — no amount on a B/L, by design: real bills of lading state no invoice value
// (only freight charges / optional declared value). The escrow amount is enforced by
// the on-chain deposit itself; amount_match returns when the commercial invoice is
// added as a required document, checked against THAT document.
import type { DealTerms } from "./store";

export interface BolFields {
  // ── graded against the agreed terms ──
  blNumber: string;
  shipperName: string;
  consigneeName: string;
  goodsDescription: string;
  shippedOnBoardDate: string; // YYYY-MM-DD (the B/L's "Shipped on Board Date" box)
  // ── recorded for the audit trail / examiner, not machine-graded ──
  vessel: string;
  voyageNumber: string;
  portOfLoading: string;
  portOfDischarge: string;
  containerNumber: string;
  packages: string; // kind & count, e.g. "480 cartons"
  grossWeight: string; // e.g. "8,640 kg"
}

/** The non-graded fields, in display order — single source for form + audit. */
export const RECORDED_FIELDS: { key: keyof BolFields; label: string }[] = [
  { key: "vessel", label: "Vessel" },
  { key: "voyageNumber", label: "Voyage No." },
  { key: "portOfLoading", label: "Port of Loading" },
  { key: "portOfDischarge", label: "Port of Discharge" },
  { key: "containerNumber", label: "Container No." },
  { key: "packages", label: "Packages" },
  { key: "grossWeight", label: "Gross Weight" },
];

export interface RuleResult {
  rule: string;
  pass: boolean;
  expected: string;
  actual: string;
}

export interface Verdict {
  verdict: "Compliant" | "Discrepant";
  rules: RuleResult[];
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Deterministic goods check: every meaningful token of the agreed goods description
// must appear in the B/L's description (normalised). Token containment rather than
// equality because B/L descriptions carry extra detail (marks, counts, container
// wording) beyond the terms' summary.
const tokens = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

function goodsMatch(bolDescription: string, termsGoods: string): { pass: boolean; detail: string } {
  const want = tokens(termsGoods);
  const have = new Set(tokens(bolDescription));
  if (want.length === 0) return { pass: false, detail: "no goods in terms" };
  const missing = want.filter((t) => !have.has(t));
  return {
    pass: missing.length === 0,
    detail: missing.length === 0 ? "all terms present" : `missing: ${missing.join(", ")}`,
  };
}

export function gradeBol(fields: BolFields, terms: DealTerms): Verdict {
  const rules: RuleResult[] = [];

  rules.push({
    rule: "document_present (B/L number)",
    pass: fields.blNumber.trim().length > 0,
    expected: "a B/L number",
    actual: fields.blNumber.trim() || "(empty)",
  });

  rules.push({
    rule: "party_match (shipper = seller)",
    pass: norm(fields.shipperName) === norm(terms.sellerName),
    expected: terms.sellerName,
    actual: fields.shipperName,
  });

  rules.push({
    rule: "party_match (consignee = buyer)",
    pass: norm(fields.consigneeName) === norm(terms.buyerName),
    expected: terms.buyerName,
    actual: fields.consigneeName,
  });

  const goods = goodsMatch(fields.goodsDescription, terms.goods);
  rules.push({
    rule: "goods_match (description covers agreed goods)",
    pass: goods.pass,
    expected: terms.goods,
    actual: fields.goodsDescription.trim()
      ? `${fields.goodsDescription.trim()} (${goods.detail})`
      : "(empty)",
  });

  // shipment_by — deadline comes from the agreed terms, never from the document
  const datePass =
    /^\d{4}-\d{2}-\d{2}$/.test(fields.shippedOnBoardDate) &&
    fields.shippedOnBoardDate <= terms.shipmentDeadline;
  rules.push({
    rule: "shipment_by (shipped-on-board date ≤ deadline)",
    pass: datePass,
    expected: `on or before ${terms.shipmentDeadline}`,
    actual: fields.shippedOnBoardDate || "(empty)",
  });

  return {
    verdict: rules.every((r) => r.pass) ? "Compliant" : "Discrepant",
    rules,
  };
}
