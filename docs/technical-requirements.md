# Blockmediary — Technical Requirements

**Product:** Blockmediary — programmable documentary escrow for SME cross-border trade
**Team:** Transakt (BEEM063 Hackathon, Exeter MSc FinTech)
**Document status:** Baselined v1.0 — derived from the Business Requirements Document (BRD v1.0)
**Last updated:** 2026-08-09

---

## 0. Document control

| Field | Value |
|-------|-------|
| Purpose | Translate Blockmediary's **Business Requirements Document** into concrete, testable technical requirements, and record the delivered technical baseline. |
| Audience | Build-phase engineers (smart contract, web), reviewers, and graders. |
| Authority | The [BRD](business-requirements.md) is authoritative for *intent*; this document is authoritative for *technical realisation* and is subordinate to the BRD where they conflict. |
| Traceability anchor | This document maps onto the BRD's identifiers: functional requirements **`FR-1…FR-19`** (BRD §7), non-functional requirements (BRD §10), business rules (BRD §9), and the state model (BRD §6.2). |

### Source documents

| Source | Role |
|--------|------|
| [`docs/business-requirements.md`](business-requirements.md) | Primary — the BRD (v1.0). |

### Requirement identifiers & conventions

- **`FR-n` / NFR / business rule** — references the BRD's numbering (BRD §7 / §10 / §9).
- **`TR-n.m`** — a technical requirement realising part of a BRD requirement. The `TR-n` families are grouped by topic: **TR-2** = architecture (§3), **TR-3** = smart contract (§4), **TR-4** = off-chain components (§5), **TR-5** = data models (§6), **TR-6** = APIs / interfaces (§7), **TR-7** = end-to-end flow & autonomy gates (§8), **TR-8** = security & compliance (§9), **TR-9** = deployment & acceptance (§10).
- **`AP-n`** — architectural principle (§3.1) that requirements inherit.
- **Status** column: **Delivered** = in the current baseline; **Roadmap** = specified for the full product, not implemented in this release.
- All money is in **minor units** (token base units, e.g. USDC 6-decimals) — never floats, never computed in free-text (BRD §9.3).
- All timestamps are **ISO 8601 UTC**.

---

## 1. Scope

### 1.1 Two targets, one document (delivered vs. firm)

The BRD (§3.3, §4.2) distinguishes the **delivered demonstrator** — a clickable testnet
prototype running the deal lifecycle end to end — from the **firm** (the launched product).
This document specifies the full-product requirements so the firm target stays traceable, and
uses the **Status** column to mark what the delivered baseline provides. Both are valid
targets.

### 1.2 In technical scope (realising BRD §4.1 goals + FR-1…FR-16)

1. Capture trade terms through a structured intake and hold the per-deal release rules (FR-1, FR-2).
2. Instantiate an on-chain escrow, take the buyer's stablecoin deposit, and prove "funds locked" to the seller (FR-4, FR-5).
3. Collect the seller's shipment document and verify it against the release rules with a deterministic engine, producing a verdict (FR-6, FR-8, FR-9).
4. Issue a notice of release, run the objection window (default 48h), and record objections against the valid grounds only (FR-10, FR-11).
5. Release on a compliant verdict with no valid objection; support the refund path (FR-12, FR-13).
6. Persist every state transition to an append-only audit trail (FR-14).
7. Surface deal state to both parties through role-specific dashboards, with multi-deal management (FR-16, FR-18).

Roadmap items in technical scope (specified, not built): the Trade Escrow Agreement (FR-3),
KYC / KYB / sanctions screening (FR-7), AI / OCR field extraction and the full verdict set
(FR-8, FR-9), objection grading and amendment / waiver / dispute escalation (FR-11, FR-13),
the human-review console (FR-15), and notifications (FR-17).

### 1.3 Out of technical scope

Per BRD §4.2, out of scope splits into:

- **Roadmap (leave architectural seams, BRD §4.2.a):** marketplace / discovery; insurance
  sourcing; counterparty trust scoring; eBL / document-custodian title control; white-label /
  API distribution (FR-19); broader corridors / goods.
- **Permanent product boundaries — never build (BRD §4.2.b):** trade financing / invoice
  financing / liquidity provision (no financing spread, no credit logic anywhere); full legal
  automation of the sale contract; physical-goods quality / condition guarantees (release on
  document compliance only, unless an inspection certificate is itself a release rule);
  sanctioned corridors and prohibited / high-risk regulated goods.

---

## 2. Business-requirement → technical-requirement traceability

### 2.1 Functional requirements (BRD §7)

| FR | Requirement (BRD §7) | Pri | Realised by | Status |
|----|----------------------|-----|-------------|--------|
| **FR-1** | Capture trade terms via a structured intake; role-agnostic initiation. | M | TR-4.1 (deal-intake), TR-6.2 (intake routes) | Delivered |
| **FR-2** | Hold the canonical per-deal release rules. | M | TR-4.1, TR-5.1 (deal-terms schema) | Delivered (structured terms) |
| **FR-3** | Generate a Trade Escrow Agreement for both parties to approve. | M | TR-4.1 (TEA generation) | Roadmap |
| **FR-4** | Deploy / instantiate an on-chain escrow holding stablecoin funds. | M | TR-3.1, TR-3.3, TR-9.1 | Delivered |
| **FR-5** | Buyer deposits; reflect "funds locked" to the seller. | M | TR-3.4 (`deposit`), TR-3.5 (`Funded`), TR-6.1 | Delivered |
| **FR-6** | Let the seller submit the required shipment document. | M | TR-4.2, TR-6.2 (`submit-bol`) | Delivered (bill of lading) |
| **FR-7** | Capture company identity; KYC / KYB / sanctions screening as a hard gate before funding. | M | TR-4.5, TR-7.3 | Partial — identity capture delivered; screening on roadmap |
| **FR-8** | Verify the document against the release rules with a deterministic engine. | M | TR-4.3 (rules engine), TR-5.2 (fields) | Delivered (deterministic); AI / OCR extraction on roadmap |
| **FR-9** | Produce a compliance verdict. | M | TR-4.3, TR-5.3 | Delivered (Compliant / Discrepant); Rejected / Escalated on roadmap |
| **FR-10** | Notice of release + fixed objection window (default 48h). | M | TR-4.4, TR-5.3 | Delivered |
| **FR-11** | Accept buyer objections only on valid grounds; record them. | M | TR-4.4 | Delivered (recording); automated grading on roadmap |
| **FR-12** | Release funds on-chain when preconditions are met. | M | TR-3.4 (`release`), TR-4.7 | Delivered |
| **FR-13** | Refund; amendment / waiver / dispute-escalation paths. | M | TR-3.4 (`refund`), TR-4.4 | Refund + objection handling delivered; amendment / waiver / dispute on roadmap |
| **FR-14** | Append-only audit ledger of every state transition. | M | TR-4.6, TR-5.4 | Delivered (SQL audit trail); tamper-evident anchoring on roadmap |
| **FR-15** | Route out-of-envelope decisions to a human reviewer with a reason. | M | TR-7.3 | Roadmap (gates encoded; console on roadmap) |
| **FR-16** | Dashboard surfacing deal state to both parties. | M | TR-6.3, TR-6.1 | Delivered (role-specific multi-deal dashboards) |
| **FR-17** | Notifications on each state change. | S | TR-4.8 | Roadmap (UI refresh on chain events only) |
| **FR-18** | Multi-deal management for a single party. | S | TR-6.3, TR-5.1 | Delivered |
| **FR-19** | White-label / API access for partner platforms. | W | TR-6.2 (API seam) | Roadmap |

### 2.2 Non-functional requirements (BRD §10)

