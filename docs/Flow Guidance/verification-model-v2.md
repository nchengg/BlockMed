# Blockmediary Verification Model — v2

> **Status:** Working version (CEO-approved framing) · **Session:** 8 · **Date:** 2026-06-24
> **Owner:** Tamer (CEO) · **For:** Team review (Nick, Mo, Badhri, Dan, Conrad)
>
> **Supersedes:** the "six tiers" framing carried forward from Session 6 positioning.

---

## Framing

Four operational layers, plus a defined escalation route. Every deal passes through all four layers in sequence. Escalation is invoked, not standard.

**Phase 1 posture:** Blockmediary coordinates the workflow centrally, owns the audit data, and **contracts documentary examination to a regulated third-party examiner**. In-house examination is reserved for a later phase when corridor volume justifies it.

---

## Layer 1 — Counterparty & Deal Screening *(before any document work)*

Runs at deal origination, before the buyer funds escrow.

- KYB / KYC on buyer and seller (per BRD §9.2, FR-7)
- Sanctions, PEP, adverse-media screening on both entities and their UBOs
- Wallet ownership signature binding the wallet to the verified legal entity
- Corridor check (UK / UAE / KSA later — per Session 7 market correction)
- Goods category check (excludes sanctioned / prohibited / high-risk regulated goods)
- Cross-platform fraud-marker check on entities, wallets, and named issuers

**Purpose:** kill the deal before any document spend if the counterparty, corridor, or goods don't qualify. Cheapest layer; runs first.

**Output:** deal is *eligible* or *blocked / enhanced review required*.

**Performed by:** Blockmediary (automated screening providers + internal compliance review).

---

## Layer 2 — Automated Extraction & Rule-Checking

Runs when the seller submits documents.

