// Deterministic document rules engine (AP-5: all money math in code, never in
// AI free-text). Grades the seller's document pack against the agreed terms.
//
// Field sets follow docs/document-templates.md — DOC-01 (Commercial Invoice),
// DOC-02 (Packing List), DOC-03 (Bill of Lading, BIMCO CONGENBILL 2016). The
// register's full product collects more; this implements every field that is
// load-bearing (GRADE / CROSS / FLAG) plus the recorded particulars a
// documentary examiner needs. AI extraction can replace the manual forms later —
// these schemas ARE the extraction target.
//
// Three rule kinds, per the register:
//   GRADE — checked against the agreed deal terms. Fail = Discrepant.
//   CROSS — checked against another document in the same pack. Faking one
//           document consistently across three is much harder than faking one,
//           so this is the engine's real anti-fraud mechanism.
//   FLAG  — does not fail the pack; it HOLDS it (UCP 600 Art. 27 for claused
//           bills). A held pack never auto-releases: the objection window's
//           quiet expiry is not consent when a flag is standing, so release
//           requires the buyer's explicit approval.
//
// Verdict outcomes:
//   Compliant  — all grades and crosses pass, no flags. Notice + window.
//   Held       — grades and crosses pass but a flag fired. Notice, but no
//                quiet-expiry release.
//   Discrepant — a grade or cross failed. No notice; seller corrects.
import type { DealTerms } from "./store";

// ── field sets ───────────────────────────────────────────────────────────────

/** DOC-01 — Commercial Invoice. */
export interface InvoiceFields {
  invoiceNumber: string; // CROSS: packing list + B/L reference carry this
  sellerName: string; // GRADE: = terms.sellerName
  buyerName: string; // GRADE: = terms.buyerName
  goodsDescription: string; // GRADE: token-match against terms.goods
  currency: string; // GRADE: must match the escrow currency (USDC)
  totalValue: string; // GRADE: must equal the escrow amount — exact decimal compare
  invoiceDate: string; // GRADE: YYYY-MM-DD, ≤ shipment deadline
  incoterm: string; // GRADE when terms carry one; recorded otherwise
  quantity: string; // CROSS: = packing list
  packages: string; // CROSS: = packing list
  grossWeight: string; // CROSS: = packing list + B/L
  hsCode: string; // GRADE: required on all deals (export controls input)
  hazardousGoods: string; // FLAG: any entry triggers human review
  signatoryName: string; // GRADE: present (declaration must be signed)
}

/** DOC-02 — Packing List. */
export interface PackingListFields {
  exporterName: string; // GRADE: = terms.sellerName
  consigneeName: string; // GRADE: = terms.buyerName
  invoiceNumber: string; // CROSS: = invoice
  blNumber: string; // CROSS: = B/L
  vessel: string; // CROSS: = B/L
  voyageNumber: string; // CROSS: = B/L
  portOfLoading: string; // GRADE vs terms (when set) + CROSS vs B/L
  portOfDischarge: string; // GRADE vs terms (when set) + CROSS vs B/L
  departureDate: string; // GRADE: YYYY-MM-DD, ≤ shipment deadline
  goodsDescription: string; // GRADE: token-match against terms.goods
  quantity: string; // CROSS: = invoice
  packages: string; // CROSS: = invoice
  grossWeight: string; // CROSS: = B/L
  signatoryName: string; // GRADE: present
}

/** DOC-03 — Bill of Lading. */
export interface BolFields {
  blNumber: string; // present + CROSS: = packing list
  shipperName: string; // GRADE: = terms.sellerName
  consigneeName: string; // GRADE: = terms.buyerName
  goodsDescription: string; // GRADE: token-match against terms.goods
  shippedOnBoardDate: string; // GRADE: YYYY-MM-DD, ≤ shipment deadline
  portOfLoading: string; // GRADE vs terms (when set) + CROSS vs packing list
  portOfDischarge: string; // GRADE vs terms (when set) + CROSS vs packing list
  vessel: string; // CROSS: = packing list
  voyageNumber: string; // CROSS: = packing list
  packages: string; // CROSS: = packing list
  grossWeight: string; // CROSS: = packing list + invoice
  containerNumber: string; // RECORD
  signedBy: string; // GRADE: present — UCP 600 Art. 20, carrier/master/agent
  cleanOnBoard: string; // FLAG: anything other than "clean" holds (Art. 27)
  onDeckNotation: string; // FLAG: on-deck stowage holds
  freightPayment: string; // GRADE: CIF/CFR/CIP/CPT terms must show "prepaid"
}

