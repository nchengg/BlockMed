# Business Requirements Document (BRD) — Blockmediary

> **Status:** Baselined · **Version:** 1.0 · **Date:** 2026-08-09
> **Owner:** Transakt (BEEM063 hackathon team)

This document is authoritative for the *intent* of the Blockmediary product. It records
the business requirements, the decisions taken during the build phase, and the delivered
scope as agreed by the team. Requirements are separated into the **delivered baseline** —
the system as built and demonstrated — and the **roadmap** — functionality retained as
forward direction for the firm but not implemented in this release.

---

## 1. Document control

| Field | Value |
|-------|-------|
| Document title | Blockmediary — Business Requirements Document |
| Version | 1.0 (baselined) |
| Last updated | 2026-08-09 |
| Status | Baselined for submission |
| Distribution | Transakt team |
| Related docs | [technical-requirements.md](technical-requirements.md) |

**Revision history**

| Version | Date | Notes |
|---------|------|-------|
| 0.1 | 2026-05-31 | Initial draft for kickoff. |
| 0.2 | 2026-06-05 | Recorded the full-API-integration decision (§10, §11, §12). |
| 0.3 | 2026-06-10 | Recorded the role-agnostic onboarding decision (§5, FR-1). |
| 1.0 | 2026-08-09 | Baselined against the delivered prototype. Resolved all outstanding decisions; separated delivered scope from roadmap; reconciled the document-verification model to the delivered deterministic rules engine (AI extraction retained as roadmap); recorded account-based authentication with SIWE wallet linking; recorded delivered multi-deal management, objection-window handling, and refund path. Removed draft framing and open-item annotations. |

---

## 2. Executive summary

Blockmediary is a **programmable documentary escrow layer for SME cross-border trade**.
A buyer prefunds a stablecoin escrow; the seller ships goods and submits trade documents;
a smart contract releases the funds when those documents satisfy a pre-agreed set of
release rules.

**Tagline:** *LC-like trust for smaller deals. Buyer prefunds in stablecoin; seller ships
and submits documents; funds release when documents satisfy the agreed rules.*

In one line: Blockmediary converts the **payment-relevant** and **document-verifiable**
terms of a trade agreement into a smart-contract escrow workflow — without turning the
whole sale contract into code, and without offering any form of financing.

---

## 3. Business context & problem statement

### 3.1 The problem

SME importers and exporters struggle with cross-border payment trust:

- Sellers do not want to ship before payment is secured.
- Buyers do not want to pay before shipment evidence exists.
- Letters of credit (LCs) are too slow, expensive, or inaccessible for smaller transactions.
- Documentary trade processes are manual, opaque, and bank-dependent.

### 3.2 The opportunity

There is a gap between "wire the money and hope" and "open a full bank LC." Blockmediary
targets that gap with an LC-*like* workflow for smaller, **prefunded** transactions, using
stablecoin escrow and document-based release.

### 3.3 What success looks like

The firm is the long-term direction — a workable business serving SME cross-border trade at
launch. The primary success criterion for the current phase is a working demonstrator that
runs the escrow lifecycle end to end.

- **Delivered lens — demonstrator:** a working clickable testnet prototype that runs the
  deal lifecycle end to end, submitted for the BEEM063 deliverable.
- **Direction — firm:** a launched product taking real SME cross-border deals on a chosen
  corridor, with a sustainable revenue model. Every scope cut is reversible toward this.

A commercial north-star metric for the launched firm (for example, a target number of live
deals or escrow volume) is a roadmap item and is not part of the delivered baseline.

---

## 4. Goals & non-goals

### 4.1 Goals (delivered baseline)

- Structured escrow workflow built from buyer/seller trade terms.
- Lock buyer funds in stablecoin escrow; show the seller that funds are locked before shipment.
- Collect seller shipment documents; verify them against agreed release rules.
- Notify both parties on compliance; provide a limited objection window.
- Release funds to the seller if no valid objection; otherwise support refund and
  objection-handling paths.

### 4.2 Non-goals

Out-of-scope items fall into two buckets: functionality deferred to the firm's roadmap, and
permanent product boundaries the firm will not cross at any scale.

**4.2.a — Roadmap (deferred past this release)**

These are parts of the launched product retained as forward direction; they are not in the
delivered baseline.

- Buyer/seller marketplace or discovery.
- Insurance sourcing; party trust / counterparty scoring.
- Direct title control via electronic bill of lading (eBL) / document-custodian integration.
- White-label / API distribution to partner platforms (forwarders, marketplaces, banks).
- Broader corridors and goods types beyond the initial beachhead.