| NFR (BRD §10) | Realised by | Status |
|---------------|-------------|--------|
| **Security** — funds never in a Blockmediary-controlled wallet; direct smart-contract custody | TR-3.2, TR-8.1 | Delivered |
| **Authentication** — account sessions + SIWE wallet linking | TR-6.2.4, TR-6.2.5 | Delivered |
| **Portability** — chain-portable contract + deploy scripts | TR-3.6, TR-9.1 | Delivered |
| **Auditability** — append-only audit trail | TR-4.6, TR-5.4 | Delivered (SQL); anchoring on roadmap |
| **Determinism** — all money math in code | TR-4.3, TR-8.4 | Delivered |
| **Accuracy** — extraction confidence ≥ 0.9 to auto-pass | TR-4.3, TR-7.3 | Roadmap (AI extraction) |
| **Privacy / data** — synthetic only during build | TR-8.5 | Delivered |
| **Performance** — L2 finality acceptable for release | TR-3.1 | Delivered |
| **Compliance** — AML / sanctions screening before funding | TR-4.5, TR-7.3 | Roadmap |
| **Availability** — demonstrator-grade | TR-9.* | Delivered |
| **API security** — API is the sole off-chain client surface; releaser key server-side | AP-9, TR-6.2.3–TR-6.2.7 | Delivered for delivered routes; third-party hardening (API keys, rate limiting, CORS allowlist) on roadmap |

### 2.3 Business rules & autonomy (BRD §9)

| Business rule (BRD §9) | Realised by | Status |
|------------------------|-------------|--------|
| Valid objection grounds only (BRD §9.1) | TR-4.4 | Delivered (recording on the valid-grounds set); automated grading on roadmap |
| Autonomy thresholds (BRD §9.2), incl. £50k value cap and 48h window | TR-7.3 | Value cap and window held as config; confidence / screening rows apply to roadmap components |
| No money in free-text (BRD §9.3) | TR-4.3, TR-8.4 | Delivered |
| No release without all preconditions (BRD §9.3) | TR-7.2, TR-3.4 | Delivered |
| No Blockmediary-controlled wallet (BRD §9.3, §10, §12) | TR-3.2, TR-8.1 | Delivered |
| No title / quality control over goods (BRD §9.3) | TR-3.4 | Delivered |
| No real PII during build (BRD §9.3, §14) | TR-8.5 | Delivered |

### 2.4 State model & rails (BRD §6.2, §12)

| BRD item | Realised by | Status |
|----------|-------------|--------|
| **State model** (BRD §6.2): `Draft→Agreed→Funded→ReleasePending→Released`; `Refunded` from `Funded`; `Cancelled` from `Agreed`. End states `Released / Refunded / Cancelled`. | TR-3.3, TR-3.5, TR-7.2 | Delivered (7-value on-chain enum). Off-chain document review and objection window tracked in the deal record and audit trail. `Disputed` on roadmap. |
| Settlement chain — Base Sepolia; chain-portable | TR-3.1, TR-3.6, TR-9.1 | Delivered |
| Stablecoin — USDC | TR-3.2, TR-5.1 | Delivered (USDC); EURC on roadmap |
| Document verification — deterministic rules engine; AI extraction on roadmap | TR-4.3 | Delivered (deterministic); AI / human console on roadmap |
| Custody — direct smart contract | TR-3.2, TR-8.1 | Delivered |
| Integration model — full API integration | AP-9, TR-6.2.4–TR-6.2.7 | Delivered for delivered routes; third-party hardening on roadmap |
| Dispute forum — per-deal, set in the TEA | TR-5.1, TR-4.4 | Roadmap (seeded default) |
| eBL / document custody | §12 | Roadmap |
| Revenue model (BRD §13) | — | Roadmap (no fee logic in the baseline) |

---

## 3. System architecture

> Realises BRD §11, NFR-Security, NFR-Portability, NFR-Auditability. Governing rule: **the
> smart contract does not understand trade documents** — it holds funds and enforces state
> transitions; all document interpretation is off-chain; an authorised release function
> submits the verdict on-chain.

### 3.1 Architectural principles

| ID | Principle | Source |
|----|-----------|--------|
| AP-1 | **Narrow contract.** On-chain code holds stablecoin and enforces state transitions only — no document logic, no money math beyond token transfers, no business rules. | BRD §11 |
| AP-2 | **Off-chain verdict, on-chain enforcement.** Verification produces a verdict off-chain; a role-gated function records it on-chain; release executes against recorded state. | BRD §11, §6.1 |
| AP-3 | **Direct smart-contract custody.** Buyer funds are held only by the escrow contract — never a Blockmediary-controlled wallet. A regulated custodian remains a permitted full-product option and the design leaves a seam for it. | BRD §9.3, §10, §12 |
| AP-4 | **Audit around action.** An **intent** entry is written before an on-chain transition is submitted, and a **reconciliation** entry (txHash, receipt) after, so the audit trail — not the chain — is the regulator-facing source of truth. | BRD §9.3, §10 |
| AP-5 | **Determinism for money.** All amount-matching, comparison, and threshold math run in real code — never in free-text. | BRD §9.3, §10 |
| AP-6 | **Chain portability.** The contract and deploy scripts stay EVM-portable so the escrow can be redeployed to another EVM / OP-stack L2 quickly. | BRD §12, §10 |
| AP-7 | **Human-in-the-loop above the envelope, enforced at `recordVerdict`.** Because `release` is permissionless, all gating — verdict, objection window, holds — occurs before `recordVerdict` moves state to `ReleasePending`. `ReleasePending` is the point of no return. | BRD §9.2, §12 |
| AP-8 | **Sandbox / synthetic only.** No real PII or live financial data during build. | BRD §9.3, §14 |
| AP-9 | **API-first integration.** Every client interaction with the off-chain platform passes through the authenticated HTTP API (§7.2): authentication → authorization → validation → business logic → audit. No client reads or writes the data store directly, and no client holds the releaser key. The sole bypass is wallet-signed on-chain transactions (`approve` / `deposit` / `release`), governed by the contract's own roles. | BRD §10, §12 |

#### TR-2.* — cross-cutting architecture requirements

- **TR-2.1** (AP-1, AP-2) — The system is split into three trust tiers: (a) **on-chain** escrow contract; (b) **off-chain orchestration + verification** (deal intake, document checking, objection handling, audit); (c) **client** (buyer / seller / operator UI). No tier assumes logic belonging to another; the UI is never the authority on deal state — it reads state from chain plus the deal record.
- **TR-2.2** (AP-2, AP-7) — Exactly one privileged off-chain actor (the **releaser**) submits verdicts / refunds on-chain. It holds an authorising key but never custodies funds (AP-3). Its actions are recorded in the audit trail first (AP-4).
- **TR-2.3** (AP-4) — Every component that triggers a state transition writes an **intent** audit entry and confirms it before submitting the on-chain transaction, and writes a **reconciliation** entry once the receipt is observed (txHash, status). A dropped / timed-out transaction records the outcome — never a silent gap.
- **TR-2.4** (AP-6) — On-chain code avoids chain-specific opcodes and takes the stablecoin token address and roles as deploy parameters, so a redeploy to another EVM L2 needs only new parameters.
- **TR-2.5** (AP-1, FR-2) — Per-deal **release rules** and the submitted **document fields** have a defined storage substrate. Delivered: the deal terms and review results are held in the application database; the contract stores only `{buyer, seller, amount}` plus state. Roadmap: a durable spec store with the spec's content hash committed on-chain at deal creation, binding funds to the rule-set they were escrowed against.

### 3.2 Component model

