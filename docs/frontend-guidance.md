# Blockmediary — Frontend Build Guidance

**Status:** v0.1 draft · **Date:** 2026-07-05
**Derived from:** [Flow Guidance](Flow%20Guidance/) (`deal-flow-stages.md`, `operational-flow-v1.md`, `verification-model-v2.md`), [technical-requirements.md](technical-requirements.md) (TRD v0.4 §7), [domain-rules.md](domain-rules.md)
**Audience:** whoever builds `app/` — screens, states, and the engineering bindings in one place.

> **Authority note.** Where the Flow Guidance docs and the TRD conflict (examiner-on-every-deal,
> objection-window placement, staged release), this document takes the **simple MVP posture**:
> auto-release inside the autonomy envelope, no examiner console, no objection window, single-shot
> release — with **explicit seams** (§8) so each piece of complexity can be added without reworking
> the frontend. The conflicts themselves are logged in §9 for team resolution; the frontend must not
> silently resolve them.

## How to read this

- ✅ = build for the **MVP demo** (the graded Phase 1–4 slice).
- 🔵 = **full product**, deferred — but the ✅ build must leave its seam (§8).
- This mirrors the TRD's MVP-column convention. The demo is a single page keyed by
  `?role=buyer|seller` with one hardcoded deal; the full product is the multi-role, multi-deal
  surface described per stage in §4.

---

## 1. Principles (every screen inherits these)

1. **The UI is never authoritative** (TRD TR-2.1). Deal state comes from the chain
   (`state(dealId)`); decision history comes from the audit ledger via the API. The frontend
   renders state; it never computes or caches it as truth.
2. **State-driven rendering.** Every control is enabled/disabled by the shared `State` enum
   (§6.3), not by local UI flow. If the chain says `Funded`, the Release button is disabled no
   matter what the user just did.
3. **No money math in the client** beyond display formatting (AP-5). Amounts arrive as string
   minor units; the client formats with the token's `decimals` (6 for USDC) at display time only.
4. **No secrets client-side.** The releaser key never appears in the bundle; all state-moving
   server work goes through the API (`/api/check-document` in the MVP). Wallet-signed transactions
   (`approve`, `deposit`, `release`) are the only client-initiated chain writes.
5. **Roles see different surfaces, same state.** Buyer, seller (✅ via `?role=`), and later
   examiner/compliance/platform (🔵 via real auth, TR-6.3.4) all render off the same deal state.
6. **Copy is legally loaded.** Use §7's terminology rules. Never imply financing, title control,
   goods-quality guarantees, or in-house examination.

## 2. The state model is the UI spine

The shared enum (MVP 6-value, must track the Solidity enum order **exactly** — TR-6.1.2):

```ts
enum State { Draft = 0, Agreed = 1, Funded = 2, ReleasePending = 3, Released = 4, Refunded = 5 }
```

Off-chain-only states (`DocumentsSubmitted`, `ReviewInProgress`, `Compliant`) live in the audit
ledger, not on-chain (TR-4.6.4). ✅ The MVP shows them transiently as verdict-pane status while
`/api/check-document` runs; 🔵 the full product reads them from `GET /api/deals/:id` and renders
them as first-class timeline steps.

### Per-state UI rules (what each role can do)

| State | Buyer sees / can do | Seller sees / can do |
|-------|--------------------|----------------------|
| `Draft` 🔵 | Deal form / invite pending | Review terms, counter |
| `Agreed` | **Approve → Deposit** panel ✅ (deposit gated on approve receipt) | "Awaiting buyer funding" — do **not** ship |
| `Funded` | "Funds locked" confirmation; (🔵 objection UI later lives *before* this exits) | **Funds are locked — safe to ship.** Document upload enabled ✅ |
| `ReleasePending` | Read-only status (🔵 objection window UI if adopted here — unresolved, §9) | **Release** button enabled ✅ |
| `Released` | Terminal: receipt view, txHash link ✅ | Terminal: paid confirmation, txHash link ✅ |
| `Refunded` | Terminal: refund receipt 🔵 (no UI path in MVP) | Terminal: refund notice 🔵 |