**4.2.b — Permanent product boundaries (the firm does not do these, even at scale)**

These define what Blockmediary *is*; crossing them changes the product and its regulatory profile.

- **Trade financing, liquidity provision, invoice financing.** Blockmediary is an escrow /
  settlement layer, not a lender. There is no financing spread. This is a firm-level
  boundary, not a temporary scope cut.
- Full legal automation of the underlying sale contract — the sale contract stays between the parties.
- Quality / condition guarantees for physical goods — release is on **document** compliance,
  not on actual receipt or condition (unless an inspection certificate is a release rule).
- Sanctioned corridors and prohibited high-risk goods.

### 4.3 Target market (beachhead)

Blockmediary's initial target market is:

- **Corridors:** trade lanes across the **UK, the EU, and the Middle East** (UK ⇄ EU ⇄ ME).
- **Goods:** **goods-agnostic** — any goods type, except the permanent exclusion below.

The single hard limit is §4.2.b: sanctioned corridors and prohibited / high-risk regulated
goods are excluded (for example weapons, dual-use, controlled substances). Subject to that,
Blockmediary does not restrict by commodity — release depends on **document** compliance,
not on the nature of the goods. The demonstrator exercises one representative lane and goods
sample end to end.

---

## 5. Stakeholders & actors

| Actor | Need | Role in the system |
|-------|------|--------------------|
| **Buyer** (importer) | Does not want to pay before shipment evidence | Funds the escrow at origination; gets refund / release per rules. May initiate a deal and invite the seller. |
| **Seller** (exporter) | Wants payment assurance before shipping | Sees funds locked, ships goods, submits documents to trigger release. May initiate a deal and invite the buyer. |
| **Platform / intermediary** (e.g. forwarder, marketplace, broker) | Brings a buyer and seller together; sets a deal up on their behalf | May initiate a deal and invite both counterparties; coordinates onboarding but is **not** a principal to the escrow (does not deposit / approve / release). |
| **Blockmediary** | Operational layer | Creates the escrow workflow, verifies documents, coordinates release logic. |
| **Smart contract** | On-chain enforcement | Holds stablecoin funds; enforces release / refund state transitions. |
| **Document reviewer** | Compliance check | Human or assisted review of document conformity to release rules (roadmap console). |
| **Dispute resolver** | Last-resort path | Named forum / arbitrator / expert determination for unresolved issues (roadmap). |

**Onboarding supports all party roles.** Deal initiation is **role-agnostic**: any of the
three actor roles — buyer, seller, or platform/intermediary — may initiate a deal, and the
counterparty (or, for a platform/intermediary, both counterparties) is invited to join and
approve before the escrow is created. Supporting a platform/intermediary as a deal initiator
in the onboarding flow is distinct from white-label API distribution to partner platforms
(FR-19), which remains on the roadmap (§4.2.a).

**Authentication model.** Identity is established by an **account-based session** (email and
password, server-issued session cookie). A party may additionally link a wallet through
**Sign-In With Ethereum (SIWE / EIP-4361)** to authorise on-chain actions from their own
wallet. Buyers and sellers transact from their linked wallets; a platform/intermediary may
operate through an account alone. This model covers all three roles.

---

## 6. Scope & high-level flow

### 6.1 End-to-end flow (delivered)

1. A party (buyer, seller, or platform/intermediary) initiates a deal and records the trade
   terms; the counterparty is invited to review and accept.
2. On acceptance, Blockmediary instantiates the on-chain escrow for the deal.
3. The buyer deposits the agreed stablecoin amount into escrow from their linked wallet.
4. The seller sees funds locked, ships the goods, and submits the required shipment document.
5. Blockmediary verifies the submitted document against the agreed release rules and produces
   a compliance verdict.
6. On a compliant verdict, a notice of release is issued and a fixed objection window opens,
   limited to predefined grounds.
7. If no valid objection is raised, the release is authorised on-chain and the funds are
   released to the seller. Otherwise the deal follows the objection or refund path.

### 6.2 State model

The on-chain contract tracks the funding-and-settlement half of the lifecycle; document
review and the objection window are tracked off-chain and recorded in the audit trail.

```
Draft → Agreed → Funded → ReleasePending → Released
                        ↘ Refunded (from Funded)
       → Cancelled (from Agreed)
```

End states: **Released**, **Refunded**, **Cancelled**.

---

## 7. Functional requirements

