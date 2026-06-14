# Blockmediary — Technical Requirements

**Product:** Blockmediary — programmable documentary escrow for SME cross-border trade
**Team:** Transakt (BEEM063 Hackathon, Exeter MSc FinTech)
**Document status:** Draft v0.4 — derived from the Business Requirements Document (BRD v0.3)
**Last updated:** 2026-06-10

---

## 0. Document control

| Field | Value |
|-------|-------|
| Purpose | Translate Blockmediary's **Business Requirements Document** into concrete, testable technical requirements. |
| Audience | Build-phase engineers (smart contract, web, agent runtime), reviewers, and graders. |
| Authority | The [BRD](business-requirements.md) is authoritative for *intent*; this document is authoritative for *technical realisation* and is subordinate to the BRD where they conflict. Flag conflicts rather than silently diverging. |
| Traceability anchor | This document maps directly onto the BRD's own identifiers: functional requirements **`FR-1…FR-19`** (BRD §7), non-functional requirements (BRD §10), business rules (BRD §9), and the state model (BRD §6.2). |
| Change control | Update alongside any change to [`business-requirements.md`](business-requirements.md), [`domain-rules.md`](domain-rules.md), or [`plans/mvp-slice.md`](../plans/mvp-slice.md). |

### Source documents

| Source | Role |
|--------|------|
| [`docs/business-requirements.md`](business-requirements.md) | **Primary — the BRD.** Functional reqs (FR-1…FR-19), NFRs, business rules, decided items, open questions. Status: 🟡 draft v0.3 (2026-06-10; adds the **onboarding / all-party-roles** decision — role-agnostic deal initiation, §5/§15 item 11). |
| [`docs/domain-rules.md`](domain-rules.md) | Business-rule detail: full state taxonomy, autonomy thresholds, valid objection grounds, money/standards conventions. |
| [`docs/product-blockmediary.md`](product-blockmediary.md) | Supporting product narrative (positioning, actors, rails). Where it and the BRD differ, the **BRD wins** (e.g. target market — see note below). |
| [`docs/architecture.md`](architecture.md) | On-chain/off-chain split and agent-team breakdown. |
| [`docs/hackathon-context.md`](hackathon-context.md) | Academic delivery constraints (deadlines, grading) bounding scope. |
| [`plans/mvp-slice.md`](../plans/mvp-slice.md) | The 2-week MVP build plan — already a partial technical spec (locks chain, stack, contract shape, cuts). This document generalises it to full technical requirements and marks what the slice defers. |
| `Hackathon/MVP_FLOW.md` (Google Drive, **not in repo**) | Cited as canonical product mechanics. Unavailable to this document; dependencies on it are flagged in §12. |

> **BRD-supersedes-product-spec note.** The BRD (2026-05-31) records several decisions that **post-date and override** `product-blockmediary.md`: target market is now **UK / EU / Middle East corridors, goods-agnostic** (not "Shenzhen → LA, manufactured components"); chain is **decided** as Base Sepolia (not "TBD"); custody is **decided** as direct smart contract; document verification is **decided** as AI-first with human review as the final step; the dispute forum is **per-deal**, set in each Trade Escrow Agreement. This document follows the BRD on all of these.

### Requirement identifiers & conventions

- **`FR-n` / NFR / business rule** — references the BRD's own numbering (BRD §7/§10/§9).
- **`TR-n.m`** — a technical requirement realising part of a BRD requirement. The `TR-n` family numbers are stable labels grouped by topic (they run one ahead of nothing in particular — use the index below, not arithmetic, to locate them): **TR-2** = architecture (§3), **TR-3** = smart contract (§4), **TR-4** = off-chain components (§5), **TR-5** = data models (§6), **TR-6** = APIs/interfaces (§7), **TR-7** = end-to-end flow & autonomy gates (§8), **TR-8** = security & compliance (§9), **TR-9** = deployment & acceptance (§10).
- **`AP-n`** — architectural principle (§3.1) that requirements inherit.
- **MoSCoW** priority is inherited from the BRD where the BRD assigns one.
- **MVP** column: ✅ = in the 2-week demo slice ([`plans/mvp-slice.md`](../plans/mvp-slice.md)); 🔵 = full product, deferred past the demo. The MVP column is the single place that records demo scope — keep it honest.
- All money is in **minor units** (token base units, e.g. USDC 6-decimals) — never floats, never computed in agent free-text (BRD §9.3; `domain-rules.md`).
- All timestamps are **ISO 8601 UTC**.
- The BRD is a **draft with open `[DISCUSS]` items** (BRD §15). Where a requirement depends on an unresolved `[DISCUSS]`, this document encodes the BRD's current default and forwards the decision to §12 — it does **not** invent a resolution.

---

## 1. Scope

### 1.1 Two targets, one document (demo vs. firm)

The BRD (§3.3, §4.2) draws a deliberate line between the **Demo** (primary current-phase lens — a clickable testnet prototype running the happy path end-to-end) and the **firm** (the launched product). This technical document specifies the **full-product** requirements so the firm target stays traceable, and uses the **MVP column** to mark what the demo slice actually delivers. Both are valid targets; do not conflate them.

### 1.2 In technical scope (realising BRD §4.1 goals + FR-1…FR-15)

1. Capture trade terms and generate the canonical **escrow specification** (JSON) + **Trade Escrow Agreement** (FR-1…FR-3).
2. Deploy/instantiate an **on-chain escrow**, take the buyer's stablecoin deposit, and prove "funds locked" to the seller (FR-4, FR-5).
3. **KYC/KYB/sanctions** screening as a hard gate before funding (FR-7).
4. Collect seller documents; **extract + verify** against the escrow spec's release rules; produce a verdict (FR-6, FR-8, FR-9).
5. Issue a **notice of release**, run the **objection window** (default 48h), and grade objections against valid grounds only (FR-10, FR-11).
6. **Release** on clean compliance with no valid objection; support **refund / amendment / waiver / dispute** branches (FR-12, FR-13).
7. **Immutable audit ledger** written *before* every on-chain action; route out-of-envelope decisions to a human with a stated reason (FR-14, FR-15).

The BRD's **S**hould/**C**ould surfacing requirements — dashboard (FR-16), notifications (FR-17), multi-deal management (FR-18) — are in technical scope as full-product items and specified in §6; the BRD flags (§7) that FR-16/17 may need to move S→M for a credible demo (forwarded to §12).

### 1.3 Out of technical scope

The BRD splits "out of scope" into two buckets (BRD §4.2) — this distinction matters technically because it tells us what to leave a **seam** for vs. what to **never** build:

- **Deferred past the hackathon (firm will likely build later) — leave architectural seams (BRD §4.2.a):** marketplace/discovery; insurance sourcing; counterparty trust scoring; eBL / document-custodian title control; white-label/API distribution (FR-19); broader corridors/goods beyond the demo lane.
- **Permanent product boundaries — never build (BRD §4.2.b):** **trade financing / invoice financing / liquidity provision** (no financing spread, ever — no credit logic anywhere); full legal automation of the sale contract; physical-goods quality/condition guarantees (release is on *document* compliance only, unless an inspection certificate is itself a release rule); sanctioned corridors and prohibited/high-risk regulated goods.

