# Blockmediary — Escrow Demo Web App

A guided, clickable walk through the escrow lifecycle against a **local chain** with
test funds — no wallet extension, no faucets, no env vars.

The flow: **seller proposes terms → buyer agrees (deal registered on-chain) → buyer
funds (approve + deposit) → seller submits bill-of-lading details → deterministic
rules check → verdict recorded on-chain → release pays the seller.**

## Run it

```bash
# 1. Local chain (terminal 1)
cd contracts && npm install && npx hardhat node

# 2. Deploy + seed (terminal 2)
cd contracts && npx hardhat run scripts/deploy-local.ts --network localhost

# 3. Web app (terminal 3)
cd app && npm install && npm run dev
```

Open http://localhost:3000 and follow the steps. Use **Start over** to run it again
(each run creates a fresh deal on the same chain). To also see the failure path,
change the B/L amount or a party name before submitting — the verdict comes back
**Discrepant** with the failing rules listed, and the funds stay locked.

## How it maps to the spec

| Piece | Realises |
|---|---|
| `lib/rules.ts` — deterministic BoL grading (bigint minor units, no floats, no AI) | TRD AP-5, TR-4.3.2 |
| `api/submit-bol` — grade off-chain, `recordVerdict` on-chain only when Compliant | AP-2, AP-7 (recordVerdict is the point of no return) |
| `api/fund` — exact-amount approve, then deposit | TR-6.3.2, allowance-hygiene threat |
| `api/release` — signed by the *seller* to demonstrate permissionless release | TR-3.2-roles |
| `lib/store.ts` audit trail (every action, tx hashes) | FR-14 (demo-grade stand-in) |

## Demo-only shortcuts (deliberate, replaced on the road to Base Sepolia)

- **Signing:** buyer/seller/releaser are the standard pre-funded Hardhat dev accounts,
  signed server-side ([lib/chain.ts](lib/chain.ts)). The public demo replaces buyer/seller
  with real wallets (wagmi + RainbowKit) and keeps only the releaser key server-side.
- **No authentication** on the API routes (TRD TR-6.2.3 caveat) — localhost only.
- **Terms store** is a JSON file, not the escrow-spec store; goods description is not
  yet part of the on-chain binding (no `specHash`).
