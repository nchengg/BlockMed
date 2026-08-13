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
  gradeDocuments, amountsEqual, requiredCustoms,
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
  const certificateOfOrigin = {
    exporterName: TERMS.sellerName, consigneeName: TERMS.buyerName,
    issuedInCountry: "United Arab Emirates", referenceNumber: "INV-100",
    goodsDescription: "Organic cotton, 480 cartons", originCriterion: "P",
    grossWeight: "8,640 kg", invoiceNumber: "INV-100", marksAndNumbers: "480 cartons",
    certifyingStamp: "Dubai Chamber of Commerce", signatoryName: "A. Signatory",
    uaeEmbassyStamp: "attested", uaeMofaStamp: "attested",
  };
  return { invoice, packingList, bol, certificateOfOrigin };
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

// ── DOC-05 / DOC-06: corridor customs references ────────────────────────────
//
// These are required by ROUTE, not by choice — the register keys them off the
// corridor ("all UK export deals", "all UAE import deals"). Derived from the
// agreed ports so a seller cannot skip one by leaving a box unticked.
const UK_TO_UAE: DealTerms = { ...TERMS, portOfLoading: "Felixstowe, GB", portOfDischarge: "Jebel Ali, AE" };

describe("requiredCustoms", () => {
  // The register keys CDS off the EXPORT leg and Mirsal2 off the IMPORT leg, so
  // direction matters: the base fixture runs Jebel Ali -> Felixstowe, which is a
  // UAE export to the UK and therefore triggers neither of these two.
  it("requires both on a UK -> UAE deal", () => {
    expect(requiredCustoms(UK_TO_UAE)).toEqual({ uk: true, uae: true });
  });

  it("requires neither on the reverse leg (UAE -> UK)", () => {
    expect(requiredCustoms(TERMS)).toEqual({ uk: false, uae: false });
  });

  it("requires neither when the terms name no route", () => {
    expect(requiredCustoms({ ...TERMS, portOfLoading: null, portOfDischarge: null }))
      .toEqual({ uk: false, uae: false });
  });

  it("requires neither on an unrelated corridor", () => {
    const other = { ...TERMS, portOfLoading: "Shanghai, CN", portOfDischarge: "Rotterdam, NL" };
    expect(requiredCustoms(other)).toEqual({ uk: false, uae: false });
  });
});

// compliantPack() carries TERMS' ports (Jebel Ali -> Felixstowe). Flip them so
// the documents agree with the UK -> UAE corridor under test; otherwise the port
// grades fail and mask what these tests are actually about.
function ukToUaePack(): DocumentPack {
  const p = compliantPack();
  for (const d of [p.packingList, p.bol]) {
    d.portOfLoading = "Felixstowe, GB";
    d.portOfDischarge = "Jebel Ali, AE";
  }
  return p;
}

describe("UAE import clearance (DOC-06)", () => {
  const AE = UK_TO_UAE; // discharge into Jebel Ali — Mirsal2 applies
  const withUae = (over: Record<string, string> = {}): DocumentPack => ({
    ...ukToUaePack(),
    ukCustoms: { mrn: "26GB1234567890ABC1", exportLicenceNumber: "" },
    uaeCustoms: {
      importerName: TERMS.buyerName, importerTrn: "100123456700003",
      declarationNumber: "MRS2-9911", declarationType: "Type 1",
      declaredValue: "2500.00", currency: "USDC", hsCode: "5208.52",
      countryOfOrigin: "IN", attachmentsConfirmed: "confirmed", ...over,
    },
  });

  it("is Compliant when the declaration matches the invoice", () => {
    expect(gradeDocuments(withUae(), AE).verdict).toBe("Compliant");
  });

  it("fails when the declaration is missing entirely on a UAE import", () => {
    const v = gradeDocuments(ukToUaePack(), AE);
    expect(v.verdict).toBe("Discrepant");
    expect(v.rules.find((r) => r.rule.startsWith("uae_import_cleared"))?.pass).toBe(false);
  });

  // Over/under-invoicing is the classic trade-based money-laundering signature.
  it("catches a customs value that differs from the invoice", () => {
    const v = gradeDocuments(withUae({ declaredValue: "1200.00" }), AE);
    expect(v.verdict).toBe("Discrepant");
    expect(v.rules.find((r) => r.rule.startsWith("declared_value"))?.pass).toBe(false);
  });

  it("catches an importer who is not the buyer", () => {
    expect(gradeDocuments(withUae({ importerName: "Someone Else" }), AE).verdict).toBe("Discrepant");
  });

  it("holds when Dubai Customs attachments are not confirmed", () => {
    expect(gradeDocuments(withUae(), AE).verdict).toBe("Compliant");
    const missing = gradeDocuments(withUae({ attachmentsConfirmed: "" }), AE);
    expect(missing.rules.find((r) => r.rule.startsWith("customs_attachments"))?.pass).toBe(false);
    expect(missing.verdict).toBe("Held");
  });

  it("skips the UAE rules entirely on a non-UAE corridor", () => {
    const other = { ...TERMS, portOfDischarge: "Rotterdam, NL" };
    const p = compliantPack();
    for (const d of [p.packingList, p.bol]) d.portOfDischarge = "Rotterdam, NL";
    const v = gradeDocuments(p, other);
    expect(v.rules.some((r) => r.rule.startsWith("uae_import"))).toBe(false);
    expect(v.verdict).toBe("Compliant");
  });
});