/**
 * DOC-04 — Certificate of Origin (UNCTAD GSP Form A).
 *
 * Issued by a chamber of commerce, not the seller — so like the B/L, the seller
 * transcribes someone else's document, and the certifying stamp is what makes it
 * evidence rather than a claim. Its absence is a hold, not a failure: a missing
 * stamp means "not yet certified", which a human resolves, whereas a wrong
 * exporter name means the paperwork is wrong.
 *
 * UAE deals additionally need embassy and MoFA attestation, which the register
 * flags separately because they are stamps ON this certificate rather than
 * documents of their own.
 */
export interface CertificateOfOriginFields {
  exporterName: string; // GRADE: = terms.sellerName
  consigneeName: string; // GRADE: = terms.buyerName
  issuedInCountry: string; // GRADE: present — the exporting country
  referenceNumber: string; // CROSS: = invoice number
  goodsDescription: string; // GRADE: token-match against terms.goods
  originCriterion: string; // GRADE: one of the GSP Form A codes
  grossWeight: string; // CROSS: = invoice + packing list
  invoiceNumber: string; // CROSS: = invoice (Box 10)
  marksAndNumbers: string; // CROSS: = packing list packages (Box 6)
  certifyingStamp: string; // FLAG: chamber of commerce stamp — hold if missing
  signatoryName: string; // GRADE: present (Box 12)
  uaeEmbassyStamp: string; // FLAG: UAE corridor only — hold if missing
  uaeMofaStamp: string; // FLAG: UAE corridor only — hold if missing
}

/** Valid GSP Form A origin criteria (UNCTAD). */
export const ORIGIN_CRITERIA = ["P", "W", "Y", "G", "F"] as const;

/**
 * DOC-05 — UK CDS export declaration. Reference numbers only.
 *
 * Blockmediary does not process the declaration: the seller's freight forwarder
 * files it with HMRC. We collect the outputs that prove HMRC accepted it. This
 * is also the one document category where genuine third-party verification is
 * reachable — HMRC exposes an API to check an MRN — so the field is shaped to
 * be checkable later, not just recorded.
 */
export interface UkCustomsFields {
  mrn: string; // GRADE: present — proves the export declaration was accepted
  exportLicenceNumber: string; // FLAG: dual-use / strategic goods need one
}

/** DOC-06 — Dubai Customs (Mirsal2) import declaration. Filed by the BUYER. */
export interface UaeCustomsFields {
  importerName: string; // GRADE: = terms.buyerName
  importerTrn: string; // RECORD: UAE VAT registration
  declarationNumber: string; // GRADE: present — proof UAE customs accepted it
  declarationType: string; // RECORD: Type 1 standard import
  declaredValue: string; // CROSS: = commercial invoice total
  currency: string; // GRADE: = escrow currency
  hsCode: string; // CROSS: = invoice
  countryOfOrigin: string; // CROSS: = invoice/packing list origin
  attachmentsConfirmed: string; // FLAG: Dubai Customs needs all four attachments
}

export interface DocumentPack {
  invoice: InvoiceFields;
  packingList: PackingListFields;
  bol: BolFields;
  /** Required on all corridors (DOC-04). Optional in the type only so reviews
   *  stored before it existed still parse. */
  certificateOfOrigin?: CertificateOfOriginFields;
  /**
   * Corridor-conditional. Present only when the deal's route requires them —
   * a UK export needs CDS, a UAE import needs Mirsal2, and a deal that is
   * neither needs neither. Absent = the checks are skipped, never failed.
   */
  ukCustoms?: UkCustomsFields;
  uaeCustoms?: UaeCustomsFields;
}