| Component | Tier | Responsibility | Realises | Status |
|-----------|------|----------------|----------|--------|
| **Escrow contract** | On-chain | Custody USDC; enforce state machine; emit events; role-gated `recordVerdict` / `refund`; permissionless `release` | FR-4, FR-5, FR-12, FR-13, AP-1/3 | Delivered |
| **ERC-20 stablecoin** | On-chain | Value transfer (USDC). MockUSDC for local tests. | BRD §12 | Delivered |
| **deal-intake** | Off-chain | Capture terms → per-deal release rules; role-agnostic initiation and invitation | FR-1, FR-2 | Delivered (structured intake); TEA + spec generation on roadmap |
| **kyc-compliance** | Off-chain | Company-identity capture; KYC / KYB / sanctions screening as a pre-funding gate | FR-7, NFR-Compliance | Partial — identity capture delivered; screening on roadmap |
| **document-checker + rules engine** | Off-chain | Deterministic grading of the submitted document's structured fields against the deal's release rules → verdict | FR-6, FR-8, FR-9, AP-5 | Delivered (bill of lading); AI / OCR extraction on roadmap |
| **objection handling** | Off-chain | Objection window, objection recording on the valid-grounds set, withdrawal | FR-10, FR-11 | Delivered; automated grading / amendment / dispute on roadmap |
| **settlement** | Off-chain | Execute the authorised on-chain transaction (releaser key): `recordVerdict`, `refund` | FR-12, FR-13, AP-2 | Delivered |
| **orchestrator** | Off-chain | Route between specialists; decide auto vs. escalate | FR-15, AP-7 | Roadmap |
| **audit trail** | Off-chain | Append-only record of every transition and reviewer decision | FR-14, AP-4 | Delivered (SQL) |
| **notify** | Off-chain | Party notifications on each state change | FR-17 | Roadmap (event-driven UI refresh only) |
| **Client UIs** | Client | Buyer / seller / operator surfaces; wallet ops; state display | FR-5, FR-6, FR-16 | Delivered (role-specific multi-deal dashboards) |

### 3.3 Runtime split — delivered vs. roadmap

| Aspect | Delivered baseline | Roadmap (full product) |
|--------|--------------------|------------------------|
| Verification | Deterministic rules engine over a structured bill of lading | AI / OCR field extraction from an uploaded file, human review above the envelope |
| Chain | Base Sepolia | Base Sepolia now; mainnet (Base or portable alternative) later |
| Documents | Bill of lading (or equivalent transport document) | Full BRD §8 documentary set |
| State machine | `Draft→Agreed→Funded→ReleasePending→Released` + `Refunded` + `Cancelled` (on-chain); objection window off-chain | Adds `Disputed` and dispute resolution |
| KYC / dispute console | Identity captured; no screening; no dispute console | Screening gate + human-review / dispute consoles |
| Deals | Multi-deal, account-based | Multi-deal (delivered) |
| Auth | Account sessions + SIWE wallet linking | As delivered, plus partner API keys (FR-19) |
| Audit trail | SQL append-only table | Hash-chained + out-of-band anchored store |
| Custody | Direct smart contract (testnet USDC) | Direct smart contract (mainnet token) |

### 3.4 Trust & data-flow boundaries

- **Authority of record.** Deal *terms / rules* → the deal record (off-chain, authoritative per FR-2). Deal *state / custody* → the escrow contract (on-chain). *Who decided what, when, and why* → the audit trail (off-chain, regulator-facing). The UI reads from chain plus the deal record; it is never authoritative.
- **The releaser seam.** The only bridge from off-chain decisions to on-chain effects is the releaser-key transaction (`recordVerdict`, `refund`). Compromise of this key is the top security risk (§9.1). `release` is permissionless so the releaser cannot block a seller from being paid after a compliant verdict.
- **External feeds are advisory.** In the delivered baseline the document fields are supplied through a structured intake and graded deterministically. In the roadmap, OCR / AI output passes through the deterministic rules and confidence thresholds before it can move state; sanctions feeds gate funding but a hit escalates to a human.

---

## 4. Smart-contract requirements

> Realises FR-4, FR-5, FR-12, FR-13, the BRD §6.2 state model, and AP-1/2/3/6. **Stack:**
> Solidity `^0.8.20`, OpenZeppelin v5 (`AccessControl`, `Pausable`, `ReentrancyGuard`,
> `SafeERC20`, `IERC20`), Hardhat 3 + viem. The contract is **narrow by design (AP-1)**: it
> holds USDC, enforces state, and emits events — it has no knowledge of documents, rules, or
> fiat values.

### 4.1 Contract scope & custody (TR-3.1, TR-3.2)

- **TR-3.1** (FR-4, AP-6) — A single `Escrow` contract manages many deals keyed by `bytes32 dealId`, holding one ERC-20 stablecoin. The token address and role holders (admin, releaser) are constructor parameters, never hardcoded, to satisfy chain-portability (TR-2.4). Deployed to Base Sepolia.
- **TR-3.2** (AP-3, NFR-Security) — Custody is the contract itself. Funds move only via `SafeERC20` (`safeTransferFrom` on deposit, `safeTransfer` on release / refund). No function may transfer escrowed funds to any address other than the deal's recorded `buyer` (refund) or `seller` (release). There is no owner-drain / sweep function.
- **TR-3.6** (AP-6) — The contract compiles and passes tests against a generic EVM target and avoids chain-specific precompiles / opcodes, so a redeploy to another EVM / OP-stack L2 needs only new deploy parameters.

### 4.2 Roles (TR-3.2-roles)

| Role | Holder | May call | Constraint |
|------|--------|----------|------------|
| `DEFAULT_ADMIN_ROLE` | Deployer / Blockmediary admin (multisig in production) | Grant / revoke roles, `pause` / `unpause`, `refund` (escape hatch), `cancel` | Cannot move funds except via `refund` to the recorded buyer |
| `RELEASER_ROLE` | Off-chain releaser service key (TR-2.2) | `createDeal`, `recordVerdict`, `refund` | Authorises state transitions; never custodies funds; rotatable |
| _(none — permissionless)_ | Anyone | `release` | Only succeeds from `ReleasePending`; pays the recorded seller |
| Deal `buyer` (address, not a role) | Buyer wallet | `deposit` | Only the recorded buyer for that `dealId` |

- **TR-3.2-roles** — Use OZ v5 `AccessControl` with `_grantRole`. Roles are grantable / revocable by admin so the releaser key can be rotated after suspected compromise (§9.1). `release` remains **permissionless** (AP-7) so a compliant verdict cannot be withheld by the releaser. Admin and releaser are **distinct addresses** so a leaked releaser key cannot pause the contract or cancel deals.

### 4.3 State machine (TR-3.3)

- **TR-3.3** (FR-4, FR-12, FR-13, BRD §6.2) — The contract tracks per-deal state and rejects any transition not in the allowed set below, reverting with a typed error (TR-3.7). Off-chain document review and the objection window are tracked in the deal record and audit trail, not on-chain (AP-1) — the contract sees only funding, verdict, and settlement.

**`Draft` is the implicit zero-value state.** A `mapping(bytes32 => State)` zero-initialises
every unused `dealId` to enum index 0, which is `Draft`. `createDeal`'s uniqueness guard is
`state(dealId) == Draft`, which is the `DealExists` protection. `dealId` is caller-supplied
(a `bytes32`).

**On-chain enum (delivered):** `enum State { Draft, Agreed, Funded, ReleasePending, Released,
Refunded, Cancelled }` (7 values).

| From | Function (caller) | To | Guard |
|------|-------------------|-----|-------|
| `Draft` | `createDeal` (releaser) | `Agreed` | `state == Draft`; `amount > 0`; buyer≠seller |
| `Agreed` | `cancel` (admin) | `Cancelled` | before funding only; moves no funds |
| `Agreed` | `deposit` (buyer) | `Funded` | `safeTransferFrom(buyer, amount)` |
| `Funded` | `recordVerdict` (releaser) | `ReleasePending` | verdict authorised off-chain (Compliant + all gates passed, AP-7) |
| `Funded` | `refund` (releaser / admin) | `Refunded` | refund condition met |
| `ReleasePending` | `release` (permissionless, `whenNotPaused`) | `Released` | `safeTransfer(seller, amount)` |

