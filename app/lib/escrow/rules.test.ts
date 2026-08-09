// Tests for the three-document rules engine (DOC-01/02/03 per
// docs/document-templates.md). The properties pinned down:
//
//   1. A mutually consistent pack matching the terms is Compliant.
//   2. Any GRADE failure (terms mismatch) is Discrepant.
//   3. Any CROSS failure (documents disagreeing with each other) is Discrepant —
//      this is the anti-fraud property: one edited document betrays itself.
//   4. A FLAG never fails the pack; it HOLDS it. Held ≠ Discrepant, because the
//      two demand different actions (human review vs. corrected documents).
//   5. Money is compared exactly, in minor units, never as floats.
import { describe, it, expect } from "vitest";
import {
  gradeDocuments, amountsEqual,
  type DocumentPack, type InvoiceFields, type PackingListFields, type BolFields,
} from "./rules";
import type { DealTerms } from "./store";

const TERMS: DealTerms = {
  goods: "Organic cotton, 480 cartons",
  amountUsdc: "2500.00",
  sellerName: "Solaris Textiles Co.",
  buyerName: "Meridian Imports Ltd.",
  shipmentDeadline: "2026-08-30",
  portOfLoading: "Jebel Ali, AE",
  portOfDischarge: "Felixstowe, GB",
  incoterm: "CIF",
};

// One consistent pack, built once — each test perturbs a copy.
function compliantPack(): DocumentPack {
  const invoice: InvoiceFields = {
    invoiceNumber: "INV-100", sellerName: TERMS.sellerName, buyerName: TERMS.buyerName,
    goodsDescription: "Organic cotton, 480 cartons, bale-packed", currency: "USDC",
    totalValue: "2500.00", invoiceDate: "2026-08-20", incoterm: "CIF",
    quantity: "480", packages: "480 cartons", grossWeight: "8,640 kg",
    hsCode: "5208.52", hazardousGoods: "", signatoryName: "A. Signatory",
  };
  const packingList: PackingListFields = {
    exporterName: TERMS.sellerName, consigneeName: TERMS.buyerName,
    invoiceNumber: "INV-100", blNumber: "MAEU-1", vessel: "MAERSK ATLANTIC",
    voyageNumber: "421W", portOfLoading: "Jebel Ali, AE", portOfDischarge: "Felixstowe, GB",
    departureDate: "2026-08-20", goodsDescription: "Organic cotton, 480 cartons",
    quantity: "480", packages: "480 cartons", grossWeight: "8,640 kg",
    signatoryName: "A. Signatory",
  };
  const bol: BolFields = {
    blNumber: "MAEU-1", shipperName: TERMS.sellerName, consigneeName: TERMS.buyerName,
    goodsDescription: "Organic cotton, 480 cartons, said to contain", shippedOnBoardDate: "2026-08-20",
    portOfLoading: "Jebel Ali, AE", portOfDischarge: "Felixstowe, GB",
    vessel: "MAERSK ATLANTIC", voyageNumber: "421W", packages: "480 cartons",
    grossWeight: "8,640 kg", containerNumber: "MSKU-1234567",
    signedBy: "As agent for the Carrier", cleanOnBoard: "clean", onDeckNotation: "",
    freightPayment: "prepaid",
  };
  return { invoice, packingList, bol };
}

const failures = (pack: DocumentPack, terms: DealTerms = TERMS) =>
  gradeDocuments(pack, terms).rules.filter((r) => !r.pass);

describe("compliant pack", () => {
  it("grades Compliant when every document matches the terms and each other", () => {
    const v = gradeDocuments(compliantPack(), TERMS);
    expect(failures(compliantPack())).toEqual([]);
    expect(v.verdict).toBe("Compliant");
  });

  it("stays Compliant without optional terms (ports, incoterm)", () => {
    const bare: DealTerms = { ...TERMS, portOfLoading: null, portOfDischarge: null, incoterm: null };
    expect(gradeDocuments(compliantPack(), bare).verdict).toBe("Compliant");
  });
});

