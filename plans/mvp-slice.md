# Blockmediary MVP slice — 2-week sprint plan

**Owner:** Transakt fullstack engineer (you)
**Window:** 2 weeks from kickoff
**Demo target:** screen-recordable happy path for the main pitch video (2026-08-14)
**Approach:** monorepo (add `app/` + `contracts/` to this repo). Solo build. Cut everything not on the happy path.

> **This is a deliberately narrow slice.** Dispute window, KYC, refund UI, multi-agent orchestrator, audit-ledger viewer, separate buyer/seller pages, full state-machine coverage — all DEFERRED. Mention them in the pitch deck as roadmap. Build them after the demo if there's time.

---

## What you're actually shipping (happy path only)

```
Buyer (UI)                      Contract                       Seller (UI)
   │                                │                              │
   ├──connect wallet─────────────► │                               │
   ├──approve(USDC)──────────────► │                               │
   ├──deposit(dealId)────────────► │ ──Funded event──────────────► │
   │                                │                              ├──upload PDF
   │                                │                              │
   │             [server: Claude vision extracts → rules check → Compliant]
   │                                │ ◄──recordVerdict(Compliant)──┤
   │                                │ ──ReleasePending event────── │
   │                                │ ◄──release(dealId)────────── │
   │                                │ ──USDC to seller──────────►  │
   │                                │ ──Released event────────────►│
```

Everything else is out of scope for the demo recording.

---

## Phase 0 — Decisions & setup (Day 1, half day)

### Locked-in defaults

| Decision | Choice | Why |
|----------|--------|-----|
| Chain | **Base Sepolia** | Best regulatory story, native Circle USDC, EVM (you know TS), 2-week-friendly |
| Repo | **Monorepo** — add `app/` + `contracts/` to this repo | Solo + short timeline; one git history |
| OCR | **Claude vision via Anthropic SDK only** | Zero extra cloud accounts |
| Wallet | **Bring-your-own + USDC testnet** | Matches product spec, simpler regulatory story |
| Agent runtime | **Direct Anthropic SDK call to one prompt** (no Agent SDK orchestrator) | Cut for time; orchestrator returns post-demo |

### Tasks

1. Create `.gitignore` at repo root: `node_modules/`, `.next/`, `.env*`, `!.env.example`, `artifacts/`, `cache/`, `ignition/deployments/`, `data/uploads/`, `data/demo/runtime/`.
2. Create `.env.example`:
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
3. Register WalletConnect/Reown Cloud projectId at https://cloud.reown.com.
4. Get Anthropic API key in the team workspace.
5. Fund a deployer wallet with Base Sepolia ETH (faucet) + USDC (https://faucet.circle.com).

**Done when:** `.env.example` and `.gitignore` committed, faucets actioned, projectId + API key issued.

---

## Phase 0 — Allowed APIs (consolidated reference)

Cite this section from every later phase. **Don't invent APIs — copy from these docs.**

### Smart contracts — Hardhat 3 + OpenZeppelin v5
- Init: `npx hardhat --init` → "TypeScript Hardhat project using Node Test Runner and Viem"
- Config: `defineConfig({ ... })` in ESM `hardhat.config.ts`
- OZ v5 imports: `IERC20`, `SafeERC20`, `AccessControl`, `Pausable`. `^0.8.20` pragma. Use `_grantRole`, not `_setupRole`. Custom errors over revert strings.
- Tests: `node:test` + `node:assert/strict` + `viem` via `network.create()`
- Deployments: Hardhat Ignition modules under `ignition/modules/`
- Docs: https://hardhat.org/docs/getting-started.md · https://docs.openzeppelin.com/contracts/5.x/access-control

### Web frontend — Next.js 14/15 App Router + wagmi v2 + RainbowKit
- Packages: `wagmi`, `viem@2.x`, `@tanstack/react-query`, `@rainbow-me/rainbowkit`
- Config: `getDefaultConfig({ appName, projectId, chains: [baseSepolia], transports, ssr: true, storage: createStorage({ storage: cookieStorage }) })`
- Hooks: `useAccount`, `useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`, `useWatchContractEvent`
- SSR: `cookieToInitialState(...)` in `app/layout.tsx`
- Docs: https://wagmi.sh/react/getting-started · https://rainbowkit.com/docs/installation · https://wagmi.sh/react/guides/ssr

### Anthropic SDK (vision + structured extraction)
- Package: `@anthropic-ai/sdk`
- PDF input: `type: "document"`, `source: { type: "base64", media_type: "application/pdf", data }`. Up to 32 MB / 100 pages.
- Image input: JPEG/PNG/WebP, ≤5 MB, base64.
- Cache: `cache_control: { type: "ephemeral" }` on document/image blocks only.
- Docs: https://platform.claude.com/docs/en/build-with-claude/pdf-support

### Chain constants — Base Sepolia
- chainId: **84532** · RPC: `https://sepolia.base.org` · Explorer: `https://sepolia.basescan.org`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals)
- Faucets: Circle USDC https://faucet.circle.com · Base ETH https://www.alchemy.com/faucets/base-sepolia