End states: `Released`, `Refunded`, `Cancelled` (terminal). The roadmap `Disputed` state and
its resolution transitions are reached only from `ReleasePending` and are not in the delivered
contract.

> **Critical sequencing (AP-7).** `recordVerdict` is the point of no return: it is only called
> after the off-chain verdict is Compliant and every gate (objection window expired with no
> valid objection, no active dispute) has passed — because once state is `ReleasePending`,
> `release` is permissionless and unstoppable.

### 4.4 Functions (TR-3.4)

- **TR-3.4** — The contract exposes exactly these external functions, each enforcing its state guard, following **checks-effects-interactions** (state mutated before the token transfer), and emitting the matching event (TR-3.5):
  - `createDeal(bytes32 dealId, address buyer, address seller, uint256 amount)` — `RELEASER_ROLE`; `Draft → Agreed`. Reverts `ZeroAmount`, `DealExists`, `SameParty`. (Roadmap adds a `bytes32 specHash` parameter binding the deal to its rule-set, TR-2.5.)
  - `deposit(bytes32 dealId)` — only the recorded `buyer` (else `NotBuyer`); `whenNotPaused nonReentrant`; `safeTransferFrom`; `Agreed → Funded`.
  - `recordVerdict(bytes32 dealId)` — `RELEASER_ROLE`; `Funded → ReleasePending`. The verdict content is off-chain; on-chain this is the authorised "proceed to settlement" signal.
  - `release(bytes32 dealId)` — **permissionless**, `whenNotPaused nonReentrant`; `safeTransfer(seller)`; `ReleasePending → Released`.
  - `refund(bytes32 dealId)` — `RELEASER_ROLE` or admin (else `NotAuthorised`), `whenNotPaused nonReentrant`; `safeTransfer(buyer)`; `Funded → Refunded`.
  - `cancel(bytes32 dealId)` — admin only; `Agreed → Cancelled`; moves no funds; works while paused.
  - `pause()` / `unpause()` — admin (`Pausable`). All fund-moving functions — `deposit`, `release`, `refund` — carry `whenNotPaused`; `release` must, so pause can stop an in-flight permissionless settlement. This re-introduces a censorship lever (admin can pause to block a compliant seller); it is accepted as an emergency-only backstop, not a routine gate.
  - View: `deals(dealId)` → `{buyer, seller, amount}`; `state(dealId)` → `State`.
- All money parameters are token base units (`uint256`, 6-decimals for USDC). The contract performs no fiat conversion, no fee arithmetic, no rounding (AP-1, AP-5).
- **Token constraint (TR-3.2).** The escrowed token must be a standard, **non-fee-on-transfer, non-rebasing** ERC-20: the contract pays the recorded `amount` rather than measuring balance deltas. USDC satisfies this.

### 4.5 Events (TR-3.5)

- **TR-3.5** (FR-5, FR-17, AP-4) — Every state transition emits an event so the off-chain layer (audit trail, UI) can react without polling. Events: `DealCreated(dealId, buyer, seller, amount)`, `Funded(dealId, amount)`, `VerdictRecorded(dealId)`, `Released(dealId, amount)`, `Refunded(dealId, amount)`, `Cancelled(dealId)`, `StateChanged(dealId, from, to)` — the canonical event the UI subscribes to. Roadmap adds `DisputeRaised` / `DisputeResolved`.
- `dealId` is indexed on all events. Events are observability only — the audit trail (TR-4.6), not events, is the authoritative record (AP-4).

### 4.6 Errors & safety patterns (TR-3.7)

- **TR-3.7** — Custom errors, not revert strings: `InvalidState`, `ZeroAmount`, `DealExists`, `NotBuyer`, `SameParty`, `NotAuthorised`.
- Mandatory patterns: checks-effects-interactions on every fund move; `SafeERC20` for all transfers; `ReentrancyGuard` on `deposit` / `release` / `refund`; `Pausable` on fund-moving functions.
- **Forbidden:** `_setupRole`, `Ownable()` no-arg constructor, `SafeMath`, `.transfer()` / `.send()` for ETH, raw `IERC20.transfer`, `require(msg.sender == ...)` for role auth, `tx.origin`.
- The contract holds only the stablecoin; it does not accept ETH (no `payable` fund paths), so there is no native-asset attack surface.

### 4.7 Testing requirements (TR-3.8)

- **TR-3.8** — Contract test coverage (present in `contracts/test/`): happy path (`createDeal → mint → approve → deposit → recordVerdict → release`, asserting final `Released` and seller balance increased by `amount`); access control (non-releaser cannot `createDeal` / `recordVerdict`, non-buyer cannot `deposit`); state guards (disallowed transitions revert `InvalidState`); refund escape hatch (admin `refund` from `Funded`); permissionless release (a third party can `release` from `ReleasePending`); pause (every fund-moving function, including `release`, reverts while paused); `cancel` (admin cancels from `Agreed` only). `MockUSDC` (6-decimals) for local tests.

---

## 5. Off-chain components

> Realises FR-1, FR-2, FR-6–FR-14, FR-16. Money math, amount-matching, and rule evaluation
> happen in code, never in free-text (AP-5). The delivered baseline implements the intake,
> rules engine, objection handling, settlement, and audit trail directly in the application;
> the per-component requirements below record both the delivered surface and the roadmap
> target.

### 5.1 deal-intake (TR-4.1) — FR-1, FR-2, FR-3

- **TR-4.1.1** (FR-1) — Capture trade terms through a structured intake and record them on the deal. **Delivered.** (Roadmap: extraction from an uploaded sale-contract PDF with per-field confidence.)
- **TR-4.1.2** (FR-2) — Hold the per-deal release rules (the fields and thresholds the engine evaluates, §6.1). **Delivered** as structured deal terms. (Roadmap: a canonical escrow-specification JSON whose content hash feeds `createDeal(specHash)`, TR-3.4.)
- **TR-4.1.3** (FR-3) — Generate the Trade Escrow Agreement referencing the terms, for buyer + seller approval, and name the per-deal dispute forum. **Roadmap.**
- **TR-4.1.4** (FR-1) — **Role-agnostic deal initiation.** Intake supports a deal being initiated by any party role — buyer, seller, or platform/intermediary — recording the initiator's role and inviting the counterparty (or both counterparties) to accept before the escrow is created on-chain. **Delivered.** The initiator and invitee identities are established by the authentication model (TR-6.2.4–6.2.5).

### 5.2 document-checker + rules engine (TR-4.2, TR-4.3) — FR-6, FR-8, FR-9

- **TR-4.2** (FR-6) — Accept the seller's shipment document. **Delivered:** a bill of lading submitted through a structured intake (`submit-bol`). Roadmap: the full BRD §8 documentary set and file upload with size limits and a stored blob + content hash.
- **TR-4.3.1** (FR-8, extraction) — **Delivered:** document fields are supplied through the structured intake. **Roadmap:** AI / OCR field extraction (Claude vision) returning per-field values and confidences, schema-validated before any business logic; the extractor reads fields only and does not grade (AP-5 separation).
- **TR-4.3.2** (FR-8, rules — the core layer) — A **deterministic rules engine** (`rules.ts`, pure code) compares the submitted document's structured fields against the deal's release rules and returns a per-rule audit object. **Delivered rule families:** required-document present; party match (shipper = seller, consignee = buyer, thresholded); goods match (agreed goods present in the document description); shipment date ≤ deadline. Each rule yields pass / fail plus the compared values for the audit trail. Amount and currency matching are roadmap rules that arrive with the commercial-invoice document (§8).
- **TR-4.3.3** (FR-9, verdict) — Combine per-rule results into one verdict. **Delivered:** `Compliant` (→ on-chain `recordVerdict` path) and `Discrepant` (recorded, no transition). **Roadmap:** `Rejected` / `Escalated`, per-field confidences, the £50k value-cap gate, and routing over the cap to human review (AP-7).