The single most important UI promise in the product is the seller's `Funded` view: **"the money is
on-chain and locked before you ship."** Give it visual weight (amount, token, contract address,
explorer link) — it is the LC-replacement moment.

## 3. Roles and surfaces

| Role | Surface | Identity | MVP |
|------|---------|----------|-----|
| Buyer | Fund panel, deal status, (🔵 objection UI, deal intake) | Wallet ✅ / SIWE or session 🔵 (TRD Q18) | ✅ `?role=buyer` |
| Seller | Funds-locked view, document upload, Release, deal status | Wallet ✅ | ✅ `?role=seller` |
| Platform/intermediary 🔵 | Deal initiation + invite flow only — never deposit/approve/release (TR-6.2.5) | Account/JWT (may have no wallet) | 🔵 |
| Examiner/reviewer 🔵 | Review console: Layer-2 checks + documents + structured verdict capture (verification-model v2 Layer 4) | Account/JWT | 🔵 (seam only, §8) |
| Compliance 🔵 | Screening queue, holds, escalations | Account/JWT | 🔵 |

`?role=` is a deliberate demo stand-in (TR-6.3.4). Structure components so the role comes from a
single `useRole()` source that today reads the query param and later reads the auth session —
nothing else in the tree should touch `searchParams` for role.

## 4. Screen inventory — dual-track, by deal-flow stage

Follows `deal-flow-stages.md` stages 1–6. Each stage lists the full-product screens and the MVP cut.

### Stage 1 — Agree 🔵 (MVP: hardcoded deal)

- **Deal form:** trade terms (amount, currency/token, required documents, shipment deadline,
  Incoterm) producing the escrow-spec JSON preview. Money entered in major units, converted to
  minor-unit strings at the API boundary — never floats in payloads.
- **Counterparty review:** invited party sees the terms, highlights issues, accepts (back-and-forth
  negotiation is a later iteration per deal-flow-stages).
- **Role-agnostic initiation** (TR-4.1.4): buyer, seller, or platform can start; the form asks
  "your role in this deal" and generates invites accordingly.
- **MVP:** none of this — the deal is pre-seeded (`seed-demo.ts`); the page shows the hardcoded
  deal's terms read from `deals(dealId)` + the hardcoded spec.

### Stage 2 — Verify parties 🔵 (MVP: shown, non-blocking)

- **Screening status slot:** per-party approved/blocked badge from the outsourced screening result.
  Funding UI is gated on both parties green (hard gate before `Funded`, FR-7).
- **MVP:** render the step in the deal timeline as "Parties verified ✓" (pre-approved, per
  deal-flow-stages) so the demo shows the gate exists without building it. Do not omit it from the
  UI — graders should see where compliance sits.

### Stage 3 — Lock funds ✅

- **Buyer panel:** wallet connect (`<ConnectButton/>`), USDC balance (`useReadContract` +
  `erc20Abi`), **Approve** (exact-amount `approve(escrowAddress, amount)` against the **USDC token
  contract**, never `type(uint256).max` — threat model "allowance hygiene"), then **Deposit**
  (`deposit(dealId)`), which MUST stay disabled until the approve receipt lands
  (`useWaitForTransactionReceipt`, TR-6.3.2). Show each tx's pending/confirmed state and explorer
  link.
- **Seller panel:** the funds-locked view (§2). Updates within ~5s of confirmation (acceptance A2).
- 🔵 Later: fiat on-ramp entry point (licensed partner — seam only, no build).

### Stage 4 — Ship & submit documents ✅ (invoice only)

- **Seller upload:** single PDF ≤5 MB, posts multipart to `/api/check-document`. Show the
  document's content hash after upload (audit-trail tie-in).
- 🔵 Full product: a **required-documents checklist** driven by `requiredDocuments` in the escrow
  spec, with per-document status (pending / submitted / verified / discrepant) — this is how the
  flow-v1 "BoL first, remaining docs after" sequencing renders without touching the on-chain state
  (the two-pass verification in flow-v1 is per-document off-chain tracking, not a state-machine
  loop). Build the MVP upload pane as one row of that future checklist.
