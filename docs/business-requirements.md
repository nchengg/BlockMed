# Business Requirements Document (BRD) — Blockmediary

> **Status:** 🟡 DRAFT for discussion · **Version:** 0.1 · **Date:** 2026-05-31
> **Owner:** Transakt (BEEM063 hackathon team) · **Author:** _[name]_
>
> **How to read this doc:** This is a *vague first draft* meant to frame tomorrow's
> meeting, not a signed-off spec. Anything marked **`[DISCUSS]`** is an open decision
> for the team. Anything marked **`[ASSUMPTION]`** is a placeholder we've filled in so
> the doc reads as a whole — challenge it. Everything else is pulled from the existing
> product spec ([product-blockmediary.md](product-blockmediary.md)) and domain rules
> ([domain-rules.md](domain-rules.md)) and is reasonably settled.

---

## 1. Document control

| Field | Value |
|-------|-------|
| Document title | Blockmediary — Business Requirements Document |
| Version | 0.1 (draft) |
| Last updated | 2026-05-31 |
| Status | Draft — for meeting review |
| Distribution | Transakt team |
| Related docs | [product-blockmediary.md](product-blockmediary.md), [domain-rules.md](domain-rules.md), [architecture.md](architecture.md), [hackathon-context.md](hackathon-context.md) |

**Revision history**

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-05-31 | _[name]_ | Initial draft for kickoff meeting |

---

## 2. Executive summary

Blockmediary is a **programmable documentary escrow layer for SME cross-border trade**.
A buyer prefunds a stablecoin escrow; the seller ships goods and submits trade documents;
a smart contract releases the funds when those documents satisfy a pre-agreed set of
release rules.

**Tagline:** *LC-like trust for smaller deals. Buyer prefunds in stablecoin; seller ships
and submits documents; funds release when documents satisfy the agreed rules.*

In one line: Blockmediary converts the **payment-relevant** and **document-verifiable**
terms of a trade agreement into a smart-contract escrow workflow — without trying to turn
the whole sale contract into code, and without offering any form of financing.

---

## 3. Business context & problem statement

### 3.1 The problem

SME importers and exporters struggle with cross-border payment trust:

- Sellers don't want to ship before payment is secured.
- Buyers don't want to pay before shipment evidence exists.
- Letters of credit (LCs) are too slow, expensive, or inaccessible for smaller transactions.
- Documentary trade processes are manual, opaque, and bank-dependent.

### 3.2 The opportunity

There is a gap between "wire the money and hope" and "open a full bank LC." Blockmediary
targets that gap with an LC-*like* workflow for smaller, **prefunded** transactions, using
stablecoin escrow and document-based release.

### 3.3 What success looks like

> **`[DISCUSS]`** We have not agreed our definition of success. Candidate framings:
> - **Academic:** score well against the BEEM063 grading rubric (clarity, viability, demo).
> - **Demo:** a working clickable testnet prototype that runs the happy path end-to-end.
> - **Commercial (aspirational):** a credible path to first paying SME deals on a chosen corridor.
>
> _Pick one primary lens for this BRD and keep the others as secondary._

---

## 4. Goals & non-goals

### 4.1 Goals (in scope for MVP)

- Structured escrow workflow built from buyer/seller trade terms.
- Lock buyer funds in stablecoin escrow; show the seller that funds are locked before shipment.
- Collect seller shipment documents; verify them against agreed release rules.
- Notify both parties on compliance; provide a limited objection window.
- Release funds to the seller if no valid objection; otherwise support discrepancy /
  amendment / refund / dispute paths.

### 4.2 Non-goals (explicitly out of scope for MVP)

- Buyer/seller marketplace or discovery.
- **Trade financing, liquidity provision, invoice financing** — explicitly *not* Blockmediary,
  despite operating in the same space.
- Insurance sourcing; party trust scoring.
- Full legal automation of the underlying sale contract.
- Quality guarantees for physical goods (unless an inspection certificate is a release rule).
- Direct title control (unless integrated with an eBL or document custodian).
- Complex regulated goods, sanctioned corridors, high-risk commodities.

