# Blockmediary — product specification

**Team:** Transakt (BEEM063 hackathon group).
**Product:** Blockmediary — a programmable documentary escrow layer for SME cross-border trade.

**Tagline:** *LC-like trust for smaller deals. Buyer prefunds in stablecoin; seller ships and submits documents; funds release when documents satisfy the agreed rules.*

Source of truth for product mechanics: `Hackathon/MVP_FLOW.md` (Drive). This file is the canonical product spec for agent design; update it whenever the team's MVP doc evolves and regenerate downstream artefacts.

> For the authoritative delivered-vs-roadmap split (what's actually built vs. planned), see `docs/business-requirements.md` (baselined 2026-08-09) and `docs/technical-requirements.md` — this file predates that baseline and is kept for agent-design context, not as the current scope reference.

## Positioning

Blockmediary does **not** turn an entire trade contract into a smart contract, and it does **not** offer working-capital advances or trade financing. The underlying sale contract stays between buyer and seller; Blockmediary provides a separate Trade Escrow Agreement plus an on-chain execution layer for locking and releasing funds.

> Blockmediary converts the **payment-relevant** and **document-verifiable** terms of a trade agreement into a smart-contract escrow workflow.

## Problem

SME importers and exporters struggle with cross-border payment trust:
- Sellers don't want to ship before payment is secured.
- Buyers don't want to pay before shipment evidence exists.
- Letters of credit are too slow, expensive, or inaccessible for smaller transactions.
- Documentary trade processes are manual, opaque, and bank-dependent.

Blockmediary offers an LC-like workflow for smaller, **prefunded** transactions, using stablecoin escrow and document-based release.

## Actors

| Actor | Need | Role in the system |
|-------|------|--------------------|
| **Buyer** | Doesn't want to pay before shipment evidence | Funds the escrow at deal origination, gets refund / release per rules |
| **Seller** | Wants payment assurance before shipping | Sees funds locked, ships goods, submits documents to trigger release |
| **Blockmediary** | Operational layer | Creates escrow workflow, verifies documents, coordinates release logic |
| **Smart contract** | On-chain enforcement | Holds stablecoin funds; enforces release/refund state transitions |
| **Document reviewer** | Compliance check | Human or assisted review of document conformity to release rules |
| **Dispute resolver** | Last-resort path | Named forum, arbitrator, or expert determination for unresolved issues |

## MVP scope

### In scope
- Structured escrow workflow from buyer/seller trade terms.
- Lock buyer funds in stablecoin escrow; show seller funds are locked before shipment.
- Collect seller shipment documents; verify against agreed release rules.
- Notify both parties on compliance; provide a limited objection window.
- Release funds to seller if no valid objection; support discrepancy / amendment / refund / dispute paths.

### Out of scope for MVP
- Buyer/seller marketplace or discovery.
- **Trade financing, liquidity provision, invoice financing** — explicitly not Blockmediary's MVP, despite operating in the same space.
- Insurance sourcing; party trust scoring.
- Full legal automation of the underlying sale contract.
- Quality guarantees for physical goods (unless an inspection certificate is part of release rules).
- Direct title control (unless integrated with an electronic bill of lading or document custodian).
- Complex regulated goods, sanctioned corridors, high-risk commodities.

## High-level flow

1. Buyer and seller agree a commercial sale contract outside Blockmediary.
2. One or both parties engage Blockmediary, upload the sale contract or enter key terms.
3. Blockmediary extracts payment-relevant and document-verifiable release conditions.
4. Blockmediary generates: a Trade Escrow Agreement + a structured escrow specification + a smart-contract escrow instance.
5. Buyer and seller review and approve the escrow terms.
6. Buyer deposits the agreed stablecoin amount into escrow.
7. Seller sees funds locked → ships goods → uploads required documents.
8. Blockmediary verifies documents against the agreed rule set.
9. If compliant, Blockmediary issues a notice of release; buyer has a short objection window limited to predefined grounds.
10. If no valid objection, funds release to the seller. Otherwise: amendment, waiver, refund, or dispute.

## Smart contract state model

```
Draft → Agreed → Funded → DocumentsSubmitted → ReviewInProgress
       → Compliant → ReleasePending → Released
                                    ↘ Disputed → Released | Refunded
       → Cancelled (from Agreed)
       → Refunded (from Funded, on refund condition)
```

See [domain-rules.md](domain-rules.md) for the full state taxonomy and autonomy policy.

## Architectural principle

The smart contract **does not understand trade documents**. It holds funds and enforces state transitions only. Document verification is **off-chain**; an authorised release function submits the verdict to the contract. This keeps the on-chain layer narrow and the compliance/review trail clear.

| Layer | Responsibility |
|-------|----------------|
| Smart contract escrow | Hold and release stablecoin funds; enforce state transitions |
| Off-chain workflow | Deal terms, document storage, deterministic rules engine (delivered); OCR/AI extraction (roadmap) |
| Off-chain verification | Determine whether release conditions are satisfied |
| Authorised release function | Submit the verdict on-chain |
| Audit trail | Record who approved release and on what basis |

## Required documents (initial MVP set)

- Commercial invoice
- Packing list
- Bill of lading / sea waybill / air waybill / courier receipt
- Certificate of origin (where required)
- Inspection certificate (where quality/quantity verification is required)
- Insurance certificate (where required by Incoterm or deal terms)

## External rails

- **Stablecoin rail** — USDC on Base Sepolia (testnet), delivered; EURC support and a production mainnet deployment are on the roadmap. Contract kept chain-portable.
- **Document custody / electronic bill of lading** — TBD partnership for title control if added beyond MVP.

## Revenue model

The MVP is **not** a financing product, so there is no financing spread. Revenue paths under consideration:

| # | Stream | Notes |
|---|--------|-------|
| A | Per-deal escrow fee | Flat or % of trade volume; main MVP revenue |
| B | Document review fee | When human review is required (above an automated-only tier) |
| C | Dispute / amendment fees | Charged when the workflow leaves the happy path |
| D | SaaS / API for platforms | White-label for marketplaces, forwarders, banks (post-MVP) |

## Open questions (drive Build-phase work)

1. ~~Which chain?~~ — resolved: delivered on Base Sepolia (testnet, EVM L2), kept chain-portable; production mainnet is a later decision.
2. **Document-verification tooling** — the delivered baseline is a deterministic rules engine; what mix of OCR/AI extraction vs. human review hits acceptable accuracy for the MVP doc set remains a roadmap question.
3. **Custody model** — buyer deposits to a smart contract directly vs. a regulated custody partner. MVP doc strongly prefers smart contract / regulated custodian over a Blockmediary-controlled wallet.
4. **Beachhead corridor + goods type** — start with simple, repeatable, low-to-medium value manufactured-goods transactions. Which corridor (e.g. Shenzhen → LA)?
5. **Dispute forum** — named arbitrator / expert determination process for unresolved issues. Pick one for the MVP demo.
6. **Sale-contract intake** — start with structured form only, or attempt term-extraction from uploaded contracts? MVP doc allows either / both.