- Copy caution: an emailed PDF copy of a BoL is not an "original" (domain-rules); upload copy for
  the BoL row must say scanned paper original (MVP posture) when that document type arrives.

### Stage 5 — Verify documents ✅ (verdict pane) / 🔵 (examiner console)

- **Verdict pane (✅):** renders the `/api/check-document` response — extraction progress →
  per-rule results (pass/fail with expected vs. actual values from the `rules[]` array) → verdict
  badge (`Compliant` green / `Discrepant` amber). On `Compliant`, show the `recordVerdict` txHash;
  on `Discrepant`, show the failed rules and that chain state is unchanged (acceptance A4).
- **Verdict vocabulary** is the canonical four: `Compliant / Discrepant / Rejected / Escalated`
  (MVP renders the first two). The examiner-facing outcomes in verification-model v2 ("Release
  authorised / Cure requested / Waiver requested / Escalated") are the 🔵 examiner console's
  action set, mapping onto the canonical verdicts — don't invent a fifth status.
- **Examiner console (🔵, seam only):** shows Layer-2 automated results + Layer-3 corroboration
  status ("Corroborated / Source unavailable (logged) / Source contradicted") + the documents,
  and captures the examiner's verdict as **structured data** (issuer, doc type, discrepancy code,
  examiner ID, decision, timestamp, dealId — verification-model v2 build requirement). Per the
  team's MVP decision this console is not built now, and the MVP happy path auto-releases inside
  the autonomy envelope (≤ £50k, all rules pass, confidence ≥ 0.9) — but the verdict pane must
  render a `decision: human_review` response as "held for review" rather than erroring, so
  flipping examiner-on-every-deal on later is a backend policy change, not a frontend rebuild.

### Stage 6 — Release ✅ / objection window 🔵

- **Release (✅):** seller-side button, enabled only at `state == ReleasePending` (enum value 3),
  calling the permissionless `release(dealId)`. On success: `Released` terminal view both sides.
  Copy note: release is a transaction someone sends, not something the contract does by itself —
  say "release the funds" (button), not "funds release automatically."
- **Objection window (🔵):** notice-of-release banner to the buyer + countdown + "raise objection"
  form restricted to the **closed valid-grounds enum** (missing_document / field_mismatch /
  late_shipment / suspected_fraud / sanctions_kyc / mutual_amendment) — a dropdown, not free text,
  because anything else is invalid by design. **Unresolved placement (§9):** TRD AP-7 runs the
  window off-chain *before* `recordVerdict`; deal-flow-stages puts it after. Until decided, bind
  the objection UI to a ledger-supplied `windowOpen` flag from the API, not to an on-chain state —
  then either resolution is a backend change.
- **Refund / amend / dispute paths (🔵):** no UI in MVP (contract `refund` exists, unused).
  Terminal `Refunded` view + amendment flow ("this deal supersedes `dealId` X" via `lineage`)
  come with Phase 5.
- **Staged release (flow-v1 steps 7/12) — do not build.** The contract is single-shot; tranche UI
  is blocked on the open release-model decision (flow-v1 open decision 1). The timeline component
  (§6.4) should render steps from data so a staged model would add steps, not screens.

## 5. The demo page (✅ MVP assembly)

One route, `app/app/page.tsx`, composed of the pieces above:

```
?role=buyer                          ?role=seller
┌────────────────────────┐          ┌────────────────────────┐
│ Deal header (terms,    │          │ Deal header            │
│ amount, parties)       │          │                        │
│ State badge  ← chain   │          │ State badge  ← chain   │
│ Timeline (6 stages)    │          │ Timeline (6 stages)    │
│ ── role panel ──       │          │ ── role panel ──       │
│ USDC balance           │          │ Funds-locked banner    │
│ [Approve] → [Deposit]  │          │ Upload invoice (PDF)   │
│ (Deposit gated on      │          │ Verdict pane           │
│  approve receipt)      │          │ [Release] (@ Pending)  │
└────────────────────────┘          └────────────────────────┘
```

