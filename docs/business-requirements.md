# Business Requirements Document (BRD) — Blockmediary

> **Status:** 🟡 DRAFT for discussion · **Version:** 0.2 · **Date:** 2026-06-05
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
| Version | 0.2 (draft) |
| Last updated | 2026-06-05 |
| Status | Draft — for meeting review |
| Distribution | Transakt team |
| Related docs | [product-blockmediary.md](product-blockmediary.md), [domain-rules.md](domain-rules.md), [architecture.md](architecture.md), [hackathon-context.md](hackathon-context.md) |

**Revision history**

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-05-31 | _[name]_ | Initial draft for kickoff meeting |
| 0.2 | 2026-06-05 | _[name]_ | Recorded the **full API integration** decision (CEO + team, cybersecurity grounds): new NFR row (§10), §11 API-layer row, §12 integration-model rail, §15 settled item 14, glossary entry |

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

**Direction vs. current-phase success (settled 2026-05-31):** the firm is the long-term
**direction** — a workable business serving the public at launch — but the **primary success
criterion for *this* phase is the Demo.** We optimise the BRD around landing a convincing
hackathon prototype; the firm is the horizon that keeps those choices honest.

- **Primary lens now — Demo:** a working clickable testnet prototype that runs the happy path
  end-to-end, due for the BEEM063 submission. _This is what we design and grade against today._
- **Ultimate direction — firm:** a launched product taking real SME cross-border deals on a
  chosen corridor, with a sustainable revenue model. Every MVP cut should be reversible toward this.
- **Academic (concurrent):** score well against the BEEM063 rubric — a by-product of doing the above well.

> **`[DISCUSS]`** (longer-term) Agree a commercial north-star metric for "workable firm at
> launch" — e.g. _N_ live deals, escrow volume, or first paying customer. Not needed for the
> demo, but it's what turns "firm" from aspiration into a target.

---

## 4. Goals & non-goals

### 4.1 Goals (in scope for MVP)

- Structured escrow workflow built from buyer/seller trade terms.
- Lock buyer funds in stablecoin escrow; show the seller that funds are locked before shipment.
- Collect seller shipment documents; verify them against agreed release rules.
- Notify both parties on compliance; provide a limited objection window.
- Release funds to the seller if no valid objection; otherwise support discrepancy /
  amendment / refund / dispute paths.

### 4.2 Non-goals

> **Team direction (agreed 2026-05-31):** Blockmediary is being built as a **workable firm
> intended to serve the public at launch**. The hackathon MVP is the *first submission /
> proof slice*, not the end state. So "out of scope" splits into two very different
> buckets — things we'll build *later for the firm*, and things the firm *won't do at all*.
> Don't treat the whole list as permanent product boundaries.

**4.2.a — Deferred past the hackathon (firm will likely build these later)**

These are real parts of the launched product; they're just not in the hackathon slice.

- Buyer/seller marketplace or discovery.
- Insurance sourcing; party trust / counterparty scoring.
- Direct title control via electronic bill of lading (eBL) / document-custodian integration.
- White-label / API distribution to partner platforms (forwarders, marketplaces, banks).
- Broader corridors and goods types beyond the initial beachhead.

**4.2.b — Permanent product boundaries (the firm does *not* do these, even at scale)**

These define what Blockmediary *is* — crossing them changes the product and its regulatory profile.

- **Trade financing, liquidity provision, invoice financing** — Blockmediary is an escrow /
  settlement layer, not a lender. No financing spread, ever. _(See `[DISCUSS]` below — confirm
  this is a firm-level boundary, not just an MVP cut.)_
- Full legal automation of the underlying sale contract — the sale contract stays between the parties.
- Quality / condition guarantees for physical goods — release is on **document** compliance,
  not on actual receipt or condition (unless an inspection certificate is a release rule).
- Sanctioned corridors and prohibited high-risk goods.

> **`[DISCUSS]`** Confirm the **no-financing** line is a *firm-level* boundary (4.2.b), not just
> an MVP deferral. This is the single biggest positioning + regulatory call. If the firm ever
> intends to add financing, it belongs in a roadmap section, not as a permanent boundary.

### 4.3 Target market (beachhead)

**Decided 2026-05-31.** Blockmediary's initial target market is:

- **Corridors:** trade lanes across the **UK, the EU, and the Middle East** (UK ⇄ EU ⇄ ME).
- **Goods:** **goods-agnostic** — any goods type, *except* the permanent exclusion below.

The single hard limit on "any goods" is §4.2.b: **sanctioned corridors and prohibited /
high-risk regulated goods are excluded** (e.g. weapons, dual-use, controlled substances).
Subject to that, Blockmediary does not restrict by commodity — release depends on **document**
compliance, not on the nature of the goods.

> **Note for the team:** this is broader than a classic single-lane beachhead (one corridor +
> one goods type). It widens addressable volume but also widens the document-rule and
> compliance surface. Keep the **demo** narrow (pick one representative lane + goods sample to
> show end-to-end) even though the **firm's** stated market is the full UK/EU/ME, any-goods scope.

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
| Security | Funds never held in a Blockmediary-controlled wallet | ✅ Direct smart-contract custody for MVP (no custodian) |
| API security | **Full API integration (✅ decided 2026-06-05):** every client and partner interaction with the off-chain platform passes through Blockmediary's **authenticated API layer** — no direct database / document-store / audit-ledger access, no out-of-band mutation paths | Sole exception: wallet-signed on-chain transactions (deposit/release), which go to the chain, not the API. MVP demo route is not yet authenticated — accepted demo-only gap (see TRD §7.2) |
| Portability | Escrow contract + deploy scripts kept chain-portable | Enables fast migration off Base Sepolia if it breaks (§12) |
| Auditability | Immutable audit ledger is the regulator-facing source of truth | Write before every on-chain action |
| Determinism | All money math in code, not LLM prose | Prevents arithmetic errors |
| Accuracy | Document extraction confidence ≥ 0.9 to auto-pass | Below threshold → human review |
| Privacy / data | Synthetic data only during build; PII handling TBD for production | **`[DISCUSS]`** data-protection regime |
| Performance | On-chain finality acceptable for an escrow release | Base Sepolia (L2) — fast/cheap finality for the demo |
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
| API layer | Sole authenticated entry point for **every** off-chain read/write (buyer/seller UI now; partner platforms post-MVP) — clients never touch the data store or ledger directly |
| Off-chain workflow | Deal terms, escrow spec, document storage, OCR/AI extraction, rules engine, audit ledger |
| Off-chain verification | Determine whether release conditions are satisfied |
| Authorised release function | Submit the verdict on-chain |
| Audit trail | Record who approved release, and on what basis |

(See [architecture.md](architecture.md) for the agent-team breakdown.)

---

## 12. External rails & dependencies

- **Settlement chain — ✅ Base Sepolia (testnet) for the MVP.** Decided 2026-05-31. EVM /
  L2, low gas, good tooling for the demo. **Contingency:** the team is scoping *instant
  migration options* in case the chain breaks or degrades — keep contract code and deploy
  scripts chain-portable (EVM-compatible fallback, e.g. another OP-stack / EVM L2) so a
  redeploy is fast. _Production mainnet (Base or alternative) is a later decision._
- **Stablecoin** — USDC / EURC (testnet equivalents on Base Sepolia for the demo).
- **Document verification tooling — ✅ AI-first with human review as the final step.** Decided
  2026-05-31. AI/OCR extracts fields and proposes a verdict; a human reviewer signs off as the
  final gate before release. Matches the autonomy policy in §9.2 (auto-pass only above
  confidence + value thresholds; otherwise mandatory human review).
- **Integration model — ✅ Full API integration.** Decided 2026-06-05 (CEO + team, on cybersecurity grounds).
  All clients — the buyer/seller UI today, partner platforms later (§4.2.a / FR-19) — interact with
  Blockmediary's off-chain platform **only** through its authenticated REST API: every request is
  authenticated, authorised per role and per deal, validated, rate-limited, and audit-logged before it
  touches business logic. Nothing reads or writes the database, document store, or audit ledger
  directly, and no client ever holds the releaser key. **Scope limit (stated honestly):** wallet-signed
  on-chain transactions (approve/deposit/release) are the one deliberate bypass — they go to the chain
  and are governed by the smart contract's own roles, not the API. The decision is **binding for the
  full product**; the hackathon demo's single route remains unauthenticated and same-origin (accepted
  demo-only gap, never to be exposed publicly — TRD §7.2).