> **`[DISCUSS]`** Is the no-financing line firm for the whole project, or just the MVP?
> It shapes positioning, regulatory exposure, and revenue.

---

## 5. Stakeholders & actors

| Actor | Need | Role in the system |
|-------|------|--------------------|
| **Buyer** (importer) | Doesn't want to pay before shipment evidence | Funds the escrow at origination; gets refund / release per rules |
| **Seller** (exporter) | Wants payment assurance before shipping | Sees funds locked, ships goods, submits documents to trigger release |
| **Blockmediary** | Operational layer | Creates escrow workflow, verifies documents, coordinates release logic |
| **Smart contract** | On-chain enforcement | Holds stablecoin funds; enforces release/refund state transitions |
| **Document reviewer** | Compliance check | Human or assisted review of document conformity to release rules |
| **Dispute resolver** | Last-resort path | Named forum / arbitrator / expert determination for unresolved issues |

> **`[DISCUSS]`** Who is the *first* customer we design for — the buyer, the seller, or
> a platform that brings both? The "who initiates a deal" answer changes the onboarding UX.

---

## 6. Scope & high-level flow

### 6.1 End-to-end happy path

1. Buyer and seller agree a commercial sale contract **outside** Blockmediary.
2. One or both parties engage Blockmediary; upload the sale contract or enter key terms.
3. Blockmediary extracts payment-relevant and document-verifiable release conditions.
4. Blockmediary generates: a **Trade Escrow Agreement** + a structured **escrow specification** + a **smart-contract escrow instance**.
5. Buyer and seller review and approve the escrow terms.
6. Buyer deposits the agreed stablecoin amount into escrow.
7. Seller sees funds locked → ships goods → uploads required documents.
8. Blockmediary verifies documents against the agreed rule set.
9. If compliant, Blockmediary issues a **notice of release**; the buyer has a short objection
   window limited to predefined grounds.
10. If no valid objection, funds release to the seller. Otherwise: amendment, waiver, refund, or dispute.

### 6.2 State model

```
Draft → Agreed → Funded → DocumentsSubmitted → ReviewInProgress
       → Compliant → ReleasePending → Released
                                    ↘ Disputed → Released | Refunded
       → Cancelled (from Agreed)
       → Refunded (from Funded, on refund condition)
```

End states: **Released**, **Refunded**, **Cancelled**.

---

## 7. Functional requirements