> The no-financing boundary is still flagged `[DISCUSS]` in the BRD (§4.2.b, §15 Q13) as "confirm firm-level vs MVP cut." This document treats it as a **permanent boundary** (the BRD's stated default) and forwards the confirmation to §12.

### 1.4 MVP-slice boundary

[`plans/mvp-slice.md`](../plans/mvp-slice.md) ships a **deliberately narrower** happy-path-only demo than the full FR set: single chain (Base Sepolia), **commercial invoice only** (not the full BRD §8 set), a reduced state machine, **no KYC/dispute/refund UI**, a single hardcoded deal, and a **direct Anthropic SDK call** (no multi-agent orchestrator). The MVP also omits the Trade Escrow Agreement (FR-3) and hardcodes the escrow spec rather than generating it. The **MVP column** in §2 records this per requirement.

---

## 2. Business-requirement → technical-requirement traceability

Mapping the BRD's own identifiers to the technical requirements that realise them. Detailed `TR-n.m` text lives in the referenced sections (§3–§9).

### 2.1 Functional requirements (BRD §7)

| FR | Requirement (BRD §7) | Pri | Realised by | MVP |
|----|----------------------|-----|-------------|-----|
| **FR-1** | Capture trade terms via structured form **and/or** uploaded sale-contract extraction. | M | TR-4.1 (deal-intake), TR-6.2 (intake API) | 🔵 (MVP hardcodes the deal) |
| **FR-2** | Generate a canonical escrow specification (JSON), authoritative for release rules. | M | TR-4.1, TR-5.1 (escrow-spec schema) | 🔵 (MVP hardcodes `spec` in `rules.ts`) |
| **FR-3** | Generate a Trade Escrow Agreement (legal wrapper) for both parties to approve. | M | TR-4.1 (TEA generation); per-deal dispute forum captured in the escrow spec (field name a TR design choice — see §5) | 🔵 (omitted from slice) |
| **FR-4** | Deploy / instantiate an on-chain escrow holding stablecoin funds. | M | TR-3.1 (deploy), TR-3.3 (state), TR-9.1 (Ignition) | ✅ |
| **FR-5** | Buyer deposits the agreed stablecoin; reflect "funds locked" to the seller. | M | TR-3.4 (`deposit`), TR-3.5 (`Funded` event), TR-6.1 (read state) | ✅ |
| **FR-6** | Let the seller upload the required document set. | M | TR-4.2 (store_document), TR-6.2 (`/check-document`) | ✅ (invoice only) |
| **FR-7** | KYC / KYB / sanctions screening at origination — **hard gate before funding**. | M | TR-4.5 (kyc-compliance), TR-7.3 (gate), TR-8.3 | 🔵 (deferred) |
| **FR-8** | Extract document fields (OCR/AI) + run the rules engine against the escrow spec. | M | TR-4.3 (rules engine), TR-5.2 (extract schema) | ✅ (invoice fields) |
| **FR-9** | Produce a compliance verdict: Compliant / Discrepant / Rejected / Escalated. | M | TR-4.3, TR-5.3 (verdict object) | ✅ (Compliant transitions on-chain; Discrepant shown only, no transition) |
| **FR-10** | Issue a notice of release + run a fixed objection window (**default 48h**). | M | TR-4.4 (dispute/window), TR-7.2, TR-5.3 | 🔵 |
| **FR-11** | Accept buyer objections **only** on predefined valid grounds; grade them. | M | TR-4.4 (grade_objection), TR-7.3 | 🔵 |
| **FR-12** | Release funds on-chain when all release preconditions are met. | M | TR-3.4 (`release`), TR-4.7 (settlement), TR-7.2 | ✅ |
| **FR-13** | Support refund, amendment, waiver, and dispute-escalation paths. | M | TR-3.4 (`refund`), TR-4.4, TR-3.3 (branches) | 🔵 (contract `refund` exists, no UI) |
| **FR-14** | Persist every state transition to an immutable audit ledger **before** the on-chain action. | M | TR-4.6 (ledger), TR-5.4 (entry schema), TR-8.3 | ✅ (append-only JSONL) |
| **FR-15** | Route any out-of-envelope decision to a human reviewer with a stated reason. | M | TR-7.3 (autonomy gates), TR-8.2 (enforcement) | ✅ (gates encoded; most paths human-skipped in demo) |
| **FR-16** | Dashboard / UI surfacing deal state to both parties. | S | TR-6.3 (web UI), TR-6.1 (state reads) | ✅ (single demo page, `?role=`) |
| **FR-17** | Notifications (email / in-app) on each state change. | S | TR-4.8 (notify), TR-3.5 (events as triggers) | 🔵 (event watcher only in MVP) |
| **FR-18** | Multi-deal management for a single party. | C | TR-6.3 (deal list), TR-5.1 (`dealId` keying) | 🔵 |
| **FR-19** | White-label / API access for partner platforms. | W (post-MVP) | TR-6.2 (API seam) — boundary only | 🔵 (seam, not built) |

### 2.2 Non-functional requirements (BRD §10)

| NFR (BRD §10) | Realised by | MVP |
|---------------|-------------|-----|
| **Security** — funds never in a Blockmediary-controlled wallet; direct smart-contract custody | TR-3.2 (custody = contract), TR-8.1 (key handling: releaser authorises, never custodies) | ✅ |
| **Portability** — escrow contract + deploy scripts kept chain-portable | TR-3.6 (EVM-portable design), TR-9.1 (parameterised Ignition) | ✅ |
| **Auditability** — immutable audit ledger is the regulator-facing source of truth; write before every on-chain action | TR-4.6, TR-5.4, TR-8.3 | ✅ |
| **Determinism** — all money math in code, not LLM prose | TR-4.3 (rules in `tools/`/`rules.ts`), TR-8.4 | ✅ |
| **Accuracy** — extraction confidence ≥ 0.9 to auto-pass; else human review | TR-4.3 (per-field confidence), TR-7.3 (threshold gate) | ✅ (threshold encoded) |
| **Privacy / data** — synthetic/sandbox only during build; production PII handling TBD | TR-8.5 (data handling), TR-9.3 (test fixtures) | ✅ |
| **Performance** — on-chain finality acceptable for escrow release (Base Sepolia L2) | TR-3.1 (chain choice), TR-9.* | ✅ |
| **Compliance** — AML / sanctions screening before funding | TR-4.5, TR-7.3 (pre-`Funded` gate) | 🔵 |
| **Availability** — demo-grade for MVP; production SLAs out of scope | §1.1; TR-9.* | ✅ |
| **API security** — full API integration: all client/partner interaction via the authenticated API layer (BRD §10, decided 2026-06-05) | AP-9, TR-6.2.4–TR-6.2.7 | 🔵 (MVP route unauthenticated + same-origin — accepted demo-only gap, TR-6.2.3) |

### 2.3 Business rules & autonomy (BRD §9; `domain-rules.md`)

| Business rule (BRD §9) | Realised by | MVP |
|------------------------|-------------|-----|
| **Valid objection grounds only** (BRD §9.1): missing doc, field mismatch, late shipment, suspected fraud, sanctions/KYC issue, mutual amendment — everything else invalid | TR-4.4 (grade_objection), TR-7.3 | 🔵 |
| **Autonomy thresholds** (BRD §9.2): per-action auto-act vs. escalate, incl. **£50k MVP value cap** and **≥0.9 confidence** | TR-7.3 (gate table), TR-8.2 (enforcement) | ✅ value-cap + extraction-confidence gates encoded; 🔵 KYC/sanctions autonomy row (depends on FR-7, deferred). Thresholds are `[DISCUSS]` defaults → §12 |
| **No money in agent free-text** (BRD §9.3) | TR-4.3, TR-8.4 | ✅ |
| **No release without all preconditions** (BRD §9.3) | TR-7.2 (precondition set), TR-3.4 (`release` guards) | ✅ |
| **No Blockmediary-controlled wallet; SC or regulated custodian** (BRD §9.3, §10, §12) | TR-3.2, TR-8.1 | ✅ |
| **No title / quality control over physical goods** (BRD §9.3) | TR-3.4 (release gated on the document verdict only — no goods-condition input) | ✅ |
| **No real PII during build** (BRD §9.3, §14) | TR-8.5, TR-9.3 | ✅ |

### 2.4 State model & rails (BRD §6.2, §12)

| BRD item | Realised by | MVP |
|----------|-------------|-----|
| **State model** (BRD §6.2; full transitions in `domain-rules.md`): linear `Draft→Agreed→Funded→DocumentsSubmitted→ReviewInProgress→Compliant→ReleasePending→Released`; branches — `Cancelled` **from Agreed**; `Refunded` **from Funded** (refund condition) **or via Disputed**; `Disputed` **from ReviewInProgress or ReleasePending**, exiting to `Released \| Refunded`. End states: `Released / Refunded / Cancelled`. | TR-3.3 (state machine + per-transition guards), TR-3.5 (events), TR-7.2 | ✅ reduced path (`Draft→Agreed→Funded→ReleasePending→Released` + `Refunded` escape hatch from `Funded` — 6-value enum, 5 on happy path); 🔵 full taxonomy |
| **Settlement chain — Base Sepolia** (decided); chain-portable contingency (BRD §12) | TR-3.1, TR-3.6, TR-9.1 | ✅ |
| **Stablecoin — USDC/EURC** (testnet for demo) (BRD §12) | TR-3.2 (ERC-20), TR-5.1 (`payment.currency`) | ✅ USDC; 🔵 EURC |
| **Document verification — AI-first + human review as final step** (decided) (BRD §12, §9.2) | TR-4.3 (AI extract), TR-7.3 (human sign-off gate) | ✅ AI; 🔵 human console |
| **Custody — direct smart contract** (decided) (BRD §12) | TR-3.2, TR-8.1 | ✅ |
| **Integration model — full API integration** (decided 2026-06-05, cybersecurity grounds) (BRD §10 API security, §12, §15 item 14) | AP-9; TR-6.2.4–TR-6.2.7 (authN, deal-scoped authZ, transport/abuse hardening, API as sole mutation surface); §2.2 NFR "API security" | 🔵 (MVP route unauthenticated + same-origin — accepted demo-only gap, TR-6.2.3) |
| **Dispute forum — per-deal, set in the Trade Escrow Agreement; seed a demo default** (decided) (BRD §12) | TR-5.1 carries a per-deal dispute-forum value in the escrow spec (field name a TR design choice, not a BRD-named field), TR-4.4 | 🔵 (seeded default) |
| **eBL / document custody** — TBD partner, deferred (BRD §12, §4.2.a) | §12 open question (seam only) | 🔵 |
| **Revenue model** (BRD §13): per-deal fee / doc-review fee / dispute fee / SaaS | Fee mechanics **undefined in BRD** → §12 open question; no fee field asserted in TR-5.1 | 🔵 |

> **Coverage:** every BRD functional requirement (FR-1…FR-19), every NFR (§10), every §9 business rule, and the §6.2 state model + §12 rails map to at least one technical requirement. Requirements the MVP slice defers (🔵) remain specified so the full-product target stays traceable. Items the BRD leaves open (`[DISCUSS]` — value cap, objection window, revenue stream, intake mode, doc set, no-financing boundary, KYC/dispute providers, eBL, and **whether FR-16 dashboard / FR-17 notifications must move S→M for a credible demo**, BRD §7) are carried into §12 rather than resolved here.

---

## 3. System architecture

> Realises BRD §11 (on-chain vs off-chain split), NFR-Security, NFR-Portability, NFR-Auditability, and the BR-10 architectural principle. The governing rule: **the smart contract does not understand trade documents** — it holds funds and enforces state transitions; all document interpretation is off-chain; an authorised release function submits the verdict on-chain.

### 3.1 Architectural principles (constraints every component inherits)

| ID | Principle | Source |
|----|-----------|--------|
| AP-1 | **Narrow contract.** On-chain code holds stablecoin and enforces state transitions only — no document logic, no money math beyond token transfers, no business rules. | BRD §11 |
| AP-2 | **Off-chain verdict, on-chain enforcement.** Document verification produces a verdict off-chain; a single role-gated function records it on-chain; release executes against recorded state. | BRD §11, §6.1 |
| AP-3 | **Direct smart-contract custody.** Buyer funds are held only by the escrow contract — never a Blockmediary-controlled wallet. The MVP uses no custodian; a **regulated custodian remains a permitted full-product option** (BRD §9.3 "smart contract *or* regulated custodian") and the design leaves a seam for it. | BRD §9.3, §10, §12 |
| AP-4 | **Audit around action.** Two entries bracket every on-chain transition: an **intent** entry (decision + authorising actor + reason) written *before* the tx is submitted, and a **reconciliation** entry (txHash, block, success/revert) written *after* the receipt. Intent-before-submit makes the ledger — not the chain — the regulator-facing source of truth; reconciliation closes the async-finality gap (a submitted tx may revert, drop, or settle differently). | BRD §9.3, §10 (Auditability) |
| AP-5 | **Determinism for money.** All amount-matching, currency comparison, and fee/threshold math run in real code (`tools/`, `rules.ts`) — never in LLM free-text. | BRD §9.3, §10 (Determinism) |
| AP-6 | **Chain portability.** The contract and deploy scripts stay EVM-portable so the escrow can be redeployed to another EVM/OP-stack L2 quickly if Base Sepolia degrades. | BRD §12, §10 (Portability) |
| AP-7 | **Human-in-the-loop above the envelope, enforced at `recordVerdict`.** Any decision outside the autonomy thresholds (BRD §9.2) escalates to a human reviewer with a stated reason; AI proposes, a human signs off. Because `release` is permissionless (TR-3.4, AP-2), **all gating — verdict sign-off, objection window, dispute/sanctions holds — MUST occur before `recordVerdict` moves state to `ReleasePending`.** `ReleasePending` is the point of no return: once there, anyone may trigger settlement and it cannot be blocked. The effective "final gate before release" is therefore `recordVerdict`, not `release`. | BRD §9.2, §12; `plans/mvp-slice.md` (permissionless release) |
| AP-8 | **Sandbox/synthetic only.** No real PII or live financial data during build; sanctions feeds are public snapshots. | BRD §9.3, §14 |
| AP-9 | **API-first integration (decided 2026-06-05, cybersecurity grounds).** Every client interaction with the off-chain platform — buyer/seller UI, reviewer/compliance consoles, future partner platforms (FR-19) — passes through the **authenticated HTTP API** (§7.2): authN → authZ → validation → business logic → audit, in that order, on every route. No client reads or writes the data store, document store, or audit ledger directly, and no client ever holds the releaser key. The sole deliberate bypass is **wallet-signed on-chain transactions** (`approve`/`deposit`/`release`), which interact with the chain and are governed by the contract's own roles (§4.2), not the API. | BRD §10 (API security), §12, §15 item 14 |

#### TR-2.* — cross-cutting architecture requirements

- **TR-2.1** (AP-1, AP-2) — The system MUST be split into three trust tiers: (a) **on-chain** escrow contract; (b) **off-chain orchestration + verification** (deal intake, KYC, document checking, dispute, audit); (c) **client** (buyer/seller UI). No tier may assume logic that belongs to another (e.g. the UI MUST NOT be the authority on deal state — it reads it from chain + ledger).
- **TR-2.2** (AP-2, AP-7) — Exactly one privileged off-chain actor (the **releaser**) MAY submit verdicts/refunds on-chain. It holds an authorising key but **never custodies funds** (AP-3). Its actions MUST be gated by the autonomy policy (§7.3) and recorded in the audit ledger first (AP-4).
- **TR-2.3** (AP-4) — Every component that triggers a state transition MUST write an **intent** audit entry (TR-4.6) and confirm the append succeeded **before** submitting the on-chain transaction or returning a verdict to the user, and MUST write a **reconciliation** entry once the transaction receipt is observed (carrying txHash, block number, and success/revert). A dropped/timed-out tx MUST leave a reconciliation entry recording the unknown/failed outcome — never a silent gap.
- **TR-2.4** (AP-6) — On-chain code MUST avoid chain-specific opcodes/precompiles and MUST take the stablecoin token address and roles as deploy parameters (not hardcoded constants), so a redeploy to another EVM L2 needs only new parameters.
- **TR-2.5** (AP-1, FR-2) — The **escrow specification** (authoritative for release rules) and uploaded **documents** MUST have a defined storage substrate with integrity guarantees: (a) full product — a durable store (DB/object store) for the spec and document blobs, with the **spec's content hash committed on-chain at deal creation** so the funds are cryptographically bound to the rule-set they were escrowed against and an off-chain spec cannot be silently swapped; (b) MVP slice — spec hardcoded in `rules.ts`/route, documents under `app/data/`, no on-chain hash (acceptable for the demo, flagged as a deferred seam). The contract itself stores only `{buyer, seller, amount}` + state (AP-1) plus, in the full product, the spec hash.

### 3.2 Component model

Two runtime views: the **full product** (all components) and the **MVP slice** (subset actually built for the demo). `plans/mvp-slice.md` is the authority for the slice.

```
                         ┌─────────────────────────────────────────────┐
                         │                CLIENT TIER                   │
                         │  Buyer UI  ·  Seller UI  ·  Reviewer console  │
                         │     (Next.js + wagmi + RainbowKit)            │
                         └───────────────┬───────────────┬──────────────┘
                       wallet txns       │               │  HTTPS (REST)
              (approve/deposit; release = permissionless)  │
                                         │               ▼
                                         │   ┌──────────────────────────────────┐
                                         │   │      OFF-CHAIN ORCHESTRATION       │
                                         │   │  ┌───────────┐  ┌───────────────┐  │
                                         │   │  │deal-intake│  │ kyc-compliance│  │
                                         │   │  └───────────┘  └───────────────┘  │
                                         │   │  ┌──────────────┐ ┌─────────────┐  │
                                         │   │  │document-check│ │   dispute   │  │
                                         │   │  │ +rules engine│ └─────────────┘  │
                                         │   │  └──────────────┘ ┌─────────────┐  │
                                         │   │  ┌──────────────┐ │  settlement │  │
                                         │   │  │ orchestrator │ └─────────────┘  │
                                         │   │  └──────────────┘                  │
                                         │   │  Tools (deterministic): rules,     │
                                         │   │  amount-match, audit append, notify│
                                         │   └───────┬─────────────────┬──────────┘
                                         │           │ verdict/refund  │ append
                                         │           │ (releaser key)  ▼
                                         │           │        ┌──────────────────┐
                                         │           │        │   AUDIT LEDGER    │
                                         │           │        │ (append-only,     │
                                         │           │        │  immutable)       │
                                         │           │        └──────────────────┘
                                         ▼           ▼
                         ┌─────────────────────────────────────────────┐
                         │                 ON-CHAIN TIER                 │
                         │   Escrow contract (holds USDC, state machine) │
                         │   ERC-20 stablecoin (USDC/EURC testnet)       │
                         │   Settlement chain: Base Sepolia (EVM L2)     │
                         └─────────────────────────────────────────────┘

  External feeds (off-chain): sanctions/KYC providers (sandbox) · OCR/AI (Anthropic
  Claude vision) · notification channels (email/Slack/in-app).
```

| Component | Tier | Responsibility | Realises | MVP |
|-----------|------|----------------|----------|-----|
| **Escrow contract** | On-chain | Custody USDC; enforce state machine; emit events; role-gated `recordVerdict`/`refund`; permissionless `release` | FR-4, FR-5, FR-12, FR-13, AP-1/3 | ✅ |
| **ERC-20 stablecoin** | On-chain | Value transfer (USDC; EURC later). MockUSDC on local tests. | BRD §12 | ✅ |
| **deal-intake** | Off-chain | Capture terms (form/upload) → escrow spec JSON + Trade Escrow Agreement | FR-1, FR-2, FR-3 | 🔵 |
| **kyc-compliance** | Off-chain | KYC/KYB/sanctions screening — **hard gate pre-funding (FR-7, the mandated requirement)**; continuous monitoring through `Released` is a full-product extension (per `architecture.md`, beyond FR-7) | FR-7, NFR-Compliance | 🔵 |
| **document-checker + rules engine** | Off-chain | OCR/AI field extraction (Claude vision) + deterministic rules vs. escrow spec → verdict | FR-6, FR-8, FR-9, AP-5 | ✅ (invoice) |
| **dispute** | Off-chain | Objection window, valid-grounds grading, amendment/waiver/refund/escalation | FR-10, FR-11, FR-13 | 🔵 |
| **settlement** | Off-chain | Execute authorised on-chain release/refund tx (releaser key); narrow — no FX, no ramps | FR-12, FR-13, AP-2 | ✅ partial — in the slice `recordVerdict` is folded into the `/check-document` route and `release` is a client button; no standalone settlement component |
| **orchestrator** | Off-chain | Route between specialists, aggregate, decide auto vs. escalate | FR-15, AP-7 | 🔵 (MVP: single direct SDK call) |
| **audit ledger** | Off-chain | Append-only immutable record of every transition + reviewer decision | FR-14, AP-4 | ✅ (JSONL) |
| **notify** | Off-chain | Party notifications on each state change | FR-17 | 🔵 (event watcher only) |
| **Client UIs** | Client | Buyer/seller/reviewer surfaces; wallet ops; state display | FR-5, FR-6, FR-16 | ✅ (single `?role=` page) |

**Mapping to the `architecture.md` agent team.** The canonical agent list (`architecture.md` §Agent team) names six domain specialists; the table above re-maps two of them to clarify the on-/off-chain boundary: the **`escrow`** agent (smart-contract wrapper — lock/release/refund/state) maps to **{Escrow contract (on-chain) + settlement (off-chain tx executor)}**; the other four (`deal-intake`, `kyc-compliance`, `document-checker`, `dispute`) map 1:1. The cross-phase generalists **`data-analyst`** and **`report-writer`** are **development/analysis-time** roles (they power the `run-analysis` skill and reporting), **not** runtime components of the escrow product, and so are intentionally absent from the product component model.

### 3.3 Runtime split — full product vs. MVP slice

| Aspect | Full product | MVP slice (`plans/mvp-slice.md`) |
|--------|--------------|-----------------------------------|
| Agent runtime | Claude Agent SDK orchestrator invoking specialist agents behind the UI; the `run-analysis` skill is the stable seam | **One direct Anthropic SDK call** with an inline prompt; no orchestrator |
| Chain | Base Sepolia now; mainnet (Base or portable alt) later | Base Sepolia only |
| Documents | Full BRD §8 set | Commercial invoice only |
| State machine | Full taxonomy (§2.4) | `Draft→Agreed→Funded→ReleasePending→Released` + `Refunded` escape hatch |
| KYC / dispute / refund UI | Built | Deferred (contract `refund` exists, unused by UI) |
| Deals | Multi-deal | Single hardcoded `dealId` |
| Audit ledger | Immutable append-only store (DB/object store) | `audit-ledger.jsonl` file |
| Custody | Direct smart contract (mainnet token) | Direct smart contract (testnet USDC) |

> The MVP **deliberately** collapses the off-chain tier to a single server route (`/api/check-document`) plus a seed script. The component model above is the **target**; the slice is one honest, demoable cut through it. Re-expansion path is the "what was cut" table in `plans/mvp-slice.md`.

### 3.4 Trust & data-flow boundaries

- **Authority of record.** Deal *terms/rules* → escrow spec (off-chain, authoritative per FR-2). Deal *state/custody* → escrow contract (on-chain). *Who decided what, when, and why* → audit ledger (off-chain, regulator-facing). The UI is never authoritative — it reads from chain + ledger.
- **The releaser seam.** The only bridge from off-chain decisions to on-chain effects is the releaser-key transaction (`recordVerdict`, `refund`). Compromise of this key is the top security risk (§9.1). `release` is intentionally **permissionless** (anyone may trigger a release once the contract is in `ReleasePending`), so the releaser key cannot block a seller from being paid after a compliant verdict.
- **External feeds are advisory, not authoritative.** OCR/AI output passes through deterministic rules (AP-5) and confidence thresholds (AP-7) before it can move state; sanctions feeds gate funding but a hit escalates to a human (never auto-suppressed).

---

## 4. Smart-contract requirements

> Realises FR-4, FR-5, FR-12, FR-13, the BRD §6.2 state model, and AP-1/2/3/6. **Stack (locked by `plans/mvp-slice.md`):** Solidity `^0.8.20`, OpenZeppelin v5 (`AccessControl`, `Pausable`, `SafeERC20`, `IERC20`), Hardhat 3 + viem + `node:test`, Hardhat Ignition for deploys. The contract is **narrow by design (AP-1)**: it holds USDC, enforces state, and emits events — it has no knowledge of documents, rules, or fiat values.

### 4.1 Contract scope & custody (TR-3.1, TR-3.2)

- **TR-3.1** (FR-4, AP-6) — A single `Escrow` contract MUST manage many deals keyed by `bytes32 dealId`, holding an ERC-20 stablecoin per deal. The stablecoin **token address** and the **role holders** (admin, releaser) MUST be constructor/deploy parameters, never hardcoded constants, to satisfy chain-portability (TR-2.4). Deployed to Base Sepolia for the MVP.
- **TR-3.2** (AP-3, NFR-Security) — Custody is the contract itself. Funds move only via `SafeERC20` (`safeTransferFrom` on deposit, `safeTransfer` on release/refund). No function may transfer escrowed funds to any address other than the deal's recorded `buyer` (refund) or `seller` (release). There is **no owner-drain / sweep** function over deal balances.
- **TR-3.6** (AP-6) — The contract MUST compile and pass tests against a generic EVM target and avoid chain-specific precompiles/opcodes, so a redeploy to another EVM/OP-stack L2 needs only new Ignition parameters.

### 4.2 Roles (TR-3.2-roles)

| Role | Holder | May call | Constraint |
|------|--------|----------|------------|
| `DEFAULT_ADMIN_ROLE` | Deployer / Blockmediary admin (multisig in production) | Grant/revoke roles, `pause`/`unpause`, `refund` (escape hatch), `cancel` (full product) | Cannot move funds except via `refund` to the recorded buyer |
| `RELEASER_ROLE` | Off-chain releaser service key (TR-2.2) | `createDeal`, `recordVerdict`, `refund` | Authorises state transitions; **never custodies funds**; rotatable |
| _(none — permissionless)_ | Anyone | `release` | Only succeeds from `ReleasePending`; pays the recorded seller |
| Deal `buyer` (address, not a role) | Buyer wallet | `deposit` | Only the recorded buyer for that `dealId` |

- **TR-3.2-roles** — Use OZ v5 `AccessControl` with `_grantRole` (never `_setupRole`). Roles MUST be grantable/revocable by admin so the releaser key can be rotated after suspected compromise (§9.1). `release` MUST remain **permissionless** (AP-7): not gated on `RELEASER_ROLE`, so a compliant verdict cannot be withheld by the releaser.

### 4.3 State machine (TR-3.3)

- **TR-3.3** (FR-4, FR-12, FR-13, BRD §6.2) — The contract MUST track per-deal state and reject any transition not in the allowed set below, reverting with a typed error (TR-3.7). State is the on-chain half of the BRD §6.2 model; off-chain-only states (`DocumentsSubmitted`, `ReviewInProgress`, `Compliant`) are tracked in the audit ledger, **not** on-chain (AP-1) — the contract sees only funding, verdict, and settlement.

**`Draft` is the implicit zero-value state.** A `mapping(bytes32 => State)` zero-initialises every unused `dealId` to enum index 0, which MUST be `Draft`. There is therefore no "stateless" deal: an uncreated `dealId` is already `Draft`. `createDeal`'s uniqueness guard is exactly `state(dealId) == Draft`, and that same check **is** the `DealExists` protection (TR-3.7). `dealId` is **caller-supplied** (a `bytes32`, e.g. `keccak256("deal-…")` from the seed/intake layer) — the contract does not derive or namespace it; uniqueness is enforced solely by the `state == Draft` check.

**Full-product on-chain enum & transitions:**

| From | Function (caller) | To | Guard |
|------|-------------------|-----|-------|
| `Draft` (zero-value) | `createDeal` (releaser) | `Agreed` | `state == Draft` (= `DealExists` check); `amount > 0`; buyer≠seller |
| `Agreed` | `cancel` (admin) | `Cancelled` | before funding only |
| `Agreed` | `deposit` (buyer) | `Funded` | `safeTransferFrom(buyer, amount)` |
| `Funded` | `recordVerdict` (releaser) | `ReleasePending` | verdict authorised off-chain (Compliant + all gates passed, AP-7) |
| `Funded` | `refund` (releaser/admin) | `Refunded` | refund condition met (deadline missed / mutual cancel / dispute-for-buyer) |
| `ReleasePending` | `release` (permissionless, `whenNotPaused`) | `Released` | `safeTransfer(seller, amount)` |
| `ReleasePending` | `raiseDispute` (releaser, on valid objection) | `Disputed` | within objection window |
| `Disputed` | `resolveRelease` / `resolveRefund` (releaser) | `Released` / `Refunded` | dispute outcome |

End states: `Released`, `Refunded`, `Cancelled` (terminal — no transition out). The BRD §6.2 transition `ReviewInProgress → Disputed` is **not** in this table because `ReviewInProgress` is an off-chain-only state (AP-1): a dispute raised during off-chain review is handled entirely off-chain and simply never advances the contract past `Funded` (the contract reaches `Disputed` only from the on-chain `ReleasePending`).

**MVP-slice enum** (`plans/mvp-slice.md`): `enum State { Draft, Agreed, Funded, ReleasePending, Released, Refunded }` — 6 values; happy path walks `Agreed → Funded → ReleasePending → Released`; `refund` from `Funded` is an admin escape hatch with no UI; `Disputed`/`Cancelled`/`DocumentsSubmitted`/`ReviewInProgress`/`Compliant` are **not** in the slice.

> **Critical sequencing (AP-7).** `recordVerdict` is the point of no return: it MUST only be called after the off-chain verdict is Compliant **and** every gate (human sign-off where required, objection window expired with no valid objection, no active dispute, no sanctions hit) has passed — because once state is `ReleasePending`, `release` is permissionless and unstoppable. The objection window and dispute holds are enforced **off-chain before** `recordVerdict`, not on-chain after it (in the full product, `raiseDispute` from `ReleasePending` exists as a backstop but the design intent is that disputes are resolved before the verdict is recorded).

### 4.4 Functions (TR-3.4)

- **TR-3.4** — The contract MUST expose exactly these external functions, each enforcing its state guard (TR-3.3), following **checks-effects-interactions** (state mutated **before** the token transfer), and emitting the matching event (TR-3.5):
  - `createDeal(bytes32 dealId, address buyer, address seller, uint256 amount [, bytes32 specHash])` — `RELEASER_ROLE`; `Draft → Agreed`. Reverts `ZeroAmount`, `DealExists` (i.e. `state != Draft`), `SameParty`. **`specHash`** (full product) is the keccak256 of the canonical escrow-spec JSON, stored on the deal — this realises the TR-2.5(a) binding of funds to the rule-set. **MVP slice omits `specHash`** (spec is hardcoded; TR-2.5(b)).
  - `deposit(bytes32 dealId)` — only the recorded `buyer`; `safeTransferFrom`; `Agreed → Funded`.
  - `recordVerdict(bytes32 dealId)` — `RELEASER_ROLE`; `Funded → ReleasePending`. (Verdict content is off-chain; on-chain this is the authorised "proceed to settlement" signal. It stores no verdict in the MVP — the verdict is implicitly Compliant.)
  - `release(bytes32 dealId)` — **permissionless**, **`whenNotPaused`**; `safeTransfer(seller)`; `ReleasePending → Released`.
  - `refund(bytes32 dealId)` — `RELEASER_ROLE`/admin, `whenNotPaused`; `safeTransfer(buyer)`; from `Funded` (and `Disputed` in full product) `→ Refunded`.
  - `cancel(bytes32 dealId)` — **admin only**; `Agreed → Cancelled` (full product; not in slice). (Per-party cancellation is deliberately excluded — it would need per-deal authorisation fields the narrow contract rejects, AP-1.)
  - `pause()` / `unpause()` — admin (`Pausable`). **All fund-moving functions — `deposit`, `release`, `refund` — MUST carry `whenNotPaused`**; in particular `release` must, or pause cannot stop an in-flight permissionless settlement. **Trade-off (stated, not hand-waved):** `whenNotPaused` on `release` re-introduces a censorship lever (admin can pause to block a compliant seller's payout); this is accepted as the safety backstop for the permissionless-for-liveness design, and pause is an emergency control, not a routine gate.
  - View: `deals(dealId)` → `{buyer, seller, amount [, specHash]}`; `state(dealId)` → `State`.
- All money parameters are token base units (`uint256`, 6-decimals for USDC). The contract performs **no** fiat conversion, no fee arithmetic, no rounding (AP-1, AP-5).
- **Token constraint (TR-3.2).** Because the token address is a deploy parameter (TR-2.4, portability), the escrowed token MUST be a standard, **non-fee-on-transfer, non-rebasing** ERC-20: the contract pays out the *recorded* `amount` and trusts it rather than measuring `balanceOf` deltas, so a fee-on-transfer/rebasing token would leave it insolvent. USDC satisfies this; any portability target MUST be checked against it.

### 4.5 Events (TR-3.5)

- **TR-3.5** (FR-5, FR-17, AP-4) — Every state transition MUST emit an event so the off-chain layer (ledger, notifications, UI) can react without polling. Required events:
  - `DealCreated(bytes32 indexed dealId, address buyer, address seller, uint256 amount)`
  - `Funded(bytes32 indexed dealId, uint256 amount)`
  - `VerdictRecorded(bytes32 indexed dealId)`
  - `Released(bytes32 indexed dealId, uint256 amount)`
  - `Refunded(bytes32 indexed dealId, uint256 amount)`
  - `StateChanged(bytes32 indexed dealId, State from, State to)` — emitted on every transition (the canonical event the UI/event-watcher subscribes to).
  - Full product: `Cancelled`, `DisputeRaised`, `DisputeResolved`.
- `dealId` MUST be indexed on all events for efficient filtering. Events are convenience/observability only — the **audit ledger (TR-4.6), not events, is the authoritative record** (AP-4).

### 4.6 Errors & safety patterns (TR-3.7)

- **TR-3.7** — Use **custom errors**, not revert strings: `InvalidState(bytes32 dealId, State expected, State actual)`, `ZeroAmount()`, `DealExists(bytes32 dealId)`, `NotBuyer()`, `SameParty()`. (The MVP plan mandates only `InvalidState` + `ZeroAmount`; `DealExists`/`NotBuyer`/`SameParty` are TR additions for the full product — clearer than reusing `InvalidState` for those cases.)
- Mandatory patterns: checks-effects-interactions on every fund move; `SafeERC20` for all transfers; `ReentrancyGuard` (or strict CEI) on `deposit`/`release`/`refund`; `Pausable` on fund-moving functions.
- **Forbidden** (`plans/mvp-slice.md` anti-patterns): `_setupRole`, `Ownable()` no-arg ctor, `SafeMath`, `.transfer()/.send()` for ETH, raw `IERC20.transfer`, `require(msg.sender == ...)` for role auth, `tx.origin`. Grep-clean gate in CI (§10).
- The contract holds **only** the stablecoin; it MUST NOT accept ETH (no `payable` fund paths), so there is no native-asset attack surface.

### 4.7 Testing requirements (TR-3.8)

- **TR-3.8** — `node:test` + viem (no Mocha/Chai/ethers v5). Mandatory test coverage:
  - Happy path: `createDeal → mint mUSDC → approve → deposit → recordVerdict → release`; assert final state `Released` and seller balance increased by `amount`.
  - Access control: a non-releaser cannot `createDeal`/`recordVerdict`; a non-buyer cannot `deposit`.
  - State guards: every disallowed transition reverts with `InvalidState`.
  - Refund escape hatch: admin can `refund` from `Funded`; cannot from other states.
  - Permissionless release: a third-party address can call `release` from `ReleasePending`.
  - Pause: **every** fund-moving function reverts while paused — explicitly including the permissionless `release` from `ReleasePending` (the test MUST prove pause stops a third-party release, or the backstop is unverified).
  - `MockUSDC` (`ERC20` with `mint`, 6-decimals override) for local tests.

---

## 5. Off-chain components

> Realises FR-1, FR-2, FR-3, FR-6–FR-11, FR-13–FR-15, FR-17 and the agent team in `architecture.md`. Each component maps to one specialist agent and a set of **deterministic tools** (`tools/`); the division is fixed by AP-5: **agents orchestrate and explain, tools compute.** All money math, amount-matching, currency comparison, and rule evaluation happen in code, never in agent free-text. The MVP collapses most of this into one server route (`/api/check-document`) + a seed script; the per-component requirements below are the full-product target.

### 5.0 Component / tool index

| Component (agent) | Tools (`tools/`) | TR | FR |
|-------------------|------------------|-----|-----|
| deal-intake | `parse_sale_contract`, `build_escrow_spec`, `deploy_escrow` | TR-4.1 | FR-1, FR-2, FR-3, FR-4 |
| kyc-compliance | `screen_sanctions`, `verify_kyb` | TR-4.5 | FR-7 |
| document-checker + rules engine | `store_document`, `extract_fields`, `check_compliance` | TR-4.2, TR-4.3 | FR-6, FR-8, FR-9 |
| dispute | `open_objection_window`, `grade_objection`, `escalate_to_dispute` | TR-4.4 | FR-10, FR-11, FR-13 |
| settlement | `fund_escrow`, `release_funds`, `refund_escrow`, `cancel_escrow` (on-chain wrappers) | TR-4.7 | FR-5, FR-12, FR-13 |
| audit ledger | `append_audit` | TR-4.6 | FR-14 |
| notify | `notify_party` | TR-4.8 | FR-17 |
| orchestrator | (routes the above) | TR-4.9 | FR-15 |

> **On-chain wrapper mapping.** The five smart-contract wrappers in `tools/README.md` map to §4 contract functions: `deploy_escrow`↔`createDeal`, `fund_escrow`↔`deposit`, `release_funds`↔`release`, `refund_escrow`↔`refund`, `cancel_escrow`↔`cancel`. The `tools/README.md` surface predates the on-chain split that introduced **`recordVerdict`** (§4) — the verdict-recording transaction is part of the settlement wrapper family (extend `release_funds` or add a `record_verdict` wrapper) and is **not** the off-chain `check_compliance` verdict (which produces the off-chain decision that authorises calling it). Update `tools/README.md` to add `record_verdict` when the wrappers are built.

### 5.1 deal-intake (TR-4.1) — FR-1, FR-2, FR-3

- **TR-4.1.1** (FR-1) — Capture trade terms via **either** a structured form **or** extraction from an uploaded sale-contract PDF (`parse_sale_contract`). Per-field extraction confidence MUST be returned; any mandatory field below 0.9 confidence escalates to the intake user for confirmation (AP-7; BRD §9.2 term-extraction threshold). *(Which intake mode the demo uses is BRD-open §15 Q7 → §12.)*
- **TR-4.1.2** (FR-2) — Produce the **canonical escrow specification** (JSON, schema §6.1) via `build_escrow_spec`. The spec is the single authority for release rules (BRD §9 Do; TR-2.5). Its content hash feeds `createDeal(specHash)` (TR-3.4).
- **TR-4.1.3** (FR-3) — Generate the **Trade Escrow Agreement** (legal wrapper) referencing the spec, for buyer + seller approval; capture both approvals before `createDeal`. The TEA names the **per-deal dispute forum** (BRD §12 decision), which is copied into the escrow spec; seed a sensible default so the dispute path is exercisable in the demo.
- **TR-4.1.4** (FR-1; BRD §5 decision, 2026-06-10) — **Role-agnostic deal initiation.** Intake MUST support a deal being initiated by **any party role — buyer, seller, or platform/intermediary** — recording the **initiator's role** and **inviting** the counterparty (or, for a platform/intermediary, both counterparties) to join and approve before `createDeal`. This realises the BRD §5 / §15-item-11 decision that onboarding supports all party roles. **Auth dependency:** the initiator and invitee identities are established by the API auth-role model (TR-6.2.4–6.2.5; mechanism still open, §12 Q18) — buyer/seller fit wallet/SIWE naturally, whereas a platform/intermediary may have **no wallet** and likely needs an account/JWT role. **Scope boundary:** platform-initiated onboarding here is the *initiator role in the intake UX* — distinct from white-label **API distribution** to partner platforms, which remains deferred (BRD §4.2.a / FR-19).
- **MVP:** deal-intake, TEA generation, and spec generation are **all deferred** — the slice hardcodes the spec in `rules.ts` and skips the TEA; **role-agnostic initiation (TR-4.1.4) is therefore a full-product requirement only** (the demo uses a single hardcoded deal, `?role=buyer|seller`).

### 5.2 document-checker + rules engine (TR-4.2, TR-4.3) — FR-6, FR-8, FR-9

- **TR-4.2** (FR-6) — Accept seller document uploads (`store_document`): the full BRD §8 set in the product; **commercial invoice only** in the MVP. Enforce upload limits (≤5 MB image / ≤32 MB·100 pp PDF per Anthropic limits); the **MVP route deliberately tightens this to a single ≤5 MB PDF** (`plans/mvp-slice.md`). Store the blob + a content hash for the audit trail. A successful upload writes the off-chain `DocumentsSubmitted` state (see TR-4.6.4).
- **TR-4.3.1** (FR-8, extraction) — Extract document fields with OCR/AI (`extract_fields`) — **Anthropic Claude vision** in the MVP (`type: "document"` base64 PDF). Extraction MUST return **per-field values + confidences**; LLM output MUST be validated against a schema (Zod in the MVP) **before** any business logic. The extractor MUST NOT grade conformity — it only reads fields (AP-5 separation).
- **TR-4.3.2** (FR-8, rules — the core layer) — A **deterministic rules engine** (`check_compliance(extracted_fields, escrow_spec)`, pure code — `rules.ts` in the MVP) compares extracted fields against the escrow spec and returns a per-rule audit object. **Spec retrieval:** in the full product the engine loads the authoritative escrow spec by `dealId` from the spec store (TR-2.5) and SHOULD verify the loaded spec's hash matches the on-chain `specHash` (TR-3.4) before grading; in the MVP the spec is hardcoded for the demo deal (`plans/mvp-slice.md`). Mandatory rule families: required-document present; party-name match (fuzzy, thresholded); **amount match** (in minor units via `parseUnits`/bigint — never floats, AP-5); currency match; shipment date ≤ deadline (from the spec, not the document, per `domain-rules.md`). Each rule yields pass/fail + the compared values for the ledger.
- **TR-4.3.3** (FR-9, verdict) — Combine per-rule results + per-field confidences into one verdict: **`Compliant` / `Discrepant` / `Rejected` / `Escalated`** (schema §6.3). Auto-`Compliant` requires **all rules pass, all checked-field confidences ≥ 0.9, AND deal value ≤ £50k cap** (BRD §9.2); otherwise the verdict routes to mandatory human review (AP-7). Fraud / sanctions / unresolved-objection signals force `Escalated` (freeze). **MVP:** only `Compliant` (→ on-chain `recordVerdict`) and `Discrepant` (shown, no transition); human-review console deferred.

### 5.3 kyc-compliance (TR-4.5) — FR-7

- **TR-4.5.1** (FR-7, hard gate) — Run KYC / KYB / sanctions screening (`verify_kyb`, `screen_sanctions`) at origination, **before** the deal may reach `Funded`. All-green (no sanctions hit, KYB matched) auto-passes; any hit **holds the deal at `Draft`** (BRD §9.2 / `domain-rules.md`) — i.e. `createDeal` is withheld until screening clears — and escalates to a compliance officer (AP-7). (If a hit surfaces after `createDeal`, the deal is held at `Agreed` and `deposit` is blocked; the hard gate is "no `Funded` without green screening" either way.) A sanctions hit is **never auto-suppressed** — it is filed and notified (regulatory report).
- **TR-4.5.2** — Sanctions sources are **public snapshots** (OFAC / UN / HMT) and synthetic identity records only during build (AP-8, BRD §9.3/§14). Provider choice is BRD-open (§15 Q, §12).
- **TR-4.5.3** (full product, beyond FR-7) — Continuous monitoring through `Released` (re-screen on long-lived deals) per `architecture.md`; a new hit on a funded deal escalates and can route to `Disputed`/refund.
- **MVP:** KYC is **deferred** entirely (stub post-demo, `plans/mvp-slice.md`).

### 5.4 dispute (TR-4.4) — FR-10, FR-11, FR-13

- **TR-4.4.1** (FR-10) — On a `Compliant` verdict with escrow `Funded` and no open dispute, issue a **notice of release** (`notify_party`) and **open the objection window** (`open_objection_window`, default **48h** — a BRD-open default, §15 Q9 → §12). The window MUST be enforced **off-chain before** `recordVerdict` (AP-7 / TR-3.3 sequencing: once `ReleasePending`, release is unstoppable).
- **TR-4.4.2** (FR-11) — Grade buyer objections (`grade_objection`) against the **closed set of valid grounds** (BRD §9.1): missing required document; field mismatch vs. escrow terms; shipment after deadline; suspected document fraud; sanctions/KYC/compliance issue; mutual amendment request. **Anything else is invalid and rejected** (protecting the seller from post-shipment renegotiation is core value). The grading rationale is written to the ledger.
- **TR-4.4.3** (FR-13) — Implement the off-happy-path branches: **amendment**, **waiver** (buyer waives a discrepancy → proceed to release), **refund** (`refund_escrow`), **dispute escalation** (`escalate_to_dispute` to the per-deal forum named in the TEA). A valid objection in the window blocks `recordVerdict` and routes here.
  - **Amendment semantics (the narrow contract has no spec setter).** Because the deal is bound on-chain to an immutable `specHash` (TR-3.4) and the contract exposes **no** `setSpec`/amend function (AP-1), amendment of release rules MUST be implemented as **`refund` the current deal → generate a new spec/TEA → `createDeal` a fresh `dealId` with the new `specHash` → re-fund**. A pure *waiver* (rules unchanged, buyer accepts a discrepancy) does **not** require a new deal — it authorises `recordVerdict` on the existing one. State this so builders don't look for an on-chain amend path that deliberately doesn't exist.
- **MVP:** objection window, grading, and dispute UI are **deferred**; the contract keeps a `refund` escape hatch with no UI.

### 5.5 settlement (TR-4.7) — FR-12, FR-13

- **TR-4.7.1** (FR-12, AP-2) — Execute the authorised on-chain transaction using the **releaser key**: `recordVerdict` (after all gates pass) and, separately, the permissionless `release` may be triggered by anyone — settlement's job is to ensure release happens promptly after `ReleasePending`. Narrow scope: **no FX, no on/off-ramps** (BRD positioning; `architecture.md`).
- **TR-4.7.2** (FR-13) — Execute `refund` on an authorised refund condition. Every settlement action follows the audit-around-action rule (TR-2.3): intent entry before submit, reconciliation entry (txHash + receipt) after.
- **MVP:** `recordVerdict` is folded into the `/api/check-document` route (server signs with `RELEASER_PRIVATE_KEY`); `release` is a client button. No standalone settlement service.

### 5.6 audit ledger (TR-4.6) — FR-14

- **TR-4.6.1** (FR-14, AP-4) — Append an immutable record of **every** state transition and reviewer decision. Each entry follows the schema in §6.4 and is written **before** the on-chain action (intent) with a **reconciliation** entry after (TR-2.3). The ledger — not the chain, not events — is the regulator-facing source of truth.
- **TR-4.6.2** — Append-only with tamper-evidence: each entry **MUST (full product)** carry a hash chained to the previous entry (`prevHash`) so deletion/edits are detectable; **MAY be omitted in the MVP** JSONL file (acceptable for a demo, flagged). Full product: append-only DB / object store with WORM semantics; **MVP:** `app/data/audit-ledger.jsonl` (one JSON object per line; `validate_data.py` keeps it parseable in CI).
- **TR-4.6.3** — A `Compliant` deal's ledger MUST contain the full chain: extract → per-rule grade → verdict → `recordVerdict` intent+txHash → `Released` reconciliation (the `plans/mvp-slice.md` acceptance check).
- **TR-4.6.4** (off-chain-only states) — The audit ledger is the **home of the off-chain-only states** (AP-1; not on-chain): the document-checker writes `DocumentsSubmitted` on a successful `store_document` (TR-4.2), `ReviewInProgress` when `extract_fields` begins, and `Compliant` when `check_compliance` returns a clean verdict (TR-4.3.3). These ledger transitions are what bridge the on-chain `Funded → ReleasePending` gap and MUST precede the `recordVerdict` intent entry.
- **TR-4.6.5** (idempotency) — State-transition appends and the on-chain transactions they precede MUST be **idempotent per (`dealId`, transition)**: a re-submitted `recordVerdict`/`release` (e.g. duplicate request, retry after timeout) MUST NOT create a second authorising tx or a duplicate intent entry — the contract reverts the second tx on `InvalidState`, and the off-chain layer MUST dedupe on `(dealId, fromState→toState)` before submitting and surface the existing result. This closes the double-submit gap created by the async `recordVerdict`→receipt path (TR-2.3).

### 5.7 notify (TR-4.8) — FR-17

- **TR-4.8** (FR-17, **S**) — Notify both parties on each state change (`notify_party`): funding confirmed, documents submitted, notice of release, objection window opened/closed, dispute opened, released/refunded. Channels: email / in-app (provider TBD). **MVP:** no notification channel — the UI's `useWatchContractEvent` on `StateChanged` re-reads state instead. *(BRD §7 flags whether FR-17 must move S→M for a credible demo — §12.)*

### 5.8 orchestrator (TR-4.9) — FR-15

- **TR-4.9.1** (FR-15, AP-7) — Route work between the specialists above, aggregate their structured outputs, and decide **auto-handle vs. escalate** against the autonomy policy (TR-7.3, §8 / BRD §9.2). Every output MUST be tagged auto-handled vs. escalated **with a reason** (the autonomy line graders/regulators want to see).
- **TR-4.9.2** — In the product the orchestrator runs via the **Claude Agent SDK** behind the UI, invoking the `run-analysis` skill as the stable seam (`architecture.md`). **MVP:** no orchestrator — a single direct Anthropic SDK call with an inline prompt; the orchestrator returns post-demo.

---

## 6. Data models

> Realises FR-2 (escrow spec), FR-8/FR-9 (extract + verdict), FR-14 (audit entry), FR-7 (screening record), plus the on-chain deal struct (§4). **Conventions (BRD §9 / `domain-rules.md`):** all money is in **minor units** and carried as **strings** in JSON (to avoid float/precision loss and JS `number` overflow on `uint256`); all timestamps are **ISO 8601 UTC**; the escrow spec is the **single authority** for release rules; documents are checked against the spec, not the sale contract. Schemas below are normative field sets; exact encodings (Zod/JSON-Schema/Solidity) follow per tier.

### 6.1 Escrow specification (TR-5.1) — the authoritative object

- **TR-5.1** (FR-2, FR-3, TR-2.5) — `build_escrow_spec` MUST emit a canonical JSON document with at least the fields below. Its keccak256 (over a canonical serialisation — sorted keys, no insignificant whitespace) is the **`specHash`** committed on-chain at `createDeal` (TR-3.4).

```jsonc
{
  "specVersion": "1.0",
  "dealId": "0x<bytes32>",                 // matches the on-chain key
  "parties": {
    "buyer":  { "name": "…", "address": "0x<evm>", "kycRef": "…" },
    "seller": { "name": "…", "address": "0x<evm>", "kycRef": "…" }
  },
  "payment": {
    "settlementToken": "USDC",              // the stablecoin the escrow holds/releases (no FX)
    "invoiceCurrency": "USD",               // ISO-4217 the invoice is denominated in (for currency_match)
    "chainId": 84532,                       // Base Sepolia (MVP)
    "token": "0x036CbD…",                   // ERC-20 address (deploy param)
    "amountMinor": "100000000",             // string, minor units (USDC 6dp → 100.00)
    "decimals": 6
  },
  "tradeTerms": {
    "incoterm": "FOB",                      // optional; informs which docs are required
    "shipmentDeadline": "2026-07-01T00:00:00Z",  // ISO 8601 UTC; authoritative (not from docs)
    "originCorridor": "UK→EU"               // beachhead is UK/EU/ME, goods-agnostic (BRD §4.3)
  },
  "requiredDocuments": ["commercial_invoice"],   // subset of BRD §8 set; MVP = invoice only
  "releaseRules": [                          // the rule set the engine evaluates (TR-4.3.2)
    { "rule": "document_present", "doc": "commercial_invoice" },                                  // MVP ✅
    { "rule": "amount_match",     "field": "totalAmount", "against": "payment.amountMinor", "toleranceMinor": "0" },  // MVP ✅
    { "rule": "party_match",      "field": "sellerName",  "against": "parties.seller.name", "minScore": 0.8 },        // MVP ✅
    { "rule": "currency_match",   "field": "currency",    "against": "payment.invoiceCurrency" },                    // 🔵 full product
    { "rule": "shipment_by",      "field": "shipmentDate","against": "tradeTerms.shipmentDeadline" }                 // 🔵 full product
  ],
  "approvals": {                             // FR-3: both parties approve the spec/TEA before createDeal
    "buyer":  { "approved": true, "at": "2026-06-10T10:00:00Z", "ref": "sig:…" },
    "seller": { "approved": true, "at": "2026-06-10T10:05:00Z", "ref": "sig:…" }
  },
  "lineage": { "amendmentOf": null },        // set to a prior dealId when this deal supersedes a refunded one (TR-4.4.3)
  "objectionWindowHours": 48,               // BRD default (open §15 Q9 → §12)
  "valueCapGBP": 50000,                      // autonomy cap context (open §15 Q8 → §12)
  "disputeForum": {                          // per-deal, from the TEA (BRD §12); field name is a TR design choice
    "type": "expert_determination",          // enum: arbitration | expert_determination | litigation
    "name": "…", "rules": "…", "seat": "…"
  }
}
```

**Release-rule DSL (closed set).** A `rule` value MUST be one of the enumerated types below; an unknown `rule` is a spec error (rejected at `build_escrow_spec`), never a silent no-op. Each type has a fixed key contract:

| `rule` | Required keys | Pass condition | MVP |
|--------|---------------|----------------|-----|
| `document_present` | `doc` | the named doc was uploaded | ✅ |
| `amount_match` | `field`, `against`, `toleranceMinor` | `abs(toMinor(field) − spec[against]) ≤ toleranceMinor` (bigint, AP-5) | ✅ (tolerance 0) |
| `party_match` | `field`, `against`, `minScore` | fuzzy-match score ≥ `minScore` | ✅ |
| `currency_match` | `field`, `against` | `field == spec[against]` (ISO-4217) | 🔵 |
| `shipment_by` | `field`, `against` | `toUTC(field) ≤ spec[against]` | 🔵 |

- Money fields are **strings in minor units**; the rules engine parses them via `parseUnits`/bigint (AP-5). `amountMinor` MUST equal the on-chain deal `amount`.
- `requiredDocuments` and `releaseRules` are the only inputs to the verdict (TR-4.3) — the engine never reads the sale contract.
- **Settlement token vs invoice currency.** `payment.settlementToken` (the stablecoin held/released) and `payment.invoiceCurrency` (ISO-4217 the document states) are **distinct**: `currency_match` compares the invoice's currency field to `invoiceCurrency`, not to the token. The demo MAY denominate the invoice in USD (≈USDC 1:1) as a simplification.
- **Data-protection note (→ §12).** `parties.*.name` and the extracted `sellerName`/`buyerName` are personal/company data. In the full product the spec's `specHash` is committed on-chain (immutable, publicly readable on Base Sepolia); the *cleartext* names live only in the off-chain spec store, but committing a hash of records containing names is a production data-protection design choice. BRD §10 marks production PII handling as `[DISCUSS]`; this is forwarded to §12. (Build-time uses synthetic identities only — AP-8.)
- **MVP:** the spec is **not generated** — its effective fields (`amountMinor`, `sellerName`) are hardcoded in `rules.ts`. The MVP rules engine (`gradeInvoice`, `plans/mvp-slice.md`) evaluates **only** `document_present` + `amount_match` + `party_match` (it does **not** check currency or shipment date); `specHash`, `approvals`, `lineage`, `disputeForum`, `currency_match`, `shipment_by`, and multi-doc rules are all deferred.

### 6.2 Extracted document fields (TR-5.2)

- **TR-5.2** (FR-8) — `extract_fields` MUST return values, schema-validated before any rule runs (AP-5). The extractor reads; it does **not** grade.

**Full-product envelope** (per-field confidence, source binding):

```jsonc
{
  "documentType": "commercial_invoice",
  "fields": {
    "totalAmount":   { "value": "100.00", "confidence": 0.98 },  // string; engine converts to minor units
    "currency":      { "value": "USD",    "confidence": 0.99 },  // ISO-4217 (what the invoice states)
    "sellerName":    { "value": "Acme Widgets Ltd", "confidence": 0.97 },
    "buyerName":     { "value": "…",      "confidence": 0.95 },
    "invoiceNumber": { "value": "INV-001","confidence": 0.99 },
    "shipmentDate":  { "value": "2026-06-20T00:00:00Z", "confidence": 0.92 }
  },
  "sourceDocumentHash": "sha256:…"           // ties extraction to the stored blob (TR-4.2)
}
```

**MVP Zod schema** (`plans/mvp-slice.md` — five flat strings, no confidence wrapper, no `shipmentDate`):

```ts
const InvoiceExtract = z.object({
  totalAmount:   z.string(),   // string to avoid float parsing in LLM output
  currency:      z.string(),
  sellerName:    z.string(),
  buyerName:     z.string(),
  invoiceNumber: z.string(),
})
```

- A field below the **0.9** confidence threshold (BRD §9.2) flags that specific field for human review and blocks auto-`Compliant` (AP-7). Confidence and `shipmentDate` are **full-product** additions — the MVP single-shot extraction has neither.
- `totalAmount` is a **string** in both tiers (never a float) to avoid LLM/JS float parsing.

### 6.3 Compliance verdict (TR-5.3)

- **TR-5.3** (FR-9) — `check_compliance` MUST return one verdict enum + a **per-rule audit object** (the evidence that goes to the ledger):

```jsonc
{
  "dealId": "0x<bytes32>",
  "verdict": "Compliant",                    // Compliant | Discrepant | Rejected | Escalated
  "evaluatedAt": "2026-06-20T12:00:00Z",
  "specHash": "0x<bytes32>",                 // which spec version was evaluated (TR-4.3.2)
  "rules": [
    { "rule": "amount_match", "field": "totalAmount", "pass": true, "expected": "100000000", "actual": "100000000", "toleranceMinor": "0" },
    { "rule": "party_match",  "field": "sellerName",  "pass": true, "expected": "Acme Widgets Ltd", "actual": "Acme Widgets Ltd", "score": 0.94 }
  ],
  "lowConfidenceFields": [],                  // any field < 0.9 → non-empty → human review
  "valuation": {                              // auditable basis for the £50k cap test (AP-5 — no free-text math)
    "amountMinor": "100000000", "settlementToken": "USDC",
    "rate": "0.79", "rateSource": "ECB 2026-06-20", "valuedAtGBP": "79.00"
  },
  "valueWithinCap": true,                     // valuedAtGBP ≤ valueCapGBP → auto-eligible
  "decision": "auto",                         // auto | human_review (AP-7)
  "reviewer": null,                           // set when human signs off: { id, at }
  "reason": "all rules pass; confidence ≥ 0.9; value ≤ cap"
}
```

- Verdict mapping: all rules pass **and** `lowConfidenceFields` empty **and** `valueWithinCap` → `Compliant` (`decision: auto`); a failed rule → `Discrepant`; a missing required doc / unrecoverable → `Rejected`; fraud / sanctions / unresolved objection → `Escalated`. Over the cap or any low-confidence field → `decision: human_review` (verdict still computed, but not actioned until a reviewer signs off).
- **MVP:** only `Compliant`/`Discrepant`; `decision` is always `auto` (no human console); `reviewer` unused.

### 6.4 Audit-ledger entry (TR-5.4)

- **TR-5.4** (FR-14, AP-4, TR-2.3) — Every entry is one JSON object (one JSONL line in the MVP) with:

```jsonc
{
  "seq": 42,                                  // monotonic per ledger
  "ts": "2026-06-20T12:00:01Z",               // ISO 8601 UTC
  "dealId": "0x<bytes32>",
  "phase": "intent",                          // intent | reconciliation | offchain_state
  "from": "Funded", "to": "ReleasePending",   // transition (incl. off-chain-only states, TR-4.6.4)
  "actor": { "role": "releaser", "id": "…" }, // who authorised; "system"/"reviewer:<id>"/"buyer"…
  "basis": "verdict=Compliant; objection window expired; no dispute",  // why
  "verdictRef": "0x<hash-of-verdict-object>", // links to the §6.3 object
  "tx": { "hash": null, "block": null, "status": null },  // filled by the reconciliation entry
  "prevHash": "sha256:…",                     // chains to seq-1 (MUST full product; MAY omit MVP)
  "entryHash": "sha256:…"                     // hash of this entry's canonical content
}
```

- Two entries bracket each on-chain action: `phase:"intent"` (before submit, `tx` null) and `phase:"reconciliation"` (after receipt, `tx` populated, incl. revert/drop) — TR-2.3. Off-chain-only transitions use `phase:"offchain_state"` (TR-4.6.4).
- **Hash schemes:** on-chain binding hashes (`specHash`) are **keccak256** (`0x…`, to match Solidity); off-chain ledger/document hashes (`prevHash`, `entryHash`, `sourceDocumentHash`) are **sha256** (`sha256:…`) — they are deliberately *not* on-chain values. `entryHash` is computed over the entry's canonical content **including `seq`, `ts`, and the transition**, and `prevHash` = the prior entry's `entryHash`, so neither `seq` nor any field can be rewritten without breaking the chain.
- **MVP:** `audit-ledger.jsonl`; `prevHash`/`entryHash` MAY be omitted; the line set for a Compliant deal must still show extract→grade→verdict→recordVerdict(tx)→released (TR-4.6.3).

### 6.5 KYC / screening record (TR-5.5)

- **TR-5.5** (FR-7) — `screen_sanctions` / `verify_kyb` return a record appended to the ledger; **no real PII** (AP-8) — synthetic identities + public list snapshots only:

```jsonc
{
  "dealId": "0x<bytes32>",
  "party": "buyer",                           // buyer | seller
  "kybMatched": true,
  "sanctions": { "lists": ["OFAC","UN","HMT"], "hit": false, "snapshotDate": "2026-06-01" },
  "result": "green",                          // green → may fund; hit/amber → hold + escalate
  "screenedAt": "2026-06-01T09:00:00Z"
}
```

- A `hit` (or amber) MUST set the deal hold (TR-4.5.1) and file a report — never auto-suppressed.
- **MVP:** deferred (no KYC in the slice).

### 6.6 Objection record (TR-5.7) — FR-11

- **TR-5.7** (FR-11) — A buyer objection raised in the window (TR-4.4.2) is recorded with the **graded ground** from the closed valid set (BRD §9.1):

```jsonc
{
  "dealId": "0x<bytes32>",
  "raisedBy": "buyer",
  "raisedAt": "2026-06-21T09:00:00Z",
  "ground": "field_mismatch",                // enum: missing_document | field_mismatch | late_shipment |
                                             //       suspected_fraud | sanctions_kyc | mutual_amendment
  "detail": "invoice seller name differs from escrow spec",
  "valid": true,                              // graded against the closed set; anything else → false
  "rationale": "ground ∈ valid set; field mismatch confirmed by rule party_match",
  "outcome": "amendment"                      // amendment | waiver | refund | dispute | rejected(invalid)
}
```

- An objection with `valid:false` (e.g. "buyer changed their mind", post-shipment renegotiation, subjective quality with no inspection rule) is **rejected** and does **not** block release. The full record is appended to the ledger (TR-4.6).
- **MVP:** deferred (no objection window in the slice).

### 6.7 On-chain deal struct (TR-5.6) — for reference, defined in §4

- **TR-5.6** — The contract stores the minimal struct (AP-1): `Deal { address buyer; address seller; uint256 amount; }` keyed by `bytes32 dealId`, plus `mapping(bytes32 => State)`. **Full product adds `bytes32 specHash`** to the struct (TR-3.4). All other fields above are **off-chain** — the contract never sees names, documents, rules, currency labels, or fiat values.

---

## 7. APIs & interfaces

> Realises FR-5, FR-6, FR-16, FR-19, and the integration seams (FR-17 notification *delivery* is an off-chain concern owned by TR-4.8; §7 provides only its MVP substitute — the `useWatchContractEvent` state-refresh in TR-6.3.1 — not an HTTP notification surface). Four interface planes: **on-chain** (contract ABI), **off-chain HTTP** (server routes), **client** (UI/wallet), and **internal tools + external connectors**. MVP marks per `plans/mvp-slice.md`.

### 7.1 On-chain interface — contract ABI (TR-6.1)

- **TR-6.1.1** (FR-5, FR-12) — The escrow contract exposes the §4 functions as its ABI. **Writes:** `createDeal`, `deposit`, `recordVerdict`, `release`, `refund`, `cancel`, `pause`, `unpause`, role admin. **Reads (views):** `deals(bytes32) → (buyer, seller, amount[, specHash])`, `state(bytes32) → uint8 State`, `hasRole(role, account)`. **Events** (TR-3.5): `DealCreated`, `Funded`, `VerdictRecorded`, `Released`, `Refunded`, `StateChanged`, (+ `Cancelled`/`DisputeRaised`/`DisputeResolved` full product).
- **TR-6.1.2** — The ABI JSON is the cross-tier contract: the web app imports it (the **escrow** ABI from `contracts/artifacts/…` via copy-on-build/symlink), and the off-chain settlement service uses it via viem. The buyer panel additionally needs the **ERC-20 ABI** (`erc20Abi`) for the USDC `approve`/`balanceOf` calls (TR-6.3.2). The State enum int↔name mapping has a **single owner** — a shared TS enum that MUST track the MVP 6-value order exactly (`Draft=0, Agreed=1, Funded=2, ReleasePending=3, Released=4, Refunded=5`); the Release-button gate (`state == ReleasePending`, i.e. `3`) depends on it, so any reordering of the Solidity enum MUST update the shared enum in lockstep. `dealId` is `bytes32` everywhere (UI derives it via `keccak256`).
- **MVP:** exactly the reduced function/event set in §4.

### 7.2 Off-chain HTTP API (TR-6.2)

- **TR-6.2.1** (FR-6, FR-8, FR-9) — **`POST /api/check-document`** — the operational core (and the only route built in the MVP). Accepts a multipart upload (single PDF ≤5 MB in MVP); converts to base64; calls Claude vision (`extract_fields`); validates with Zod (TR-5.2); runs the deterministic rules engine (`check_compliance`, TR-4.3); appends audit entries (TR-4.6); on `Compliant`, signs `recordVerdict` with the releaser key and waits for the receipt. Response:
  ```jsonc
  // 200 Compliant: { "verdict": "Compliant", "txHash": "0x…", "rules": [...], "auditRef": "…" }
  // 200 Discrepant: { "verdict": "Discrepant", "extract": {...}, "reason": "…" }   // no chain write
  // 400: Zod/validation failure (bail before any business logic or chain write)
  // 409: deal not in Funded (e.g. already ReleasePending/Released) — mirrors on-chain InvalidState
  ```
  Audit appends bracket the chain write per AP-4/TR-2.3: an **intent** entry **before** signing `recordVerdict`, a **reconciliation** entry (txHash + receipt status) **after**.
- **TR-6.2.1a** (idempotency, TR-4.6.5) — Re-uploading a document for a deal already past `Funded` MUST NOT fire a second `recordVerdict`: the route dedupes on `(dealId, transition)`, and returns the **existing** `txHash` (200) or **409** rather than submitting a duplicate tx or writing a duplicate intent entry.
- **TR-6.2.2** (full product) — Additional routes, all returning structured results + audit refs: `POST /api/deals` (intake → escrow spec + TEA, FR-1/2/3), `POST /api/deals/:id/approve` (party approval, FR-3), `POST /api/deals/:id/objections` (raise/grade objection, FR-11), `GET /api/deals/:id` (state + ledger view, FR-16), `POST /api/kyc/screen` (FR-7). These are **🔵 deferred** in the MVP.
- **TR-6.2.3** (security) — Routes that move state or hold secrets run **server-side only**; the releaser key (`RELEASER_PRIVATE_KEY`) is read from env, never exposed to the client bundle (§9.1). Input validation (Zod) precedes any business logic or chain write on every route. **MVP caveat:** `/api/check-document` is **unauthenticated and same-origin** — anyone who can reach it can trigger a releaser-signed `recordVerdict`, so the demo deployment MUST NOT be exposed publicly. Authentication, rate-limiting, and CORS hardening are deferred (required before FR-19 / any public surface). **Note (2026-06-05):** this caveat now **diverges from the decided full-product posture** (AP-9 / TR-6.2.4–7). It is accepted *for the demo only*, on the strict condition the route stays localhost-bound; implementing TR-6.2.4–7 is the first post-demo hardening item.

#### Full-API-integration requirements (AP-9, decided 2026-06-05) — TR-6.2.4 … TR-6.2.7

- **TR-6.2.4** (authentication, full product) — Every off-chain HTTP route MUST authenticate the caller **before any other processing**. Party-facing routes use user sessions via short-lived signed tokens (e.g. JWT) **or** wallet-signature login (SIWE, EIP-4361) — mechanism is an open decision (§12 Q18). Service/partner access (FR-19 seam) uses per-client API keys: carried in a request header (never in URLs), issued and revocable individually, stored only as salted hashes server-side, rotated on schedule and on suspected compromise. Failed authentication returns `401` with a generic body (no information leakage about which part failed); an authenticated caller lacking rights returns `403` (TR-6.6 typed errors).
- **TR-6.2.5** (authorization) — Authentication establishes *who*; each route additionally enforces **role + deal-scoped** authorization: a buyer may act only on deals where they are the recorded buyer (approve, raise objection), a seller only on theirs (document upload), reviewer/compliance/admin roles only on their respective consoles. The authorising identity is written to the audit entry's `actor` field (TR-5.4), making every API action attributable — the API layer is what populates the attribution the ledger promises. **Role model (BRD §5 decision, 2026-06-10):** the role set MUST additionally accommodate a **platform/intermediary initiator** — a non-principal party that may **create a deal and invite buyer + seller** (TR-4.1.4) but is **not** itself the escrow buyer/seller; its rights are scoped to **initiation/coordination only**, never deposit/approve/release. Because such a party may have **no wallet**, its auth mechanism is the open part of §12 Q18 (likely account/JWT) — flagged as a consequence to confirm, not decided here.
- **TR-6.2.6** (transport & abuse hardening) — TLS (HTTPS) on every surface, no plaintext fallback. Per-client rate limiting on all routes (`429` + `Retry-After`). Strict CORS allowlist — never `*` on authenticated routes. Request-size limits per TR-4.2. Secrets, tokens, and keys MUST never appear in URLs, logs, or error bodies. Repeated auth failures are logged and surfaced for monitoring (the releaser-signed routes are the highest-value target, §9.1).
- **TR-6.2.7** (the API as sole mutation surface) — AP-9 makes the HTTP API the **only** off-chain mutation path in production: no admin scripts or consoles writing the store/ledger out-of-band (seed scripts are build/demo-time only, TR-9.3). The two non-API paths are deliberate and bounded: (a) wallet-signed on-chain transactions, governed by contract roles (§4.2); (b) the chain-event watcher, which is **read-only**. Any future internal console (reviewer sign-off, compliance) MUST itself call the authenticated API, not the database.
- **MVP:** none of TR-6.2.4–7 is built — the slice has the single same-origin route under the TR-6.2.3 caveat. These four requirements are the gate between the demo and **any** public exposure, and a hard precondition for FR-19.

### 7.3 Client / UI interface (TR-6.3)

- **TR-6.3.1** (FR-5, FR-6, FR-16) — Next.js (App Router) + wagmi v2 + RainbowKit. Wallet connect via `<ConnectButton/>`. Contract interaction via wagmi hooks: `useAccount`, `useReadContract` (state badge, balances), `useWriteContract` (`approve`, `deposit`, `release`), `useWaitForTransactionReceipt`, `useWatchContractEvent` (`StateChanged` → invalidate the state query, no polling).
- **TR-6.3.2** — Buyer surface: USDC balance, **Approve** then **Deposit**. `approve` is a write **against the USDC token contract** (not the escrow) using `erc20Abi` — `approve(escrowAddress, amount)` — and **Deposit MUST be gated on the approve receipt** (`useWaitForTransactionReceipt`) before `deposit(dealId)` is enabled. Seller surface: document upload → `/api/check-document` → verdict pane → **Release** button (enabled when `state == ReleasePending`). All wagmi usage in `'use client'` components.
- **TR-6.3.3** (SSR) — **MVP is CSR-only** (no cookie hydration — a deliberate `plans/mvp-slice.md` time-saving cut); the **full product** uses `cookieToInitialState` + `createStorage({ storage: cookieStorage })` + `ssr: true` per the wagmi SSR guide.
- **TR-6.3.4** (FR-1, FR-16; BRD §5 decision, 2026-06-10) — **Role-based onboarding flows (full product).** The client MUST provide distinct onboarding/initiation flows per party role — **buyer, seller, and platform/intermediary** — any of which can start a deal and invite the counterparty/counterparties (realising the BRD §5 role-agnostic-initiation decision and TR-4.1.4). The acting role is established at **authentication** (TR-6.2.4–6.2.5), **not** via the demo's `?role=` query param (a deliberate MVP stand-in). **Auth dependency:** the platform/intermediary flow needs an account/JWT-style role (it may carry no buyer/seller wallet), reinforcing the §12 Q18 decision — confirm the mechanism before building.
- **MVP:** a **single page** keyed by `?role=buyer|seller`, one hardcoded `dealId`; no separate buyer/seller pages, no platform/intermediary flow, no multi-deal dashboard, no reviewer console (all 🔵). Display USDC only (not ETH).

### 7.4 Internal tool interface (TR-6.4)

- **TR-6.4** (AP-5) — The `tools/` surface (deterministic functions the agents call) is an internal interface with stable signatures, each independently testable (the week-8 eval harness target). Canonical signatures (from `tools/README.md`, reconciled in §5.0): `parse_sale_contract(pdf) → fields+confidence`; `build_escrow_spec(terms) → EscrowSpec` (§6.1); `screen_sanctions(party)` / `verify_kyb(party) → ScreeningRecord` (§6.5); `store_document(blob) → {hash}`; `extract_fields(document, schema) → Extract` (§6.2); `check_compliance(extracted_fields, escrow_spec) → Verdict` (§6.3); `open_objection_window(dealId)` / `grade_objection(objection, spec) → ObjectionRecord` (§6.6) / `escalate_to_dispute(dealId)`; on-chain wrappers `deploy_escrow`/`fund_escrow`/`release_funds`/`refund_escrow`/`cancel_escrow` (+ `record_verdict`, to be added — §5.0); `notify_party(party, event)`; `append_audit(entry)` (§6.4). Money math lives **only** here (AP-5). **MVP:** these are inlined into the route/`rules.ts` rather than exposed as a discrete tool layer.

### 7.5 External connectors (TR-6.5)

- **TR-6.5** — External interfaces, all swappable behind the tool layer: **chain RPC** (Base Sepolia `https://sepolia.base.org`, viem transport); **Anthropic API** (Claude vision for extraction; model id verified against current docs, never a stale `claude-3-opus`); **sanctions/KYC feeds** (public OFAC/UN/HMT snapshots in build; provider TBD §12); **notification channels** (email/Slack/in-app, TBD); **stablecoin faucets** (Circle USDC, Base ETH — test only). In the product these are MCP connectors (chain RPC, sanctions, OCR, audit store, notifications) per `tools/README.md`; build-time secrets via env (`.env`, never committed).

### 7.6 API conventions (TR-6.6)

- **TR-6.6** — All HTTP responses carry the structured result + an `auditRef` to the ledger entry (FR-14 traceability). Errors are typed (validation 400, auth 401/403, state-conflict 409 mirroring on-chain `InvalidState`). Money in API payloads is **string minor units** (TR-5 conventions). No endpoint returns or accepts a private key. **FR-19** (white-label/API) is a **seam only** — the off-chain HTTP API is the future external surface but is **not** hardened/authenticated for third parties in scope now. The **full-API-integration decision (AP-9)** confirms this API as the canonical external surface; TR-6.2.4–7 define the hardening bar it must meet before FR-19 opens it to third parties.

---

## 8. End-to-end flow & autonomy gates

> Realises the BRD §6.1 happy path, FR-15 (autonomy), and the §9.2 decision policy. This section ties the components (§5), contract (§4), and data (§6) into the **deal → document-check → release** lifecycle and defines, per step, what the system does **automatically** vs. **escalates to a human**.

### 8.1 The deal → document-check → release sequence (TR-7.1)

- **TR-7.1** — The system MUST implement the BRD §6.1 ten-step happy path, with every state transition audited (AP-4) and every decision tagged auto/escalate (FR-15).

```
 Step (BRD §6.1)              Component            On/off-chain        State after
 ─────────────────────────────────────────────────────────────────────────────────
 1. Sale contract (off-platform)        —                  —             —
 2. Engage + upload terms     deal-intake (TR-4.1) off-chain            (pre-Draft)
 3. Extract release rules     deal-intake          off-chain            —
 4. Generate spec+TEA+escrow  deal-intake+settlement on-chain createDeal Draft→Agreed
    └ GATE: KYC/sanctions (TR-4.5) must be green before funding
 5. Both parties approve      deal-intake (TR-4.1.3) off-chain          Agreed
 6. Buyer deposits            client→contract      on-chain deposit      Agreed→Funded
 7. Seller ships + uploads    document-checker     off-chain store_document  (DocumentsSubmitted*)
 8. Verify vs rules           document-checker     off-chain check_compliance (ReviewInProgress*→Compliant*)
    └ GATE: verdict + confidence + value cap (TR-7.3)
 9. Notice of release + window dispute (TR-4.4)    off-chain            (objection window open)
    └ GATE: objection window expires, no valid objection, no dispute (TR-7.3)
10. Record verdict → release  settlement→contract  on-chain recordVerdict Funded→ReleasePending
                                                   on-chain release      ReleasePending→Released
 ─────────────────────────────────────────────────────────────────────────────────
 * off-chain-only states live in the audit ledger (TR-4.6.4), not on-chain.
```

- **Critical ordering (AP-7, TR-3.3):** all of step 8's and step 9's gates execute **before** `recordVerdict` (step 10), because `recordVerdict` makes the release unstoppable (permissionless `release`). The objection window is an **off-chain** timer; `recordVerdict` is only signed after it expires with no valid objection.
- **MVP path:** steps 6→8→10 only — buyer deposits, seller uploads invoice, `/api/check-document` extracts+grades, and on `Compliant` the server signs `recordVerdict`; the seller then clicks Release. Steps 2–5 (intake/KYC/approval) and step 9 (objection window) are deferred; the deal is pre-seeded via `createDeal` in a seed script.

### 8.2 State transitions & release preconditions (TR-7.2)

- **TR-7.2.1** — The release of funds MUST NOT occur unless **all** of the following hold (BRD §9.3 "no release without all preconditions"; `domain-rules.md`):
  1. escrow is `Funded`;
  2. required documents submitted;
  3. compliance verdict = `Compliant` (with human sign-off where the autonomy gate requires it);
  4. notice of release issued;
  5. objection window expired with **no valid objection**;
  6. no active dispute.
  Conditions 2–5 are enforced **off-chain before** `recordVerdict`; the on-chain contract enforces 1 (`Funded`) and the `ReleasePending` precondition for `release`. "**Valid objection**" (cond. 5) is the closed grounds set in BRD §9.1 / TR-4.4.2, recorded per the §6.6 objection schema; a `Disputed` deal (cond. 6) is reachable on-chain only from `ReleasePending` (§4.3) — a dispute during off-chain review simply never advances the contract past `Funded`. A valid objection diverts the flow to **amendment** (refund + new `dealId`, TR-4.4.3), **waiver** (authorises `recordVerdict` on the existing deal), **refund**, or **dispute** rather than to release.
  **MVP note:** the slice builds neither the notice nor the objection window, so it satisfies conditions 4–5 **by construction** (no window ⇒ trivially "expired with no valid objection") — it does not violate the "all six" rule.
- **TR-7.2.2** — Refund preconditions (any one): shipment deadline missed; mutual cancellation; dispute resolved for the buyer. Refund requires human reviewer sign-off (BRD §9.2) and writes the audit bracket (TR-2.3).
- **TR-7.2.3** — Each transition writes its ledger entry **before** the on-chain tx (intent) and a reconciliation entry after (TR-2.3); off-chain-only transitions (`DocumentsSubmitted`/`ReviewInProgress`/`Compliant`) are ledger-only (TR-4.6.4).

### 8.3 Autonomy gates (TR-7.3) — auto-act vs. escalate

- **TR-7.3** (FR-15, BRD §9.2) — Each action below MUST be tagged **auto-handled** or **escalated**, with a reason recorded in the ledger. Auto-action is permitted **only inside** the envelope; anything outside escalates to the named human role. This table is the machine-readable form of BRD §9.2 + `domain-rules.md`.

| Action | Auto threshold (act automatically) | Otherwise → escalate to |
|--------|-----------------------------------|--------------------------|
| Term extraction (TR-4.1) | per-field confidence ≥ 0.9 on all mandatory fields | deal-intake user (confirm) |
| KYC / KYB / sanctions (TR-4.5) | all green, no sanctions hit, KYB matched | compliance officer; hold deal at `Draft` |
| Document field extraction (TR-4.3.1) | OCR/AI confidence ≥ 0.9 per checked field | flag that field for human review |
| Compliance verdict (TR-4.3.3) | all rules pass **AND** deal value ≤ **£50k** equiv. cap | mandatory human-review console sign-off |
| Notice of release (TR-4.4.1) | verdict `Compliant`, no open dispute, escrow `Funded` | hold; surface discrepancy/escalation |
| Fund release (TR-7.2) | objection window expired, no valid objection, no active dispute | hold; route to dispute workflow |
| Refund (TR-7.2.2) | refund condition met | hold; require human reviewer sign-off |
| Regulatory/sanctions report | standard AML/sanctions trigger | **file and notify — never auto-suppress** |

- The **human roles** in the escalate column map to BRD §5 actors — *deal-intake user* (a Blockmediary operator), *compliance officer*, *document reviewer* (the human-review console), *human reviewer* (refund sign-off), and the *dispute resolver* (per-deal forum). **None of these consoles are built in the MVP** (TR-7.3.3).
- **TR-7.3.1** — The **£50k cap** and **48h window** are BRD-**open defaults** (BRD §15 Q8/Q9 → §12); they MUST be configuration values (in the escrow spec / config), not hardcoded constants, so confirming or changing them is a config change.
- **TR-7.3.2** — Escalation is **fail-safe**: if any gate's inputs are missing, ambiguous, or below threshold, the system holds and escalates rather than proceeding. A `Escalated` verdict freezes the deal pending dispute (fraud / sanctions / unresolved objection).
- **TR-7.3.3** (MVP) — The slice operates **inside the auto envelope by construction** (synthetic compliant invoice ≤ £50k, no KYC, no objection) so no human console is built; the gate logic is still encoded (value-cap + confidence checks in `rules.ts`) and the auto/escalate tag is written to the ledger. Human-review console, KYC escalation, and dispute routing are 🔵 deferred.

---

## 9. Security & compliance

> Realises NFR-Security, NFR-Auditability, NFR-Compliance, NFR-Determinism, NFR-Privacy (BRD §10), the §9.3 hard "don'ts", and AP-3/4/5/7/8. Security here spans three surfaces: the **key/custody** model, the **contract**, and the **off-chain/data** plane.

### 9.1 Key management & custody (TR-8.1) — the top risk

- **TR-8.1.1** (AP-3, NFR-Security) — Buyer funds are held **only by the escrow contract** — never a Blockmediary-controlled wallet, never a hot wallet (BRD §9.3, §10, §12). The releaser holds an **authorising** key, not a custodial one: it can move a deal's state (`recordVerdict`, `refund`) but **cannot redirect funds to an arbitrary address** — payouts go only to the deal's recorded buyer (`refund`) or seller (`release`) (TR-3.2). Note this is *not* the same as "cannot harm a party": see TR-8.1.2.
- **TR-8.1.2** (top security risk) — **Compromise of the releaser key** is the highest-impact threat, and it is a **two-sided** lever (not just "push to release"):
  - **Against the seller:** `recordVerdict` on a non-compliant deal (→ `ReleasePending`, after which release is permissionless and unstoppable), paying out goods that didn't conform; **and** `refund` of any `Funded`-but-pre-verdict deal to the buyer, denying a seller who has shipped. The permissionless-`release` design protects the seller only *after* `recordVerdict` — during the whole `Funded → (recordVerdict | refund)` window the releaser holds a one-sided lever against the seller.
  - **Against the buyer:** pushing a discrepant deal to release.
  Mitigations REQUIRED:
  - Key lives in server env (`RELEASER_PRIVATE_KEY`), **never** in the repo, client bundle, or logs; `.env*` is gitignored (TR-8.5).
  - Key is **rotatable** via `AccessControl` grant/revoke (TR-3.2-roles) — on suspected compromise, admin revokes the old releaser and grants a new one.
  - Admin is a **multisig in production** (single deployer key acceptable only for the testnet demo).
  - `pause()` is the emergency backstop: because `release` carries `whenNotPaused` (TR-3.4), admin can pause to halt in-flight settlement during incident response — accepting the censorship trade-off (§4.4) as an emergency-only lever.
  - The audit ledger's intent-before-submit entry (AP-4) records *which* key authorised every transition, making misuse attributable.
- **TR-8.1.3** — `release` is **permissionless** by design (AP-7): once a deal is `ReleasePending`, a compliant seller cannot be censored by withholding the releaser key — the releaser can *start* settlement but not *stop* it. This protects the seller only **post-verdict**; pre-verdict protection (against the refund lever above) rests on key hygiene + multisig admin + the audit trail, not on the contract.

### 9.2 Autonomy & privilege enforcement (TR-8.2)

- **TR-8.2.1** (FR-15) — The autonomy gates (§8.3 / TR-7.3) MUST be **machine-enforced**, not merely documented: the off-chain layer checks each threshold in code and refuses to proceed (fail-safe escalate, TR-7.3.2) when inputs are missing/ambiguous/below threshold. Every decision is tagged auto/escalate with a reason in the ledger.
- **TR-8.2.2** (agent privilege) — In the agent scaffold, agent tool-grants are constrained by a **capability manifest** (`tools/agent_capabilities.json`) and a CI gate (`tools/check_agent_security.py`) that fails the build on: (a) a grant outside the agent's approved set (escalation), (b) an undeclared agent, (c) an empty `tools:` line (which would grant all tools), (d) a stale manifest entry, and (e) a Bash/Write-granted agent missing its `## Boundaries` guardrails section. Widening an agent's privilege is therefore a reviewable edit to the manifest, not a silent prose change.
  - **Known gap (→ §12):** an agent approved as `*` (currently `orchestrator`) is **short-circuited** before checks (a)/(c)/(e) — see `check_agent_security.py` lines 82–84 (`if allowed == ["*"]: continue`). So the most-privileged agent is *not* superset-checked and is *not* required to carry a Boundaries section, even though `*` includes Bash/Write. This is an accepted current limitation (de-escalation is treated as safe); to close it, move the `needs_escalation`/guardrails check above the `*` short-circuit. (Build-time control only; product-runtime authz is the API-auth seam, TR-6.2.3 / §12.)

### 9.3 Audit & regulatory compliance (TR-8.3)

- **TR-8.3.1** (FR-14, AP-4) — The audit ledger is the **regulator-facing source of truth**: every state transition + reviewer decision is recorded **before** the on-chain action (intent) and reconciled after (TR-2.3, §6.4). **Tamper-evidence is a production property, not an MVP one:** it requires both the hash-chain (`prevHash`/`entryHash`, TR-4.6.2) **and** an out-of-band anchor (WORM substrate or periodic on-chain commit) — a self-contained chain whose file the attacker fully controls can be wholesale re-computed. The **MVP** plain `audit-ledger.jsonl` omits chaining and is therefore freely editable: tamper-evidence is **explicitly deferred**, not achieved in the slice.
- **TR-8.3.2** (NFR-Compliance) — KYC/KYB/sanctions screening is a **hard gate before `Funded`** (FR-7, TR-4.5); a sanctions hit is **filed and notified, never auto-suppressed** (BRD §9.2 / domain-rules). Continuous monitoring through `Released` is a full-product extension (TR-4.5.3).
- **TR-8.3.3** (regulatory posture) — Scope choices constrain the regulatory profile and MUST be honoured: **no financing** (escrow/settlement only — not a lender, no spread, ever; BRD §4.2.b); **no FX inside the system** — the contract performs no currency conversion and parties agree the settlement stablecoin upfront (domain-rules); the buyer sourcing the stablecoin off-platform is not a Blockmediary FX activity, and adding in-system FX would change the regulatory profile (a deliberate boundary, not a "later" feature); **no on/off-ramps**; **no title/quality claims** (release on document compliance only). Sanctioned corridors and prohibited/high-risk goods are excluded (BRD §4.3). Target-jurisdiction AML specifics (UK/EU/ME) are BRD-open (§10 Compliance `[DISCUSS]`) → §12; the system MUST NOT make jurisdiction-specific regulatory claims without sourcing (domain-rules).

### 9.4 Determinism for money (TR-8.4)

- **TR-8.4** (AP-5, NFR-Determinism) — All amount-matching, currency comparison, fee/threshold math, and value-cap valuation happen in **real code** (`tools/`, `rules.ts`), never in agent free-text. Money is in **minor units** as `bigint`/`parseUnits` (no floats), rounded only at display (BRD §9.3). LLM output is schema-validated (Zod) **before** any business logic (TR-4.3.1). This is the single rule that prevents LLM arithmetic errors in a payments product; it is testable (the tool layer is the eval-harness target, TR-6.4).

### 9.5 Data handling & secrets (TR-8.5)

- **TR-8.5.1** (AP-8, NFR-Privacy, BRD §9.3/§14) — **No real customer PII or live financial data** during the build: synthetic identities, public sanctions snapshots (OFAC/UN/HMT), and sandbox endpoints only. Production PII handling and data-protection regime are BRD-open (§10) → §12, including the on-chain-name-hash concern (TR-5.1).
- **TR-8.5.2** (secrets) — All secrets via env. The build MUST commit a `.env.example` template and a root `.gitignore` (both are Phase-0 tasks in `plans/mvp-slice.md`, **not yet present** in the repo) that ignore real `.env*` alongside `node_modules/`, `.next/`, `artifacts/`, `data/uploads/`, `data/demo/runtime/`. No private key or API key in the repo, client bundle, logs, or LLM prompts. `RELEASER_PRIVATE_KEY`, `ANTHROPIC_API_KEY`, deployer keys are server-side only.
- **TR-8.5.3** (data integrity) — Stored documents carry a content hash (TR-4.2) tying extraction to the blob; fixtures are validated in CI (`tools/validate_data.py`) so malformed JSON/JSONL never reaches the rules engine or ledger.

### 9.6 Smart-contract security (TR-8.6)

- **TR-8.6.1** — Contract security requirements are specified in §4.6 (TR-3.7) and summarised here: checks-effects-interactions on every fund move; `SafeERC20`; reentrancy protection on `deposit`/`release`/`refund`; `Pausable` (incl. `release`); custom errors; no ETH/`payable`; no owner-drain; non-fee-on-transfer/non-rebasing token only. CI greps for the forbidden anti-patterns (`_setupRole`, `SafeMath`, `.transfer()`, raw `IERC20.transfer`, `tx.origin`, `require(msg.sender==…)` for auth) and fails on any hit (§10).
- **TR-8.6.2** (immutability stance) — The escrow contract is **non-upgradeable** by design (no proxy; `Ownable` is forbidden, §4.6): for a custody contract this removes the upgrade-key as an attack surface. Bugs are remediated by `pause` → redeploy a fixed contract → migrate (new deals on the new address; in-flight deals refunded/settled on the old one), **not** by a proxy upgrade. The full state machine (BRD §6.2) likewise arrives via a v2 contract, not an upgrade.

### 9.7 Threat-model summary (TR-8.7)

| Threat | Surface | Mitigation |
|--------|---------|------------|
| Releaser-key compromise | Off-chain key | Server-only, rotatable, multisig admin, pause backstop, attributable via ledger; **two-sided lever** incl. pre-verdict refund (TR-8.1.2) |
| **Admin-key compromise** | On-chain role | Larger blast radius than releaser: can grant itself `RELEASER_ROLE`, `refund`/`cancel`, and `pause` to censor all compliant sellers indefinitely → **multisig in production**; single deployer key for testnet only (TR-8.1.2) |
| Forged/altered document | Document plane | AI extract + deterministic rules + ≥0.9 confidence + human review above envelope; fraud → `Escalated` (TR-4.3, TR-7.3) |
| **Adversarial document / prompt injection** | LLM extraction | Extractor only reads, never grades (AP-5); deterministic rules over extracted fields; Zod validation + confidence gate (TR-4.3.1) |
| LLM hallucination / bad math | Off-chain logic | Zod validation before logic; all money math in code (TR-8.4) |
| Reentrancy / fund drain | Contract | CEI + SafeERC20 + ReentrancyGuard + no owner-drain (TR-8.6) |
| **`release` front-running / MEV** | Contract (permissionless) | Benign: `release` pays only the recorded seller, so a front-runner merely pays gas to settle for the seller — no value extraction. Considered, non-issue. |
| **Buyer abandons at `Agreed` (never deposits)** | Flow | Seller exposure if shipped early; exit is admin `cancel` (full product). **MVP has no `cancel`** — accepted demo limitation; `createDeal` is `RELEASER_ROLE`-gated so external deal-spam is bounded |
| **Reorg / finality on verdict/release tx** | L2 chain | Treat `ReleasePending`/`Released` as final only after N confirmations before writing the reconciliation entry (TR-2.3); L2 finality accepted for the demo (NFR-Performance) |
| **USDC allowance hygiene** | Client | UI MUST request **exact-amount** `approve`, not `type(uint256).max`; surface/clear residual allowance after refund/cancel |
| Sanctioned counterparty | Compliance | KYC/sanctions hard gate before `Funded`; never auto-suppress (TR-8.3) |
| Double-submit / replay | API + chain | Idempotency per (`dealId`, transition); contract reverts second tx on `InvalidState` (TR-4.6.5, TR-6.2.1a) |
| Spec swap after funding | Off-chain authority | `specHash` committed on-chain at `createDeal` binds funds to rules (TR-2.5, full product) |
| Audit-ledger tampering | Off-chain record | Hash-chain (`prevHash`/`entryHash`) **+ an out-of-band anchor** (WORM store or periodic on-chain commit) — a self-contained chain the attacker fully controls can be re-computed. **MVP JSONL has no chaining → tamper-evidence NOT achieved in the slice** (deferred, TR-8.3.1) |
| Secret leakage | Repo/CI | `.env*` gitignored; capability/privilege CI gates (TR-8.2.2, TR-8.5.2) |
| Public route abuse (MVP) | HTTP | **Sharpest MVP vuln** — unauthenticated route signs releaser `recordVerdict`; bind localhost only, never expose (one tunnel/`--hostname 0.0.0.0` = live exploit); auth deferred (TR-6.2.3). Full-product posture now decided: AP-9 / TR-6.2.4–7 (authN, deal-scoped authZ, TLS, rate limiting, CORS allowlist) |

---

## 10. Testnet, deployment & CI

> Realises NFR-Performance, NFR-Portability, NFR-Availability and the `plans/mvp-slice.md` build/deploy plan.

### 10.1 Chain & environment (TR-9.1)

- **TR-9.1.1** — Deploy to **Base Sepolia** (chainId **84532**, RPC `https://sepolia.base.org`, explorer `https://sepolia.basescan.org`). USDC test token `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals). Decided in BRD §12.
- **TR-9.1.2** (NFR-Portability) — Deploy via **Hardhat Ignition** (`ignition/modules/Escrow.ts`) with parameters `usdcAddress`, `admin`, `releaser` — no hardcoded addresses (TR-2.4), so a redeploy to another EVM/OP-stack L2 needs only new parameters. Verify the deployed contract on Basescan (`hardhat verify`).
- **TR-9.1.3** (env) — Required env (`.env`, never committed; `.env.example` template): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_WC_PROJECT_ID`, `BASE_SEPOLIA_RPC_URL`, `BASE_SEPOLIA_PRIVATE_KEY` (deployer), `BASESCAN_API_KEY`, `RELEASER_PRIVATE_KEY`, `NEXT_PUBLIC_ESCROW_ADDRESS`, `NEXT_PUBLIC_USDC_ADDRESS`. Faucets: Circle USDC (`faucet.circle.com`), Base ETH.

### 10.2 CI gates (TR-9.2)

- **TR-9.2.1 (existing CI — what `.github/workflows/ci.yml` runs today on every PR to `main`):** exactly four Python steps —
  - `python tools/sync_agents.py` (**write-mode** — `.claude/` is gitignored, so `--check` would falsely fail; per project memory).
  - `python tools/check_agent_security.py` — agent privilege gate (TR-8.2.2).
  - `python tools/validate_data.py` — every `data/` JSON/JSONL parses (guards fixtures + audit ledger).
  - `python -m compileall -q tools` — Python tools compile.
- **TR-9.2.2 (build-phase gates to ADD when `contracts/` + `app/` land — NOT yet in CI):**
  - **Contract:** `npx hardhat test` (TR-3.8 suite); **anti-pattern grep** clean (no `_setupRole`/`SafeMath`/`.transfer(`/`require(msg.sender ==`); `npx hardhat verify` on deploy.
  - **App:** typecheck/lint; **wagmi-v1-name grep** clean (no `configureChains`/`useContractRead` etc.).
  - Until these are wired into `ci.yml`, the Solidity/wagmi greps are **manual** `plans/mvp-slice.md` Phase-1/2/4 checklist items, not automated gates — do not represent them as enforced CI.
- Branch protection requiring these checks needs the repo owner (push-only members can't set it) — known repo-admin limitation (project memory).

### 10.3 Demo deployment (TR-9.3)

- **TR-9.3** — Per `plans/mvp-slice.md` Phase 4: a **seed script** (`createDeal(DEMO_DEAL_ID, buyer, seller, 100_000_000n)` = 100 USDC) and a **demo runbook** (preflight faucet/RPC checks, fresh redeploy for clean state, clear `audit-ledger.jsonl`, ~3-min script with fallbacks). A **pre-recorded fallback video** MUST exist before the live pitch. All demo data is **synthetic** (TR-8.5).
- **TR-9.3.1** (local vs CI sync) — `plans/mvp-slice.md` Phase-4 lists `python tools/sync_agents.py --check` as a **local** dev check; **CI deliberately uses write-mode** (TR-9.2.1) because `.claude/` is gitignored and `--check` would falsely fail there. Both are correct in their context.

### 10.4 Build milestones, definition-of-done & rollback (TR-9.4)

- **TR-9.4.1** (timeline) — Three hackathon phases bound the work (`docs/hackathon-context.md`): **Proposal → 2026-06-08**, **Build → 2026-08-14** (hard demo deadline), **Report → 2026-08-28**. The MVP build follows the `plans/mvp-slice.md` day-by-day table (Phase 0 setup → Phase 1 contract → Phase 2 web/wallet → Phase 3 document-check → Phase 4 polish/record).
- **TR-9.4.2** (definition of done, MVP) — DoD = all §11.1 A1–A8 pass on a cold-started environment, twice, with the pre-recorded fallback video saved. Anything not on the happy path is roadmap, not DoD.
- **TR-9.4.3** (rollback) — The escrow is non-upgradeable (TR-8.6.2); incident/rollback = **`pause` → redeploy a fixed contract (new address) → point the app at it via env → migrate** (new deals on the new contract; in-flight deals settled/refunded on the old). The chain-portable Ignition module (TR-9.1.2) also supports rollback to a different EVM L2 if Base Sepolia degrades (BRD §12 contingency).

---

## 11. Acceptance criteria

> Each Must-have FR has an acceptance test. ✅ = demonstrable in the MVP slice; 🔵 = full-product criterion. The MVP set is the union of the `plans/mvp-slice.md` per-phase verification checklists **plus the fuller TR-3.8 contract test suite** (the slice mandates 3 contract tests — happy-path / access / refund-valve; TR-3.8 adds state-guard, permissionless-release, and pause tests, which A1 includes).

### 11.1 MVP demo acceptance (the gateway — all ✅ MUST pass)

| # | Criterion (from `plans/mvp-slice.md`) | Verifies |
|---|----------------------------------------|----------|
| A1 | Contract deployed + verified on Base Sepolia; `hardhat test` (happy path + access + state-guard + refund + permissionless-release + pause) green | FR-4, TR-3.* |
| A2 | Connect wallet → USDC balance loads; **Approve → Deposit** moves the state badge to `Funded` within ~5s of confirmation | FR-5, TR-6.3 |
| A3 | Upload the synthetic **Compliant** invoice → verdict `Compliant`, chain state → `ReleasePending`, **Release** enables; funds reach the seller, state → `Released` | FR-6, FR-8, FR-9, FR-12 |
| A4 | Hand-edit the invoice to a wrong amount → verdict `Discrepant`, chain state **stays `Funded`** (no transition) | FR-8, FR-9 (negative) |
| A5 | Audit ledger contains the full chain for a Compliant deal: extract → grade → verdict → `recordVerdict` txHash → `Released` | FR-14, TR-4.6.3 |
| A6 | No money math in the LLM prompt — all comparisons in `rules.ts`; amounts via `parseUnits`/bigint | AP-5, TR-8.4 |
| A7 | **CI** (4 Python gates: `sync_agents.py`, `check_agent_security.py`, `validate_data.py`, `compileall`) green; **manual** Phase-4 anti-pattern greps clean (Solidity + wagmi-v1 — not yet a CI gate, TR-9.2.2) | TR-9.2 |
| A8 | Cold-start: redeploy fresh + run the full path **twice** without code changes; no real PII in `data/` | NFR-Availability, TR-8.5 |

### 11.2 Full-product acceptance (🔵 — per Must-have FR)

| FR | Acceptance criterion |
|----|----------------------|
| FR-1/2/3 | A sale-contract upload (or form) yields a schema-valid escrow spec (§6.1) + a TEA; both parties' approvals captured before `createDeal`; `specHash` committed on-chain |
| FR-7 | A sanctioned/synthetic-hit counterparty is **blocked before `Funded`** and escalated; an all-green party proceeds; the screening record is in the ledger |
| FR-9 | All four verdicts reachable; an over-£50k or low-confidence case routes to human review and is **not** auto-actioned |
| FR-10/11 | Notice of release issued; a valid objection within 48h blocks release; an invalid objection ("changed my mind") is rejected and release proceeds |
| FR-13 | Refund, amendment (refund + new dealId), waiver, and dispute-escalation each drive the correct state + ledger entries |
| FR-14 | Ledger is hash-chained + anchored; tampering is detectable; intent + reconciliation bracket every on-chain action |
| FR-15 | Every decision carries an auto/escalate tag + reason; out-of-envelope cases reach the named human role |
| FR-16/17 | Both parties see live deal state; notifications fire on each transition |

### 11.3 Traceability of acceptance

Every Must FR (FR-1…FR-15) has ≥1 acceptance criterion above; Should/Could/Won't FRs (FR-16…FR-19) are gated behind their MVP/roadmap status. **A1–A8 are the graded demo gateway**; §11.2 is the firm-readiness bar.

---

## 12. Open questions & decisions for human confirmation

> These are **not** invented by this document — they are the BRD's own unresolved `[DISCUSS]` items (BRD §15) plus gaps surfaced by section reviews. Resolving them turns this draft into a baselined spec. Where the MVP needs a value now, the current default is shown — nothing is silently assumed.

### 12.1 Inherited from the BRD (§15 "still open")

| # | Decision | Current default / status | Impacts |
|---|----------|--------------------------|---------|
| Q1 | **Sale-contract intake** — structured form only, or also term-extraction from uploads? | MVP hardcodes the deal; full product allows either | TR-4.1, FR-1 |
| Q2 | **MVP value cap** — confirm **£50k** equiv. or change | £50k default, as **config** not constant | TR-7.3.1 |
| Q3 | **Objection window** — confirm **48h** default or change | 48h default, as **config** | TR-4.4.1, TR-7.3.1 |
| Q4 | **Primary revenue stream** + **defensible fee level for the beachhead corridor** (BRD §13 asks both) | Likely per-deal fee (A); **no fee logic in scope**, no `fees` field asserted; fee level is a **pitch-deck** (Business Model / Financials) decision, not a build one | BRD §13 |
| Q4b | **Commercial north-star metric** for "workable firm at launch" — N live deals / escrow volume / first paying customer (BRD §3.3) | Open; **not needed for the demo**, but turns "firm" into a target | BRD §3.3 |
| Q5 | **First customer / who initiates** — buyer, seller, or platform | **✅ Resolved 2026-06-10 (BRD §5 / §15 item 11): onboarding supports ALL party roles** — role-agnostic initiation (buyer-, seller-, and platform/intermediary-initiated), counterparty/counterparties invited. Realised by TR-4.1.4, TR-6.3.4, TR-6.2.5. **Consequence → Q18:** the auth-role model must cover all three roles (buyer/seller via wallet/SIWE; platform/intermediary likely account/JWT, possibly no wallet) — *mechanism* still to confirm. | TR-4.1.4, TR-6.3.4, TR-6.2.5, Q18 |
| Q6 | **MVP doc set** — full six docs vs. invoice-only core | MVP = **invoice only** | TR-4.2, FR-6 |
| Q7 | **No-financing boundary** — confirm **firm-level** boundary, not an MVP cut | Treated as permanent boundary (BRD §4.2.b) | §1.3, TR-8.3.3 |

### 12.2 Rails / providers still TBD (BRD §12)

| # | Decision | Status |
|---|----------|--------|
| Q8 | **KYC / sanctions data-feed provider** | TBD; build uses public OFAC/UN/HMT snapshots + synthetic identities (TR-4.5.2) |
| Q9 | **eBL / document-custody partner** (title control beyond MVP) | TBD, deferred (BRD §4.2.a); seam only |
| Q10 | **Target-jurisdiction AML specifics** (UK / EU / ME) | `[DISCUSS]` (BRD §10); no jurisdiction-specific claims without sourcing (TR-8.3.3) |
| Q11 | **Production PII / data-protection regime** | `[DISCUSS]` (BRD §10); incl. the on-chain-name-in-`specHash` concern (TR-5.1) |

### 12.3 Surfaced by technical review (recommend a decision)

| # | Decision | Recommendation |
|---|----------|----------------|
| Q12 | **FR-16 dashboard / FR-17 notifications: keep S, or promote S→M for a credible demo?** (BRD §7) | MVP already builds a minimal FR-16 surface + event-watcher; decide whether full notifications are demo-required |
| Q13 | **`specHash` on-chain binding** — confirm full product commits the escrow-spec hash at `createDeal` | Recommended (TR-2.5, TR-3.4); adds one `bytes32` param |
| Q14 | **Audit-ledger tamper-evidence** — when to move from plain JSONL to hash-chained + anchored store | Required before any real (non-demo) use (TR-8.3.1) |
| Q15 | **Privilege-gate gap** — `*`-granted `orchestrator` is exempt from the Bash/Write guardrails check | Move the guardrails check above the `*` short-circuit in `check_agent_security.py` (TR-8.2.2) |
| Q16 | **MVP has no `cancel`** — a never-funded `Agreed` deal has no on-chain exit | Accept for demo, or add `cancel` to the MVP enum (§4.3) |
| Q17 | **Releaser pre-verdict refund lever** — mitigate beyond key hygiene? | Multisig admin + monitoring now; consider a timelock / dual-control on `refund` for production (TR-8.1.2) |
| Q18 | **API auth mechanism** (TR-6.2.4) — user sessions (JWT) vs wallet-signature login (SIWE) vs both; plus the partner API-key scheme | Decide before building TR-6.2.4. SIWE pairs naturally with the existing wallet UX (the party already proves control of the buyer/seller address); JWT/sessions needed anyway for reviewer/compliance roles with no wallet. The *integration model itself* is **settled** (BRD §15 item 14) — only the mechanism is open. **Update (2026-06-10, from Q5):** onboarding now resolved to support **all party roles**, so the mechanism MUST cover a **platform/intermediary initiator that may have no wallet** (pushing toward JWT/sessions for that role alongside SIWE for buyer/seller). Mechanism still open — confirm. |

---

*End of Technical Requirements v0.4. This document tracks BRD v0.3 (draft); re-baseline both once the §12 decisions are made.*