Demo flow = acceptance A2–A4: connect → approve → deposit → badge `Funded` → upload compliant
invoice → verdict pane → `ReleasePending` → Release → `Released`; then the discrepant invoice
showing `Discrepant` with state unmoved.

## 6. Engineering bindings

### 6.1 Stack (locked — TRD §7.3)

Next.js 14/15 App Router · wagmi **v2** + viem 2.x · RainbowKit · @tanstack/react-query ·
Tailwind. **CSR-only for MVP** (TR-6.3.3; SSR cookie hydration is a full-product addition). All
wagmi usage inside `'use client'` components. Forbidden: any wagmi v1 API (`configureChains`,
`useContractRead/Write`, `publicClient`) — there's a grep gate for this.

### 6.2 File layout (Phase 2 deliverables)

```
app/
  lib/chains.ts        ← single source of truth: per-chain RPC, escrow addr, USDC addr, explorer
  lib/wagmi.ts         ← getDefaultConfig, chain baseSepolia, CSR
  lib/contracts.ts     ← ESCROW_ADDRESS, USDC_ADDRESS, DEMO_DEAL_ID = keccak256("demo-deal-1"),
                          shared State enum, Escrow ABI re-export (copy-on-build from contracts/artifacts)
  app/providers.tsx    ← WagmiProvider + QueryClientProvider + RainbowKitProvider
  app/layout.tsx
  app/page.tsx         ← the ?role= demo page (§5)
  app/api/check-document/route.ts   ← backend (Phase 3)
```

### 6.3 Contract interaction map

| UI action | Hook | Target | Notes |
|-----------|------|--------|-------|
| State badge | `useReadContract` `state(dealId)` | Escrow | Re-read on `StateChanged` |
| Deal terms | `useReadContract` `deals(dealId)` | Escrow | buyer/seller/amount |
| USDC balance | `useReadContract` `balanceOf` | USDC (`erc20Abi`) | display-format only |
| Approve | `useWriteContract` `approve(escrow, amount)` | **USDC**, not Escrow | exact amount |
| Deposit | `useWriteContract` `deposit(dealId)` | Escrow | gated on approve receipt |
| Release | `useWriteContract` `release(dealId)` | Escrow | enabled iff state === 3 |
| Live updates | `useWatchContractEvent('StateChanged')` | Escrow | invalidate the state query — **no polling** |
| Tx status | `useWaitForTransactionReceipt` | — | drive pending/confirmed UI |

The `State` enum in `contracts.ts` is the **single owner** of the int↔name mapping; if the
Solidity enum is ever reordered, this file changes in lockstep (TR-6.1.2). No other file may
hardcode a state number.

### 6.4 API interaction (✅ `/api/check-document`)

Request: multipart, single PDF ≤5 MB. Handle all four responses:

| Response | UI behaviour |
|----------|--------------|
| 200 `{verdict:"Compliant", txHash, rules, auditRef}` | Rule table (all green), txHash link, expect `StateChanged` → `ReleasePending` |
| 200 `{verdict:"Discrepant", extract, reason}` | Amber verdict, failed rules with expected/actual, "no funds moved" |
| 400 (validation) | Inline upload error; nothing happened server-side |
| 409 (deal not `Funded`) | Re-read chain state and re-render — the deal already moved (idempotency, TR-6.2.1a). Show the existing outcome, not an error |

Money in all API payloads is **string minor units** (TR-6.6); display via a single shared
`formatAmount(minor: string, decimals: number)` util. 🔵 Full-product routes (`POST /api/deals`,
`/approve`, `/objections`, `GET /api/deals/:id`) follow the same conventions and all carry
`auditRef`s — build the fetch layer as a small typed client so new routes slot in.

### 6.5 Component guidance

- **`<DealTimeline steps={...}/>`** — data-driven 6-stage timeline (§4 stages). Steps come from
  props, not hardcoded JSX, so 🔵 additions (screening detail, examiner step, objection window,
  staged release) are data changes.
- **`<StateBadge/>`**, **`<TxButton/>`** (write + receipt + explorer link + disabled reasons),
  **`<VerdictPane/>`** (renders the `rules[]` array generically by rule type — new rule types in
  the spec DSL must render without code changes), **`<RolePanel role={...}/>`**.