/** Recorded-only particulars, in display order — single source for form + audit. */
export const RECORDED_FIELDS: { doc: keyof DocumentPack; key: string; label: string }[] = [
  { doc: "bol", key: "containerNumber", label: "Container No." },
];

// ── verdict shapes ───────────────────────────────────────────────────────────

export type RuleKind = "grade" | "cross" | "flag";

export interface RuleResult {
  rule: string;
  kind: RuleKind;
  pass: boolean; // for flags: pass=true means "did not fire"
  expected: string;
  actual: string;
}

export interface Verdict {
  verdict: "Compliant" | "Discrepant" | "Held";
  rules: RuleResult[];
}

// ── comparison helpers ───────────────────────────────────────────────────────

const norm = (s: string) => (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const present = (s: string) => (s ?? "").trim().length > 0;

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? "");

// Deterministic goods check: every meaningful token of the agreed goods
// description must appear in the document's description. Containment rather
// than equality because trade documents carry extra detail (marks, counts,
// container wording) beyond the terms' summary.
const tokens = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

function goodsCover(docDescription: string, termsGoods: string): { pass: boolean; detail: string } {
  const want = tokens(termsGoods);
  const have = new Set(tokens(docDescription));
  if (want.length === 0) return { pass: false, detail: "no goods in terms" };
  const missing = want.filter((t) => !have.has(t));
  return {
    pass: missing.length === 0,
    detail: missing.length === 0 ? "all terms present" : `missing: ${missing.join(", ")}`,
  };
}

// Quantities and weights arrive as human text ("8,640 kg", "480 cartons").
// Compare the numbers, not the prose: strip everything but digits and dots.
// Two blank values match (nothing claimed on either side is not a mismatch).
function numbersMatch(a: string, b: string): boolean {
  const num = (s: string) => (s ?? "").replace(/[^0-9.]/g, "");
  return num(a) === num(b);
}

// Money is compared as exact decimal strings via minor units — never floats
// (AP-5). "2500", "2500.0" and "2500.00" are the same amount.
export function amountsEqual(a: string, b: string): boolean {
  const minor = (s: string): bigint | null => {
    const m = /^\s*([0-9]+)(?:\.([0-9]{1,6}))?\s*$/.exec(s ?? "");
    if (!m) return null;
    return BigInt(m[1]) * 1_000_000n + BigInt((m[2] ?? "").padEnd(6, "0") || "0");
  };
  const am = minor(a);
  const bm = minor(b);
  return am !== null && bm !== null && am === bm;
}

/**
 * Which corridor documents this deal requires, derived from the agreed route.
 *
 * Deliberately derived rather than asked: the register keys these off the
 * corridor ("all UK export deals", "all UAE import deals"), and a seller should
 * not be able to skip a customs reference by leaving a checkbox unticked. When
 * the terms name no ports we require neither — a deal with no agreed route has
 * no corridor to infer.
 */
export function requiredCustoms(terms: DealTerms): { uk: boolean; uae: boolean } {
  const from = norm(terms.portOfLoading ?? "");
  const to = norm(terms.portOfDischarge ?? "");
  const isUk = (p: string) => /\b(gb|uk|united kingdom|england|scotland|wales)\b/.test(p);
  const isUae = (p: string) => /\b(ae|uae|united arab emirates|dubai|jebel ali|abu dhabi|sharjah)\b/.test(p);
  return { uk: isUk(from), uae: isUae(to) };
}

// ── the engine ───────────────────────────────────────────────────────────────