Requirements are numbered `FR-n` for traceability, carry a MoSCoW priority, and are marked
**Delivered** (in the current baseline) or **Roadmap** (retained as forward direction).

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-1 | Capture trade terms via a structured intake. Deal initiation is **role-agnostic**: any party role — buyer, seller, or platform/intermediary — may initiate a deal, with the counterparty (or both counterparties) invited to join and approve. | M | Delivered |
| FR-2 | Maintain a canonical set of release rules that is authoritative for compliance grading. | M | Delivered (structured terms per deal) |
| FR-3 | Generate a Trade Escrow Agreement (legal wrapper) for both parties to approve. | M | Roadmap |
| FR-4 | Deploy / instantiate an on-chain escrow holding stablecoin funds. | M | Delivered |
| FR-5 | Allow the buyer to deposit the agreed stablecoin amount; reflect "funds locked" to the seller. | M | Delivered |
| FR-6 | Let the seller submit the required shipment document. | M | Delivered (bill of lading) |
| FR-7 | Capture company identity for KYC / KYB at origination; run KYC / KYB / sanctions screening as a hard gate before funding. | M | Partial — identity capture delivered; screening on roadmap |
| FR-8 | Verify the submitted document against the agreed release rules with a deterministic rules engine and produce a per-rule audit result. | M | Delivered (deterministic engine); AI/OCR field extraction on roadmap |
| FR-9 | Produce a compliance verdict: Compliant / Discrepant. | M | Delivered (Compliant / Discrepant); Rejected / Escalated on roadmap |
| FR-10 | Issue a notice of release and run a fixed objection window (default 48h). | M | Delivered |
| FR-11 | Accept buyer objections **only** on predefined valid grounds; record them. | M | Delivered (recording); automated grading on roadmap |
| FR-12 | Release funds on-chain when all release preconditions are met. | M | Delivered |
| FR-13 | Support refund and objection-handling; amendment, waiver, and dispute-escalation paths. | M | Refund and objection handling delivered; amendment / waiver / dispute escalation on roadmap |
| FR-14 | Persist every state transition to an append-only audit ledger. | M | Delivered (SQL audit trail); tamper-evident anchoring on roadmap |
| FR-15 | Route any out-of-envelope decision to a human reviewer with a stated reason. | M | Roadmap (autonomy gates encoded; review console on roadmap) |
| FR-16 | Provide a dashboard / UI surfacing deal state to both parties. | M | Delivered (multi-deal dashboards, role-specific) |
| FR-17 | Notifications (email / in-app) on each state change. | S | Roadmap (UI refresh on chain events only) |
| FR-18 | Multi-deal management for a single party. | S | Delivered |
| FR-19 | White-label / API access for partner platforms. | W (post-MVP) | Roadmap |

---

## 8. Document requirements

**Delivered baseline.** The demonstrator verifies a single **bill of lading** (or equivalent
transport document) against the agreed release rules. Its fields are captured through a
structured intake and graded by the deterministic rules engine (§9, §12).

**Roadmap document set.** The launched product extends to the full documentary set:

- Commercial invoice
- Packing list
- Bill of lading / sea waybill / air waybill / courier receipt
- Certificate of origin (where required)
- Inspection certificate (where quality / quantity verification is required)
- Insurance certificate (where required by Incoterm or deal terms)

---

## 9. Business rules & decision policy

These rules make the system behave like a documentary-escrow insider rather than a generic
tool.

### 9.1 Valid objection grounds (buyer, during the window)

- Missing required document
- Document field mismatch vs. escrow terms
- Shipment after the deadline
- Suspected document fraud
- Sanctions / KYC / compliance issue
- Mutual amendment request

Anything else is **invalid** — for example, "buyer changed their mind," post-shipment
renegotiation, or a subjective quality complaint when no inspection certificate was required.
Protecting the seller from post-shipment renegotiation is core to the value proposition.

### 9.2 Autonomy thresholds (auto-act vs. escalate)

| Action | Auto threshold | Otherwise |
|--------|----------------|-----------|
| Term extraction | Per-field confidence ≥ 0.9 on all mandatory fields | Escalate for confirmation |
| KYC / sanctions | All green, no hit, KYB matched | Escalate; hold at Draft |
| Document field extraction | Confidence ≥ 0.9 per field | Flag the field for human review |
| Compliance verdict | All checks pass **and** deal value ≤ value cap (**£50k** equiv.) | Mandatory human review |
| Notice of release | Verdict Compliant, no dispute, escrow Funded | Hold; surface discrepancy |
| Fund release | Objection window expired, no valid objection, no active dispute | Hold; route to objection handling |
| Refund | Refund condition met | Hold; require reviewer sign-off |

