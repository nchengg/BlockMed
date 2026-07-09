# Blockmediary — Frontend Roadmap (Reshi Branch)

**Branch:** `Reshi` · **Focus:** Frontend build (Phase 2 of the MVP implementation plan)
**Team:** Transakt · **Hackathon:** BEEM063, Exeter MSc FinTech
**Last updated:** 2026-06-23

---

## What we're building

Blockmediary is a programmable documentary escrow for SME cross-border trade — LC-like trust for smaller deals. The buyer prefunds USDC into a smart contract, the seller ships and submits documents, and the contract releases funds when documents pass verification.

The frontend is a Next.js web app that connects to the on-chain escrow (Base Sepolia) and exposes:
- **Buyer flow:** Connect wallet → Approve USDC → Deposit into escrow → See "funds locked"
- **Seller flow:** See locked funds → Upload invoice → Get verdict → Trigger release

Full spec: [`docs/technical-requirements.md`](docs/technical-requirements.md) · [`plans/implementation-phases.md`](plans/implementation-phases.md)

---

## Phase overview

| Phase | Scope | Status |
|-------|-------|--------|
| **0 — Bootstrap** | Node 22 LTS, pnpm, API keys, wallets, faucets | ⬜ Not started |
| **1 — Smart contract** | Hardhat 3, `Escrow.sol`, Base Sepolia deploy | ⬜ Not started |
| **2 — Web UI + wallet** | Next.js App Router, wagmi v2, RainbowKit, state display, Approve → Deposit flow | ⬜ Not started |
| **3 — Rules engine + doc check** | `/api/check-document`, Claude vision, Zod, audit ledger | ⬜ Not started |
| **4 — Integration & demo polish** | Seed script, demo runbook, pre-recorded fallback | ⬜ Not started |
| **5 — Full product expansion** | KYC, dispute, deal intake, multi-agent SDK (post-demo) | ⏸ Deferred |

---

## Phase 0 — Bootstrap (do this first)

Before any code can run, these need to be done manually:

**Tools:**
- Install Node 22 LTS via nvm-windows (`nvm install 22 && nvm use 22`)
- Enable pnpm via corepack (`corepack enable && corepack prepare pnpm@latest --activate`)

**Accounts & keys to register:**
- [ ] Anthropic API key → `ANTHROPIC_API_KEY`
- [ ] WalletConnect / Reown Cloud project → `NEXT_PUBLIC_WC_PROJECT_ID`
- [ ] BaseScan API key → `BASESCAN_API_KEY`
- [ ] Deployer wallet private key → `BASE_SEPOLIA_PRIVATE_KEY`
- [ ] Releaser wallet private key → `RELEASER_PRIVATE_KEY`

**Faucets:**
- [ ] Base Sepolia ETH → https://www.alchemy.com/faucets/base-sepolia
- [ ] Testnet USDC → https://faucet.circle.com

**Deliverables:**
- `.env` locally (based on `.env.example`)
- `.nvmrc` pinning Node 22

---

## Phase 1 — Smart contract

Bootstrap the `contracts/` Hardhat 3 project and deploy `Escrow.sol` to Base Sepolia.

**Key decisions (already resolved by BRD):**
- Chain: **Base Sepolia** (chainId 84532), failover: Optimism Sepolia → Ethereum Sepolia
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals)
- Contract inherits `AccessControl` + `Pausable` (OpenZeppelin v5)

**State machine (MVP 6-value enum):**
```
Draft → Agreed → Funded → ReleasePending → Released
                        ↘ Refunded
```

**Exit criteria:** `hardhat test` green; contract deployed and verified on BaseScan; `NEXT_PUBLIC_ESCROW_ADDRESS` set in `.env`.

---

## Phase 2 — Web UI + wallet (frontend focus)

Scaffold `app/` with Next.js 15 App Router, connect to the escrow contract, and build the buyer/seller single-page UI.

**Tech stack:**
- Next.js 15 (App Router, TypeScript, Tailwind CSS)
- wagmi v2 + viem 2.x (NOT wagmi v1 — no `configureChains`, `useContractRead`, etc.)
- RainbowKit (wallet connection)
- @tanstack/react-query