describe("UK export clearance (DOC-05)", () => {
  const UK_TERMS = UK_TO_UAE;
  const withUk = (over: Record<string, string> = {}): DocumentPack => ({
    ...ukToUaePack(),
    ukCustoms: { mrn: "26GB1234567890ABC1", exportLicenceNumber: "", ...over },
    uaeCustoms: {
      importerName: TERMS.buyerName, importerTrn: "1", declarationNumber: "MRS2-1",
      declarationType: "Type 1", declaredValue: "2500.00", currency: "USDC",
      hsCode: "5208.52", countryOfOrigin: "IN", attachmentsConfirmed: "confirmed",
    },
  });

  it("requires an HMRC MRN on a UK export", () => {
    expect(gradeDocuments(withUk(), UK_TERMS).verdict).toBe("Compliant");
    expect(gradeDocuments(withUk({ mrn: "" }), UK_TERMS).verdict).toBe("Discrepant");
  });

  // A licence NUMBER being present means the goods are controlled — that is
  // what needs a human, so presence fires the flag rather than absence.
  it("holds when an export licence is declared (controlled goods)", () => {
    expect(gradeDocuments(withUk({ exportLicenceNumber: "GBSIEA2026/1234" }), UK_TERMS).verdict).toBe("Held");
  });
});