### 5.3 kyc-compliance (TR-4.5) — FR-7

- **TR-4.5.1** (FR-7) — **Delivered:** company identity is captured at onboarding (legal name, registration number, country, address, contact) and stored on the account. **Roadmap:** KYC / KYB / sanctions screening at origination, as a hard gate before `Funded`; all-green auto-passes, any hit holds the deal and escalates to a compliance officer; a sanctions hit is filed and notified, never auto-suppressed.
- **TR-4.5.2** — Roadmap screening uses public snapshots (OFAC / UN / HMT) and synthetic identity records only during build (AP-8). Provider choice is a roadmap decision (§12).

### 5.4 objection handling (TR-4.4) — FR-10, FR-11, FR-13

- **TR-4.4.1** (FR-10) — **Delivered:** on a `Compliant` verdict with escrow `Funded`, issue a notice of release and open the objection window (default **48h**, held as config). The window is enforced off-chain before `recordVerdict` (AP-7).
- **TR-4.4.2** (FR-11) — **Delivered:** record buyer objections against the closed set of valid grounds (BRD §9.1): missing required document; field mismatch; shipment after deadline; suspected document fraud; sanctions / KYC / compliance issue; mutual amendment request. The objection blocks `recordVerdict` while it stands; a buyer may withdraw it. **Roadmap:** automated grading of objection validity and rejection of invalid grounds.
- **TR-4.4.3** (FR-13) — **Delivered:** the refund path (releaser / admin `refund` from `Funded`). **Roadmap:** amendment (refund + new `dealId` with new terms), waiver, and dispute escalation to the per-deal forum. Because the deal has no on-chain spec setter (AP-1), amendment of release rules is implemented as refund → new deal, not an on-chain amend path.

### 5.5 settlement (TR-4.7) — FR-12, FR-13

- **TR-4.7.1** (FR-12, AP-2) — **Delivered:** the releaser key signs `recordVerdict` after the gates pass (through the release-approval / finalise routes); `release` is permissionless and may be triggered by anyone once the deal is `ReleasePending`. Narrow scope: no FX, no on / off-ramps.
- **TR-4.7.2** (FR-13) — **Delivered:** the releaser / admin key signs `refund` on an authorised refund condition. Every settlement action follows the audit-around-action rule (TR-2.3).

### 5.6 audit trail (TR-4.6) — FR-14

- **TR-4.6.1** (FR-14, AP-4) — **Delivered:** an append-only record of every state transition and reviewer decision, stored in the application database (`AuditEntry`). Each entry carries the timestamp, actor, action, optional detail, transaction hash, and account. The audit trail — not the chain, not events — is the regulator-facing source of truth.
- **TR-4.6.2** — **Roadmap:** tamper-evidence — each entry carries a hash chained to the previous entry and an out-of-band anchor (WORM store or periodic on-chain commit). The delivered SQL trail is append-only in application logic but not cryptographically chained; tamper-evident anchoring is a roadmap property.
- **TR-4.6.3** — A `Compliant` deal's audit trail contains the full chain: document submission → per-rule grade → notice / window → verdict (`recordVerdict` intent + txHash) → `Released` reconciliation.
- **TR-4.6.4** (idempotency) — State-transition writes and the on-chain transactions they precede are idempotent per (`dealId`, transition): a re-submitted action does not create a second authorising transaction or a duplicate entry. The contract reverts the second transaction on `InvalidState`; the off-chain layer verifies the on-chain state (e.g. `fund/confirm` checks the receipt and state) before writing.

### 5.7 notify (TR-4.8) — FR-17

- **TR-4.8** (FR-17, **S**) — **Roadmap:** notify both parties on each state change (funding confirmed, document submitted, notice of release, objection window opened / closed, released / refunded) over email / in-app channels. **Delivered:** the UI re-reads state on the contract's `StateChanged` event; there is no separate notification channel.

### 5.8 orchestrator (TR-4.9) — FR-15

- **TR-4.9** (FR-15, AP-7) — **Roadmap:** an orchestrator that routes work between specialists, aggregates their outputs, and decides auto-handle vs. escalate against the autonomy policy (TR-7.3), tagging every output with a reason. The delivered baseline has no agent orchestrator; the autonomy gates that apply are encoded directly in the relevant routes.

---

## 6. Data models

> Realises FR-2 (release rules), FR-8 / FR-9 (fields + verdict), FR-14 (audit entry), plus the
> on-chain deal struct (§4). **Conventions:** money in **minor units** as **strings** in JSON;
> timestamps **ISO 8601 UTC**; documents are checked against the deal's release rules, not the
> sale contract.

### 6.1 Deal terms & release rules (TR-5.1)

- **TR-5.1** (FR-2) — Each deal records the parties, the payment amount and token, the trade terms, and the release rules the engine evaluates. **Delivered fields** (application database):
  - Parties: buyer and seller accounts (and display names), the initiating role.
  - Payment: USDC amount (minor units), settlement token, chain id.
  - Trade terms: goods description, shipment deadline.
  - Release rules (delivered): document present; shipper = seller; consignee = buyer; goods match; shipment date ≤ deadline.
  - Objection window: 48h default (config).
- **Roadmap:** a canonical escrow-specification JSON (adding invoice currency, amount-match and currency-match rules, per-deal dispute forum, approvals, and lineage for amendments) whose keccak256 is committed on-chain as `specHash` at `createDeal`, binding funds to the rule-set (TR-2.5).

### 6.2 Submitted document fields (TR-5.2)

- **TR-5.2** (FR-8) — The submitted bill of lading records its structured fields (B/L number, shipper, consignee, goods description, vessel, ports, shipped-on-board date, and other transport fields). The rules engine grades the graded subset (§5.2); the remaining fields are recorded for the audit trail. **Delivered.** Roadmap: AI-extracted fields with per-field confidence and a source-document hash tying extraction to the stored blob.

### 6.3 Compliance verdict (TR-5.3)

- **TR-5.3** (FR-9) — Grading returns one verdict plus a per-rule audit object (the evidence written to the audit trail): the verdict (`Compliant` / `Discrepant` delivered; `Rejected` / `Escalated` roadmap), the evaluated rules with their pass / fail and compared values, and the timestamp. **Delivered:** `Compliant` opens the notice / window and enables the `recordVerdict` path; `Discrepant` is recorded with no on-chain transition. Roadmap adds low-confidence-field handling, the value-cap valuation, and the auto vs. human-review decision.

### 6.4 Audit-trail entry (TR-5.4)

- **TR-5.4** (FR-14, AP-4, TR-2.3) — Each entry records: the deal, the timestamp, the actor (role and account), the action, an optional detail, and the transaction hash where the action was on-chain. **Delivered** as `AuditEntry` rows. Two entries bracket each on-chain action — an intent entry before submission and a reconciliation entry after the receipt (TR-2.3). **Roadmap:** a `prevHash` / `entryHash` chain and an out-of-band anchor for tamper-evidence (TR-4.6.2).

### 6.5 KYC / screening record (TR-5.5)

- **TR-5.5** (FR-7) — **Delivered:** company-identity fields on the account (legal name, registration number, country, address, contact). **Roadmap:** a screening record per party (KYB matched, sanctions lists and hit flag, result, timestamp) appended to the audit trail; a hit holds the deal and files a report — never auto-suppressed. No real PII (AP-8) — synthetic identities and public list snapshots only.

### 6.6 Objection record (TR-5.6) — FR-11

- **TR-5.6** (FR-11) — A buyer objection raised in the window records the ground from the closed valid set (missing document / field mismatch / late shipment / suspected fraud / sanctions-KYC / mutual amendment), a detail, and the raised-at timestamp; it may be withdrawn. **Delivered.** Roadmap adds an automated validity grade and outcome (amendment / waiver / refund / dispute / rejected).

