# Blockmediary — Phased Implementation Plan

**Product:** Blockmediary — programmable documentary escrow for SME cross-border trade
**Team:** Transakt (BEEM063 Hackathon)
**Status:** v0.1 · **Date:** 2026-06-03
**Derived from:** [business-requirements.md](../docs/business-requirements.md) (BRD v0.1), [technical-requirements.md](../docs/technical-requirements.md) (TRD v0.2), [mvp-slice.md](mvp-slice.md), [AGENTS.md](../AGENTS.md)

> **How to read this.** Phases take the TRD into production in stages. Each phase has a **goal**,
> the **BRD/TRD requirements it satisfies** (FR/NFR/TR/AP IDs for traceability), **deliverables**,
> **entry/exit criteria**, an **autonomy** note (can run AFK vs. needs a human gate), and — per the
> user's working style — an **"⬇️ Install / download FIRST"** checklist with exact commands run
> *at the start* of the phase. The MVP slice (Phases 1–4) is the graded demo; Phase 5 is the
> full-product re-expansion. Version pins are taken from the TRD where the TRD pins them.

---

## 0. Repo state — what's already here vs. what's missing (read this before Phase 0)

Inspected 2026-06-03 on branch `docs/technical-requirements`.

### ✅ Already present (do NOT re-create)
| Item | Evidence | Notes |
|------|----------|-------|
| Agent/skill scaffold | `agents/`, `skills/`, `tools/`, `docs/`, `data/` | The repo today is the **agent scaffold only** (AGENTS.md) |
| Python tooling | `tools/sync_agents.py`, `check_agent_security.py`, `validate_data.py`, `agent_capabilities.json` | The off-chain *deterministic* `tools/` layer is specced but not yet code |
| CI (4 Python gates) | `.github/workflows/ci.yml` | `sync_agents` (write-mode) · `check_agent_security` · `validate_data` · `compileall` (TRD TR-9.2.1) |
| **Root `.gitignore`** | `.gitignore` | **Already covers** `node_modules/`, `.next/`, `.env*` (with `!.env.example`), `contracts/artifacts|cache`, `contracts/ignition/deployments`, `app/data/uploads/`, `app/data/audit-ledger.jsonl`. The mvp-slice "create .gitignore" task is **done** — TRD TR-8.5.2 is out of date on this. |
| Node + npm | `node v25.9.0`, `npm 11.12.1` | ⚠️ see discrepancy below |
| Python | local `3.14.4`; CI pins `3.12` | Both fine for the Python tools |
| git / gh | `git 2.54.0`, `gh` authed as `nchengg` | Repo: `dapUoE/BlockMed` |

### ❌ Missing — must be created/installed during the build (greenfield)
| Item | Needed by | TRD/plan ref |
|------|-----------|--------------|
| **`contracts/` directory + Hardhat 3 project** | Phase 1 | TRD §4, mvp-slice Phase 1 |
| **`app/` directory + Next.js project** | Phase 2 | TRD §6/§7, mvp-slice Phase 2 |
| **No `package.json` / lockfile anywhere** (no npm/pnpm/yarn project yet) | Phases 1–3 | greenfield — both sub-projects bootstrap fresh |
| **No `hardhat.config.*`, no `foundry.toml`, no `.tool-versions`** | Phase 1 | TRD locks **Hardhat 3** (not Foundry) |
| **`.env.example` at repo root** | Phase 0 | mvp-slice Phase 0 §2; **not yet present** |
| **`pnpm`** (package manager) | Phase 2 (`pnpm create next-app`) | **NOT installed** — `pnpm: command not found` |
| **Accounts / keys** (Anthropic, Reown/WalletConnect, BaseScan, deployer + releaser wallets) | Phase 0 | mvp-slice Phase 0 §3–5 |
| **Faucet funds** (Base Sepolia ETH + testnet USDC) | Phase 0/1 | mvp-slice Phase 0 §5 |

### ⚠️ Discrepancies / risks to decide up front
1. **Node v25.9.0 is non-LTS ("Current", odd-numbered).** Hardhat 3, Next.js 15, and wagmi v2 are
   tested against **Node 20/22 LTS**. Node 25 *may* work but is unsupported and a known source of
   flaky native-module / toolchain errors. **Recommendation:** install **Node 22 LTS** via `nvm`
   (or `volta`) and pin it with a `.nvmrc` / `.tool-versions` so the build is reproducible. This is
   the single biggest "works on my machine" risk for the whole build.