- OCR / AI extraction of required fields from each document (commercial invoice, BoL, packing list, certificate of origin, etc.)
- Per-field confidence scoring (auto-accept threshold ≥ 0.9 per BRD §9.2)
- Rule-check against the canonical **escrow specification**: amount, currency, party names, goods description, quantity, shipment date vs deadline, origin/destination, Incoterm, transport reference, consignee
- Cross-document consistency check (invoice ↔ BoL ↔ packing list don't contradict each other)

**Purpose:** mechanical, deterministic checks at machine speed. No judgement — just "do the extracted fields match the escrow spec?"

**Output:** preliminary verdict *Compliant / Discrepant / Rejected*, with per-field confidence and a flagged-item list.

**Performed by:** Blockmediary (proprietary platform).

---

## Layer 3 — Source Corroboration *(where available)*

Runs in parallel with Layer 2, **where the source supports it.**

- Carrier-source verification on the Bill of Lading: eBoL where issued, shipper API check where exposed (DCSA-aligned where the carrier participates)
- Issuer-source verification on other documents where a digital channel exists (e.g. certificates of origin from issuing chambers that expose verification)

**Purpose:** corroborate that the document is genuine and was issued by the named source — not just internally consistent.

**Honest scope limit:** this layer **only fires for documents whose source supports it**. For the SME beachhead (UAE importers of Indian / Türkish textiles via smaller shippers), source corroboration will often be unavailable. When it is unavailable, the deal proceeds straight to Layer 4 with that limitation logged in the audit trail. We do not pretend Layer 3 ran when it didn't.

**Output:** *Corroborated*, *Source-unavailable (logged)*, or *Source-contradicted (escalate)*.

**Performed by:** Blockmediary platform (calling external carrier / issuer APIs).

---

## Layer 4 — Contracted Documentary Examiner *(mandatory final gate)*

Runs on every deal. Not optional.

- A contracted, regulated documentary examination firm (Phase 1 target: Dubai-based, UAE corridor) reviews the Layer 2 verdict + Layer 3 corroboration status + the actual documents
- Examiner applies UCP 600 documentary examination standards
- Examiner can confirm release, request a cure / waiver / amendment, or escalate
- Examiner verdict is recorded as **structured data** in the Blockmediary audit ledger (not just a signed PDF) before the on-chain release call

**Purpose:** judgement layer. UCP-style documentary examination, applied by a qualified third-party examiner, before any irreversible action. This is the layer that makes Blockmediary defensible as a documentary-credit-aligned product — performed by professionals contractually accountable for examination accuracy.

**Output:** *Release authorised*, *Cure requested*, *Waiver requested*, *Escalated*.

**Performed by:** Contracted documentary examination firm.

### Why outsourced for Phase 1

- **Liability cleanly contracted to the examiner** under their professional services agreement. Blockmediary warrants the *process*; the examiner warrants the *examination*.
- **Lower regulatory exposure** — Blockmediary is not performing the documentary determination as a regulated activity in-house.
- **Variable cost per deal** — no fixed examiner headcount before volume justifies it.
- **Faster path to live deals** — no time spent recruiting, training, supervising examiners during the MVP-to-firm window.

### Data ownership clause (non-negotiable)

The examiner supplies the verdict; Blockmediary owns the structured record of every examination — issuer reliability, document quality by corridor, fraud patterns, discrepancy types. The examiner does not retain analytical rights over our deal data. This protects the long-term data moat without holding the function in-house.

### Reserved right

Blockmediary may bring documentary examination in-house at any time without breach of the examiner contract. Locked into the agreement from day one.

---

## Escalation Route — *invoked, not standard*

Triggered by Layer 1 (enhanced review), Layer 3 (source contradiction), or Layer 4 (examiner escalation).

- Third-party document verification (specialist firms beyond the contracted examiner — e.g. forensic document analysts, additional Dubai-based legal verification firms)
- Counterparty re-verification, additional KYB enhanced due diligence
- Suspected fraud workflow — freeze release, compliance review
- Disputed-deal workflow — buyer objection, cure / waiver / amendment / dispute-forum referral per the parties' Trade Escrow Agreement

**Purpose:** the path for deals that the standard four-layer flow cannot resolve. Costed and slower — priced into the deal where invoked.

**What this layer is not:** an in-house physical document forensics capability. We do not build that. We refer out.

**Performed by:** specialist third parties (different from the Layer 4 contracted examiner where conflict-of-interest requires).

---

## What changed from the old "six tiers"

| Old framing | What it actually was | Now |
|---|---|---|
| Tier 1 — Tiered intake | A router, not a verification layer | Folded into Layer 1 as the screening function |
| Tier 2 — OCR + rules engine | Real | Layer 2 |
| Tier 3 — DCSA / carrier API | Real, but unavailable for most SME deals | Layer 3, with honest scope limit |
| Tier 4 — Human examiner | Mis-positioned as a middle tier; ownership ambiguous | Layer 4 — terminal gate, every deal, **contracted to third-party examiner** |
| Tier 5 — Cross-platform fraud DB | Mis-ordered at the end | Moved to Layer 1 (screening, before document spend) |
| Tier 6 — Physical + forensics | Not buildable in Phase 1 | Demoted to Escalation Route, referred out |

**Net:** four buildable layers + one escalation route. Examination contracted out for Phase 1 with structured-data ownership retained. Liability sits with the examiner; data sits with us.

---

## Downstream impacts to flag to the team

1. **Layer 4 wording in all artefacts must change.** "Blockmediary human examiner" → "Contracted documentary examiner." Affects current internal slides, any claims in the proposal video, Mo's frontend copy on the intermediary console, and the BRD when reopened.
2. **CCO workstream (Badhri) gains a real W1–W2 line item:** examiner-partner due diligence and contracting. Dubai-based firms are the Phase 1 target, aligned with the CEO's network research action and former-boss meeting. No longer background work.
3. **CTO workstream (Nick) gains an audit-ledger requirement:** Layer 4 verdicts must be captured as **structured data**, not stored as signed PDFs. Issuer, document type, discrepancy code, examiner ID, decision, timestamp, deal ID — all structured. This is the data-ownership clause turned into a build requirement.
4. **CFO workstream (Conrad) gains a unit-economics input:** per-deal examiner fee. Pass-through to the buyer, or absorbed into the 0.5–1.0% settlement fee. Either way it's a real number that has to be in the model — feeds BRD open items 8 (£50k cap) and 10 (revenue stream).
5. **Locked positioning still holds.** "Central document verification" = centrally *coordinated* with a single named examiner per deal. Buyer and seller see one point of accountability. The word "central" was never doing the work of "in-house."
6. **Proposal video check.** If anything in the 8/10 submitted video claims in-house examination, note it in the CEO log — the main video at W10 should not repeat that claim.

---

## Open items linked to this model

- **BRD open item #8** — £50k MVP value cap. Layer 4 examiner fee is a floor on per-deal viable size.
- **BRD open item #10** — primary revenue stream + defensible fee level. Examiner fee handling (pass-through vs. absorbed) is part of this.
- **BRD open item #12** — MVP doc set (full six vs. minimal core). Affects Layer 2 build scope and Layer 4 examiner scope.
- **Session 8 meeting decision** — simple escrow first, document verification layered later. Does *not* override this model; it sequences the build. Layer 1 + escrow funding + on-chain release ship before Layers 2–4 are fully operational.

---

## References

- Blockmediary BRD v0.2 — §9.2 (autonomy thresholds), §12 (external rails), FR-7 / FR-8 / FR-9
- Session 7 handover — locked positioning, beachhead corridor
- Session 8 team meeting minutes — simple escrow first, BoL as first trigger, Dubai legal firm sourcing action
- UCP 600 (ICC, 2007) — documentary examination standard (Badhri to upload as md)
