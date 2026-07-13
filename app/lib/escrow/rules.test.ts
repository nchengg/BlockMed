// Unit tests for the deterministic bill-of-lading grading engine (gradeBol).
//
// This is the code that decides whether escrow money releases, so the suite is
// deliberately exhaustive: one fully-compliant baseline, then a table that flips
// exactly one field at a time to isolate each rule, plus boundary/edge cases
// (exact minor-unit amounts, case/whitespace-insensitive party matching, the
// shipment-date deadline boundary, missing/malformed fields, cross-field failure).
//
// All amounts are compared in USDC minor units (6 dp) as bigint — never floats.
import { describe, it, expect } from "vitest";
import { gradeBol, type BolFields, type Verdict } from "./rules";
import type { DealTerms } from "./store";

// Agreed terms — the trusted side of the comparison.
const TERMS: DealTerms = {
  goods: "500 units surgical gloves",
  amountUsdc: "2500.00",
  sellerName: "Acme Exports Ltd",
  buyerName: "Globex Imports LLC",
  shipmentDeadline: "2026-08-01",
};

// A fully-compliant seller-submitted B/L for the terms above.
const COMPLIANT: BolFields = {
  blNumber: "BL-0001",
  shipperName: "Acme Exports Ltd",
  consigneeName: "Globex Imports LLC",
  amountUsdc: "2500.00",
  shipmentDate: "2026-07-15",
};

// Rule identifiers as emitted by gradeBol — assert against these exact strings so a
// rename of a rule is caught by the tests.
const RULE = {
  doc: "document_present (B/L number)",
  amount: "amount_match (USDC minor units)",
  shipper: "party_match (shipper = seller)",
  consignee: "party_match (consignee = buyer)",
  shipment: "shipment_by (date ≤ deadline)",
} as const;

const grade = (over: Partial<BolFields>): Verdict =>
  gradeBol({ ...COMPLIANT, ...over }, TERMS);

const failingRules = (v: Verdict): string[] =>
  v.rules.filter((r) => !r.pass).map((r) => r.rule);

describe("gradeBol — fully compliant", () => {
  it("returns Compliant with every rule passing", () => {
    const v = grade({});
    expect(v.verdict).toBe("Compliant");
    expect(failingRules(v)).toEqual([]);
    expect(v.rules.every((r) => r.pass)).toBe(true);
  });
});

describe("gradeBol — structural invariants", () => {
  it("always emits exactly the five rules, in order", () => {
    const v = grade({});
    expect(v.rules.map((r) => r.rule)).toEqual([
      RULE.doc,
      RULE.amount,
      RULE.shipper,
      RULE.consignee,
      RULE.shipment,
    ]);
  });

  it("populates expected/actual on every rule", () => {
    for (const r of grade({}).rules) {
      expect(typeof r.expected).toBe("string");
      expect(typeof r.actual).toBe("string");
      expect(r.expected.length).toBeGreaterThan(0);
    }
  });

  it("reports amounts as USDC minor units, not the decimal string", () => {
    const amountRule = grade({}).rules.find((r) => r.rule === RULE.amount)!;
    expect(amountRule.expected).toBe("2500000000"); // 2500.00 * 1e6
    expect(amountRule.actual).toBe("2500000000");
  });
});

// One row per scenario. `over` mutates a single field of the compliant baseline
// (except the explicitly cross-field rows), `verdict` is the whole-document
// outcome, and `fails` is the exact set of rules expected to fail.
interface Case {
  name: string;
  over: Partial<BolFields>;
  verdict: Verdict["verdict"];
  fails: string[];
}