2. **`pnpm` is not installed** but the mvp-slice Phase 2 scaffold command (`pnpm create next-app`)
   assumes it. Either install pnpm (recommended, matches the plan) or substitute `npm create next-app`
   everywhere (npm 11 is present). This plan installs pnpm.
3. **CI has no contract/app gates yet.** The 4 Python gates run, but `hardhat test`, the Solidity
   anti-pattern grep, and the wagmi-v1-name grep are **not** wired into `ci.yml` (TRD TR-9.2.2). They
   are manual checklist items until Phase 4/5 adds them. Don't represent them as enforced CI.
4. **`.claude/` is gitignored** — CI runs `sync_agents.py` in **write-mode**, never `--check`
   (project memory; TRD TR-9.3.1). Don't add a `--check` gate.

### 🟡 BRD/TRD items still UNDECIDED that could block a phase
These are open `[DISCUSS]` items (BRD §15, TRD §12). None block the **MVP happy-path demo** (the slice
hardcodes around them), but each blocks the corresponding **full-product** phase:

| Open item | Blocks | Default the MVP uses |
|-----------|--------|----------------------|
| Sale-contract intake mode (form vs. extraction) — TRD Q1 | Phase 5 deal-intake (FR-1) | MVP hardcodes the deal |
| £50k value cap — TRD Q2 | nothing (config value) | £50k as config |
| 48h objection window — TRD Q3 | Phase 5 dispute (FR-10) | 48h as config |
| Revenue stream / fee level — TRD Q4 | pitch deck only (no build) | no fee logic |
| MVP doc set (six vs. invoice-only) — TRD Q6 | full doc-checker (FR-6) | invoice only |
| KYC/sanctions provider — TRD Q8 | Phase 5 KYC (FR-7) | public OFAC/UN/HMT snapshots |
| Production PII / data-protection regime — TRD Q11 | any non-synthetic data | synthetic only (AP-8) |
| FR-16/17 promote S→M? — TRD Q12 | scope of Phase 2/5 | minimal UI + event-watcher |
| `specHash` on-chain binding — TRD Q13 | Phase 5 spec store (TR-2.5) | MVP omits `specHash` |

---

## Chain selection & failover

**Satisfies.** NFR-Portability + NFR-Availability (BRD §10), AP-6 (chain portability), TR-2.4
(token address + roles as deploy params), TR-3.6 (EVM-portable, no chain-specific opcodes),
TR-9.1.2 (parameterised Ignition), BRD §12 chain-portability contingency.

**Primary chain:** **Base Sepolia** (chainId 84532) — as planned everywhere below.

**Failover order (if Base Sepolia degrades — BRD §12):**
1. **Optimism Sepolia** — *like-for-like swap.* Same OP-Stack as Base, so contract behaviour, gas
   model, finality, and tooling are near-identical; lowest-risk migration.
2. **Ethereum Sepolia** — *broadest-support, most-stable last resort.* L1 anchor, EF-run; every
   faucet, RPC, Circle USDC deployment, and Etherscan verify supports it first. Cost: slower blocks
   and pricier/contested faucets.
- **Further EVM options:** **Arbitrum Sepolia**, **Polygon Amoy** — viable EVM fallbacks if both
  OP-Stack chains and L1 Sepolia are unavailable.

**Design-for-portability requirement (single source of truth).** Chain config MUST live in **one
place** — a `chains.ts` / env map keyed by chainId — holding, per chain: **RPC URL**, **deployed
escrow address**, **Circle USDC token address**, and **block-explorer verify endpoint + API key**.
A failover is then a bounded, four-step operation:

> switch RPC → redeploy the (already-parameterised) contract via Ignition → swap the USDC address →
> update the one frontend chain config.

Only **two** things genuinely differ per chain (everything else is the same EVM contract + same
Ignition module, AP-6/TR-2.4):
- the **Circle USDC contract address** (per-chain), and
- the **explorer verification** target (BaseScan → Etherscan / Optimism Etherscan / Arbiscan / Polygonscan),
  each with its own verify URL + API key.

