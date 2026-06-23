# Blockmediary — Claude Code entry

The full project spec is in [AGENTS.md](AGENTS.md) (cross-tool, read by Codex / Cursor /
Aider / Claude Code alike). This file just adds Claude-Code-specific notes.

## Read this first

[AGENTS.md](AGENTS.md) — what the project is, where agents are defined, working conventions.

## Claude-Code-specific notes

- The Claude-native locations `.claude/agents/` and `.claude/skills/` are **generated**
  from the canonical [agents/](agents/) and [skills/](skills/) directories at the repo
  root. Do not edit files under `.claude/` — your changes will be overwritten.
- After editing anything in `agents/` or `skills/`, run:
  ```
  python tools/sync_agents.py
  ```
- A pre-commit hook (see [AGENTS.md](AGENTS.md#suggested-pre-commit-hook)) blocks
  commits when `.claude/` drifts from canonical.

## Quick links

- **Product:** Blockmediary (documentary escrow for SME cross-border trade). **Team:** Transakt.
- **Product spec:** [docs/product-blockmediary.md](docs/product-blockmediary.md) — what we're building (mirrors `Hackathon/MVP_FLOW.md` in Drive)
- **Domain rules:** [docs/domain-rules.md](docs/domain-rules.md) — business rules every agent inherits (state model, autonomy thresholds, valid objection grounds)
- **Hackathon context:** [docs/hackathon-context.md](docs/hackathon-context.md) — deadlines, grading, framework, trainers
- **Architecture:** [docs/architecture.md](docs/architecture.md) — on-chain/off-chain split, agent team
- **Specialists:** [agents/](agents/)
- **Workflows:** [skills/](skills/)

---

## Reshi branch — Frontend build

This branch (`Reshi`) is focused on building the **web frontend** (`app/`). See [ROADMAP.md](ROADMAP.md) for the full phase plan.

### Tech stack
- **Framework:** Next.js 15, App Router, TypeScript, Tailwind CSS
- **Web3:** wagmi **v2** + viem **2.x** + RainbowKit (use v2 hooks only — `useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`, `useWatchContractEvent`)
- **Off-chain:** `@anthropic-ai/sdk` (Claude vision for doc extraction), `zod` (schema validation)
- **Chain:** Base Sepolia (chainId 84532) · USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Frontend-specific rules
- **Never use wagmi v1 APIs** — no `configureChains`, `useContractRead`, `useContractWrite`, `publicClient`.
- **Money math belongs in `app/lib/checker/rules.ts`** — use `parseUnits` / bigint. Never compute amounts in prompts or component state.
- **Exact-amount USDC approval only** — no `MaxUint256`. Gate `deposit` on the approve transaction receipt.
- **`RELEASER_PRIVATE_KEY` is server-only** — must never reach the client bundle. Only used inside `app/app/api/check-document/route.ts`.
- **`app/lib/chains.ts` is the single source of truth** for per-chain addresses, RPC URLs, and explorer config.

### What exists vs. what to build
| Status | Item |
|--------|------|
| ✅ Exists | Agent scaffold (`agents/`, `skills/`, `docs/`, `tools/`), CI, `.gitignore` |
| ✅ Exists | `.env.example` (check if present; create per Phase 0 if not) |
| ❌ Build | `contracts/` — Hardhat 3 + `Escrow.sol` (Phase 1) |
| ❌ Build | `app/` — Next.js app with wagmi, buyer/seller UI, doc check API (Phases 2–3) |

### Bootstrap checklist (Phase 0 — human tasks)
Before running any code, complete Phase 0 in [ROADMAP.md](ROADMAP.md): Node 22 LTS, pnpm, API keys (Anthropic, Reown, BaseScan), deployer + releaser wallets, Base Sepolia ETH + testnet USDC from faucets.