> Numbered `FR-n` for traceability. Priority uses MoSCoW (**M**ust / **S**hould / **C**ould / **W**on't-now).

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Capture trade terms via structured form **and/or** uploaded sale-contract extraction. | M |
| FR-2 | Generate a canonical escrow specification (JSON) that is authoritative for release rules. | M |
| FR-3 | Generate a Trade Escrow Agreement (legal wrapper) for both parties to approve. | M |
| FR-4 | Deploy / instantiate an on-chain escrow holding stablecoin funds. | M |
| FR-5 | Allow the buyer to deposit the agreed stablecoin amount; reflect "funds locked" to the seller. | M |
| FR-6 | Let the seller upload the required document set. | M |
| FR-7 | Run KYC / KYB / sanctions screening at origination (hard gate before funding). | M |
| FR-8 | Extract document fields (OCR/AI) and run a rules engine against the escrow spec. | M |
| FR-9 | Produce a compliance verdict: Compliant / Discrepant / Rejected / Escalated. | M |
| FR-10 | Issue a notice of release and run a fixed objection window (default 48h). | M |
| FR-11 | Accept buyer objections **only** on predefined valid grounds; grade them. | M |
| FR-12 | Release funds on-chain when all release preconditions are met. | M |
| FR-13 | Support refund, amendment, waiver, and dispute-escalation paths. | M |
| FR-14 | Persist every state transition to an immutable audit ledger *before* the on-chain action. | M |
| FR-15 | Route any out-of-envelope decision to a human reviewer with a stated reason. | M |
| FR-16 | Provide a dashboard / UI surfacing deal state to both parties. | S |
| FR-17 | Notifications (email / in-app) on each state change. | S |
| FR-18 | Multi-deal management for a single party. | C |
| FR-19 | White-label / API access for partner platforms. | W (post-MVP) |

> **`[DISCUSS]`** Which of the **S/C** items must move to **M** for a credible demo?
> The clickable prototype probably needs at least FR-16 and FR-17.

---

## 8. Document requirements (initial MVP set)

- Commercial invoice
- Packing list
- Bill of lading / sea waybill / air waybill / courier receipt
- Certificate of origin (where required)
- Inspection certificate (where quality/quantity verification is required)
- Insurance certificate (where required by Incoterm or deal terms)

> **`[DISCUSS]`** For the demo, do we verify the *full* set or a minimal core (invoice +
> transport doc)? Fewer doc types = a more reliable extraction demo.

---

## 9. Business rules & decision policy

These are the rules that make the system behave like a documentary-escrow insider rather
than a generic tool. (Full detail in [domain-rules.md](domain-rules.md).)

### 9.1 Valid objection grounds (buyer, during the window)

- Missing required document
- Document field mismatch vs. escrow terms
- Shipment after the deadline
- Suspected document fraud
- Sanctions / KYC / compliance issue
- Mutual amendment request

Anything else is **invalid** — e.g. "buyer changed their mind," post-shipment
renegotiation, or a subjective quality complaint when no inspection certificate was
required. *Protecting the seller from post-shipment renegotiation is core to the value prop.*

### 9.2 Autonomy thresholds (auto-act vs. escalate)

| Action | Auto threshold | Otherwise |
|--------|----------------|-----------|
| Term extraction | Per-field confidence ≥ 0.9 on all mandatory fields | Escalate for confirmation |
| KYC / sanctions | All green, no hit, KYB matched | Escalate; hold at Draft |
| Document field extraction | OCR/AI confidence ≥ 0.9 per field | Flag the field for human review |
| Compliance verdict | All checks pass **and** deal value ≤ MVP cap (**£50k** equiv.) | Mandatory human review |
| Notice of release | Verdict Compliant, no dispute, escrow Funded | Hold; surface discrepancy |
| Fund release | Objection window expired, no valid objection, no active dispute | Hold; route to dispute |
| Refund | Refund condition met | Hold; require reviewer sign-off |

> **`[DISCUSS]`** The **£50k** MVP value cap and the **48h** objection window are inherited
> defaults. Confirm or change both.

### 9.3 Hard "don'ts"

- Don't compute money in agent free-text — all arithmetic in `tools/` (real code).
- Don't release funds without **all** preconditions met.
- Don't accept objections outside valid grounds.
- Don't claim title or quality control over physical goods.
- Don't route buyer funds through a Blockmediary-controlled wallet — prefer smart contract or regulated custodian.
- Don't ingest real PII during the build — synthetic / sandbox data only.

---

## 10. Non-functional requirements

| Category | Requirement | Notes / `[DISCUSS]` |
|----------|-------------|---------------------|
| Security | Funds never held in a Blockmediary-controlled wallet | Smart contract or regulated custodian only |
| Auditability | Immutable audit ledger is the regulator-facing source of truth | Write before every on-chain action |
| Determinism | All money math in code, not LLM prose | Prevents arithmetic errors |
| Accuracy | Document extraction confidence ≥ 0.9 to auto-pass | Below threshold → human review |
| Privacy / data | Synthetic data only during build; PII handling TBD for production | **`[DISCUSS]`** data-protection regime |
| Performance | On-chain finality acceptable for an escrow release | Depends on chain choice |
| Compliance | AML / sanctions screening before funding | **`[DISCUSS]`** which jurisdictions |
| Availability | Demo-grade for MVP | Production SLAs out of scope now |

---

## 11. Architecture summary (on-chain vs off-chain)

The smart contract is intentionally **narrow** — it holds funds and enforces state
transitions only. It does **not** understand trade documents. Verification happens
off-chain, and an authorised release function submits the verdict on-chain.

| Layer | Responsibility |
|-------|----------------|
| Smart contract escrow | Hold + release stablecoin; enforce state transitions |
| Off-chain workflow | Deal terms, escrow spec, document storage, OCR/AI extraction, rules engine, audit ledger |
| Off-chain verification | Determine whether release conditions are satisfied |
| Authorised release function | Submit the verdict on-chain |
| Audit trail | Record who approved release, and on what basis |

(See [architecture.md](architecture.md) for the agent-team breakdown.)

---

## 12. External rails & dependencies

- **Stablecoin rail** — USDC / EURC on a PoS chain. **`[DISCUSS]`** chain TBD; candidates:
  Solana / Polygon / Base / Avalanche. Selection criteria: throughput, finality, regulatory
  clarity, gas cost.
- **Document custody / electronic bill of lading** — **`[DISCUSS]`** TBD partner if title
  control is added beyond MVP.
- **Document verification tooling** — **`[DISCUSS]`** OCR/AI mix vs. human review.
- **KYC / sanctions data feeds** — **`[DISCUSS]`** provider TBD.
- **Dispute forum** — **`[DISCUSS]`** named arbitrator / expert determination process TBD.

---

## 13. Revenue model

The MVP is **not** a financing product — there is no financing spread. Candidate streams:

| # | Stream | Notes |
|---|--------|-------|
| A | Per-deal escrow fee | Flat or % of trade volume; main MVP revenue |
| B | Document review fee | When human review is required (above an automated-only tier) |
| C | Dispute / amendment fees | Charged when the workflow leaves the happy path |
| D | SaaS / API for platforms | White-label for marketplaces, forwarders, banks (post-MVP) |

> **`[DISCUSS]`** Which stream is the *primary* MVP story for the pitch? Likely **A**.
> What's a defensible fee level for the beachhead corridor?

---

## 14. Assumptions & constraints

- **`[ASSUMPTION]`** Buyer and seller already have a signed sale contract before engaging Blockmediary.
- **`[ASSUMPTION]`** Both parties can hold/transact a stablecoin (or we provide guidance to).
- **`[ASSUMPTION]`** Beachhead is simple, repeatable, low-to-medium-value manufactured goods.
- **Constraint:** synthetic/sandbox data only during the build (no real PII).
- **Constraint:** hackathon timeline — hard demo deadline **2026-08-14**; proposal due **2026-06-08**.
- **Constraint:** team capacity vs. scope already flagged as tight in earlier sizing work.

---

## 15. Open questions (the meeting agenda)

These are the decisions that turn this draft into a real BRD. Carried forward from the
product spec plus the gaps above.

1. **Definition of success** — academic / demo / commercial primary lens? (§3.3)
2. **Which PoS chain?** — Solana / Polygon / Base / Avalanche. (§12)
3. **Document-verification tooling** — OCR/AI vs. human-review mix for acceptable accuracy. (§12)
4. **Custody model** — direct-to-smart-contract vs. regulated custody partner. (§10)
5. **Beachhead corridor + goods type** — e.g. Shenzhen → LA, manufactured components. (§14)
6. **Dispute forum** — which named arbitrator / process for the MVP demo. (§12)
7. **Sale-contract intake** — structured form only, or also term-extraction from uploads. (§7)
8. **MVP value cap** — confirm **£50k** equivalent or change. (§9.2)
9. **Objection window** — confirm **48h** default or change. (§9.2)
10. **Primary revenue stream** — and a defensible fee level. (§13)
11. **First customer / who initiates** — buyer, seller, or platform. (§5)
12. **MVP doc set** — full six documents vs. a minimal core for the demo. (§8)

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Beachhead** | The single buyer/seller corridor + goods type the MVP targets first. |
| **Compliance verdict** | Document-verification outcome: Compliant / Discrepant / Rejected / Escalated. |
| **Escrow specification** | Structured JSON generated at deal intake; authoritative for release rules. |
| **Notice of release** | Message issued when documents are compliant; starts the objection window. |
| **Objection window** | Fixed period (default 48h) for the buyer to raise a *valid* objection. |
| **PoS chain** | Proof-of-stake blockchain hosting the escrow contract (chain TBD). |
| **Release rules** | Document-compliance conditions in the escrow spec that must be met to release funds. |
| **Trade Escrow Agreement** | Legal agreement between buyer, seller and Blockmediary (separate from the sale contract). |