### 6.7 On-chain deal struct (TR-5.7) — defined in §4

- **TR-5.7** — The contract stores `Deal { address buyer; address seller; uint256 amount; }` keyed by `bytes32 dealId`, plus `mapping(bytes32 => State)`. All other fields are off-chain — the contract never sees names, documents, rules, currency labels, or fiat values. Roadmap adds `bytes32 specHash` to the struct (TR-3.4).

---

## 7. APIs & interfaces

> Realises FR-5, FR-6, FR-16, FR-19 and the integration seams. Four interface planes:
> **on-chain** (contract ABI), **off-chain HTTP** (server routes), **client** (UI / wallet),
> and **external connectors**.

### 7.1 On-chain interface — contract ABI (TR-6.1)

- **TR-6.1.1** (FR-5, FR-12) — The escrow contract exposes the §4 functions. **Writes:** `createDeal`, `deposit`, `recordVerdict`, `release`, `refund`, `cancel`, `pause`, `unpause`, role admin. **Reads:** `deals(bytes32)`, `state(bytes32)`, `hasRole(role, account)`. **Events:** as TR-3.5.
- **TR-6.1.2** — The ABI JSON is the cross-tier contract: the web app imports it (via viem), and the buyer flow additionally uses the ERC-20 ABI for the USDC `approve` / `balanceOf` calls. The State enum int↔name mapping has a single shared owner tracking the on-chain order exactly (`Draft=0, Agreed=1, Funded=2, ReleasePending=3, Released=4, Refunded=5, Cancelled=6`); the Release-button gate (`state == ReleasePending`) depends on it, so any reordering of the Solidity enum updates the shared mapping in lockstep.

### 7.2 Off-chain HTTP API (TR-6.2)

The delivered off-chain API is a set of authenticated Next.js route handlers. Every state-changing
route resolves the acting identity from the server session (§7.2.4), validates input, performs its
business logic, writes the audit trail, and — where the action is on-chain — signs with the
appropriate key and reconciles against the receipt.

- **TR-6.2.1 — Authentication routes.**
  - `POST /api/auth/signup` — create an account (company-identity fields), hash the password, issue a session.
  - `POST /api/auth/login` — verify credentials; issue a session cookie; a single generic failure response (no account enumeration).
  - `POST /api/auth/logout` — delete the session and clear the cookie.
  - `GET /api/auth/session` — resolve the signed-in account from the session cookie.
  - `POST /api/auth/wallet/nonce` — SIWE step 1: issue a single-use nonce and build the EIP-4361 message (session required).
  - `POST /api/auth/wallet/link` (+ `DELETE`) — SIWE step 2: verify the signature recovers to the claimed address and record the wallet; `DELETE` unlinks.
- **TR-6.2.2 — Escrow routes.**
  - `POST /api/escrow/create-deal`, `POST /api/escrow/propose` — record a proposed deal and its terms (off-chain); invite the counterparty.
  - `POST /api/escrow/accept-deal`, `POST /api/escrow/agree` — counterparty acceptance; on accept the releaser key signs `createDeal` (`Draft → Agreed`), binding each party's linked address.
  - `POST /api/escrow/fund` — buyer funding signed server-side for the local demonstrator; and `POST /api/escrow/fund/prepare` + `POST /api/escrow/fund/confirm` — build the `approve` / `deposit` calldata for the buyer's own wallet and verify the submitted transaction against the receipt and on-chain state.
  - `POST /api/escrow/submit-bol` — the seller submits the bill of lading; the deterministic rules engine grades it; `Compliant` opens the notice / objection window (no on-chain write yet); `Discrepant` records the result.
  - `POST /api/escrow/approve-release` — the buyer waives the window; the releaser key signs `recordVerdict` (`Funded → ReleasePending`).
  - `POST /api/escrow/finalise-release` — after the window expires with no standing objection; the releaser key signs `recordVerdict`.
  - `POST /api/escrow/object` / `POST /api/escrow/withdraw-objection` — the buyer records or withdraws an objection on the valid-grounds set; a standing objection blocks `recordVerdict`.
  - `POST /api/escrow/refund` — the releaser / admin key signs `refund` (`Funded → Refunded`); blocked while a clean notice stands.
  - `POST /api/escrow/release` — the permissionless `release` (`ReleasePending → Released`), demonstrating that anyone may settle a compliant deal.
  - `GET /api/escrow/status`, `GET /api/escrow/summary`, `GET /api/escrow/deals`, `GET /api/escrow/deals/[dealId]`, `GET /api/escrow/companies` — deal state and balances, per-account aggregates, the caller's deals with their per-deal role, a single deal (403 if the caller is not a party), and the counterparty picker.
- **TR-6.2.3 (releaser-key handling)** — Routes that move state or hold secrets run server-side only; the releaser key is read from the environment and never reaches the client bundle. In the delivered baseline the server-side signer is guarded: it refuses to sign (HTTP 501) on any network other than the local development chain, so the publicly-known development keys can never authorise a transaction on a public network. Deploying against a public network requires a real releaser key supplied from the environment (see §9.1).
- **TR-6.2.4 (authentication) — Delivered.** Every escrow route authenticates the caller before other processing, via the account session (short-lived server-issued cookie) established at login. Wallet control is proven separately through SIWE (EIP-4361) wallet linking. Failed authentication returns a generic `401`; an authenticated caller lacking rights returns `403`.
- **TR-6.2.5 (authorization) — Delivered.** Each route enforces role- and deal-scoped authorization: a party may act only on deals where they are the recorded buyer or seller; read routes return `403` when the caller is not a party. Roles are **per-deal**, derived from the deal's recorded parties, not from a global account flag; the account type distinguishes client from operator surfaces. The authorising identity is written to the audit entry's actor field. The role set accommodates a platform / intermediary initiator that may create a deal and invite both counterparties but is not itself buyer or seller.
- **TR-6.2.6 (transport & abuse hardening) — Roadmap.** TLS on every surface, per-client rate limiting (`429` + `Retry-After`), a strict CORS allowlist, and request-size limits. Required before any third-party (partner) exposure.
- **TR-6.2.7 (partner API keys) — Roadmap.** Per-client API keys (header-borne, individually revocable, stored as salted hashes, rotated on schedule and on suspected compromise) for the FR-19 partner surface.

### 7.3 Client / UI interface (TR-6.3)

- **TR-6.3.1** (FR-5, FR-6, FR-16) — Next.js (App Router) + wagmi v2 + viem. Wallet connect and on-chain interaction via wagmi hooks (`useAccount`, `useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`, `useWatchContractEvent` on `StateChanged`). **Delivered.**
- **TR-6.3.2** — Buyer surface: USDC balance, **Approve** then **Deposit**, where `approve` is a write against the USDC token contract (exact amount) and **Deposit is gated on the approve receipt**. Seller surface: document submission → verdict → **Release** (enabled when `state == ReleasePending`). **Delivered.**
- **TR-6.3.3** (role-based onboarding) — The client provides role-specific surfaces (buyer, seller, operator) and role-agnostic initiation with counterparty invitation (FR-1, TR-4.1.4). The acting role is established at authentication (TR-6.2.4–6.2.5). **Delivered.**

### 7.4 External connectors (TR-6.5)

- **TR-6.5** — External interfaces, swappable behind the application layer: **chain RPC** (Base Sepolia, viem transport); **stablecoin faucets** (Circle USDC, Base ETH — test only). **Roadmap connectors:** an AI / OCR provider for document extraction; sanctions / KYC feeds (public OFAC / UN / HMT snapshots in build); notification channels. Build-time secrets are supplied via environment variables and never committed.

### 7.5 API conventions (TR-6.6)