### Anti-patterns NEVER to use
- `_setupRole` (use `_grantRole`), `Ownable()` no-arg ctor, `SafeMath`, `.transfer()/.send()` for ETH, raw `IERC20.transfer`, `tx.origin` for auth
- Wagmi v1 names: `configureChains`, `publicClient`, `autoConnect`, `useContractRead/Write/Event`
- `hardhat-deploy` + `scripts/deploy.ts` (use Ignition)
- Mocha+Chai+ethers v5 test stack (use viem + `node:test`)
- `cache_control` on text blocks (only document/image)
- Old Claude model IDs like `claude-3-opus` (check https://platform.claude.com/docs/en/about-claude/models/overview)

---

## Phase 1 — Smart contract (Days 1–3, ~2.5 days)

**Goal:** deployed escrow on Base Sepolia, minimal state machine, role-gated verdict, permissionless release.

### Cut from the original spec
- ~~`DocumentsSubmitted`, `ReviewInProgress`, `Compliant`, `Disputed`, `Cancelled` states~~ — only ship the states actually walked on the happy path
- ~~Dispute / refund UI~~ — keep `refund` function in the contract as a safety valve but don't wire it to UI

### Minimal state machine

```
Draft → Agreed → Funded → ReleasePending → Released
                      ↘ Refunded  (admin escape hatch only)
```

### Implementation steps

1. `cd ` (repo root) `&& mkdir contracts && cd contracts && npx hardhat --init` (TS + viem template)
2. **`contracts/contracts/Escrow.sol`** — copy patterns from *Phase 0 — Allowed APIs*:
   - Inherit `AccessControl`, `Pausable`
   - `enum State { Draft, Agreed, Funded, ReleasePending, Released, Refunded }`
   - `struct Deal { address buyer; address seller; uint256 amount; }`
   - `mapping(bytes32 => Deal) public deals; mapping(bytes32 => State) public state;`
   - Custom errors: `InvalidState(bytes32, State, State)`, `ZeroAmount()`
   - `bytes32 public constant RELEASER_ROLE = keccak256("RELEASER_ROLE");`
   - Functions:
     - `createDeal(bytes32 dealId, address buyer, address seller, uint256 amount)` — `RELEASER_ROLE`, `Draft → Agreed`
     - `deposit(bytes32 dealId)` — only `deals[dealId].buyer`, `safeTransferFrom`, `Agreed → Funded`
     - `recordVerdict(bytes32 dealId)` — `RELEASER_ROLE`, `Funded → ReleasePending` (verdict is implicitly Compliant in the demo; Discrepant path is not built)
     - `release(bytes32 dealId)` — permissionless, `safeTransfer`, `ReleasePending → Released`
     - `refund(bytes32 dealId)` — `RELEASER_ROLE`, from `Funded` only, escape hatch
   - Events: `DealCreated`, `Funded`, `VerdictRecorded`, `Released`, `Refunded`, `StateChanged(bytes32 indexed, State, State)`
3. **`contracts/contracts/mocks/MockUSDC.sol`** — `ERC20("Mock USDC", "mUSDC")` with `mint` and 6 decimals override.
4. **Tests** — happy path only:
   - `test/Escrow.happyPath.ts`: createDeal → mint USDC → approve → deposit → recordVerdict → release → assert state Released + seller balance
   - `test/Escrow.access.ts`: non-releaser cannot `createDeal` / `recordVerdict`
   - `test/Escrow.refundSafetyValve.ts`: admin can refund from Funded
5. **Ignition module** `contracts/ignition/modules/Escrow.ts` — params: `usdcAddress`, `admin`, `releaser`.
6. **`hardhat.config.ts`** — add `baseSepolia` network entry (chainId 84532, RPC + private key from env).

### Verification

- [ ] `npx hardhat test` — three tests pass
- [ ] `npx hardhat ignition deploy ./ignition/modules/Escrow.ts --network baseSepolia --parameters '...'` — succeeds, address recorded in `NEXT_PUBLIC_ESCROW_ADDRESS`
- [ ] `npx hardhat verify --network baseSepolia <address>` — verified on basescan
- [ ] Grep clean: no `_setupRole`, no `SafeMath`, no `.transfer(`, no `require(msg.sender ==`

### Anti-pattern guards
- State mutation before token transfer (CEI) — always.
- USDC address via constructor, not constant.
- `release()` stays permissionless — do not gate it on `RELEASER_ROLE`.

---

## Phase 2 — Web UI + wallet (Days 4–7, ~4 days)

**Goal:** one-page UI that connects a wallet, deposits USDC, uploads a PDF, and shows the release.

### Cut from the original spec
- ~~Separate buyer/seller pages~~ — single page with a `?role=buyer|seller` query param
- ~~Dashboard listing multiple deals~~ — one hardcoded `dealId` for the demo
- ~~SSR cookie hydration for wagmi~~ — keep it CSR-only to save half a day (acceptable for a demo)

### Implementation steps

1. **Scaffold app**:
   ```
   pnpm create next-app app --typescript --app --tailwind --eslint --src-dir=false
   cd app && pnpm add wagmi viem@2.x @tanstack/react-query @rainbow-me/rainbowkit @anthropic-ai/sdk zod
   ```
2. **`app/lib/wagmi.ts`** — copy `getDefaultConfig` snippet from *Phase 0*. Single chain: `baseSepolia`. Skip cookie storage.
3. **`app/app/providers.tsx`** (`'use client'`) — `WagmiProvider` + `QueryClientProvider` + `RainbowKitProvider`. Import `@rainbow-me/rainbowkit/styles.css`.
4. **`app/app/layout.tsx`** — wrap children in `<Providers>`.
5. **`app/lib/contracts.ts`** — export:
   - `ESCROW_ADDRESS` (from env)
   - `USDC_ADDRESS` (from env)
   - `DEMO_DEAL_ID` — a hardcoded `keccak256("demo-deal-1")` for now
   - `escrowAbi` (imported from `contracts/artifacts/...` via a symlink or a copy-on-build script)
6. **`app/app/page.tsx`** — single demo page, conditional UI by `role`:
   - **Header:** `<ConnectButton />`, current state badge via `useReadContract({ functionName: 'state', args: [DEMO_DEAL_ID] })`
   - **Buyer panel (role=buyer):**
     - USDC balance: `useReadContract(USDC, erc20Abi, 'balanceOf', [address])`
     - "Approve" button → `useWriteContract({ ...approve(ESCROW, parseUnits('100', 6)) })`
     - "Deposit" button (enabled after approve receipt) → `useWriteContract({ ...deposit(DEMO_DEAL_ID) })`
   - **Seller panel (role=seller):**
     - File input → POST to `/api/check-document`
     - Verdict result pane
     - "Release" button (enabled when state == `ReleasePending`) → `useWriteContract({ ...release(DEMO_DEAL_ID) })`
   - **Event watcher:** `useWatchContractEvent` for `StateChanged` → invalidate state query (forces re-read)

### Files created

```
app/
  package.json
  next.config.mjs
  tsconfig.json
  app/
    layout.tsx
    providers.tsx
    page.tsx
    api/check-document/route.ts  (filled in Phase 3)
  lib/
    wagmi.ts
    contracts.ts
    abi.ts                       (Escrow ABI re-export)
```

### Verification

- [ ] `pnpm dev` — connect Metamask, see USDC balance load
- [ ] Approve + Deposit → state badge changes to "Funded" within 5s of confirmation
- [ ] Grep: no wagmi v1 hook names

### Anti-pattern guards
- All wagmi components in `'use client'` files.
- Don't poll with `useEffect`; let `useWatchContractEvent` + `queryClient.invalidateQueries` drive updates.
- Don't display ETH balance — only USDC.

---

## Phase 3 — Document-check (Days 8–10, ~3 days)

**Goal:** seller uploads one PDF, server extracts fields with Claude vision, deterministic rules check passes, server calls `recordVerdict` as the releaser.

### Cut from the original spec
- ~~Multi-document upload (BOL + invoice + packing list)~~ — accept just the **commercial invoice** for the demo
- ~~Full rules engine~~ — only check: invoice total matches escrow `amount`; invoice seller matches `deals[dealId].seller` (string-ish match)
- ~~Markdown agent loader~~ — inline the document-checker prompt as a TS const
- ~~Verdict can be Discrepant/Rejected/Escalated~~ — only Compliant or Discrepant; Discrepant just shows an error, no on-chain transition
- ~~Files API + prompt caching~~ — single-shot call; revisit if it works

### Implementation steps

1. **`app/lib/checker/schema.ts`** — Zod:
   ```ts
   export const InvoiceExtract = z.object({
     totalAmount: z.string(),   // string to avoid float parsing in LLM output
     currency: z.string(),
     sellerName: z.string(),
     buyerName: z.string(),
     invoiceNumber: z.string(),
   })
   ```
2. **`app/lib/checker/prompt.ts`** — inline system prompt: "Extract these fields from the attached commercial invoice. Return JSON only matching this schema. Do not grade conformity." Include the Zod schema as a JSON-schema string in the prompt.
3. **`app/lib/checker/rules.ts`** — pure deterministic functions:
   ```ts
   export function gradeInvoice(extract: InvoiceExtract, spec: { amount: bigint, sellerName: string }) {
     const extractedAmount = parseUnits(extract.totalAmount, 6) // 6 decimals
     const amountOk = extractedAmount === spec.amount
     const sellerOk = fuzzyMatch(extract.sellerName, spec.sellerName) > 0.8
     return amountOk && sellerOk ? 'Compliant' : 'Discrepant'
   }
   ```
4. **`app/app/api/check-document/route.ts`**:
   - Accept multipart upload (single PDF, ≤5 MB)
   - Convert to base64
   - Call `anthropic.messages.create({ model: 'claude-sonnet-4-6', messages: [{ role: 'user', content: [{ type: 'document', source: {...} }, { type: 'text', text: PROMPT }] }] })`
   - Parse response with `InvoiceExtract.parse(...)` — bail with 400 on Zod failure
   - Call `gradeInvoice(extract, spec)` where `spec` is hardcoded for the demo deal
   - If `Compliant`: use `viem` `createWalletClient` with `RELEASER_PRIVATE_KEY` to call `escrow.recordVerdict(DEMO_DEAL_ID)`; wait for receipt; return `{ verdict: 'Compliant', txHash }`
   - If `Discrepant`: return `{ verdict: 'Discrepant', extract, reason }` without touching chain
   - Append every result to `app/data/audit-ledger.jsonl` (one line of JSON per event)
5. **Synthetic invoice PDF** under `app/data/demo/invoice-acme.pdf` — match the hardcoded demo spec (e.g. seller "Acme Widgets Ltd", total "100.00 USDC").

### Verification

- [ ] Upload the synthetic Compliant invoice → verdict shows "Compliant", chain state moves to `ReleasePending`, "Release" button enables
- [ ] Hand-edit the PDF to wrong amount → verdict shows "Discrepant", chain state stays `Funded`
- [ ] Audit ledger has both attempts logged
- [ ] No money math in the agent prompt — all comparisons in `rules.ts`

### Anti-pattern guards
- LLM output through Zod *before* any business logic.
- Numeric comparisons through `parseUnits`/bigint, never floats.
- `RELEASER_PRIVATE_KEY` only in `.env`, never in repo or client bundle.

---

## Phase 4 — Demo polish (Days 11–14, ~3 days incl. buffer)

**Goal:** clean recording + a tested fallback for the live pitch.

### Tasks

1. **Demo runbook** `docs/demo-runbook.md`:
   - Preflight: check faucet balances, RPC up, redeploy fresh contract for a clean state, clear `audit-ledger.jsonl`
   - Step-by-step script with expected timings (~3 min total)
   - "If X fails, do Y" branches
2. **Seed script** `app/scripts/seed-demo.ts`:
   - Reads deployer key from env
   - Calls `escrow.createDeal(DEMO_DEAL_ID, buyer, seller, 100_000_000n)` (100 USDC at 6 decimals)
   - Logs the demo URL `http://localhost:3000?role=buyer` and `?role=seller`
3. **Record a fallback video** with OBS/ScreenStudio once the full path works end-to-end. Store in Drive under `Hackathon/Demo/blockmediary-happy-path.mp4`.
4. **Pitch-deck notes** — what's intentionally *not* shown so you can answer "what about KYC/dispute?" honestly. Cross-reference [docs/product-blockmediary.md](docs/product-blockmediary.md).

### Final verification

- [ ] Cold-start the app + redeploy the contract, run the full path twice in a row without code changes
- [ ] Anti-pattern grep: zero hits across the four lists in *Phase 0*
- [ ] `python tools/sync_agents.py --check` exits 0
- [ ] Audit ledger contains one full Compliant chain (extract → grade → tx hash → release event)
- [ ] No real PII anywhere in `data/` — all synthetic
- [ ] Pre-recorded fallback video saved to Drive

---

## Day-by-day, if you build straight through

| Day | Phase | Output |
|-----|-------|--------|
| 1 (½) | 0 | env files, accounts, faucets |
| 1 (½)–3 | 1 | Escrow.sol + tests + deployed to Base Sepolia |
| 4–7 | 2 | Next.js app with wallet + USDC deposit + state badge |
| 8–10 | 3 | Document upload + Claude vision + rules + recordVerdict bridge |
| 11–13 | 4 | Runbook, seed script, recording |
| 14 | buffer | Re-record if needed; pitch-deck integration |

This is tight. If Phase 3 slips, the seller "upload" can be mocked to a button that just calls `recordVerdict` directly — you keep the demo, you lose the Claude-vision story for it. **Have that fallback ready before week 2.**

---

## What was cut and where it goes after the demo

| Cut | Re-add when | Lives in |
|-----|-------------|----------|
| Multi-agent orchestrator | Post-demo, week 3+ | `app/lib/agents/*` (markdown loader + Agent SDK) |
| KYC stub | Post-demo, week 3 | `app/lib/kyc/*` |
| Dispute objection window | Post-demo, week 4 | `app/lib/dispute/*` + worker |
| Full state machine (DocumentsSubmitted, etc.) | When dispute lands | Contract upgrade or v2 |
| Buyer/seller dashboard | Post-demo, week 3 | `app/app/deals/*` |
| Audit ledger viewer UI | Post-demo, week 4 | `app/app/dev/ledger/page.tsx` |
| Refund / cancel UI | Post-demo | New routes |

Original 10-week plan is in git history if needed — `git log -- plans/mvp-slice.md` to recover.