describe("GRADE failures → Discrepant", () => {
  it("catches a wrong party name on any document", () => {
    for (const mutate of [
      (p: DocumentPack) => { p.invoice.sellerName = "Someone Else Ltd"; },
      (p: DocumentPack) => { p.packingList.consigneeName = "Not The Buyer"; },
      (p: DocumentPack) => { p.bol.shipperName = "Imposter Shipping"; },
    ]) {
      const p = compliantPack();
      mutate(p);
      expect(gradeDocuments(p, TERMS).verdict).toBe("Discrepant");
    }
  });

  it("catches an invoice total that differs from the escrow amount", () => {
    const p = compliantPack();
    p.invoice.totalValue = "2600.00";
    const v = gradeDocuments(p, TERMS);
    expect(v.verdict).toBe("Discrepant");
    expect(v.rules.find((r) => r.rule.startsWith("amount_match"))?.pass).toBe(false);
  });

  it("accepts equivalent decimal spellings of the amount", () => {
    const p = compliantPack();
    p.invoice.totalValue = "2500";
    expect(gradeDocuments(p, TERMS).verdict).toBe("Compliant");
  });

  it("catches shipment after the deadline on any dated document", () => {
    const p = compliantPack();
    p.bol.shippedOnBoardDate = "2026-09-01";
    expect(gradeDocuments(p, TERMS).verdict).toBe("Discrepant");
  });

  it("grades ports against the terms when the terms name them", () => {
    const p = compliantPack();
    p.bol.portOfDischarge = "Rotterdam, NL";
    const v = gradeDocuments(p, TERMS);
    expect(v.verdict).toBe("Discrepant");
    // Both the terms grade and the cross against the packing list fail.
    expect(v.rules.filter((r) => r.rule.startsWith("port_of_discharge") && !r.pass).length).toBe(2);
  });

  it("requires prepaid freight on a CIF deal", () => {
    const p = compliantPack();
    p.bol.freightPayment = "collect";
    const v = gradeDocuments(p, TERMS);
    expect(v.verdict).toBe("Discrepant");
    expect(v.rules.find((r) => r.rule.startsWith("freight_payment"))?.pass).toBe(false);
  });

  it("skips the freight rule when the terms carry no incoterm", () => {
    const p = compliantPack();
    p.bol.freightPayment = "collect";
    const bare: DealTerms = { ...TERMS, incoterm: null };
    expect(gradeDocuments(p, bare).rules.find((r) => r.rule.startsWith("freight_payment"))).toBeUndefined();
  });

  it("requires the carrier signature (UCP 600 Art. 20) and the HS code", () => {
    const p = compliantPack();
    p.bol.signedBy = "";
    p.invoice.hsCode = "";
    const v = gradeDocuments(p, TERMS);
    expect(v.rules.find((r) => r.rule.startsWith("signed (B/L"))?.pass).toBe(false);
    expect(v.rules.find((r) => r.rule.startsWith("hs_code_present"))?.pass).toBe(false);
  });
});

describe("CROSS failures → Discrepant (the anti-fraud property)", () => {
  it("catches one document quoting a different weight", () => {
    const p = compliantPack();
    p.bol.grossWeight = "9,999 kg";
    const v = gradeDocuments(p, TERMS);
    expect(v.verdict).toBe("Discrepant");
    expect(v.rules.find((r) => r.rule === "gross_weight (B/L = packing list)")?.pass).toBe(false);
  });

  it("catches a B/L number the packing list does not carry", () => {
    const p = compliantPack();
    p.packingList.blNumber = "MAEU-OTHER";
    expect(gradeDocuments(p, TERMS).verdict).toBe("Discrepant");
  });

  it("compares quantities numerically, not as prose", () => {
    const p = compliantPack();
    p.invoice.grossWeight = "8640kg"; // same number, different formatting
    expect(gradeDocuments(p, TERMS).verdict).toBe("Compliant");
  });
});

describe("FLAG → Held, never Discrepant", () => {
  it("holds a claused bill (UCP 600 Art. 27)", () => {
    const p = compliantPack();
    p.bol.cleanOnBoard = "claused — cartons water-damaged";
    const v = gradeDocuments(p, TERMS);
    expect(v.verdict).toBe("Held");
    expect(v.rules.find((r) => r.rule.startsWith("clean_on_board"))?.pass).toBe(false);
  });

  it("holds on-deck cargo and hazardous goods declarations", () => {
    for (const mutate of [
      (p: DocumentPack) => { p.bol.onDeckNotation = "stowed on deck"; },
      (p: DocumentPack) => { p.invoice.hazardousGoods = "UN 1263 paint"; },
    ]) {
      const p = compliantPack();
      mutate(p);
      expect(gradeDocuments(p, TERMS).verdict).toBe("Held");
    }
  });

  // Order matters: fix the documents first, then face the flag.
  it("reports Discrepant, not Held, when a grade fails alongside a flag", () => {
    const p = compliantPack();
    p.bol.cleanOnBoard = "claused";
    p.invoice.totalValue = "9999";
    expect(gradeDocuments(p, TERMS).verdict).toBe("Discrepant");
  });

  it('treats "clean" as not fired', () => {
    const p = compliantPack();
    p.bol.cleanOnBoard = "Clean";
    expect(gradeDocuments(p, TERMS).verdict).toBe("Compliant");
  });
});

describe("amountsEqual (AP-5: exact minor-unit money compare)", () => {
  it("equates decimal spellings", () => {
    expect(amountsEqual("2500", "2500.00")).toBe(true);
    expect(amountsEqual("2500.0", "2500.00")).toBe(true);
    expect(amountsEqual("0.10", "0.1")).toBe(true);
  });
  it("distinguishes real differences down to 6 dp", () => {
    expect(amountsEqual("2500.00", "2500.000001")).toBe(false);
    expect(amountsEqual("2499.999999", "2500")).toBe(false);
  });
  it("rejects junk rather than coercing it", () => {
    expect(amountsEqual("", "2500")).toBe(false);
    expect(amountsEqual("about 2500", "2500")).toBe(false);
    expect(amountsEqual("2,500", "2500")).toBe(false); // thousands separators are not parsed
  });
});
