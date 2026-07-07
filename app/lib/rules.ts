// Deterministic bill-of-lading rules engine (AP-5: all money math in code, never in
// AI free-text). Compares the seller-submitted BoL fields against the agreed terms.
// AI extraction can replace the manual form later — this grading layer stays the same.
import { parseUnits } from "viem";
import type { DealTerms } from "./store";

export interface BolFields {
  blNumber: string;
  shipperName: string;
  consigneeName: string;
  amountUsdc: string; // as stated on the BoL / invoice
  shipmentDate: string; // YYYY-MM-DD
}

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

export function gradeBol(fields: BolFields, terms: DealTerms): Verdict {
  const rules: RuleResult[] = [];

  rules.push({
    rule: "document_present (B/L number)",
    pass: fields.blNumber.trim().length > 0,
    expected: "a B/L number",
    actual: fields.blNumber.trim() || "(empty)",
  });

  // amount_match — bigint minor units, exact (tolerance 0)
  let amountPass = false;
  let actualMinor = "(unparseable)";
  const expectedMinor = parseUnits(terms.amountUsdc, 6);
  try {
    const got = parseUnits(fields.amountUsdc.trim(), 6);
    actualMinor = got.toString();
    amountPass = got === expectedMinor;
  } catch {
    amountPass = false;
  }
  rules.push({
    rule: "amount_match (USDC minor units)",
    pass: amountPass,
    expected: expectedMinor.toString(),
    actual: actualMinor,
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

  // shipment_by — deadline comes from the agreed terms, never from the document
  const datePass =
    /^\d{4}-\d{2}-\d{2}$/.test(fields.shipmentDate) &&
    fields.shipmentDate <= terms.shipmentDeadline;
  rules.push({
    rule: "shipment_by (date ≤ deadline)",
    pass: datePass,
    expected: `on or before ${terms.shipmentDeadline}`,
    actual: fields.shipmentDate || "(empty)",
  });

  return {
    verdict: rules.every((r) => r.pass) ? "Compliant" : "Discrepant",
    rules,
  };
}