export function gradeDocuments(pack: DocumentPack, terms: DealTerms): Verdict {
  const { invoice, packingList: pl, bol } = pack;
  const rules: RuleResult[] = [];

  const grade = (rule: string, pass: boolean, expected: string, actual: string) =>
    rules.push({ rule, kind: "grade", pass, expected, actual: actual || "(empty)" });
  const cross = (rule: string, pass: boolean, expected: string, actual: string) =>
    rules.push({ rule, kind: "cross", pass, expected, actual: actual || "(empty)" });
  const flag = (rule: string, fired: boolean, expected: string, actual: string) =>
    rules.push({ rule, kind: "flag", pass: !fired, expected, actual: actual || "(none)" });

  // ── GRADE: parties, on every document that names them ──
  grade("party_match (invoice seller = terms)", norm(invoice.sellerName) === norm(terms.sellerName), terms.sellerName, invoice.sellerName);
  grade("party_match (invoice buyer = terms)", norm(invoice.buyerName) === norm(terms.buyerName), terms.buyerName, invoice.buyerName);
  grade("party_match (packing list exporter = seller)", norm(pl.exporterName) === norm(terms.sellerName), terms.sellerName, pl.exporterName);
  grade("party_match (packing list consignee = buyer)", norm(pl.consigneeName) === norm(terms.buyerName), terms.buyerName, pl.consigneeName);
  grade("party_match (B/L shipper = seller)", norm(bol.shipperName) === norm(terms.sellerName), terms.sellerName, bol.shipperName);
  grade("party_match (B/L consignee = buyer)", norm(bol.consigneeName) === norm(terms.buyerName), terms.buyerName, bol.consigneeName);

  // ── GRADE: goods description on every document ──
  for (const [label, desc] of [
    ["invoice", invoice.goodsDescription],
    ["packing list", pl.goodsDescription],
    ["B/L", bol.goodsDescription],
  ] as const) {
    const g = goodsCover(desc, terms.goods);
    grade(`goods_match (${label} covers agreed goods)`, g.pass, terms.goods, present(desc) ? `${desc.trim()} (${g.detail})` : "");
  }

  // ── GRADE: money — the invoice total must equal the escrow amount exactly ──
  grade(
    "amount_match (invoice total = escrow amount)",
    amountsEqual(invoice.totalValue, terms.amountUsdc),
    `${terms.amountUsdc} USDC`,
    invoice.totalValue,
  );
  grade("currency_match (invoice currency = escrow)", norm(invoice.currency) === "usdc", "USDC", invoice.currency);

  // ── GRADE: dates — deadlines come from the terms, never from the documents ──
  for (const [label, date] of [
    ["invoice date", invoice.invoiceDate],
    ["packing list departure", pl.departureDate],
    ["B/L shipped-on-board", bol.shippedOnBoardDate],
  ] as const) {
    grade(
      `shipment_by (${label} ≤ deadline)`,
      isDate(date) && date <= terms.shipmentDeadline,
      `on or before ${terms.shipmentDeadline}`,
      date,
    );
  }

  // ── GRADE: ports, when the terms name them; always CROSS between documents ──
  const termPorts: [string, string | null | undefined, string, string][] = [
    ["port_of_loading", terms.portOfLoading, pl.portOfLoading, bol.portOfLoading],
    ["port_of_discharge", terms.portOfDischarge, pl.portOfDischarge, bol.portOfDischarge],
  ];
  for (const [name, agreed, plPort, bolPort] of termPorts) {
    if (agreed && present(agreed)) {
      grade(`${name} (B/L = terms)`, norm(bolPort) === norm(agreed), agreed, bolPort);
      grade(`${name} (packing list = terms)`, norm(plPort) === norm(agreed), agreed, plPort);
    }
    cross(`${name} (packing list = B/L)`, norm(plPort) === norm(bolPort), bolPort || "(empty)", plPort);
  }

  // ── GRADE: incoterm and freight payment ──
  if (terms.incoterm && present(terms.incoterm)) {
    grade("incoterm_match (invoice = terms)", norm(invoice.incoterm) === norm(terms.incoterm), terms.incoterm, invoice.incoterm);
    // Under C-terms the seller pays freight, so the B/L must say prepaid —
    // "collect" on a CIF deal means the buyer is being charged twice.
    if (["cif", "cfr", "cip", "cpt"].includes(norm(terms.incoterm))) {
      grade(
        `freight_payment (${terms.incoterm.toUpperCase()} requires prepaid)`,
        norm(bol.freightPayment) === "prepaid",
        "prepaid",
        bol.freightPayment,
      );
    }
  }

  // ── GRADE: signatures and required identifiers ──
  grade("signed (invoice declaration)", present(invoice.signatoryName), "a named signatory", invoice.signatoryName);
  grade("signed (packing list)", present(pl.signatoryName), "a named signatory", pl.signatoryName);
  grade("signed (B/L by carrier/master/agent — UCP 600 Art. 20)", present(bol.signedBy), "carrier, master or agent", bol.signedBy);
  grade("document_present (B/L number)", present(bol.blNumber), "a B/L number", bol.blNumber);
  grade("hs_code_present (export controls input)", present(invoice.hsCode), "an HS code", invoice.hsCode);

  // ── CROSS: the same facts stated on different documents must agree ──
  cross("invoice_number (packing list = invoice)", norm(pl.invoiceNumber) === norm(invoice.invoiceNumber) && present(invoice.invoiceNumber), invoice.invoiceNumber || "(empty)", pl.invoiceNumber);
  cross("bl_number (packing list = B/L)", norm(pl.blNumber) === norm(bol.blNumber) && present(bol.blNumber), bol.blNumber || "(empty)", pl.blNumber);
  cross("vessel (packing list = B/L)", norm(pl.vessel) === norm(bol.vessel), bol.vessel || "(empty)", pl.vessel);
  cross("voyage (packing list = B/L)", norm(pl.voyageNumber) === norm(bol.voyageNumber), bol.voyageNumber || "(empty)", pl.voyageNumber);
  cross("quantity (invoice = packing list)", numbersMatch(invoice.quantity, pl.quantity), pl.quantity || "(empty)", invoice.quantity);
  cross("packages (invoice = packing list)", numbersMatch(invoice.packages, pl.packages), pl.packages || "(empty)", invoice.packages);
  cross("packages (B/L = packing list)", numbersMatch(bol.packages, pl.packages), pl.packages || "(empty)", bol.packages);
  cross("gross_weight (invoice = packing list)", numbersMatch(invoice.grossWeight, pl.grossWeight), pl.grossWeight || "(empty)", invoice.grossWeight);
  cross("gross_weight (B/L = packing list)", numbersMatch(bol.grossWeight, pl.grossWeight), pl.grossWeight || "(empty)", bol.grossWeight);

  // ── Certificate of Origin (DOC-04) — required on all corridors ──
  // Chamber-of-commerce issued, so the certifying stamp is what turns it into
  // evidence. Missing stamp = hold (not yet certified, a human resolves it);
  // wrong exporter = fail (the paperwork is simply wrong).
  const coo = pack.certificateOfOrigin;
  grade("document_present (certificate of origin)", !!coo, "a certificate of origin", coo ? "supplied" : "");
  if (coo) {
    grade("party_match (CoO exporter = seller)", norm(coo.exporterName) === norm(terms.sellerName), terms.sellerName, coo.exporterName);
    grade("party_match (CoO consignee = buyer)", norm(coo.consigneeName) === norm(terms.buyerName), terms.buyerName, coo.consigneeName);
    const g = goodsCover(coo.goodsDescription, terms.goods);
    grade("goods_match (CoO covers agreed goods)", g.pass, terms.goods, present(coo.goodsDescription) ? `${coo.goodsDescription.trim()} (${g.detail})` : "");
    grade("issued_in (country of issue stated)", present(coo.issuedInCountry), "the exporting country", coo.issuedInCountry);
    grade(
      "origin_criterion (valid GSP Form A code)",
      ORIGIN_CRITERIA.includes(coo.originCriterion.trim().toUpperCase() as (typeof ORIGIN_CRITERIA)[number]),
      ORIGIN_CRITERIA.join(" / "),
      coo.originCriterion,
    );
    grade("signed (CoO Box 12)", present(coo.signatoryName), "a named signatory", coo.signatoryName);

    cross("invoice_number (CoO = invoice)", norm(coo.invoiceNumber) === norm(invoice.invoiceNumber) && present(invoice.invoiceNumber), invoice.invoiceNumber || "(empty)", coo.invoiceNumber);
    cross("reference (CoO = invoice number)", norm(coo.referenceNumber) === norm(invoice.invoiceNumber) && present(invoice.invoiceNumber), invoice.invoiceNumber || "(empty)", coo.referenceNumber);
    cross("gross_weight (CoO = packing list)", numbersMatch(coo.grossWeight, pl.grossWeight), pl.grossWeight || "(empty)", coo.grossWeight);
    cross("marks_and_numbers (CoO = packing list)", numbersMatch(coo.marksAndNumbers, pl.packages), pl.packages || "(empty)", coo.marksAndNumbers);

    flag("certifying_stamp (chamber of commerce)", !present(coo.certifyingStamp), "stamped and signed", coo.certifyingStamp);
  }

  // ── Corridor customs references (DOC-05 / DOC-06) ──
  // Required by route, not by choice. Each proves a customs authority accepted a
  // declaration we never see — Blockmediary collects the outputs, not the filing.
  const need = requiredCustoms(terms);

  if (need.uk) {
    const uk = pack.ukCustoms;
    grade("uk_export_cleared (CDS MRN present)", present(uk?.mrn ?? ""), "an HMRC Movement Reference Number", uk?.mrn ?? "");
    // An export licence is not required for most goods; its PRESENCE means the
    // goods are controlled, which is what needs a human to look.
    flag("export_licence (UK dual-use / strategic goods)", present(uk?.exportLicenceNumber ?? ""), "no licence required", uk?.exportLicenceNumber ?? "");
  }

  if (need.uae) {
    const ae = pack.uaeCustoms;
    grade("uae_import_cleared (Mirsal2 declaration number)", present(ae?.declarationNumber ?? ""), "a Dubai Customs declaration number", ae?.declarationNumber ?? "");
    grade("importer_match (Mirsal2 importer = buyer)", norm(ae?.importerName ?? "") === norm(terms.buyerName), terms.buyerName, ae?.importerName ?? "");
    grade("currency_match (Mirsal2 currency = escrow)", norm(ae?.currency ?? "") === "usdc", "USDC", ae?.currency ?? "");
    // The value declared to customs must be the value on the invoice: a gap
    // between them is the classic trade-based money-laundering signature
    // (over/under-invoicing), which legal-risk.md names as a live typology.
    cross("declared_value (Mirsal2 = commercial invoice)", amountsEqual(ae?.declaredValue ?? "", invoice.totalValue), invoice.totalValue || "(empty)", ae?.declaredValue ?? "");
    cross("hs_code (Mirsal2 = invoice)", norm(ae?.hsCode ?? "") === norm(invoice.hsCode), invoice.hsCode || "(empty)", ae?.hsCode ?? "");
    flag("customs_attachments (Dubai Customs requires all four)", !present(ae?.attachmentsConfirmed ?? ""), "confirmed", ae?.attachmentsConfirmed ?? "");
    // UAE deals need the certificate of origin attested twice over — these are
    // stamps ON the CoO rather than documents of their own, so they live here
    // with the corridor that demands them.
    if (coo) {
      flag("uae_embassy_attestation (CoO)", !present(coo.uaeEmbassyStamp), "attested", coo.uaeEmbassyStamp);
      flag("uae_mofa_attestation (CoO)", !present(coo.uaeMofaStamp), "attested", coo.uaeMofaStamp);
    }
  }

  // ── FLAG: automatic holds for human review — these never auto-release ──
  flag(
    "clean_on_board (UCP 600 Art. 27 — no damage/defect clauses)",
    present(bol.cleanOnBoard) && norm(bol.cleanOnBoard) !== "clean",
    "clean",
    bol.cleanOnBoard,
  );
  flag("on_deck_cargo (stowage notation)", present(bol.onDeckNotation), "no on-deck notation", bol.onDeckNotation);
  flag("hazardous_goods (invoice declaration)", present(invoice.hazardousGoods), "no hazardous goods", invoice.hazardousGoods);

  // ── verdict ──
  const hardFail = rules.some((r) => r.kind !== "flag" && !r.pass);
  const flagged = rules.some((r) => r.kind === "flag" && !r.pass);
  return {
    verdict: hardFail ? "Discrepant" : flagged ? "Held" : "Compliant",
    rules,
  };
}