- Disabled controls must say **why** ("Waiting for buyer to fund", "No compliant verdict yet") —
  the state machine is the product; make it legible.
- Errors from reverts surface the typed custom error name (`InvalidState`, `NotBuyer`) mapped to
  human copy, not raw hex.

### 6.6 Env consumed by the frontend

`NEXT_PUBLIC_WC_PROJECT_ID`, `NEXT_PUBLIC_ESCROW_ADDRESS`, `NEXT_PUBLIC_USDC_ADDRESS` (+ RPC via
`chains.ts`). Nothing non-`NEXT_PUBLIC` may be imported into client code.

## 7. Copy & terminology rules

- **"Contracted documentary examiner"** — never "Blockmediary human examiner" or anything implying
  in-house examination (verification-model v2 downstream impact #1 names frontend copy explicitly).
- **Never** "loan", "advance", "financing", "credit" — permanent product boundary.
- Release is on **document compliance** — no copy may promise goods quality, delivery, or title.
- "Funds locked in the escrow smart contract" — Blockmediary never holds the money (non-custodial;
  deal-flow-stages custody note). Don't say "we hold your funds."
- Objection copy states the closed grounds and that other objections are invalid (seller
  protection from post-shipment renegotiation is the core value).
- Display currency: USDC amounts only in MVP (not ETH); timestamps rendered from ISO 8601 UTC.

## 8. Extension seams (how complexity arrives without rework)

| Future feature | Seam the MVP build must leave |
|----------------|------------------------------|
| Examiner-on-every-deal (verification-model v2) | Verdict pane renders `decision: human_review` as "held for review"; console is a new route reusing `<VerdictPane/>` + document viewer |
| Objection window | Timeline step exists (hidden/skipped); objection UI binds to an API `windowOpen` flag, not a chain state |
| Real auth / role-based onboarding (TR-6.3.4) | Single `useRole()` source; no other `?role=` reads |
| Multi-deal dashboard (FR-18) | All components take `dealId` as a prop — nothing reads `DEMO_DEAL_ID` except the demo page |
| Full doc set / BoL-first sequencing | Upload pane is one row of a spec-driven `requiredDocuments` checklist |
| Staged release (if adopted) | Timeline + release panel driven by data (release events array), not a single boolean |
| Notifications (FR-17) | Event watcher already centralises `StateChanged` handling — notification hook attaches there |
| Chain failover | All chain constants flow from `lib/chains.ts` only |

## 9. Open decisions this document does not resolve

Logged from the Flow Guidance sanity check (2026-07-05) + TRD §12; each names the frontend impact.

| # | Decision | Conflict / source | Frontend impact |
|---|----------|-------------------|-----------------|
| 1 | Examiner on **every** deal (verification-model v2) vs. auto-release inside the £50k envelope (domain-rules, TRD §8.3) | Docs contradict; team chose simple-MVP posture for now | Whether the examiner console is happy-path or escalation-only; seam in §8 either way |
| 2 | Objection-window placement — before `recordVerdict` (TRD AP-7) vs. during `ReleasePending` (deal-flow-stages, operational-flow-v1) | Docs contradict | Which state the buyer objection UI binds to; mitigated via API flag (§8) |
| 3 | Release model — single-shot vs. staged (flow-v1 open decision 1; steps 7/12) | Contract is single-shot; flow-v1 sketches tranches | Tranche UI blocked until decided; timeline is data-driven |
| 4 | MVP doc set — invoice-only vs. BoL-first six (flow-v1 vs. TRD Q6) | Reconciled for demo (invoice), open for product | Checklist ordering + BoL "original" copy |
| 5 | Objection window 48h, £50k cap (TRD Q2/Q3) | Open defaults | Render from config/spec values, never hardcode |
| 6 | Auth mechanism — SIWE vs. JWT vs. both (TRD Q18) | Open; platform role may have no wallet | Blocks 🔵 role-based onboarding; `useRole()` seam holds |

---

*Update this document alongside changes to the Flow Guidance docs or TRD §7. The §9 table shrinks as the team locks decisions.*