// ── DOC-04: Certificate of Origin ───────────────────────────────────────────
//
// Chamber-of-commerce issued, so the certifying stamp is what makes it evidence.
// The stamp being missing HOLDS (not yet certified — a human resolves it);
// a wrong exporter name FAILS (the paperwork is simply wrong). That distinction
// is the point of having two outcomes.
describe("certificate of origin (DOC-04)", () => {
  it("is required on every corridor", () => {
    const { certificateOfOrigin: _drop, ...without } = compliantPack();
    const v = gradeDocuments(without as DocumentPack, TERMS);
    expect(v.verdict).toBe("Discrepant");
    expect(v.rules.find((r) => r.rule.startsWith("document_present (certificate"))?.pass).toBe(false);
  });

  it("catches an exporter who is not the seller", () => {
    const p = compliantPack();
    p.certificateOfOrigin!.exporterName = "Someone Else Ltd";
    expect(gradeDocuments(p, TERMS).verdict).toBe("Discrepant");
  });

  it("requires a valid GSP Form A origin criterion", () => {
    const p = compliantPack();
    p.certificateOfOrigin!.originCriterion = "Z";
    const v = gradeDocuments(p, TERMS);
    expect(v.verdict).toBe("Discrepant");
    expect(v.rules.find((r) => r.rule.startsWith("origin_criterion"))?.pass).toBe(false);
    for (const ok of ["P", "W", "Y", "G", "F", "p"]) {
      const q = compliantPack();
      q.certificateOfOrigin!.originCriterion = ok;
      expect(gradeDocuments(q, TERMS).verdict).toBe("Compliant");
    }
  });

  it("cross-checks the invoice number and weight against the other documents", () => {
    const p = compliantPack();
    p.certificateOfOrigin!.invoiceNumber = "INV-OTHER";
    expect(gradeDocuments(p, TERMS).rules.find((r) => r.rule.startsWith("invoice_number (CoO"))?.pass).toBe(false);
    const q = compliantPack();
    q.certificateOfOrigin!.grossWeight = "9,999 kg";
    expect(gradeDocuments(q, TERMS).verdict).toBe("Discrepant");
  });

  // The distinction that matters: missing certification is a hold, not a failure.
  it("holds — does not fail — when the chamber stamp is missing", () => {
    const p = compliantPack();
    p.certificateOfOrigin!.certifyingStamp = "";
    const v = gradeDocuments(p, TERMS);
    expect(v.verdict).toBe("Held");
    expect(v.rules.find((r) => r.rule.startsWith("certifying_stamp"))?.pass).toBe(false);
  });

  it("holds a UAE import missing embassy or MoFA attestation", () => {
    const uaeTerms = { ...TERMS, portOfLoading: "Felixstowe, GB", portOfDischarge: "Jebel Ali, AE" };
    for (const key of ["uaeEmbassyStamp", "uaeMofaStamp"] as const) {
      const p = ukToUaePack();
      p.certificateOfOrigin![key] = "";
      p.ukCustoms = { mrn: "26GB1", exportLicenceNumber: "" };
      p.uaeCustoms = {
        importerName: TERMS.buyerName, importerTrn: "1", declarationNumber: "MRS2-1",
        declarationType: "Type 1", declaredValue: "2500.00", currency: "USDC",
        hsCode: "5208.52", countryOfOrigin: "GB", attachmentsConfirmed: "confirmed",
      };
      expect(gradeDocuments(p, uaeTerms).verdict).toBe("Held");
    }
  });

  it("does not check UAE attestation on a non-UAE corridor", () => {
    const p = compliantPack();
    p.certificateOfOrigin!.uaeEmbassyStamp = "";
    p.certificateOfOrigin!.uaeMofaStamp = "";
    // TERMS discharges into the UK, so the UAE stamps are not required.
    expect(gradeDocuments(p, TERMS).verdict).toBe("Compliant");
  });
});

// Regression: the submit route once rebuilt the pack from three fixed fields,
// silently dropping the certificate of origin and both customs references. The
// engine then failed the pack for a document the seller HAD filled in, which is
// indistinguishable from a genuine discrepancy at the UI. These pin the shape
// the route must preserve.
describe("pack completeness (route contract)", () => {
  it("a pack carrying every document grades on its contents, not its shape", () => {
    const full = { ...ukToUaePack(), ...{
      ukCustoms: { mrn: "26GB1234567890ABC1", exportLicenceNumber: "" },
      uaeCustoms: {
        importerName: TERMS.buyerName, importerTrn: "1", declarationNumber: "MRS2-1",
        declarationType: "Type 1", declaredValue: "2500.00", currency: "USDC",
        hsCode: "5208.52", countryOfOrigin: "GB", attachmentsConfirmed: "confirmed",
      },
    } } as DocumentPack;
    expect(gradeDocuments(full, UK_TO_UAE).verdict).toBe("Compliant");
  });

  it("dropping the certificate of origin is Discrepant, and says which document", () => {
    const { certificateOfOrigin: _drop, ...stripped } = ukToUaePack();
    const v = gradeDocuments(stripped as DocumentPack, TERMS);
    const failed = v.rules.filter((r) => !r.pass).map((r) => r.rule);
    expect(failed).toContain("document_present (certificate of origin)");
  });

  it("dropping the customs references on a corridor that needs them is Discrepant", () => {
    const v = gradeDocuments(ukToUaePack(), UK_TO_UAE);
    const failed = v.rules.filter((r) => !r.pass).map((r) => r.rule);
    expect(failed).toContain("uk_export_cleared (CDS MRN present)");
    expect(failed).toContain("uae_import_cleared (Mirsal2 declaration number)");
  });
});