- **Custody — ✅ Direct smart contract.** Decided 2026-05-31. Buyer deposits straight into the
  on-chain escrow contract; no regulated custody partner and no Blockmediary-controlled wallet
  in the MVP. (Reflected in §10 and §9.3.)
- **Document custody / electronic bill of lading** — **`[DISCUSS]`** TBD partner if title
  control is added beyond MVP (deferred — §4.2.a).
- **KYC / sanctions data feeds** — **`[DISCUSS]`** provider TBD.
- **Dispute forum — ✅ Set by the parties' agreement.** Decided 2026-05-31. Rather than one
  platform-wide arbitrator, the named dispute forum / expert-determination process is whatever
  the buyer and seller agree in their **Trade Escrow Agreement** for that deal. _For the demo,
  seed a sensible default in the escrow spec so the dispute path is exercisable end-to-end._

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
- **Target market:** UK / EU / Middle East corridors, goods-agnostic (see §4.3) — *decided, not an assumption*.
- **Constraint:** synthetic/sandbox data only during the build (no real PII).
- **Constraint:** hackathon timeline — hard demo deadline **2026-08-14**; proposal due **2026-06-08**.
- **Constraint:** team capacity vs. scope already flagged as tight in earlier sizing work.

---

## 15. Open questions (the meeting agenda)

These are the decisions that turn this draft into a real BRD. Carried forward from the
product spec plus the gaps above. ✅ = settled 2026-05-31.

**Settled (✅):**

1. ✅ **Definition of success** — **Demo** is the primary current-phase lens; firm is the long-term direction. (§3.3)
2. ✅ **Settlement chain** — **Base Sepolia** (testnet); keep chain-portable for instant migration if it breaks. (§12)
3. ✅ **Document-verification tooling** — **AI-first, human review as the final step.** (§12, §9.2)
4. ✅ **Custody model** — **Direct smart contract** (no custody partner, no Blockmediary wallet). (§10, §12)
5. ✅ **Dispute forum** — **set by the parties' agreement** (per-deal in the Trade Escrow Agreement); seed a default for the demo. (§12)
6. ✅ **Target market / beachhead** — **UK / EU / Middle East corridors, goods-agnostic.** Now stated in §4.3 (no longer an open question).
14. ✅ **Integration model** — **full API integration** (settled 2026-06-05, cybersecurity grounds): all client/partner interaction via the authenticated API layer; wallet-signed on-chain transactions are the only bypass. (§10, §12.) _Numbered 14 to keep items 7–13 stable — they are cross-referenced by the TRD._

**Still open:**

7. **Sale-contract intake** — structured form only, or also term-extraction from uploads. (§7)
8. **MVP value cap** — confirm **£50k** equivalent or change. (§9.2)
9. **Objection window** — confirm **48h** default or change. (§9.2)
10. **Primary revenue stream** — and a defensible fee level. (§13)
11. **First customer / who initiates** — buyer, seller, or platform. (§5)
12. **MVP doc set** — full six documents vs. a minimal core for the demo. (§8)
13. **No-financing boundary** — confirm it's a firm-level boundary, not just an MVP cut. (§4.2.b)

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Beachhead / target market** | Blockmediary's initial market: **UK / EU / Middle East** corridors, **goods-agnostic** (excluding sanctioned/prohibited high-risk goods). See §4.3. |
| **Compliance verdict** | Document-verification outcome: Compliant / Discrepant / Rejected / Escalated. |
| **Escrow specification** | Structured JSON generated at deal intake; authoritative for release rules. |
| **Full API integration** | Integration model (decided 2026-06-05): every client or partner interaction with the off-chain platform passes through Blockmediary's authenticated REST API — no direct access to the database, document store, or audit ledger. Wallet-signed on-chain transactions are the only path that bypasses the API. |
| **Notice of release** | Message issued when documents are compliant; starts the objection window. |
| **Objection window** | Fixed period (default 48h) for the buyer to raise a *valid* objection. |
| **Settlement chain** | Blockchain hosting the escrow contract. MVP: **Base Sepolia** (testnet, EVM L2); kept chain-portable for fast migration. |
| **Release rules** | Document-compliance conditions in the escrow spec that must be met to release funds. |
| **Trade Escrow Agreement** | Legal agreement between buyer, seller and Blockmediary (separate from the sale contract). |