The **£50k** value cap and the **48h** objection window are the agreed defaults and are held
as configuration values so they can be changed without a code change. The confidence and
screening rows apply to roadmap components (AI extraction, KYC screening); the delivered
engine operates within the auto envelope by construction (structured synthetic deals below
the cap, no screening step).

### 9.3 Hard "don'ts"

- Do not compute money in agent free-text — all arithmetic in deterministic code.
- Do not release funds without **all** preconditions met.
- Do not accept objections outside valid grounds.
- Do not claim title or quality control over physical goods.
- Do not route buyer funds through a Blockmediary-controlled wallet — funds are held only by
  the smart contract.
- Do not ingest real PII during the build — synthetic / sandbox data only.

---

## 10. Non-functional requirements

| Category | Requirement | Status |
|----------|-------------|--------|
| Security | Funds never held in a Blockmediary-controlled wallet; direct smart-contract custody | Delivered |
| Authentication | Account-based sessions (hashed passwords, server-issued session cookie) with SIWE wallet linking for on-chain actions | Delivered |
| API security | All off-chain client interaction passes through Blockmediary's API layer; the releaser key is server-side only and never exposed to the client | Delivered for delivered routes; full authentication / authorization hardening for third-party (partner) access on roadmap |
| Portability | Escrow contract and deploy scripts kept chain-portable | Delivered |
| Auditability | Append-only audit trail records every state transition and reviewer decision | Delivered (SQL audit trail); tamper-evident anchoring on roadmap |
| Determinism | All money math in code, not free-text | Delivered |
| Accuracy | Document-extraction confidence ≥ 0.9 to auto-pass; below threshold → human review | Roadmap (applies to AI extraction) |
| Privacy / data | Synthetic data only during build; production PII handling on roadmap | Delivered (synthetic only) |
| Performance | On-chain finality acceptable for an escrow release (Base Sepolia L2) | Delivered |
| Compliance | AML / sanctions screening before funding | Roadmap |
| Availability | Demonstrator-grade; production SLAs on roadmap | Delivered (demonstrator) |

---

## 11. Architecture summary (on-chain vs off-chain)

The smart contract is intentionally **narrow** — it holds funds and enforces state transitions
only. It does not understand trade documents. Verification happens off-chain, and an
authorised release function submits the verdict on-chain.

| Layer | Responsibility |
|-------|----------------|
| Smart contract escrow | Hold + release stablecoin; enforce state transitions |
| API layer | Authenticated entry point for off-chain reads and writes; clients do not touch the data store or ledger directly |
| Off-chain workflow | Deal terms, document intake, deterministic rules engine, objection window, audit trail |
| Off-chain verification | Determine whether release conditions are satisfied |
| Authorised release function | Submit the verdict on-chain (releaser key, server-side only) |
| Audit trail | Record who approved release, and on what basis |

See the [Technical Requirements](technical-requirements.md) document for the component breakdown.

---

## 12. External rails & dependencies

- **Settlement chain — Base Sepolia (testnet) for the demonstrator.** EVM / L2, low gas, good
  tooling. Contract code and deploy scripts are kept chain-portable so a redeploy to another
  EVM / OP-stack L2 is fast if required. Production mainnet is a later decision.
- **Stablecoin — USDC** (Base Sepolia testnet USDC for the demonstrator). EURC support is on
  the roadmap.
- **Document verification — deterministic rules engine.** The delivered system grades a
  structured shipment document against the agreed release rules in deterministic code (no
  free-text money math). **AI / OCR field extraction** — automatically reading document fields
  from an uploaded file, with human review as the final step above the autonomy envelope — is
  retained on the roadmap and is the intended successor to the manual structured intake.
- **Custody — direct smart contract.** The buyer deposits straight into the on-chain escrow
  contract; there is no regulated custody partner and no Blockmediary-controlled wallet.
- **KYC / sanctions data feeds — roadmap.** Company identity is captured at onboarding;
  automated screening against public snapshots (OFAC / UN / HMT) and a chosen provider is a
  roadmap item.
- **Document custody / electronic bill of lading — roadmap.** A title-control partner is a
  roadmap dependency (§4.2.a).
- **Dispute forum — set by the parties' agreement.** The named dispute forum / expert
  determination is whatever the buyer and seller agree in their Trade Escrow Agreement for that
  deal (roadmap; a sensible default is seeded for the demonstrator).