**Where this lands concretely:**
- **Phase 0 `.env.example`** carries the *active-chain* RPC, USDC address, and explorer API key (the
  map below generalises today's single-chain vars — see Phase 0 deliverables).
- **Phase 1** (`hardhat.config.ts` networks + Ignition `usdcAddress` param) and **Phase 2**
  (`app/lib/chains.ts`) are the two config owners; keep them reading the *same* per-chain values.

| Chain | chainId | USDC (Circle testnet) | Explorer verify |
|-------|---------|------------------------|-----------------|
| Base Sepolia (primary) | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | BaseScan |
| Optimism Sepolia (failover 1) | 11155420 | look up Circle testnet USDC for OP Sepolia | Optimism Etherscan |
| Ethereum Sepolia (failover 2) | 11155111 | look up Circle testnet USDC for Sepolia | Etherscan |
| Arbitrum Sepolia (option) | 421614 | look up Circle testnet USDC | Arbiscan |
| Polygon Amoy (option) | 80002 | look up Circle testnet USDC | Polygonscan |

> Per-chain USDC addresses change; confirm each against Circle's testnet docs / `faucet.circle.com`
> at failover time — never hardcode beyond the primary.

---

## Phase map at a glance

| Phase | Title | Window (mvp-slice) | Autonomy | Headline "what to download" |
|-------|-------|--------------------|----------|------------------------------|
| **0** | Foundation / bootstrap | Day 1 (½) | **Human gate** (accounts, keys, faucets) | Node 22 LTS, pnpm; register Anthropic + Reown + BaseScan; fund wallets |
| **1** | Smart contract | Days 1–3 | Mostly autonomous; **human gate** on testnet deploy | Hardhat 3, OpenZeppelin v5, viem, Ignition (inside `contracts/`) |
| **2** | Web UI + wallet | Days 4–7 | Autonomous build; **human** wallet testing | Next.js 14/15, wagmi v2, viem 2.x, RainbowKit, react-query (inside `app/`) |
| **3** | Off-chain rules engine + document-check | Days 8–10 | Autonomous; needs Anthropic key + deployed contract | `@anthropic-ai/sdk`, `zod` (inside `app/`) |
| **4** | Integration & demo polish | Days 11–14 | Autonomous build; **human** records the demo | (no new deps) seed script, runbook, OBS/ScreenStudio |
| **5** | Hardening & full-product re-expansion | Post-demo (week 3+) | Mixed; **human gates** on each FR | Agent SDK, KYC/dispute libs, DB/object store, multisig, CI gate tooling |

---

## Phase 0 — Foundation / bootstrap

**Goal.** Get every account, key, tool, and faucet in place so Phases 1–3 can run without stopping to
sign up for something. Produce the `.env.example` template and confirm a reproducible Node toolchain.

**Satisfies.** TRD TR-9.1.3 (env), TR-8.5.2 (secrets via env, `.env.example` template), AP-8 (sandbox
only); mvp-slice "Phase 0 — Decisions & setup". Establishes NFR-Security (no keys in repo) and
NFR-Portability prerequisites.

### ⬇️ Install / download FIRST (run these before anything else in the phase)

```bash
# 1) Node 22 LTS via nvm-windows (RECOMMENDED — current Node is v25, non-LTS).
#    Install nvm-windows from https://github.com/coreybutler/nvm-windows/releases first, then:
nvm install 22
nvm use 22
node --version          # expect v22.x

# 2) pnpm (NOT currently installed). Corepack ships with Node 22:
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version          # expect 9.x or 10.x

# (Hardhat 3, OZ, Next.js, wagmi etc. are installed PER-PROJECT in Phases 1–3,
#  not globally — see those phases. Nothing else is global.)
```

**Accounts / keys to register (browser tasks — do all now):**
- [ ] **Anthropic API key** in the team workspace → `ANTHROPIC_API_KEY` (Phase 3 needs it).
- [ ] **WalletConnect / Reown Cloud** project at https://cloud.reown.com → `NEXT_PUBLIC_WC_PROJECT_ID` (Phase 2).
- [ ] **BaseScan API key** at https://basescan.org → `BASESCAN_API_KEY` (Phase 1 `hardhat verify`).
- [ ] **Two EVM private keys**: a **deployer** (`BASE_SEPOLIA_PRIVATE_KEY`) and a **releaser** (`RELEASER_PRIVATE_KEY`). Generate fresh throwaway keys — testnet only, never reused from mainnet.

**Faucets (fund the deployer wallet):**
- [ ] **Base Sepolia ETH** — https://www.alchemy.com/faucets/base-sepolia (gas).
- [ ] **Testnet USDC** — https://faucet.circle.com (the escrowed token; USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e`, 6 decimals).

### Deliverables
- `.env.example` at repo root with the keys below (values blank except public constants):
  ```
  ANTHROPIC_API_KEY=
  NEXT_PUBLIC_WC_PROJECT_ID=
  BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
  BASE_SEPOLIA_PRIVATE_KEY=
  BASESCAN_API_KEY=
  RELEASER_PRIVATE_KEY=
  NEXT_PUBLIC_ESCROW_ADDRESS=
  NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
  ```
- `.nvmrc` (`22`) and/or `.tool-versions` pinning Node 22 — fixes discrepancy #1.
- (Root `.gitignore` already done — verify it still ignores `.env*` with `!.env.example`.)

> **Chain-portability note (see [Chain selection & failover](#chain-selection--failover)).** The env
> vars above are the *active-chain* slots of a per-chain map. Treat `BASE_SEPOLIA_RPC_URL`,
> `NEXT_PUBLIC_USDC_ADDRESS`, and `BASESCAN_API_KEY` as the **primary** entries; on failover, point
> them (or a chainId-keyed map) at Optimism/Ethereum Sepolia's RPC, USDC address, and explorer API key.

### Entry criteria
- None (this is the bootstrap).

### Exit criteria
- `node --version` = v22.x; `pnpm --version` resolves.
- `.env.example` + `.nvmrc` committed; real `.env` exists locally and is gitignored.
- All four accounts issued; deployer wallet shows Base Sepolia ETH **and** testnet USDC balances.

### Autonomy
**Human gate.** Account sign-ups, key generation, and faucet claims need a person (CAPTCHAs, wallet
approvals, workspace access). Claude can write `.env.example`/`.nvmrc` and verify tool versions AFK,
but cannot complete the registrations.

---

## Phase 1 — Smart contract

**Goal.** A narrow `Escrow` contract deployed and verified on Base Sepolia: minimal state machine,
role-gated `recordVerdict`/`refund`, **permissionless** `release`, full `node:test` suite green.

**Satisfies.**
- **FR-4** (deploy on-chain escrow), **FR-5** (`deposit` / funds-locked), **FR-12** (`release`), **FR-13** (`refund` escape hatch).
- **NFR-Security** (direct SC custody, no Blockmediary wallet), **NFR-Portability** (parameterised deploy), **NFR-Performance** (Base Sepolia L2).
- **TR-3.1, TR-3.2, TR-3.3, TR-3.4, TR-3.5, TR-3.6, TR-3.7, TR-3.8** (contract scope, custody, state machine, functions, events, portability, errors, tests); **TR-9.1.1/2** (chain + Ignition).
- **AP-1** (narrow contract), **AP-2** (off-chain verdict/on-chain enforcement), **AP-3** (SC custody), **AP-6** (chain portability), **AP-7** (`recordVerdict` is the point of no return).

### ⬇️ Install / download FIRST

```bash
# From repo root — scaffold the Hardhat 3 project (TS + viem + node:test template):
mkdir contracts && cd contracts
npx hardhat@3 --init       # choose "TypeScript Hardhat project using Node Test Runner and Viem"
                           # TRD pins Hardhat 3 (observed 3.7.0). Do NOT use Hardhat 2 or Foundry.

# OpenZeppelin v5 contracts (TRD locks OZ v5 — AccessControl, Pausable, SafeERC20, IERC20):
pnpm add -D @openzeppelin/contracts@^5

# The Hardhat 3 viem toolbox / viem are pulled in by --init; if not present:
pnpm add -D viem@^2 @nomicfoundation/hardhat-toolbox-viem
```
> **Version notes (TRD §4):** Solidity `^0.8.20`; OpenZeppelin **v5** (`_grantRole`, **never**
> `_setupRole`); Hardhat **3** + viem + `node:test` (**no** Mocha/Chai/ethers v5); deploys via
> **Hardhat Ignition** (**not** `hardhat-deploy`/`scripts/deploy.ts`).

### Deliverables
- `contracts/contracts/Escrow.sol` — inherits `AccessControl` + `Pausable`; `enum State { Draft, Agreed, Funded, ReleasePending, Released, Refunded }` (MVP 6-value enum, TR-3.3); `struct Deal { address buyer; address seller; uint256 amount; }`; custom errors `InvalidState`, `ZeroAmount` (+ `DealExists`/`NotBuyer`/`SameParty` for full product); functions `createDeal`/`deposit`/`recordVerdict`/`release`/`refund` with CEI + `SafeERC20` + `whenNotPaused` on fund moves (TR-3.4); events incl. `StateChanged` (TR-3.5).
- `contracts/contracts/mocks/MockUSDC.sol` — `ERC20` with `mint` + 6-decimals override.
- Tests (TR-3.8): `Escrow.happyPath.ts`, `Escrow.access.ts`, `Escrow.refundSafetyValve.ts`, plus state-guard, permissionless-release, and **pause-stops-release** tests.
- `contracts/ignition/modules/Escrow.ts` — params `usdcAddress`, `admin`, `releaser` (TR-9.1.2, no hardcoded addresses → AP-6).
- `hardhat.config.ts` — `baseSepolia` network (chainId 84532, RPC + deployer key from env). Keep the
  network block + Ignition `usdcAddress` param reading the per-chain values so adding a failover network
  (Optimism/Ethereum Sepolia) is a config-only change (see [Chain selection & failover](#chain-selection--failover)).

### Entry criteria
- Phase 0 exit met (Node 22, deployer wallet funded with ETH, BaseScan key issued).

### Exit criteria (verification)
- [ ] `npx hardhat test` — full suite green (incl. pause-stops-permissionless-release).
- [ ] `npx hardhat ignition deploy ./ignition/modules/Escrow.ts --network baseSepolia --parameters '…'` — succeeds; address saved to `NEXT_PUBLIC_ESCROW_ADDRESS`.
- [ ] `npx hardhat verify --network baseSepolia <address>` — verified on BaseScan.
- [ ] **Anti-pattern grep clean** (TR-8.6.1): no `_setupRole`, `SafeMath`, `.transfer(`, raw `IERC20.transfer`, `tx.origin`, `require(msg.sender ==` for auth.

### Autonomy
**Mostly autonomous.** Claude can write the contract, tests, Ignition module, and run `hardhat test`
AFK. **Human gate at the testnet deploy + verify** (it spends faucet ETH and needs the deployer key
loaded) and to confirm the deployed address goes into `.env`.

---

## Phase 2 — Web UI + wallet

**Goal.** One Next.js page that connects a wallet, shows the on-chain state badge, runs
**Approve → Deposit** (state → `Funded`), and exposes the seller's upload + **Release** controls.

**Satisfies.**
- **FR-5** (deposit / funds-locked reflected to seller), **FR-6** (seller upload surface — wired in Phase 3), **FR-16** (minimal dashboard / state display — the demo single page).
- **TR-6.1** (consume contract ABI), **TR-6.3.1/2/3** (Next.js + wagmi v2 + RainbowKit; Approve gated on receipt; CSR-only in MVP), **TR-2.1** (UI is never authoritative — reads state from chain).
- **AP-2** (release is a client trigger of the permissionless function).

### ⬇️ Install / download FIRST

```bash
# From repo root — scaffold the Next.js App Router app:
pnpm create next-app app --typescript --app --tailwind --eslint --src-dir=false

cd app
# wagmi v2 stack + RainbowKit + react-query (TRD §7.3 / mvp-slice Phase 2).
# (@anthropic-ai/sdk + zod are added in Phase 3, but adding now is fine.)
pnpm add wagmi viem@2.x @tanstack/react-query @rainbow-me/rainbowkit
```
> **Version notes (TRD §7.3, mvp-slice Phase 0):** Next.js **14/15** App Router; **wagmi v2** + **viem
> 2.x** (NOT wagmi v1 — no `configureChains`, `publicClient`, `useContractRead/Write/Event`);
> RainbowKit current; use `getDefaultConfig({ chains: [baseSepolia], ssr: true|false, … })` and the v2
> hooks `useAccount`/`useReadContract`/`useWriteContract`/`useWaitForTransactionReceipt`/`useWatchContractEvent`.

### Deliverables
- `app/lib/chains.ts` — the frontend **single source of truth** for per-chain RPC / escrow address / USDC address / explorer (see [Chain selection & failover](#chain-selection--failover)); `wagmi.ts` reads from it.
- `app/lib/wagmi.ts` (`getDefaultConfig`, active chain `baseSepolia`, CSR-only for MVP — TR-6.3.3).
- `app/app/providers.tsx` (`'use client'`: `WagmiProvider` + `QueryClientProvider` + `RainbowKitProvider`, RainbowKit CSS).
- `app/app/layout.tsx` (wraps `<Providers>`).
- `app/lib/contracts.ts` — `ESCROW_ADDRESS`, `USDC_ADDRESS`, `DEMO_DEAL_ID = keccak256("demo-deal-1")`, shared `State` enum (`Draft=0…Refunded=5`, TR-6.1.2), Escrow ABI re-export (copy-on-build from `contracts/artifacts`).
- `app/app/page.tsx` — single page keyed by `?role=buyer|seller`: state badge (`useReadContract state`); buyer panel (USDC balance, **exact-amount** `approve` via `erc20Abi`, `deposit` gated on the approve receipt — TR-6.3.2, threat-model "allowance hygiene"); seller panel (file input → `/api/check-document` [Phase 3], verdict pane, **Release** enabled at `ReleasePending`); `useWatchContractEvent('StateChanged')` → invalidate state query.

### Entry criteria
- Phase 1 deployed (a real `NEXT_PUBLIC_ESCROW_ADDRESS` exists); Reown projectId issued.

### Exit criteria (verification)
- [ ] `pnpm dev` → connect MetaMask, USDC balance loads.
- [ ] **Approve → Deposit** moves the state badge to `Funded` within ~5s of confirmation.
- [ ] **wagmi-v1-name grep clean** (no `configureChains`/`useContractRead` etc.); all wagmi code in `'use client'`; USDC displayed (not ETH).

### Autonomy
**Autonomous build, human wallet testing.** Claude can scaffold and write all components AFK. A human
must connect a real wallet, approve transactions in MetaMask, and confirm the Funded transition.

---

## Phase 3 — Off-chain rules engine + document-check

**Goal.** Seller uploads a commercial invoice; the server extracts fields with Claude vision,
runs the **deterministic** rules engine, and on `Compliant` signs `recordVerdict` as the releaser.
This is the **operational core** (TRD's words).

**Satisfies.**
- **FR-6** (accept upload), **FR-8** (extract + rules engine), **FR-9** (verdict Compliant/Discrepant), **FR-12** (recordVerdict → release path), **FR-14** (audit ledger JSONL).
- **NFR-Determinism / NFR-Accuracy** (money math in code, ≥0.9 confidence), **NFR-Auditability** (intent + reconciliation entries).
- **TR-4.2** (store_document), **TR-4.3.1/2/3** (extract / rules / verdict), **TR-4.6** (audit ledger + off-chain-only states), **TR-4.7** (settlement folded into the route), **TR-5.2** (extract schema), **TR-5.3** (verdict object), **TR-5.4** (ledger entry), **TR-6.2.1/1a/3** (`/api/check-document`, idempotency, server-only releaser key), **TR-7.1/7.2/7.3.3** (happy-path sequence + autonomy-by-construction), **TR-8.4** (determinism), **TR-8.5** (secrets).
- **AP-4** (audit around action), **AP-5** (agents explain, tools compute), **AP-7** (recordVerdict only after gates).

### ⬇️ Install / download FIRST

```bash
cd app
# Anthropic SDK (Claude vision) + Zod (LLM-output validation BEFORE business logic):
pnpm add @anthropic-ai/sdk zod
```
> **Version / API notes (TRD §7.5, mvp-slice Phase 0):** PDF input = `type: "document"`,
> `source:{ type:"base64", media_type:"application/pdf", data }` (≤32 MB/100pp; MVP tightens to a single
> **≤5 MB PDF**). Verify the **current** model id against
> https://platform.claude.com/docs/en/about-claude/models/overview — **never** a stale `claude-3-opus`.
> Requires `ANTHROPIC_API_KEY` (Phase 0) and the deployed contract + `RELEASER_PRIVATE_KEY`.

### Deliverables
- `app/lib/checker/schema.ts` — `InvoiceExtract` Zod schema (5 flat strings, TR-5.2 MVP envelope; `totalAmount` a **string**).
- `app/lib/checker/prompt.ts` — inline extractor prompt ("read fields, **do not grade**" — AP-5 separation).
- `app/lib/checker/rules.ts` — pure `gradeInvoice(extract, spec)`: `amount_match` via `parseUnits`/bigint, `party_match` fuzzy ≥0.8 (TR-4.3.2, TR-8.4). **All money math here, never in the prompt.**
- `app/app/api/check-document/route.ts` — multipart (single ≤5 MB PDF) → base64 → Claude vision → `InvoiceExtract.parse` (bail 400) → `gradeInvoice` → on `Compliant` sign `recordVerdict` with `RELEASER_PRIVATE_KEY` (viem `createWalletClient`), await receipt, return `{verdict, txHash}`; on `Discrepant` return without chain write; **409** if deal not `Funded`; idempotent per `(dealId, transition)` (TR-6.2.1a). Audit **intent** entry before the tx, **reconciliation** after (TR-2.3).
- `app/data/audit-ledger.jsonl` — append-only; one Compliant deal shows extract→grade→verdict→recordVerdict(tx)→Released (TR-4.6.3).
- `app/data/demo/invoice-acme.pdf` — synthetic invoice matching the hardcoded spec (e.g. seller "Acme Widgets Ltd", total "100.00").

### Entry criteria
- Phase 2 UI runs and reaches `Funded`; Anthropic key live; contract deployed with `RELEASER_ROLE` granted to the releaser address.

### Exit criteria (verification)
- [ ] Upload the **Compliant** invoice → verdict `Compliant`, chain → `ReleasePending`, **Release** enables, funds reach seller, state → `Released`.
- [ ] Hand-edit the PDF to a wrong amount → verdict `Discrepant`, chain **stays `Funded`**.
- [ ] Audit ledger logs both attempts; **no money math in the prompt** (all in `rules.ts`); `RELEASER_PRIVATE_KEY` only in `.env`, never in client bundle.

### Autonomy
**Autonomous** once the key + contract exist. Claude writes the route, schema, rules, and prompt and
can run the upload test against a local server. **Fallback (mvp-slice):** if Phase 3 slips, the seller
"upload" can be a button that calls `recordVerdict` directly — keeps the demo, loses the Claude-vision
story. Have this ready before week 2.

---

## Phase 4 — Integration & demo polish

**Goal.** A clean, twice-repeatable end-to-end recording plus a tested fallback for the live pitch.

**Satisfies.**
- **TR-9.3** (seed script + demo runbook), **TR-9.4.2** (definition of done = A1–A8 pass cold, twice), **TR-9.4.3** (rollback = pause→redeploy→re-point), **A1–A8** acceptance criteria (TRD §11.1).
- **AP-8 / NFR-Privacy** (all demo data synthetic).

### ⬇️ Install / download FIRST
- **Screen recorder:** OBS Studio (https://obsproject.com) **or** Screen Studio. (No package deps.)
- No new npm/pnpm packages — this phase wires together Phases 1–3.

### Deliverables
- `app/scripts/seed-demo.ts` — `createDeal(DEMO_DEAL_ID, buyer, seller, 100_000_000n)` (100 USDC), logs the `?role=buyer` / `?role=seller` URLs.
- `docs/demo-runbook.md` — preflight (faucet/RPC checks, fresh redeploy for clean state, clear `audit-ledger.jsonl`), ~3-min step script with "if X fails, do Y" branches.
- **Pre-recorded fallback video** → Drive `Hackathon/Demo/blockmediary-happy-path.mp4`.
- Pitch-deck notes: what's intentionally *not* shown (KYC/dispute/refund) so "what about X?" is answered honestly.
- **(Recommended) add the build-phase CI gates** now (TRD TR-9.2.2): a `contracts` job (`hardhat test` + Solidity anti-pattern grep) and an `app` job (typecheck/lint + wagmi-v1 grep) in `.github/workflows/`. Closes discrepancy #3.

### Entry criteria
- Phases 1–3 individually verified.

### Exit criteria (the graded gateway — TRD §11.1 A1–A8)
- [ ] A1 contract deployed+verified, full `hardhat test` green · A2 wallet→Funded · A3 Compliant→Released · A4 Discrepant stays Funded · A5 full audit chain · A6 no LLM money math · A7 4 Python CI gates green + manual greps clean · A8 **cold-start full path twice**, no real PII.
- [ ] Fallback video saved to Drive.

### Autonomy
**Autonomous build, human records.** Claude writes the seed script, runbook, and CI gates AFK. A human
runs the live wallet path and records the video.

---

## Phase 5 — Hardening & full-product re-expansion (post-demo)

**Goal.** Walk back the MVP cuts toward the firm: full state machine, KYC gate, dispute/objection
window, deal-intake + escrow-spec generation, multi-agent orchestrator, tamper-evident ledger, and a
hardened API. Each sub-feature is its own mini-phase with a human decision gate (most depend on an open
§12 item).

**Satisfies (the deferred 🔵 requirements).**
- **FR-1/2/3** deal-intake + escrow spec + Trade Escrow Agreement (TR-4.1, TR-5.1, TR-2.5 `specHash` binding).
- **FR-7** KYC/KYB/sanctions hard gate (TR-4.5, TR-8.3.2).
- **FR-10/11** notice of release + objection window + valid-grounds grading (TR-4.4, TR-5.6/5.7, TR-7.2).
- **FR-13** amendment / waiver / refund / dispute branches incl. amendment-as-new-dealId (TR-4.4.3).
- **FR-15** orchestrator + machine-enforced autonomy gates (TR-4.9, TR-8.2.1).
- **FR-17** notifications (TR-4.8); **FR-18** multi-deal (TR-6.3); **FR-19** API seam hardening (TR-6.2.2/3, TR-6.6).
- **NFR-Auditability** hash-chained + anchored ledger (TR-4.6.2, TR-8.3.1); **NFR-Security** multisig admin (TR-8.1.2, threat-model §9.7).
- Full state machine v2 contract (TR-3.3 full enum, TR-8.6.2 — via **redeploy**, not proxy).

### ⬇️ Install / download FIRST (per sub-feature — install at the start of each)
```bash
# Multi-agent orchestrator (FR-15) — Claude Agent SDK behind the UI:
cd app && pnpm add @anthropic-ai/claude-agent-sdk      # verify current package name vs. docs first

# Durable spec/document/ledger store (TR-2.5, TR-4.6.2) — pick ONE, then install its client:
#   e.g. pnpm add @prisma/client prisma        (Postgres)   — or an object store SDK (S3/R2)
# KYC/sanctions (FR-7): no single SDK — wire the chosen provider (TRD Q8 open) or a snapshot loader.
# Dispute/objection-window worker (FR-10): a job/queue lib if running timers server-side.
# CI gate tooling: solhint or slither (Solidity lint/static analysis) to harden TR-9.2.2 gates.
```
> Several of these are **blocked on an open §12 decision** (KYC provider Q8, intake mode Q1, data-protection
> Q11, `specHash` Q13). Resolve the decision in the §12 table **before** starting that sub-feature — that
> is the human gate.

### Deliverables (incremental; re-add per the mvp-slice "what was cut" table)
- v2 `Escrow` with full enum + `cancel`/`Disputed`/`specHash` (redeploy + migrate, TR-9.4.3).
- `deal-intake` component + `build_escrow_spec` → canonical spec (§6.1) + TEA; `specHash` to `createDeal`.
- `kyc-compliance` hard gate before `Funded`; screening record in ledger (§6.5).
- `dispute` objection window + `grade_objection` + branches; objection record (§6.6).
- Hash-chained + anchored audit store (replace JSONL); tamper-evidence (TR-8.3.1).
- Orchestrator via Agent SDK + the `tools/` deterministic layer made real (TR-6.4).
- Hardened API (auth, rate-limit, CORS) before any public/FR-19 surface (TR-6.2.3).
- Multisig admin in production (TR-8.1.2); close the `*`-orchestrator privilege-gate gap (TRD Q15).

### Entry criteria
- MVP demo accepted (Phase 4 A1–A8 passed); the relevant §12 open item decided for the sub-feature.

### Exit criteria
- Per-FR full-product acceptance (TRD §11.2): e.g. sanctioned party blocked before `Funded`; valid objection blocks release while "changed my mind" is rejected; ledger tampering detectable; every decision carries an auto/escalate tag + reason.

### Autonomy
**Mixed, human-gated.** Each sub-feature needs a human decision on the corresponding open question
(provider, jurisdiction, data-protection) and sign-off before it touches real (non-synthetic) data or
a public endpoint. Contract redeploys and multisig setup are human-gated.

---

## Appendix — consolidated "download / install" matrix

| Phase | npm/pnpm packages | Global tools | Accounts / keys | Faucets |
|-------|-------------------|--------------|------------------|---------|
| **0** | — | **Node 22 LTS** (nvm), **pnpm** (corepack) | Anthropic, Reown, BaseScan, deployer+releaser keys | Base ETH, testnet USDC |
| **1** | `@openzeppelin/contracts@^5`, `viem@^2`, hardhat-viem toolbox (via `npx hardhat@3 --init`) | Hardhat 3 (project-local) | (uses Phase 0 keys) | (uses Phase 0 ETH) |
| **2** | `wagmi`, `viem@2.x`, `@tanstack/react-query`, `@rainbow-me/rainbowkit` (+ `pnpm create next-app`) | — | (uses Reown projectId) | — |
| **3** | `@anthropic-ai/sdk`, `zod` | — | (uses Anthropic + releaser keys) | — |
| **4** | — | OBS Studio / Screen Studio | — | — |
| **5** | `@anthropic-ai/claude-agent-sdk`, DB/object-store client, (solhint/slither) | — | KYC provider creds (Q8), prod multisig | mainnet later |

## Appendix — biggest honest risks
1. **Node 25 → 22 LTS** mismatch (discrepancy #1) — fix in Phase 0 or expect toolchain flakiness.
2. **pnpm not installed** (discrepancy #2) — install in Phase 0 or switch the scaffold to `npm`.
3. **Contract/app CI gates not wired** (discrepancy #3) — greps are manual until Phase 4 adds them.
4. **Public-route abuse** is the sharpest MVP security hole (TRD §9.7): `/api/check-document` signs a
   releaser `recordVerdict` unauthenticated — **bind localhost only, never tunnel/expose** during the demo.
5. **Open §12 decisions** gate every Phase 5 full-product feature; none block the Phase 1–4 demo.
</content>
</invoke>
