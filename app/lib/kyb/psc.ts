// Know-Your-Business field definitions and completeness rules.
//
// Source: docs/document-templates.md — DOC-15 (Certificate of Incorporation),
// DOC-17 (UBO / PSC register), DOC-18 (signatory passport), DOC-19 (source of
// funds). Those specs describe the full regime; this module implements the
// subset the proof of concept collects.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS IS NOT: verification.
//
// Every value here is SELF-DECLARED by the user. Nothing is checked against
// Companies House, a UAE free-zone registrar, or any sanctions list. A company
// that completes onboarding is "attested", never "verified" — the wording is
// deliberate and is carried through to the UI so a demo cannot be mistaken for
// a compliance system.
//
// Production needs, at minimum (docs/legal-risk.md):
//   • sanctions screening against OFSI / UN / EU / OFAC lists, re-run at BOTH
//     funding and release — lists change between the two
//   • Companies House PSC identity verification (mandatory since 18 Nov 2025)
//   • registry lookup confirming the company number matches the stated name
//   • uploaded documents behind each declaration, not just typed fields
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The five statutory conditions for significant control.
 *
 * UK: Companies Act 2006 Part 21A. UAE: Federal Decree-Law No. 20 of 2018.
 * Both set the threshold at 25%. A PSC meets one or more of these; the register
 * records which, because the control mechanism matters as much as the identity.
 */
export const CONTROL_CONDITIONS = [
  { key: "shares_over_25", label: "Holds more than 25% of shares" },
  { key: "voting_over_25", label: "Holds more than 25% of voting rights" },
  { key: "appoint_directors", label: "Can appoint or remove a majority of directors" },
  { key: "significant_influence", label: "Exercises significant influence or control" },
  { key: "trust_control", label: "Controls a trust or firm that meets one of the above" },
] as const;

export type ControlConditionKey = (typeof CONTROL_CONDITIONS)[number]["key"];

export function isControlCondition(v: unknown): v is ControlConditionKey {
  return typeof v === "string" && CONTROL_CONDITIONS.some(c => c.key === v);
}

export function controlConditionLabel(key: string): string {
  return CONTROL_CONDITIONS.find(c => c.key === key)?.label ?? key;
}

/** Company types, kept broad enough to cover the UK and UAE corridors. */
export const COMPANY_TYPES = [
  "Private limited company",
  "Public limited company",
  "Limited liability partnership",
  "Free zone company (FZ-LLC)",
  "Free zone establishment (FZE)",
  "Mainland LLC",
  "Sole trader",
  "Other",
] as const;

export type KybFields = {
  registrationNumber?: string | null;
  companyType?: string | null;
  jurisdiction?: string | null;
  issuingAuthority?: string | null;
  incorporationDate?: Date | string | null;
  signatoryName?: string | null;
  signatoryNationality?: string | null;
  signatoryDob?: Date | string | null;
  signatoryPassportExpiry?: Date | string | null;
  fundsSourceNature?: string | null;
  fundsSourceCountry?: string | null;
  declaredNotCriminalFunds?: boolean;
  declaredNoSanctions?: boolean;
};

export type KybGap = { field: string; label: string };

const REQUIRED: { field: keyof KybFields; label: string }[] = [
  { field: "registrationNumber", label: "Company registration number" },
  { field: "companyType", label: "Company type" },
  { field: "jurisdiction", label: "Registered jurisdiction" },
  { field: "issuingAuthority", label: "Issuing authority" },
  { field: "incorporationDate", label: "Date of incorporation" },
  { field: "signatoryName", label: "Authorised signatory name" },
  { field: "signatoryNationality", label: "Signatory nationality" },
  { field: "signatoryDob", label: "Signatory date of birth" },
  { field: "signatoryPassportExpiry", label: "Signatory passport expiry" },
  { field: "fundsSourceNature", label: "Nature of business / source of funds" },
  { field: "fundsSourceCountry", label: "Country of origin of funds" },
];

const present = (v: unknown): boolean =>
  v !== null && v !== undefined && String(v).trim() !== "";

/** Which required KYB fields are still missing, in form order. */
export function kybGaps(a: KybFields, pscCount: number): KybGap[] {
  const gaps: KybGap[] = REQUIRED.filter(r => !present(a[r.field])).map(r => ({
    field: r.field,
    label: r.label,
  }));

  // Both declarations are 🚩 FLAG in DOC-19 — POCA 2002 / MLR 2017 Sch.2
  // obligations that must be positively affirmed, never defaulted to true.
  if (!a.declaredNotCriminalFunds) {
    gaps.push({ field: "declaredNotCriminalFunds", label: "Declaration: funds not from criminal activity" });
  }
  if (!a.declaredNoSanctions) {
    gaps.push({ field: "declaredNoSanctions", label: "Declaration: no sanctions designations apply" });
  }

  // A company with no declared beneficial owner has not answered the question
  // sanctions screening actually cares about.
  if (pscCount < 1) {
    gaps.push({ field: "peopleOfControl", label: "At least one person with significant control" });
  }

  return gaps;
}

export function isKybComplete(a: KybFields, pscCount: number): boolean {
  return kybGaps(a, pscCount).length === 0;
}

/**
 * An expired signatory passport is 🚩 FLAG in DOC-18 — an automatic hold, not a
 * warning, because an expired document is not valid KYC evidence.
 *
 * Separate from completeness on purpose: the field can be present and still
 * disqualifying, and the two produce different messages.
 */
export function passportExpired(expiry: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!present(expiry)) return false;
  const d = expiry instanceof Date ? expiry : new Date(String(expiry));
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < now.getTime();
}

export type KybStatus = "incomplete" | "attested";

/**
 * Whether a company may enter deals.
 *
 * PROOF OF CONCEPT — this gate checks that the company SAID everything, not
 * that any of it is true.
 */
export function canTrade(status: string, expiry?: Date | string | null): boolean {
  return status === "attested" && !passportExpired(expiry);
}