- **Integration model — full API integration.** All client interaction with the off-chain
  platform passes through Blockmediary's API layer; wallet-signed on-chain transactions
  (approve / deposit / release) are the sole path that bypasses the API and are governed by the
  contract's own roles. Authentication and per-deal authorization are enforced on delivered
  routes; rate limiting, CORS hardening, and per-client API keys for third-party access are
  roadmap items and a precondition for FR-19.

---

## 13. Revenue model

Blockmediary is not a financing product; there is no financing spread. The **primary revenue
stream is a per-deal escrow fee** (flat or a percentage of trade volume). Additional streams
retained for the launched firm:

| # | Stream | Notes |
|---|--------|-------|
| A | Per-deal escrow fee | Primary stream. |
| B | Document review fee | When human review is required above an automated tier. |
| C | Dispute / amendment fees | Charged when the workflow leaves the happy path. |
| D | SaaS / API for platforms | White-label for marketplaces, forwarders, banks (roadmap). |

Fee levels for the beachhead corridor are a commercial decision recorded in the business
model, not in this document. No fee logic is asserted in the delivered baseline.

---

## 14. Assumptions & constraints

- Buyer and seller already have a signed sale contract before engaging Blockmediary.
- Both parties can hold and transact a stablecoin, or are guided to do so.
- Target market: UK / EU / Middle East corridors, goods-agnostic (§4.3).
- Synthetic / sandbox data only during the build (no real PII).
- Hackathon timeline — demonstrator deadline **2026-08-14**.

---

## 15. Decisions register

The decisions below are settled and reflected in the delivered baseline and roadmap above.

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Definition of success | Demonstrator is the delivered lens; the firm is the long-term direction (§3.3). |
| 2 | Settlement chain | Base Sepolia (testnet); contract kept chain-portable (§12). |
| 3 | Document-verification model | Deterministic rules engine delivered; AI / OCR extraction with human review retained on the roadmap (§8, §12). |
| 4 | Custody model | Direct smart contract; no custody partner, no Blockmediary wallet (§10, §12). |
| 5 | Dispute forum | Set per-deal in the Trade Escrow Agreement; default seeded for the demonstrator (§12, roadmap). |
| 6 | Target market / beachhead | UK / EU / Middle East corridors, goods-agnostic (§4.3). |
| 7 | Deal initiation / onboarding | Role-agnostic — buyer-, seller-, or platform/intermediary-initiated, counterparty invited (§5, FR-1). |
| 8 | Authentication model | Account-based sessions with SIWE wallet linking; covers all three roles (§5, §10). |
| 9 | Value cap and objection window | £50k equivalent and 48h respectively, held as configuration (§9.2). |
| 10 | Delivered document | Bill of lading (or equivalent transport document); full documentary set on the roadmap (§8). |
| 11 | Integration model | Full API integration; wallet-signed on-chain transactions are the only bypass (§10, §12). |
| 12 | No-financing boundary | Firm-level permanent boundary, not a temporary scope cut (§4.2.b). |
| 13 | Primary revenue stream | Per-deal escrow fee; fee level is a commercial decision (§13). |

**Roadmap decisions** (to be taken before the relevant roadmap functionality is built): KYC /
sanctions data-feed provider; electronic bill-of-lading / document-custody partner;
target-jurisdiction AML specifics (UK / EU / ME); production PII / data-protection regime.

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Beachhead / target market** | Blockmediary's initial market: UK / EU / Middle East corridors, goods-agnostic (excluding sanctioned / prohibited high-risk goods). See §4.3. |
| **Compliance verdict** | Document-verification outcome. Delivered: Compliant / Discrepant. Roadmap: Rejected / Escalated. |
| **Release rules** | Document-compliance conditions the rules engine evaluates to authorise release. |
| **Deterministic rules engine** | Code that grades a submitted document's structured fields against the agreed release rules; all money math in code, never free-text. |
| **Notice of release** | Message issued when a document is compliant; starts the objection window. |
| **Objection window** | Fixed period (default 48h) for the buyer to raise a *valid* objection. |
| **Full API integration** | Integration model: every client interaction with the off-chain platform passes through Blockmediary's API. Wallet-signed on-chain transactions are the only path that bypasses the API. |
| **SIWE** | Sign-In With Ethereum (EIP-4361); links a wallet to an account so on-chain actions are authorised from the party's own wallet. |
| **Settlement chain** | Blockchain hosting the escrow contract. Demonstrator: Base Sepolia (testnet, EVM L2); kept chain-portable. |
| **Trade Escrow Agreement** | Legal agreement between buyer, seller, and Blockmediary (separate from the sale contract). Roadmap. |
