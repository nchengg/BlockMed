# Blockmediary — Smart Contracts

Phase 1 of [plans/implementation-phases.md](../plans/implementation-phases.md): the narrow
`Escrow` contract from [TRD §4](../docs/technical-requirements.md), plus its test suite.

## What the contract is (and deliberately isn't)

`Escrow.sol` holds a stablecoin per deal and enforces the MVP state machine — nothing else.
It never sees documents, release rules, or fiat values (AP-1). Document verification happens
off-chain; the releaser key records the verdict on-chain (AP-2), and from that point
`release` is **permissionless** so a compliant seller can't be censored (AP-7).

```
Draft ──createDeal──▶ Agreed ──deposit──▶ Funded ──recordVerdict──▶ ReleasePending ──release──▶ Released
        (releaser)             (buyer)              (releaser)             (anyone)
                                            └───refund (releaser/admin)──▶ Refunded
```

Terminal states: `Released`, `Refunded`. `recordVerdict` is the point of no return — every
off-chain gate (document rules, objection window, disputes) must pass before it is called.

## Stack (locked by the TRD)

Solidity `^0.8.20` (compiled 0.8.28) · OpenZeppelin v5 (`AccessControl`, `Pausable`,
`SafeERC20`) · Hardhat 3 + viem + `node:test` · Hardhat Ignition deploys.

## Run it

```bash
npm install
npx hardhat test      # 16 tests: happy path, access, state guards, refund valve,
                      # permissionless release, pause-stops-release (TR-3.8)
```

## Deploy (Base Sepolia — needs a funded deployer key in ../.env)

```bash
npx hardhat ignition deploy ignition/modules/Escrow.ts --network baseSepolia \
  --parameters '{"EscrowModule":{"usdcAddress":"0x036CbD53842c5426634e7929541eC2318f3dCF7e","admin":"0x…","releaser":"0x…"}}'
npx hardhat verify --network baseSepolia <deployed-address>
```

All three constructor inputs are deploy parameters (TR-9.1.2) — a failover redeploy to
another EVM L2 is parameters-only, never a contract change.
