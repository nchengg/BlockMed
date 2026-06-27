# Blockmediary — Claude Code Entry

> Cross-tool entry point for AI coding assistants (Claude Code, Cursor, Codex, Aider).
> Read this file before touching any code.

---

## What we're building

**Blockmediary** is a programmable documentary escrow platform for SME cross-border trade — an accessible alternative to traditional Letters of Credit. It removes the need for banks as intermediaries.

The flow is simple:
1. **Buyer** locks USDC into a smart contract escrow (Base Sepolia testnet)
2. **Seller** ships goods and uploads trade documents (starting with a commercial invoice)
3. **Blockmediary** verifies the documents using Claude AI against the agreed release rules
4. Funds automatically release to the seller on compliance — or are flagged for review if discrepancies are found

Our frontend is the human-facing layer on top of this on-chain workflow. It needs to make a technically complex process feel effortless.

Full specs: [`docs/product-blockmediary.md`](docs/product-blockmediary.md) · [`docs/technical-requirements.md`](docs/technical-requirements.md) · [`plans/implementation-phases.md`](plans/implementation-phases.md) · [`ROADMAP.md`](ROADMAP.md)

---

## North star

> Build a **minimal, Apple-like frontend** for the escrow workflow that makes the process clear to anyone — regardless of their crypto or trade finance background.

Every screen should have a clear purpose, a clear next action, and no noise.

---

## What good looks like

- **Simple** — no unnecessary elements. If it doesn't help the user complete their task, it's not there.
- **Elegant** — generous whitespace, clean typography (Inter), subtle shadows, rounded cards. Think Apple product pages, not a crypto dashboard.
- **Professional** — it needs to feel like a fintech product a real SME would trust with a $50k trade.
- **Easy to navigate** — a user should never wonder "what do I do next?" Every state has one clear call to action.

---

## Dos

1. **Access external resources** when they improve the output. If designing a landing page, look up UI/UX references and industry standards for fintech products before writing components. If implementing a wagmi hook, check the current wagmi v2 docs. Don't guess — verify.

2. **Spawn subagents** when they can do a discrete task better (e.g. a focused research agent to audit wagmi v2 patterns, or a design-reference agent to pull Apple HIG guidelines). Don't compromise on quality to save tokens — but don't burn tokens on tasks the main agent can handle directly either.

3. **Ask before assuming** on anything design-related. If a page layout or component behaviour isn't specified here, surface the question rather than inventing an answer.

---

## Don'ts

1. **Do not change existing code** unless Mo explicitly asks for it in the current conversation. Suggesting changes is fine — making them is not.

2. **Do not delete existing features or redesign pages** without a clear instruction to do so. Additions are safe; modifications and removals need explicit sign-off.

---

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | TypeScript, Tailwind CSS |
| Wallet / Web3 | wagmi **v2** + viem 2.x + RainbowKit | v2 hooks only — see rules below |
| Styling | Tailwind CSS + Inter font | Apple-inspired, no component library needed |
| Icons | Lucide React | Clean, minimal line icons |
| Off-chain AI | `@anthropic-ai/sdk` | Claude vision for document field extraction |
| Validation | `zod` | LLM output validation before business logic |
| Chain | Base Sepolia (chainId 84532) | USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Package manager | pnpm | Not npm, not yarn |

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — explains the product, leads to buyer/seller flows |
| `/buyer` | Buyer dashboard — connect wallet, approve USDC, deposit into escrow |
| `/seller` | Seller dashboard — see funds locked, upload invoice, trigger release |
| `/dashboard` | Deal overview — escrow state, audit trail, participants |

---

## Escrow state machine (drives all frontend UI)

Every page's content is determined by the current state of the deal. Always read state from the chain — never from local state.

```
Draft → Agreed → Funded → ReleasePending → Released
                         ↘ Refunded
```

| State | Buyer sees | Seller sees |
|-------|-----------|-------------|
| `Draft` | Connect wallet prompt | Waiting for buyer |
| `Agreed` | Approve USDC button | Waiting for buyer deposit |
| `Funded` | "Funds locked ✓" | Upload invoice CTA |
| `ReleasePending` | Objection window info | "Releasing..." |
| `Released` | Deal complete | Payment received |
| `Refunded` | Refund received | Deal cancelled |

---

## MVP scope — what we are NOT building yet

Do not scaffold or suggest any of the following unless explicitly asked:
- KYC / sanctions screening UI
- Dispute or objection flow
- Multi-deal management (the MVP uses a **single hardcoded deal**)
- Deal creation form / sale-contract upload
- Trade Escrow Agreement generation
- Notifications or email flows

---

## Demo deal setup

The MVP runs on **one hardcoded deal** — `DEMO_DEAL_ID = keccak256("demo-deal-1")`. There is no deal creation flow. Users arrive at `/buyer` or `/seller` and the app reads the state of this fixed deal from the chain. All components should be wired to this single deal ID.

---

## Hard rules (never break these)

- **wagmi v2 only** — never use `configureChains`, `useContractRead`, `useContractWrite`, or `publicClient` (wagmi v1 APIs). Use `useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`, `useWatchContractEvent`.
- **Money math in `app/lib/checker/rules.ts` only** — use `parseUnits` / bigint. Never compute amounts in prompts, component state, or agent free-text.
- **Exact-amount USDC approval** — never `MaxUint256`. Gate the `deposit` call on the approve transaction receipt.
- **`RELEASER_PRIVATE_KEY` is server-side only** — it must never appear in any client-side file or bundle. It lives exclusively in `app/app/api/check-document/route.ts`.
- **`app/lib/chains.ts` is the single source of truth** for RPC URLs, contract addresses, and explorer config. Nothing else hardcodes chain values.

---

## Claude-Code-specific notes

- `.claude/agents/` and `.claude/skills/` are **generated** — do not edit them directly.
- After editing anything in `agents/` or `skills/`, run `python tools/sync_agents.py`.
- The pre-commit hook blocks commits when `.claude/` drifts from canonical.
