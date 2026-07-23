// Unit tests for the deterministic bill-of-lading grading engine (gradeBol).
//
// This is the code that decides whether escrow money releases, so the suite is
// deliberately exhaustive: one fully-compliant baseline, then a table that flips
// exactly one field at a time to isolate each rule, plus boundary/edge cases
// (case/whitespace-insensitive party matching, goods token containment, the
// shipment-date deadline boundary, missing/malformed fields, cross-field failure).
//
// NOTE: no amount rule — real B/Ls carry no invoice value; the escrow amount is
// enforced by the on-chain deposit, and amount_match returns with the commercial
// invoice document. Recorded-only fields (vessel, ports, container…) are captured
// for the audit trail but deliberately NOT graded, asserted below.
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
  goodsDescription: "500 units surgical gloves, nitrile, 50 cartons",
  shippedOnBoardDate: "2026-07-15",
  vessel: "MAERSK ATLANTIC",
  voyageNumber: "421W",
  portOfLoading: "Jebel Ali",
  portOfDischarge: "Felixstowe",
  containerNumber: "MSKU-1234567",
  packages: "50 cartons",
  grossWeight: "1,250 kg",
};

// Rule identifiers as emitted by gradeBol — assert against these exact strings so a
// rename of a rule is caught by the tests.
const RULE = {
  doc: "document_present (B/L number)",
  shipper: "party_match (shipper = seller)",
  consignee: "party_match (consignee = buyer)",
  goods: "goods_match (description covers agreed goods)",
  shipment: "shipment_by (shipped-on-board date ≤ deadline)",
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
      RULE.shipper,
      RULE.consignee,
      RULE.goods,
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

  it("recorded-only fields never affect the verdict", () => {
    const v = grade({
      vessel: "",
      voyageNumber: "",
      portOfLoading: "totally wrong port",
      portOfDischarge: "",
      containerNumber: "garbage",
      packages: "",
      grossWeight: "-1",
    });
    expect(v.verdict).toBe("Compliant");
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

  // ── party_match (case- and whitespace-insensitive) ────────────────────────
  { name: "wrong shipper fails party_match (shipper)", over: { shipperName: "Someone Else Ltd" }, verdict: "Discrepant", fails: [RULE.shipper] },
  { name: "wrong consignee fails party_match (consignee)", over: { consigneeName: "Not Globex" }, verdict: "Discrepant", fails: [RULE.consignee] },
  { name: "shipper differing only by case passes", over: { shipperName: "ACME EXPORTS LTD" }, verdict: "Compliant", fails: [] },
  { name: "shipper with collapsed inner + edge whitespace passes", over: { shipperName: "  acme   exports   ltd " }, verdict: "Compliant", fails: [] },
  { name: "consignee differing only by case passes", over: { consigneeName: "globex imports llc" }, verdict: "Compliant", fails: [] },
  { name: "empty shipper fails party_match (shipper)", over: { shipperName: "" }, verdict: "Discrepant", fails: [RULE.shipper] },

  // ── goods_match (terms tokens must all appear in the B/L description) ─────
  { name: "description with extra B/L detail still passes (containment, not equality)", over: { goodsDescription: "SHIPPER'S LOAD: 500 UNITS SURGICAL GLOVES — 50 CARTONS, 1x40FT" }, verdict: "Compliant", fails: [] },
  { name: "reordered tokens pass", over: { goodsDescription: "surgical gloves — units 500" }, verdict: "Compliant", fails: [] },
  { name: "different goods fail goods_match", over: { goodsDescription: "ceramic tiles" }, verdict: "Discrepant", fails: [RULE.goods] },
  { name: "partially matching description fails (a terms token missing)", over: { goodsDescription: "500 units latex products" }, verdict: "Discrepant", fails: [RULE.goods] },
  { name: "empty description fails goods_match", over: { goodsDescription: "" }, verdict: "Discrepant", fails: [RULE.goods] },
  { name: "case/punctuation differences alone pass", over: { goodsDescription: "500 UNITS, SURGICAL GLOVES." }, verdict: "Compliant", fails: [] },

  // ── shipment_by (date ≤ deadline; string form is ISO so lexicographic) ────
  { name: "shipment date well before deadline passes", over: { shippedOnBoardDate: "2026-01-01" }, verdict: "Compliant", fails: [] },
  { name: "shipment date exactly on the deadline passes (≤ boundary)", over: { shippedOnBoardDate: "2026-08-01" }, verdict: "Compliant", fails: [] },
  { name: "shipment one day after deadline fails shipment_by", over: { shippedOnBoardDate: "2026-08-02" }, verdict: "Discrepant", fails: [RULE.shipment] },
  { name: "malformed shipment date (not zero-padded) fails shipment_by", over: { shippedOnBoardDate: "2026-8-1" }, verdict: "Discrepant", fails: [RULE.shipment] },
  { name: "empty shipment date fails shipment_by", over: { shippedOnBoardDate: "" }, verdict: "Discrepant", fails: [RULE.shipment] },
  { name: "non-date shipment string fails shipment_by", over: { shippedOnBoardDate: "soon" }, verdict: "Discrepant", fails: [RULE.shipment] },

  // ── cross-field: multiple simultaneous discrepancies ──────────────────────
  {
    name: "goods + shipper + late date all fail together",
    over: { goodsDescription: "steel pipes", shipperName: "Wrong Co", shippedOnBoardDate: "2027-01-01" },
    verdict: "Discrepant",
    fails: [RULE.goods, RULE.shipper, RULE.shipment],
  },
  {
    name: "every rule can fail at once",
    over: {
      blNumber: "",
      shipperName: "X",
      consigneeName: "Y",
      goodsDescription: "??",
      shippedOnBoardDate: "2030-01-01",
    },
    verdict: "Discrepant",
    fails: [RULE.doc, RULE.shipper, RULE.consignee, RULE.goods, RULE.shipment],
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