- **TR-6.6** — HTTP responses carry the structured result and, where relevant, a reference to the audit entry. Errors are typed (validation `400`, auth `401` / `403`, state-conflict `409` mirroring on-chain `InvalidState`, releaser-guard `501`). Money in API payloads is string minor units. No endpoint returns or accepts a private key. FR-19 (partner API) is a seam only; TR-6.2.6–7 define the hardening bar it must meet before opening the API to third parties.

---

## 8. End-to-end flow & autonomy gates

> Realises the BRD §6.1 flow, FR-15 (autonomy), and the §9.2 decision policy.

### 8.1 The deal → document-check → release sequence (TR-7.1)

- **TR-7.1** — The delivered lifecycle:

```
 Step                          Component            On/off-chain        State after
 ─────────────────────────────────────────────────────────────────────────────────
 1. Initiate + invite         deal-intake          off-chain           (proposed)
 2. Counterparty accepts      deal-intake+settlement on-chain createDeal Draft→Agreed
 3. Buyer deposits            client→contract      on-chain deposit      Agreed→Funded
 4. Seller submits B/L        document-checker     off-chain grade       (notice + window)
    └ GATE: verdict Compliant (TR-7.3)
 5. Notice of release + window objection handling   off-chain            (objection window open)
    └ GATE: window expires / buyer waives, no standing objection (TR-7.3)
 6. Record verdict            settlement→contract  on-chain recordVerdict Funded→ReleasePending
 7. Release                   client/anyone→contract on-chain release     ReleasePending→Released
 ─────────────────────────────────────────────────────────────────────────────────
```

- **Critical ordering (AP-7, TR-3.3):** step 4's verdict and step 5's window gate execute before `recordVerdict` (step 6), because `recordVerdict` makes the release unstoppable (permissionless `release`).

### 8.2 Release preconditions (TR-7.2)

- **TR-7.2.1** — The release of funds does not occur unless all of the following hold: escrow is `Funded`; the required document was submitted; the compliance verdict is `Compliant`; a notice of release was issued; the objection window expired (or the buyer waived it) with no standing objection. Conditions 2–5 are enforced off-chain before `recordVerdict`; the contract enforces the `Funded` and `ReleasePending` preconditions.
- **TR-7.2.2** — Refund preconditions (delivered): a releaser / admin `refund` from `Funded`, blocked while a clean notice stands. Every settlement action writes the audit bracket (TR-2.3).

### 8.3 Autonomy gates (TR-7.3)

- **TR-7.3** (FR-15, BRD §9.2) — The autonomy table (BRD §9.2) records, per action, the auto-act envelope and the human escalation path. In the delivered baseline the deal operates inside the auto envelope by construction: structured synthetic deals below the £50k cap, no screening step, and objection handling gating `recordVerdict`. The value cap and objection window are held as configuration (TR-7.3.1). The human-review console, KYC escalation, and dispute routing are roadmap (TR-7.3.2).
- **TR-7.3.1** — The £50k cap and 48h window are configuration values, not hardcoded constants, so confirming or changing them is a config change.
- **TR-7.3.2** — Roadmap: escalation is fail-safe — if any gate's inputs are missing, ambiguous, or below threshold, the system holds and escalates rather than proceeding, tagging every decision auto / escalate with a reason.

---

## 9. Security & compliance

> Realises NFR-Security, NFR-Auditability, NFR-Compliance, NFR-Determinism, NFR-Privacy
> (BRD §10), the §9.3 hard "don'ts", and AP-3/4/5/7/8.

### 9.1 Key management & custody (TR-8.1) — the top risk

- **TR-8.1.1** (AP-3, NFR-Security) — Buyer funds are held only by the escrow contract — never a Blockmediary-controlled or hot wallet. The releaser holds an authorising key, not a custodial one: it can move a deal's state (`recordVerdict`, `refund`) but cannot redirect funds to an arbitrary address — payouts go only to the recorded buyer (`refund`) or seller (`release`).
- **TR-8.1.2** (top security risk) — Compromise of the releaser key is the highest-impact threat and is a two-sided lever: against the seller, `recordVerdict` on a non-compliant deal or `refund` of a `Funded`-but-pre-verdict deal; against the buyer, pushing a discrepant deal to release. Mitigations: the key lives in server environment only, never in the repo, client bundle, or logs; it is rotatable via `AccessControl` grant / revoke; admin is a multisig in production (a single deployer key is acceptable only for the testnet demonstrator); `pause()` is the emergency backstop; the audit trail's intent-before-submit entry makes every authorised transition attributable. In the delivered baseline, the server-side signer additionally refuses to sign on any non-local network (TR-6.2.3), so the publicly-known development keys cannot authorise a transaction on a public network.
- **TR-8.1.3** — `release` is permissionless by design (AP-7): once a deal is `ReleasePending`, a compliant seller cannot be censored by withholding the releaser key. This protects the seller post-verdict; pre-verdict protection rests on key hygiene, multisig admin, and the audit trail.

### 9.2 Autonomy & privilege enforcement (TR-8.2)

- **TR-8.2** — The autonomy gates (§8.3) are enforced in code, not merely documented: the delivered routes check each applicable threshold and refuse to proceed when a precondition is unmet (for example, `recordVerdict` is blocked while an objection stands, and `refund` is blocked while a clean notice stands). Every state-changing action is attributed in the audit trail.

### 9.3 Audit & regulatory compliance (TR-8.3)

- **TR-8.3.1** (FR-14, AP-4) — The audit trail is the regulator-facing source of truth: every state transition and reviewer decision is recorded before the on-chain action (intent) and reconciled after (TR-2.3). Tamper-evidence — a hash chain plus an out-of-band anchor — is a roadmap property; the delivered SQL trail is append-only in application logic but not cryptographically chained.
- **TR-8.3.2** (NFR-Compliance) — KYC / KYB / sanctions screening as a hard gate before `Funded` is a roadmap requirement (FR-7); a sanctions hit is filed and notified, never auto-suppressed.
- **TR-8.3.3** (regulatory posture) — Scope choices constrain the regulatory profile and are honoured: **no financing** (escrow / settlement only, no spread, ever); **no FX inside the system** (the contract performs no conversion; parties agree the settlement stablecoin upfront); **no on / off-ramps**; **no title / quality claims** (release on document compliance only). Sanctioned corridors and prohibited / high-risk goods are excluded. Target-jurisdiction AML specifics (UK / EU / ME) are a roadmap decision (§12); the system makes no jurisdiction-specific regulatory claims without sourcing.

### 9.4 Determinism for money (TR-8.4)

- **TR-8.4** (AP-5, NFR-Determinism) — All amount-matching, comparison, and threshold math happen in real code (`rules.ts`), never in free-text. Money is in minor units as `bigint` / `parseUnits`, rounded only at display. This prevents arithmetic errors in a payments product and is testable.

### 9.5 Data handling & secrets (TR-8.5)

- **TR-8.5.1** (AP-8, NFR-Privacy) — No real customer PII or live financial data during the build: synthetic identities and sandbox endpoints only. Production PII handling and the data-protection regime are roadmap decisions (§12).
- **TR-8.5.2** (secrets) — All secrets via environment variables; a `.env.example` template and a root `.gitignore` exclude real `.env*` and build artefacts. No private key or API key in the repo, client bundle, or logs. The releaser key and deployer keys are server-side only.
- **TR-8.5.3** (data integrity) — Application data fixtures are validated in CI so malformed JSON never reaches the rules engine or audit trail.

### 9.6 Smart-contract security (TR-8.6)