const CASES: Case[] = [
  // ── document_present ──────────────────────────────────────────────────────
  { name: "empty B/L number fails document_present", over: { blNumber: "" }, verdict: "Discrepant", fails: [RULE.doc] },
  { name: "whitespace-only B/L number fails document_present", over: { blNumber: "   " }, verdict: "Discrepant", fails: [RULE.doc] },
  { name: "B/L number with surrounding whitespace still passes", over: { blNumber: "  BL-0001  " }, verdict: "Compliant", fails: [] },

  // ── amount_match (exact, tolerance 0, minor units) ────────────────────────
  { name: "amount one cent low fails amount_match", over: { amountUsdc: "2499.99" }, verdict: "Discrepant", fails: [RULE.amount] },
  { name: "amount one cent high fails amount_match", over: { amountUsdc: "2500.01" }, verdict: "Discrepant", fails: [RULE.amount] },
  { name: "amount one MINOR UNIT high fails (tolerance is zero)", over: { amountUsdc: "2500.000001" }, verdict: "Discrepant", fails: [RULE.amount] },
  { name: "amount equal to the minor-unit boundary passes", over: { amountUsdc: "2500.000000" }, verdict: "Compliant", fails: [] },
  { name: "trailing-zero form is numerically equal and passes", over: { amountUsdc: "2500" }, verdict: "Compliant", fails: [] },
  { name: "amount with surrounding whitespace is trimmed then passes", over: { amountUsdc: "  2500.00  " }, verdict: "Compliant", fails: [] },
  { name: "empty amount parses to 0 minor units and fails amount_match", over: { amountUsdc: "" }, verdict: "Discrepant", fails: [RULE.amount] },
  { name: "unparseable amount (thousands comma) fails amount_match", over: { amountUsdc: "2,500.00" }, verdict: "Discrepant", fails: [RULE.amount] },
  { name: "non-numeric amount fails amount_match", over: { amountUsdc: "abc" }, verdict: "Discrepant", fails: [RULE.amount] },

  // ── party_match (case- and whitespace-insensitive) ────────────────────────
  { name: "wrong shipper fails party_match (shipper)", over: { shipperName: "Someone Else Ltd" }, verdict: "Discrepant", fails: [RULE.shipper] },
  { name: "wrong consignee fails party_match (consignee)", over: { consigneeName: "Not Globex" }, verdict: "Discrepant", fails: [RULE.consignee] },
  { name: "shipper differing only by case passes", over: { shipperName: "ACME EXPORTS LTD" }, verdict: "Compliant", fails: [] },
  { name: "shipper with collapsed inner + edge whitespace passes", over: { shipperName: "  acme   exports   ltd " }, verdict: "Compliant", fails: [] },
  { name: "consignee differing only by case passes", over: { consigneeName: "globex imports llc" }, verdict: "Compliant", fails: [] },
  { name: "empty shipper fails party_match (shipper)", over: { shipperName: "" }, verdict: "Discrepant", fails: [RULE.shipper] },

  // ── shipment_by (date ≤ deadline; string form is ISO so lexicographic) ────
  { name: "shipment date well before deadline passes", over: { shipmentDate: "2026-01-01" }, verdict: "Compliant", fails: [] },
  { name: "shipment date exactly on the deadline passes (≤ boundary)", over: { shipmentDate: "2026-08-01" }, verdict: "Compliant", fails: [] },
  { name: "shipment one day after deadline fails shipment_by", over: { shipmentDate: "2026-08-02" }, verdict: "Discrepant", fails: [RULE.shipment] },
  { name: "malformed shipment date (not zero-padded) fails shipment_by", over: { shipmentDate: "2026-8-1" }, verdict: "Discrepant", fails: [RULE.shipment] },
  { name: "empty shipment date fails shipment_by", over: { shipmentDate: "" }, verdict: "Discrepant", fails: [RULE.shipment] },
  { name: "non-date shipment string fails shipment_by", over: { shipmentDate: "soon" }, verdict: "Discrepant", fails: [RULE.shipment] },

  // ── cross-field: multiple simultaneous discrepancies ──────────────────────
  {
    name: "amount + shipper + late date all fail together",
    over: { amountUsdc: "1000.00", shipperName: "Wrong Co", shipmentDate: "2027-01-01" },
    verdict: "Discrepant",
    fails: [RULE.amount, RULE.shipper, RULE.shipment],
  },
  {
    name: "every rule can fail at once",
    over: {
      blNumber: "",
      amountUsdc: "1.00",
      shipperName: "X",
      consigneeName: "Y",
      shipmentDate: "2030-01-01",
    },
    verdict: "Discrepant",
    fails: [RULE.doc, RULE.amount, RULE.shipper, RULE.consignee, RULE.shipment],
  },
];

describe("gradeBol — per-discrepancy table", () => {
  it.each(CASES)("$name", ({ over, verdict, fails }) => {
    const v = grade(over);
    expect(v.verdict).toBe(verdict);
    // Order-independent set comparison of the failing rules.
    expect(failingRules(v).sort()).toEqual([...fails].sort());
    // Every scenario still emits all five rules.
    expect(v.rules).toHaveLength(5);
  });
});