**Key files to build:**
```
app/
  lib/
    chains.ts       # single source of truth for per-chain RPC/addresses
    wagmi.ts        # getDefaultConfig with baseSepolia
    contracts.ts    # ESCROW_ADDRESS, USDC_ADDRESS, DEMO_DEAL_ID, State enum, ABIs
  app/
    providers.tsx   # WagmiProvider + QueryClientProvider + RainbowKitProvider
    layout.tsx
    page.tsx        # buyer/seller panels, driven by ?role=buyer|seller
```

**Buyer panel:** USDC balance → exact-amount `approve` → `deposit` (gated on approve receipt) → state badge update via `useWatchContractEvent`.

**Seller panel:** State badge → file input → POST to `/api/check-document` → verdict display → `Release` button enabled at `ReleasePending`.

**Exit criteria:** Connect wallet → Approve → Deposit moves state badge to `Funded`.

---

## Phase 3 — Off-chain rules engine + document check

Build the `/api/check-document` Next.js API route that:
1. Accepts a ≤5 MB PDF invoice upload
2. Sends it to Claude vision for field extraction (Zod-validated)
3. Runs the deterministic rules engine (all money math in `rules.ts`, never in the prompt)
4. On `Compliant`: signs `recordVerdict` as the releaser, writes to audit ledger
5. On `Discrepant`: returns verdict without touching the chain

**Key files:**
```
app/lib/checker/
  schema.ts    # InvoiceExtract Zod schema
  prompt.ts    # extractor prompt (read fields only, no grading)
  rules.ts     # pure gradeInvoice(extract, spec) — all bigint math here
app/app/api/check-document/route.ts
app/data/
  audit-ledger.jsonl
  demo/invoice-acme.pdf   # synthetic demo invoice
```

**Exit criteria:** Compliant invoice → `Released`; wrong-amount invoice → `Discrepant`, chain unchanged; audit ledger shows both.

---

## Phase 4 — Integration & demo polish

- Seed script: `app/scripts/seed-demo.ts`
- Demo runbook: `docs/demo-runbook.md`
- Pre-recorded fallback video → Drive `Hackathon/Demo/`
- A1–A8 acceptance criteria from TRD §11.1 all pass cold, twice

---

## Key design rules (carry into all frontend code)

1. **Money math in `rules.ts`, never in prompts or component state** — use `parseUnits`/bigint throughout.
2. **wagmi v2 only** — use `useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`, `useWatchContractEvent`. Never `useContractRead`/`useContractWrite`.
3. **Exact-amount USDC approval** — never max-approval. Gate `deposit` on the approve receipt.
4. **`RELEASER_PRIVATE_KEY` server-side only** — never in the client bundle.
5. **Audit-first** — write the intent entry to `audit-ledger.jsonl` before the on-chain call, write reconciliation after.
6. **`app/lib/chains.ts` is the single source of truth** for RPC URL, escrow address, USDC address, and explorer config. `hardhat.config.ts` and `wagmi.ts` both read from it (or the same env vars).

---

## Open questions (from BRD §15 / TRD §12)

These don't block the MVP demo but need resolution before Phase 5:

- KYC/sanctions provider (TRD Q8)
- Sale-contract intake mode — structured form vs. extraction (TRD Q1)
- 48h objection window (TRD Q3) — configurable
- Revenue stream / fee level (TRD Q4)
- Production PII / data-protection regime (TRD Q11)

---

## Links

| Resource | Path |
|----------|------|
| Product spec | [`docs/product-blockmediary.md`](docs/product-blockmediary.md) |
| Domain rules | [`docs/domain-rules.md`](docs/domain-rules.md) |
| Technical requirements | [`docs/technical-requirements.md`](docs/technical-requirements.md) |
| Implementation phases | [`plans/implementation-phases.md`](plans/implementation-phases.md) |
| Architecture | [`docs/architecture.md`](docs/architecture.md) |
| Business requirements | [`docs/business-requirements.md`](docs/business-requirements.md) |