- **TR-8.6.1** — Contract security is specified in §4.6: checks-effects-interactions on every fund move; `SafeERC20`; reentrancy protection on `deposit` / `release` / `refund`; `Pausable` (including `release`); custom errors; no ETH / `payable`; no owner-drain; non-fee-on-transfer / non-rebasing token only. CI greps for the forbidden anti-patterns and fails on any hit.
- **TR-8.6.2** (immutability) — The escrow contract is non-upgradeable by design (no proxy; `Ownable` forbidden): for a custody contract this removes the upgrade key as an attack surface. Remediation is `pause` → redeploy a fixed contract → migrate, not a proxy upgrade.

### 9.7 Threat-model summary (TR-8.7)

| Threat | Surface | Mitigation |
|--------|---------|------------|
| Releaser-key compromise | Off-chain key | Server-only, rotatable, multisig admin, pause backstop, attributable via audit trail; non-local signing guard (TR-6.2.3) |
| Admin-key compromise | On-chain role | Larger blast radius (can grant roles, refund / cancel, pause) → multisig in production |
| Forged / altered document | Document plane | Deterministic rules over the submitted fields; AI extraction + confidence + human review above the envelope (roadmap) |
| Bad math | Off-chain logic | All money math in code (TR-8.4) |
| Reentrancy / fund drain | Contract | CEI + SafeERC20 + ReentrancyGuard + no owner-drain (TR-8.6) |
| `release` front-running | Contract (permissionless) | Benign: `release` pays only the recorded seller — no value extraction |
| Buyer abandons at `Agreed` | Flow | Admin `cancel` from `Agreed`; `createDeal` is releaser-gated so deal-spam is bounded |
| L2 reorg / finality | Chain | Treat state as final after N confirmations before writing the reconciliation entry; L2 finality accepted for the demonstrator |
| USDC allowance hygiene | Client | Exact-amount `approve`, never `type(uint256).max` |
| Double-submit / replay | API + chain | Idempotency per (`dealId`, transition); contract reverts the second transaction on `InvalidState` |
| Audit-trail tampering | Off-chain record | Roadmap: hash-chain + out-of-band anchor; the delivered SQL trail is append-only but not chained |
| Secret leakage | Repo / CI | `.env*` gitignored; secrets server-side only |

---

## 10. Testnet, deployment & CI

### 10.1 Chain & environment (TR-9.1)

- **TR-9.1.1** — Deploy to **Base Sepolia** (chainId **84532**, RPC `https://sepolia.base.org`, explorer `https://sepolia.basescan.org`). USDC test token `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals).
- **TR-9.1.2** (portability) — Deploy with parameters `usdcAddress`, `admin`, `releaser` — no hardcoded addresses (TR-2.4) — so a redeploy to another EVM / OP-stack L2 needs only new parameters. Verify the deployed contract on the explorer.
- **TR-9.1.3** (env) — Required environment: the AI provider key (roadmap), the wallet-connect project id, the Base Sepolia RPC URL, the deployer key, the explorer API key, the releaser key, and the deployed escrow and USDC addresses. A `.env.example` template documents the set; real `.env*` is never committed.

### 10.2 CI gates (TR-9.2)

- **TR-9.2.1** — CI runs on every PR to `main`: agent-sync (write-mode, as the agent directory is gitignored), the agent-privilege gate, data-fixture validation (every JSON / JSONL parses), and a Python compile check.
- **TR-9.2.2** — Contract and app gates run alongside the packages: `hardhat test` (TR-3.8), the Solidity anti-pattern grep (§4.6), and the app typecheck / lint plus the wagmi-v1-name grep. Branch protection requiring these checks is set by the repository owner.

### 10.3 Demonstrator deployment (TR-9.3)

- **TR-9.3** — A seed script creates the demonstrator deal(s); a runbook covers preflight checks, a fresh redeploy for clean state, and a scripted walkthrough with fallbacks. A pre-recorded fallback recording exists before the live demonstration. All demonstrator data is synthetic (TR-8.5).

### 10.4 Rollback (TR-9.4)

- **TR-9.4** — The escrow is non-upgradeable (TR-8.6.2); incident / rollback is `pause` → redeploy a fixed contract (new address) → point the app at it via environment → migrate (new deals on the new contract; in-flight deals settled / refunded on the old). The chain-portable deploy scripts also support redeploying to a different EVM L2 if Base Sepolia degrades.

---

## 11. Acceptance criteria

### 11.1 Delivered acceptance (all pass)

| # | Criterion | Verifies |
|---|-----------|----------|
| A1 | Escrow contract deployed; `hardhat test` (happy path + access + state-guard + refund + permissionless-release + pause + cancel) green | FR-4, TR-3.* |
| A2 | Sign in, link a wallet (SIWE), connect → USDC balance loads; **Approve → Deposit** moves the state badge to `Funded` | FR-5, TR-6.2, TR-6.3 |
| A3 | Submit a compliant bill of lading → verdict `Compliant`, notice + objection window open; on waiver / expiry the chain state → `ReleasePending`, **Release** enables; funds reach the seller, state → `Released` | FR-6, FR-8, FR-9, FR-10, FR-12 |
| A4 | Submit a bill of lading with a mismatched field → verdict `Discrepant`, chain state stays `Funded` (no transition) | FR-8, FR-9 (negative) |
| A5 | A buyer objection on a valid ground during the window blocks `recordVerdict`; withdrawing it restores the notice | FR-10, FR-11 |
| A6 | The audit trail contains the full chain for a compliant deal: submission → grade → notice → verdict (`recordVerdict` txHash) → `Released` | FR-14 |
| A7 | Two parties see their own deals only; a non-party is refused (`403`); roles are derived per deal | FR-16, TR-6.2.5 |
| A8 | No money math outside `rules.ts`; amounts via `parseUnits` / `bigint`; CI (agent-sync, agent-privilege, data-validation, compile) green; no real PII in the data set | AP-5, TR-8.4, TR-9.2, TR-8.5 |

### 11.2 Roadmap acceptance (per requirement)

| FR | Acceptance criterion |
|----|----------------------|
| FR-3 | A sale-contract upload (or form) yields a schema-valid escrow spec + a TEA; both parties' approvals captured before `createDeal`; `specHash` committed on-chain |
| FR-7 | A sanctioned / synthetic-hit counterparty is blocked before `Funded` and escalated; an all-green party proceeds; the screening record is in the audit trail |
| FR-8 / FR-9 | AI / OCR field extraction produces schema-valid fields with confidence; all four verdicts reachable; an over-cap or low-confidence case routes to human review |
| FR-13 | Amendment (refund + new dealId), waiver, and dispute-escalation each drive the correct state + audit entries |
| FR-14 | The audit trail is hash-chained + anchored; tampering is detectable |
| FR-15 | Every decision carries an auto / escalate tag + reason; out-of-envelope cases reach the named human role |
| FR-17 | Notifications fire on each transition over email / in-app channels |

---

## 12. Roadmap decisions

The decisions below are to be taken before the corresponding roadmap functionality is built.

| # | Decision | Notes |
|---|----------|-------|
| R1 | AI / OCR extraction provider and model | For FR-8 field extraction; validate against current provider docs. |
| R2 | KYC / sanctions data-feed provider | Public OFAC / UN / HMT snapshots in build; production provider TBD. |
| R3 | eBL / document-custody partner | For title control beyond the current scope (BRD §4.2.a). |
| R4 | Target-jurisdiction AML specifics (UK / EU / ME) | No jurisdiction-specific claims without sourcing (§9.3). |
| R5 | Production PII / data-protection regime | Including the on-chain name-in-`specHash` concern when `specHash` binding is added. |
| R6 | On-chain `specHash` binding | Commit the escrow-spec hash at `createDeal` (adds one `bytes32` parameter). |
| R7 | Audit-trail tamper-evidence | Move from the append-only SQL table to a hash-chained + anchored store. |
| R8 | Partner API hardening | API keys, rate limiting, CORS allowlist (TR-6.2.6–7) — the precondition for FR-19. |

---

*End of Technical Requirements v1.0, baselined against the delivered prototype and BRD v1.0.*
